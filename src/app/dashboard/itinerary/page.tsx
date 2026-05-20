'use client';

import { useState, useRef, useCallback } from 'react';
import { toPng } from 'html-to-image';

// ─── Types ────────────────────────────────────────────────────────────────────
interface DayEntry {
  id: string;
  dayNumber: number;
  date: string;
  overNightStay: number;
  mealPlan: string;
  details: string;
}

interface ItineraryData {
  tourName: string;
  customerName: string;
  quotationNo: string;
  adults: string;
  startDate: string;
  endDate: string;
  totalCost: string;
  days: DayEntry[];
  inclusions: string[];
  exclusions: string[];
  notes: string;
}

const uid = () => Math.random().toString(36).substr(2, 9);

const ORANGE = '#f97316';
const DARK = '#1e293b';
const LIGHT_ORANGE = '#fff7ed';
const BORDER = '#fed7aa';

// ─── Default data ─────────────────────────────────────────────────────────────
const defaultDay = (n: number): DayEntry => ({
  id: uid(),
  dayNumber: n,
  date: '',
  overNightStay: 1,
  mealPlan: 'Breakfast and Dinner',
  details: '',
});

const defaultData: ItineraryData = {
  tourName: '',
  customerName: '',
  quotationNo: '',
  adults: '2',
  startDate: '',
  endDate: '',
  totalCost: '',
  days: [defaultDay(1), defaultDay(2), defaultDay(3)],
  inclusions: ['', '', ''],
  exclusions: ['', '', ''],
  notes: '',
};

// ─── Shared input styles ──────────────────────────────────────────────────────
const inp: React.CSSProperties = {
  width: '100%', padding: '8px 10px', border: '1px solid #e2e8f0',
  borderRadius: '6px', fontSize: '12px', outline: 'none',
  boxSizing: 'border-box', background: '#fff', fontFamily: 'inherit',
};
const lbl: React.CSSProperties = {
  display: 'block', fontSize: '10px', fontWeight: '700',
  color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px',
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ItineraryPage() {
  const [data, setData] = useState<ItineraryData>(defaultData);
  const [headerImage, setHeaderImage] = useState<string | null>(null);
  const [footerImage, setFooterImage] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  const previewRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLInputElement>(null);
  const footerRef = useRef<HTMLInputElement>(null);

  const set = (field: keyof ItineraryData, value: any) =>
    setData(p => ({ ...p, [field]: value }));

  const setDay = (id: string, field: keyof DayEntry, value: any) =>
    setData(p => ({ ...p, days: p.days.map(d => d.id === id ? { ...d, [field]: value } : d) }));

  const addDay = () => setData(p => ({
    ...p, days: [...p.days, defaultDay(p.days.length + 1)]
  }));

  const removeDay = (id: string) => setData(p => ({
    ...p, days: p.days.filter(d => d.id !== id).map((d, i) => ({ ...d, dayNumber: i + 1 }))
  }));

  const setListItem = (key: 'inclusions' | 'exclusions', i: number, val: string) =>
    setData(p => { const a = [...p[key]]; a[i] = val; return { ...p, [key]: a }; });

  const addListItem = (key: 'inclusions' | 'exclusions') =>
    setData(p => ({ ...p, [key]: [...p[key], ''] }));

  const removeListItem = (key: 'inclusions' | 'exclusions', i: number) =>
    setData(p => ({ ...p, [key]: p[key].filter((_, idx) => idx !== i) }));

  const loadImage = (e: React.ChangeEvent<HTMLInputElement>, fn: (s: string) => void) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onload = ev => fn(ev.target!.result as string); r.readAsDataURL(f);
  };

  const downloadPNG = useCallback(async () => {
    if (!previewRef.current) return;
    setDownloading(true);
    try {
      // Ensure full height capture
      const el = previewRef.current;
      const dataUrl = await toPng(el, {
        cacheBust: true,
        pixelRatio: 2,
        width: el.scrollWidth,
        height: el.scrollHeight,
        style: { overflow: 'visible' },
      });
      const a = document.createElement('a');
      a.download = `${data.tourName || 'Itinerary'}_${data.customerName || 'Customer'}.png`;
      a.href = dataUrl;
      a.click();
    } catch (err) {
      console.error(err);
      alert('PNG generation failed. Try Print → Save as PDF instead.');
    } finally { setDownloading(false); }
  }, [data.tourName, data.customerName]);

  // ─── Form Panel ──────────────────────────────────────────────────────────────
  const FormPanel = () => (
    <div style={{ padding: '16px', overflowY: 'auto', height: '100%', boxSizing: 'border-box' }}>

      {/* Header Image */}
      <div style={{ marginBottom: '16px' }}>
        <label style={lbl}>Header Image</label>
        <div onClick={() => headerRef.current?.click()} style={{
          border: '2px dashed #fed7aa', borderRadius: '8px', padding: '10px',
          textAlign: 'center', cursor: 'pointer', background: LIGHT_ORANGE,
        }}>
          {headerImage
            ? <img src={headerImage} alt="hdr" style={{ maxHeight: '60px', maxWidth: '100%', objectFit: 'contain' }} />
            : <span style={{ fontSize: '12px', color: '#9a3412' }}>📷 Upload Header Image</span>}
        </div>
        <input ref={headerRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={e => loadImage(e, setHeaderImage)} />
        {headerImage && <button onClick={() => setHeaderImage(null)}
          style={{ fontSize: '10px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', marginTop: '4px' }}>✕ Remove</button>}
      </div>

      {/* Tour + Customer Info */}
      <div style={{ marginBottom: '16px' }}>
        <label style={lbl}>Tour Details</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <input placeholder="Tour Name (e.g. AYODHYA YATRA)" value={data.tourName}
            onChange={e => set('tourName', e.target.value)} style={inp} />
          <input placeholder="Customer Name (e.g. Mr. C L Kalani)" value={data.customerName}
            onChange={e => set('customerName', e.target.value)} style={inp} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <input placeholder="Quotation No (e.g. #QT000081)" value={data.quotationNo}
              onChange={e => set('quotationNo', e.target.value)} style={inp} />
            <input placeholder="Adults (e.g. 4)" type="number" value={data.adults}
              onChange={e => set('adults', e.target.value)} style={inp} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <div>
              <label style={{ ...lbl, marginBottom: '2px' }}>Start Date</label>
              <input type="date" value={data.startDate} onChange={e => set('startDate', e.target.value)} style={inp} />
            </div>
            <div>
              <label style={{ ...lbl, marginBottom: '2px' }}>End Date</label>
              <input type="date" value={data.endDate} onChange={e => set('endDate', e.target.value)} style={inp} />
            </div>
          </div>
          <input placeholder="Total Package Cost (e.g. 87960)" value={data.totalCost}
            onChange={e => set('totalCost', e.target.value)} style={inp} />
        </div>
      </div>

      {/* Days */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <label style={{ ...lbl, marginBottom: 0 }}>Day-by-Day Plan ({data.days.length} Days)</label>
          <button onClick={addDay} style={{
            padding: '4px 10px', background: ORANGE, color: '#fff',
            border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '11px', cursor: 'pointer',
          }}>+ Day</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {data.days.map(day => (
            <div key={day.id} style={{
              background: '#f8fafc', border: `1px solid ${BORDER}`,
              borderRadius: '8px', padding: '10px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: '800', fontSize: '12px', color: ORANGE }}>DAY {day.dayNumber}</span>
                {data.days.length > 1 && (
                  <button onClick={() => removeDay(day.id)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px' }}>✕</button>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <input type="date" value={day.date} onChange={e => setDay(day.id, 'date', e.target.value)} style={inp} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                  <div>
                    <label style={{ ...lbl, marginBottom: '2px' }}>Overnight Stays</label>
                    <input type="number" min={0} value={day.overNightStay}
                      onChange={e => setDay(day.id, 'overNightStay', parseInt(e.target.value) || 0)} style={inp} />
                  </div>
                  <div>
                    <label style={{ ...lbl, marginBottom: '2px' }}>Meal Plan</label>
                    <input placeholder="e.g. Breakfast and Dinner" value={day.mealPlan}
                      onChange={e => setDay(day.id, 'mealPlan', e.target.value)} style={inp} />
                  </div>
                </div>
                <textarea placeholder="Details / Activities description..." value={day.details}
                  onChange={e => setDay(day.id, 'details', e.target.value)} rows={2}
                  style={{ ...inp, resize: 'vertical' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inclusions */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <label style={{ ...lbl, marginBottom: 0 }}>Inclusions</label>
          <button onClick={() => addListItem('inclusions')} style={{
            padding: '4px 10px', background: '#16a34a', color: '#fff',
            border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '11px', cursor: 'pointer',
          }}>+</button>
        </div>
        {data.inclusions.map((inc, i) => (
          <div key={i} style={{ display: 'flex', gap: '5px', marginBottom: '5px', alignItems: 'center' }}>
            <input value={inc} onChange={e => setListItem('inclusions', i, e.target.value)}
              placeholder={`Inclusion ${i + 1}`} style={{ ...inp, flex: 1 }} />
            <button onClick={() => removeListItem('inclusions', i)}
              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', flexShrink: 0 }}>✕</button>
          </div>
        ))}
      </div>

      {/* Exclusions */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <label style={{ ...lbl, marginBottom: 0 }}>Exclusions</label>
          <button onClick={() => addListItem('exclusions')} style={{
            padding: '4px 10px', background: '#dc2626', color: '#fff',
            border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '11px', cursor: 'pointer',
          }}>+</button>
        </div>
        {data.exclusions.map((exc, i) => (
          <div key={i} style={{ display: 'flex', gap: '5px', marginBottom: '5px', alignItems: 'center' }}>
            <input value={exc} onChange={e => setListItem('exclusions', i, e.target.value)}
              placeholder={`Exclusion ${i + 1}`} style={{ ...inp, flex: 1 }} />
            <button onClick={() => removeListItem('exclusions', i)}
              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', flexShrink: 0 }}>✕</button>
          </div>
        ))}
      </div>

      {/* Notes */}
      <div style={{ marginBottom: '16px' }}>
        <label style={lbl}>Additional Notes</label>
        <textarea value={data.notes} onChange={e => set('notes', e.target.value)}
          rows={2} placeholder="Any extra notes..." style={{ ...inp, resize: 'vertical' }} />
      </div>

      {/* Footer Image */}
      <div style={{ marginBottom: '8px' }}>
        <label style={lbl}>Footer Image</label>
        <div onClick={() => footerRef.current?.click()} style={{
          border: '2px dashed #fed7aa', borderRadius: '8px', padding: '10px',
          textAlign: 'center', cursor: 'pointer', background: LIGHT_ORANGE,
        }}>
          {footerImage
            ? <img src={footerImage} alt="ftr" style={{ maxHeight: '40px', maxWidth: '100%', objectFit: 'contain' }} />
            : <span style={{ fontSize: '12px', color: '#9a3412' }}>📷 Upload Footer Image</span>}
        </div>
        <input ref={footerRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={e => loadImage(e, setFooterImage)} />
        {footerImage && <button onClick={() => setFooterImage(null)}
          style={{ fontSize: '10px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', marginTop: '4px' }}>✕ Remove</button>}
      </div>
    </div>
  );

  // ─── Preview / Output ────────────────────────────────────────────────────────
  const fmtDate = (iso: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const fmtDateShort = (iso: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB').replace(/\//g, '/');
  };

  const nights = Math.max(0, data.days.length - 1);
  const durLabel = `${nights} Night${nights !== 1 ? 's' : ''} & ${data.days.length} Day${data.days.length !== 1 ? 's' : ''}`;

  const PreviewPanel = () => (
    <div ref={previewRef} style={{
      background: '#fff', fontFamily: "'Segoe UI', Arial, sans-serif",
      color: '#1e293b', width: '100%', fontSize: '13px',
    }}>

      {/* ── Header Image ────────────────────────────────── */}
      {headerImage ? (
        <img src={headerImage} alt="header"
          style={{ width: '100%', display: 'block', maxHeight: '180px', objectFit: 'cover' }} />
      ) : (
        <img src="/style1.png" alt="header"
          style={{ width: '100%', display: 'block', maxHeight: '180px', objectFit: 'cover' }} />
      )}

      {/* ── Info Bar ────────────────────────────────────── */}
      <div style={{
        background: DARK, color: '#fff', padding: '10px 20px',
        display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '16px', alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '900', color: ORANGE, textTransform: 'uppercase', letterSpacing: '1px' }}>
            {data.tourName || 'TOUR NAME'}
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
            {data.quotationNo && `Quotation No.: ${data.quotationNo}`}
          </div>
          {data.adults && <div style={{ fontSize: '11px', color: '#94a3b8' }}>Adult(s): {data.adults}</div>}
        </div>
        <div style={{ textAlign: 'center' }}>
          {data.customerName && (
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#f1f5f9' }}>
              For : {data.customerName}
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '13px', fontWeight: '800', color: ORANGE }}>{durLabel}</div>
          {(data.startDate || data.endDate) && (
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
              {fmtDate(data.startDate)}{data.startDate && data.endDate ? ' to ' : ''}{fmtDate(data.endDate)}
            </div>
          )}
        </div>
      </div>

      {/* ── Section header ──────────────────────────────── */}
      <div style={{
        background: LIGHT_ORANGE, borderLeft: `4px solid ${ORANGE}`,
        padding: '10px 20px', margin: '0',
        fontSize: '13px', fontWeight: '800', color: '#7c2d12', textTransform: 'uppercase', letterSpacing: '1px',
      }}>
        Presenting the Detailed Itinerary
      </div>

      {/* ── Days ────────────────────────────────────────── */}
      <div style={{ padding: '0 20px' }}>
        {data.days.map(day => (
          <div key={day.id} style={{ borderBottom: `1px solid #f1f5f9`, padding: '14px 0' }}>

            {/* Day badge row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{
                background: DARK, color: '#fff', borderRadius: '6px',
                padding: '4px 12px', fontSize: '12px', fontWeight: '800',
                display: 'inline-flex', alignItems: 'center', gap: '6px',
              }}>
                ▶ DAY {String(day.dayNumber).padStart(2, '0')}
              </div>
              {day.date && (
                <div style={{
                  background: '#dcfce7', color: '#166534', borderRadius: '6px',
                  padding: '4px 10px', fontSize: '12px', fontWeight: '700',
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                }}>
                  ✓ {fmtDateShort(day.date)}
                </div>
              )}
            </div>

            {/* Day details */}
            <div style={{ paddingLeft: '8px' }}>
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '6px' }}>
                <div style={{ fontSize: '12px', color: '#475569' }}>
                  <strong style={{ color: DARK }}>Over Night Stay:</strong> {day.overNightStay}
                </div>
                <div style={{ fontSize: '12px', color: '#475569' }}>
                  <strong style={{ color: DARK }}>Meal Plan:</strong> {day.mealPlan || '—'}
                </div>
              </div>
              {day.details && (
                <div style={{ fontSize: '12px', color: '#334155', lineHeight: '1.6' }}>
                  <strong style={{ color: DARK }}>Details:</strong> {day.details}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Total Cost ──────────────────────────────────── */}
      {data.totalCost && (
        <div style={{ padding: '16px 20px' }}>
          <div style={{
            background: DARK, borderRadius: '10px', padding: '16px 24px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>
              Total Package Cost
            </div>
            <div style={{ fontSize: '20px', fontWeight: '900', color: ORANGE }}>
              INR {parseFloat(data.totalCost).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      )}

      {/* ── Inclusions ──────────────────────────────────── */}
      {data.inclusions.some(i => i.trim()) && (
        <div style={{ padding: '0 20px 16px' }}>
          <div style={{
            fontSize: '14px', fontWeight: '900', color: ORANGE,
            textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px',
            borderBottom: `2px solid ${ORANGE}`, paddingBottom: '4px',
          }}>
            Inclusions
          </div>
          {data.inclusions.filter(i => i.trim()).map((inc, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '6px' }}>
              <span style={{ color: '#16a34a', fontSize: '14px', marginTop: '1px', flexShrink: 0 }}>✅</span>
              <span style={{ fontSize: '12px', color: '#334155', lineHeight: '1.5' }}>{inc}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Exclusions ──────────────────────────────────── */}
      {data.exclusions.some(e => e.trim()) && (
        <div style={{ padding: '0 20px 16px' }}>
          <div style={{
            fontSize: '14px', fontWeight: '900', color: '#dc2626',
            textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px',
            borderBottom: '2px solid #dc2626', paddingBottom: '4px',
          }}>
            Exclusions
          </div>
          {data.exclusions.filter(e => e.trim()).map((exc, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '6px' }}>
              <span style={{ color: '#dc2626', fontSize: '14px', marginTop: '1px', flexShrink: 0 }}>☒</span>
              <span style={{ fontSize: '12px', color: '#334155', lineHeight: '1.5' }}>{exc}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Notes ───────────────────────────────────────── */}
      {data.notes.trim() && (
        <div style={{ padding: '0 20px 16px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Notes</div>
          <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.6', margin: 0 }}>{data.notes}</p>
        </div>
      )}

      {/* ── Footer Image ─────────────────────────────────── */}
      {footerImage ? (
        <img src={footerImage} alt="footer"
          style={{ width: '100%', display: 'block', maxHeight: '70px', objectFit: 'cover', marginTop: '8px' }} />
      ) : (
        <div style={{
          background: DARK, color: ORANGE, textAlign: 'center',
          padding: '10px', fontSize: '13px', fontWeight: '800', letterSpacing: '1px',
        }}>
          Mahesh Sharma Tirth Yatra — शुभ यात्रा ! मंगल यात्रा !
        </div>
      )}
    </div>
  );

  // ─── Page layout ─────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .itin-split { flex-direction: column !important; height: auto !important; }
          .itin-form-pane { width: 100% !important; height: auto !important; border-right: none !important; border-bottom: 1px solid #e2e8f0; }
          .itin-preview-pane { width: 100% !important; }
          .itin-tab-mobile { display: flex !important; }
          .itin-form-pane-wrap { display: ${activeTab === 'edit' ? 'flex' : 'none'} !important; }
          .itin-preview-pane-wrap { display: ${activeTab === 'preview' ? 'flex' : 'none'} !important; }
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 40px)' }}>

        {/* ── Header bar ────────────────────────────────── */}
        <div className="itin-no-print" style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '12px', flexWrap: 'wrap', gap: '10px',
        }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>🗺️ Itinerary Builder</h1>
            <p style={{ color: '#64748b', margin: '2px 0 0', fontSize: '12px' }}>Build → Preview → Download — zero database storage</p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Mobile tab toggles */}
            <div className="itin-tab-mobile" style={{
              display: 'none', gap: '6px',
            }}>
              {(['edit', 'preview'] as const).map(t => (
                <button key={t} onClick={() => setActiveTab(t)} style={{
                  padding: '7px 14px', borderRadius: '7px', border: `2px solid`,
                  borderColor: activeTab === t ? ORANGE : '#e2e8f0',
                  background: activeTab === t ? ORANGE : '#fff',
                  color: activeTab === t ? '#fff' : '#475569',
                  fontWeight: '700', fontSize: '12px', cursor: 'pointer',
                }}>
                  {t === 'edit' ? '✏️ Edit' : '👁️ Preview'}
                </button>
              ))}
            </div>

            <button onClick={downloadPNG} disabled={downloading} style={{
              padding: '8px 14px', background: '#7c3aed', color: '#fff', border: 'none',
              borderRadius: '8px', fontWeight: '700', cursor: downloading ? 'wait' : 'pointer',
              fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px',
            }}>
              {downloading ? '⏳...' : '🖼️ Save PNG'}
            </button>
            <button onClick={() => window.print()} style={{
              padding: '8px 14px', background: DARK, color: '#fff', border: 'none',
              borderRadius: '8px', fontWeight: '700', cursor: 'pointer',
              fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px',
            }}>
              📄 Print / PDF
            </button>
          </div>
        </div>

        {/* ── Split pane ────────────────────────────────── */}
        <div className="itin-split" style={{
          display: 'flex', flex: 1, background: '#fff', borderRadius: '12px',
          border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          overflow: 'hidden', minHeight: 0,
        }}>
          {/* Left: 60% Form */}
          <div className="itin-form-pane itin-no-print" style={{
            width: '60%', borderRight: '1px solid #e2e8f0',
            overflowY: 'auto', flexShrink: 0,
          }}>
            <FormPanel />
          </div>

          {/* Right: 40% Preview */}
          <div className="itin-preview-pane" style={{
            flex: 1, overflowY: 'auto', background: '#f8fafc',
          }}>
            <div style={{ padding: '12px', minHeight: '100%' }}>
              <div style={{
                background: '#fff', borderRadius: '8px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                overflow: 'hidden',
              }}>
                <PreviewPanel />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
