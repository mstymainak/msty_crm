'use client';

import { useState, useRef, useCallback } from 'react';
import { toPng } from 'html-to-image';

// ─── Types ───────────────────────────────────────────────────────────────────
interface DayEntry {
  id: string;
  dayNumber: number;
  date: string;
  location: string;
  description: string;
  meals: string;
  nightStay: string;
}

interface ContactInfo {
  tourManager: string;
  mobile: string;
  officeContact: string;
  doctorContact: string;
}

interface ItineraryData {
  tourName: string;
  startDate: string;
  startLocation: string;
  endLocation: string;
  days: DayEntry[];
  instructions: string[];
  contacts: ContactInfo;
  notes: string;
  bodyStyle: 'style1' | 'style2' | 'style3';
  language: 'hi' | 'en';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).substr(2, 9);

const LABELS = {
  hi: {
    tourName: 'यात्रा का नाम',
    startDate: 'यात्रा तिथि',
    startLocation: 'यात्रा प्रारंभ स्थान',
    endLocation: 'यात्रा समाप्ति स्थान',
    day: 'DAY',
    date: 'दिनांक',
    location: 'स्थान',
    description: 'कार्यक्रम विवरण',
    meals: 'भोजन',
    nightStay: 'रात्रि विश्राम',
    instructions: 'महत्वपूर्ण निर्देश',
    contacts: 'संपर्क सूत्र',
    tourManager: 'टूर मैनेजर',
    mobile: 'मोबाइल',
    officeContact: 'ऑफिस संपर्क',
    doctorContact: 'विकित्सक संपर्क',
    notes: 'नोट',
    blessing: 'शुभ यात्रा ! मंगल यात्रा !',
  },
  en: {
    tourName: 'Tour Name',
    startDate: 'Tour Date',
    startLocation: 'Starting Location',
    endLocation: 'End Location',
    day: 'DAY',
    date: 'Date',
    location: 'Location',
    description: 'Program Details',
    meals: 'Meals',
    nightStay: 'Night Stay',
    instructions: 'Important Instructions',
    contacts: 'Contact Information',
    tourManager: 'Tour Manager',
    mobile: 'Mobile',
    officeContact: 'Office Contact',
    doctorContact: 'Doctor Contact',
    notes: 'Notes',
    blessing: 'Bon Voyage! Happy Journey!',
  },
};

const DEFAULT_INSTRUCTIONS_HI = [
  'यात्रा समय पर निर्धारित स्थान पर उपस्थित हों।',
  'यात्रा के दौरान स्वच्छता एवं अनुशासन बनाए रखें।',
  'कीमती सामान की स्वयं सुरक्षा करें।',
  'किसी भी प्रकार की सहायता हेतु टूर मैनेजर से संपर्क करें।',
];

// ─── Style Themes ─────────────────────────────────────────────────────────────
const THEMES = {
  style1: {
    name: 'Pamphlet Standard',
    emoji: '🌅',
    dayBadge: '#ea580c',
    dayBadgeText: '#fff',
    headerRow: '#fff3e8',
    headerText: '#c2410c',
    border: '#fed7aa',
    icon: '#ea580c',
    footerBg: '#dc2626',
    footerText: '#fff',
    cardTitle: '#dc2626',
    cardBorder: '#fca5a5',
    accent: '#f97316',
  },
  style2: {
    name: 'Royal Deluxe',
    emoji: '✨',
    dayBadge: '#1e3a8a',
    dayBadgeText: '#f59e0b',
    headerRow: '#eff6ff',
    headerText: '#1e3a8a',
    border: '#bfdbfe',
    icon: '#1e40af',
    footerBg: '#1e3a8a',
    footerText: '#f59e0b',
    cardTitle: '#1e3a8a',
    cardBorder: '#93c5fd',
    accent: '#f59e0b',
  },
  style3: {
    name: 'Adventure Clean',
    emoji: '🏔️',
    dayBadge: '#065f46',
    dayBadgeText: '#fff',
    headerRow: '#ecfdf5',
    headerText: '#065f46',
    border: '#a7f3d0',
    icon: '#059669',
    footerBg: '#065f46',
    footerText: '#6ee7b7',
    cardTitle: '#065f46',
    cardBorder: '#6ee7b7',
    accent: '#10b981',
  },
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ItineraryPage() {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [headerImage, setHeaderImage] = useState<string | null>(null);
  const [footerImage, setFooterImage] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const headerInputRef = useRef<HTMLInputElement>(null);
  const footerInputRef = useRef<HTMLInputElement>(null);

  const [data, setData] = useState<ItineraryData>({
    tourName: '',
    startDate: '',
    startLocation: '',
    endLocation: '',
    days: [
      { id: uid(), dayNumber: 1, date: '', location: '', description: '', meals: '', nightStay: '' },
    ],
    instructions: [...DEFAULT_INSTRUCTIONS_HI],
    contacts: { tourManager: '', mobile: '', officeContact: '', doctorContact: '' },
    notes: '',
    bodyStyle: 'style1',
    language: 'hi',
  });

  const L = LABELS[data.language];
  const theme = THEMES[data.bodyStyle];

  const updateField = (field: keyof ItineraryData, value: any) =>
    setData(prev => ({ ...prev, [field]: value }));

  const addDay = () => {
    setData(prev => ({
      ...prev,
      days: [
        ...prev.days,
        {
          id: uid(),
          dayNumber: prev.days.length + 1,
          date: '',
          location: '',
          description: '',
          meals: '',
          nightStay: '',
        },
      ],
    }));
  };

  const removeDay = (id: string) => {
    setData(prev => {
      const filtered = prev.days.filter(d => d.id !== id);
      return { ...prev, days: filtered.map((d, i) => ({ ...d, dayNumber: i + 1 })) };
    });
  };

  const updateDay = (id: string, field: keyof DayEntry, value: string) => {
    setData(prev => ({
      ...prev,
      days: prev.days.map(d => (d.id === id ? { ...d, [field]: value } : d)),
    }));
  };

  const updateInstruction = (index: number, value: string) => {
    setData(prev => {
      const copy = [...prev.instructions];
      copy[index] = value;
      return { ...prev, instructions: copy };
    });
  };

  const addInstruction = () =>
    setData(prev => ({ ...prev, instructions: [...prev.instructions, ''] }));

  const removeInstruction = (index: number) =>
    setData(prev => ({ ...prev, instructions: prev.instructions.filter((_, i) => i !== index) }));

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (v: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setter(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDownloadPNG = useCallback(async () => {
    if (!previewRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(previewRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `${data.tourName || 'Itinerary'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('PNG download error:', err);
      alert('Could not generate image. Please try the PDF option instead.');
    } finally {
      setDownloading(false);
    }
  }, [data.tourName]);

  const handlePrint = () => window.print();

  // ── Form Panel ──────────────────────────────────────────────────────────────
  const FormPanel = () => (
    <div style={{ padding: '20px', overflowY: 'auto', height: '100%', boxSizing: 'border-box' }}>
      <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 20px' }}>
        ✏️ Edit Itinerary
      </h2>

      {/* Language Toggle */}
      <section style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>Language</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['hi', 'en'] as const).map(lang => (
            <button
              key={lang}
              onClick={() => updateField('language', lang)}
              style={{
                padding: '7px 16px',
                borderRadius: '8px',
                border: `2px solid ${data.language === lang ? theme.accent : '#e2e8f0'}`,
                background: data.language === lang ? theme.accent : '#fff',
                color: data.language === lang ? '#fff' : '#475569',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              {lang === 'hi' ? 'हिंदी' : 'English'}
            </button>
          ))}
        </div>
      </section>

      {/* Header Image */}
      <section style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>Header Image</label>
        <div
          onClick={() => headerInputRef.current?.click()}
          style={{
            border: '2px dashed #e2e8f0',
            borderRadius: '8px',
            padding: '14px',
            textAlign: 'center',
            cursor: 'pointer',
            background: '#f8fafc',
            transition: 'border-color 0.2s',
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.borderColor = theme.accent)}
          onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.borderColor = '#e2e8f0')}
        >
          {headerImage ? (
            <img src={headerImage} alt="Header" style={{ maxWidth: '100%', maxHeight: '80px', objectFit: 'contain', borderRadius: '4px' }} />
          ) : (
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>📷 Click to upload header image</span>
          )}
        </div>
        <input
          ref={headerInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => handleImageUpload(e, setHeaderImage)}
        />
        {headerImage && (
          <button
            onClick={() => setHeaderImage(null)}
            style={{ marginTop: '6px', fontSize: '11px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ✕ Remove header image
          </button>
        )}
      </section>

      {/* Tour Details */}
      <section style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>Tour Details</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input
            placeholder={L.tourName}
            value={data.tourName}
            onChange={e => updateField('tourName', e.target.value)}
            style={inputStyle}
          />
          <input
            type="date"
            placeholder={L.startDate}
            value={data.startDate}
            onChange={e => updateField('startDate', e.target.value)}
            style={inputStyle}
          />
          <input
            placeholder={L.startLocation}
            value={data.startLocation}
            onChange={e => updateField('startLocation', e.target.value)}
            style={inputStyle}
          />
          <input
            placeholder={L.endLocation}
            value={data.endLocation}
            onChange={e => updateField('endLocation', e.target.value)}
            style={inputStyle}
          />
        </div>
      </section>

      {/* Day Entries */}
      <section style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>Day-by-Day Plan</label>
          <button onClick={addDay} style={addBtnStyle(theme.accent)}>+ Add Day</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {data.days.map((day, index) => (
            <div key={day.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: '700', fontSize: '13px', color: theme.dayBadge }}>
                  DAY {day.dayNumber}
                </span>
                {data.days.length > 1 && (
                  <button
                    onClick={() => removeDay(day.id)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px' }}
                  >
                    ✕
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <input type="date" placeholder={L.date} value={day.date} onChange={e => updateDay(day.id, 'date', e.target.value)} style={smallInputStyle} />
                <input placeholder={L.location} value={day.location} onChange={e => updateDay(day.id, 'location', e.target.value)} style={smallInputStyle} />
                <textarea
                  placeholder={L.description}
                  value={day.description}
                  onChange={e => updateDay(day.id, 'description', e.target.value)}
                  rows={2}
                  style={{ ...smallInputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                />
                <input placeholder={L.meals} value={day.meals} onChange={e => updateDay(day.id, 'meals', e.target.value)} style={smallInputStyle} />
                <input placeholder={L.nightStay} value={day.nightStay} onChange={e => updateDay(day.id, 'nightStay', e.target.value)} style={smallInputStyle} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Instructions */}
      <section style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>{L.instructions}</label>
          <button onClick={addInstruction} style={addBtnStyle(theme.accent)}>+ Add</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {data.instructions.map((inst, i) => (
            <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input
                value={inst}
                onChange={e => updateInstruction(i, e.target.value)}
                style={{ ...smallInputStyle, flex: 1 }}
              />
              <button
                onClick={() => removeInstruction(i)}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px', flexShrink: 0 }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Contacts */}
      <section style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>{L.contacts}</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <input placeholder={L.tourManager} value={data.contacts.tourManager} onChange={e => updateField('contacts', { ...data.contacts, tourManager: e.target.value })} style={smallInputStyle} />
          <input placeholder={L.mobile} value={data.contacts.mobile} onChange={e => updateField('contacts', { ...data.contacts, mobile: e.target.value })} style={smallInputStyle} />
          <input placeholder={L.officeContact} value={data.contacts.officeContact} onChange={e => updateField('contacts', { ...data.contacts, officeContact: e.target.value })} style={smallInputStyle} />
          <input placeholder={L.doctorContact} value={data.contacts.doctorContact} onChange={e => updateField('contacts', { ...data.contacts, doctorContact: e.target.value })} style={smallInputStyle} />
        </div>
      </section>

      {/* Notes */}
      <section style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>{L.notes}</label>
        <textarea
          placeholder="Enter notes here..."
          value={data.notes}
          onChange={e => updateField('notes', e.target.value)}
          rows={3}
          style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
        />
      </section>

      {/* Footer Image */}
      <section style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>Footer Image</label>
        <div
          onClick={() => footerInputRef.current?.click()}
          style={{
            border: '2px dashed #e2e8f0',
            borderRadius: '8px',
            padding: '14px',
            textAlign: 'center',
            cursor: 'pointer',
            background: '#f8fafc',
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.borderColor = theme.accent)}
          onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.borderColor = '#e2e8f0')}
        >
          {footerImage ? (
            <img src={footerImage} alt="Footer" style={{ maxWidth: '100%', maxHeight: '50px', objectFit: 'contain', borderRadius: '4px' }} />
          ) : (
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>📷 Click to upload footer image</span>
          )}
        </div>
        <input
          ref={footerInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => handleImageUpload(e, setFooterImage)}
        />
        {footerImage && (
          <button
            onClick={() => setFooterImage(null)}
            style={{ marginTop: '6px', fontSize: '11px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ✕ Remove footer image
          </button>
        )}
      </section>

      {/* Body Style Selector */}
      <section style={{ marginBottom: '12px' }}>
        <label style={labelStyle}>Itinerary Style</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {(Object.entries(THEMES) as [string, typeof THEMES.style1][]).map(([key, t]) => (
            <button
              key={key}
              onClick={() => updateField('bodyStyle', key)}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: `2px solid ${data.bodyStyle === key ? t.accent : '#e2e8f0'}`,
                background: data.bodyStyle === key ? t.accent + '18' : '#fff',
                color: '#0f172a',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '13px',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
              }}
            >
              <span>{t.emoji}</span>
              <div>
                <div style={{ fontWeight: '700' }}>{t.name}</div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '400' }}>
                  {key === 'style1' ? 'Saffron & Crimson — Traditional' : key === 'style2' ? 'Navy & Gold — Premium' : 'Green & Mint — Modern'}
                </div>
              </div>
              {data.bodyStyle === key && <span style={{ marginLeft: 'auto', color: t.accent }}>✓</span>}
            </button>
          ))}
        </div>
      </section>
    </div>
  );

  // ── Preview Panel ────────────────────────────────────────────────────────────
  const PreviewPanel = () => (
    <div ref={previewRef} style={{
      background: '#fff',
      fontFamily: data.bodyStyle === 'style1' ? "'Noto Sans Devanagari', Arial, sans-serif" : "'Inter', Arial, sans-serif",
      color: '#0f172a',
      width: '100%',
    }}>
      {/* Header */}
      {headerImage ? (
        <img
          src={headerImage}
          alt="Itinerary Header"
          style={{ width: '100%', display: 'block', maxHeight: '200px', objectFit: 'cover' }}
        />
      ) : (
        <div style={{
          background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 50%, #f97316 100%)',
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100px',
          borderBottom: `4px solid ${theme.accent}`,
        }}>
          <span style={{ color: '#7c2d12', fontSize: '14px', fontWeight: '600', opacity: 0.7 }}>
            📷 Upload your header image on the left panel
          </span>
        </div>
      )}

      {/* Tour Details Grid */}
      <div style={{ padding: '16px 20px', borderBottom: `2px solid ${theme.border}`, background: theme.headerRow }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px' }}>
          {[
            [L.tourName, data.tourName],
            [L.startLocation, data.startLocation],
            [L.startDate, data.startDate ? new Date(data.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : ''],
            [L.endLocation, data.endLocation],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '10px', fontWeight: '700', color: theme.headerText, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', borderBottom: `1px solid ${theme.border}`, paddingBottom: '2px', minHeight: '20px' }}>
                {value || ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Day Rows — Landscape flow */}
      <div style={{ padding: '0 20px' }}>
        {data.days.map(day => (
          <div key={day.id} style={{
            display: 'grid',
            gridTemplateColumns: '80px 1fr',
            borderBottom: `1px solid ${theme.border}`,
            minHeight: '70px',
          }}>
            {/* Day Badge */}
            <div style={{
              background: theme.dayBadge,
              color: theme.dayBadgeText,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 4px',
              borderRight: `2px solid ${theme.border}`,
            }}>
              <span style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>{L.day}</span>
              <span style={{ fontSize: '24px', fontWeight: '900', lineHeight: 1 }}>
                {String(day.dayNumber).padStart(2, '0')}
              </span>
              {day.date && (
                <span style={{ fontSize: '9px', marginTop: '4px', opacity: 0.85, textAlign: 'center' }}>
                  {new Date(day.date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                </span>
              )}
            </div>

            {/* Day Details — landscape flow */}
            <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {/* Main row: Location — Description */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                {day.location && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px', minWidth: '100px' }}>
                    <span style={{ color: theme.icon, fontSize: '12px', marginTop: '1px' }}>📍</span>
                    <div>
                      <div style={{ fontSize: '9px', color: theme.headerText, fontWeight: '700', textTransform: 'uppercase' }}>{L.location}</div>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>{day.location}</div>
                    </div>
                  </div>
                )}
                {day.description && (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                    <span style={{ color: theme.icon, fontSize: '12px', marginTop: '1px' }}>📋</span>
                    <div>
                      <div style={{ fontSize: '9px', color: theme.headerText, fontWeight: '700', textTransform: 'uppercase' }}>{L.description}</div>
                      <div style={{ fontSize: '12px', color: '#334155', lineHeight: '1.4' }}>{day.description}</div>
                    </div>
                  </div>
                )}
              </div>
              {/* Sub row: Meals | Night Stay */}
              {(day.meals || day.nightStay) && (
                <div style={{ display: 'flex', gap: '16px', marginTop: '6px', flexWrap: 'wrap' }}>
                  {day.meals && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ color: theme.icon, fontSize: '11px' }}>🍽️</span>
                      <span style={{ fontSize: '10px', color: '#64748b' }}>
                        <strong style={{ color: theme.headerText }}>{L.meals}:</strong> {day.meals}
                      </span>
                    </div>
                  )}
                  {day.nightStay && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ color: theme.icon, fontSize: '11px' }}>🏨</span>
                      <span style={{ fontSize: '10px', color: '#64748b' }}>
                        <strong style={{ color: theme.headerText }}>{L.nightStay}:</strong> {day.nightStay}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', padding: '16px 20px' }}>
        {/* Instructions */}
        <div style={{ border: `1px solid ${theme.cardBorder}`, borderRadius: '8px', padding: '12px' }}>
          <div style={{ fontSize: '12px', fontWeight: '800', color: theme.cardTitle, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            💡 {L.instructions}
          </div>
          <ul style={{ margin: 0, paddingLeft: '14px', listStyle: 'disc' }}>
            {data.instructions.filter(i => i.trim()).map((inst, i) => (
              <li key={i} style={{ fontSize: '10px', color: '#334155', marginBottom: '4px', lineHeight: '1.4' }}>{inst}</li>
            ))}
          </ul>
        </div>

        {/* Contacts */}
        <div style={{ border: `1px solid ${theme.cardBorder}`, borderRadius: '8px', padding: '12px' }}>
          <div style={{ fontSize: '12px', fontWeight: '800', color: theme.cardTitle, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            📞 {L.contacts}
          </div>
          {[
            [L.tourManager, data.contacts.tourManager],
            [L.mobile, data.contacts.mobile],
            [L.officeContact, data.contacts.officeContact],
            [L.doctorContact, data.contacts.doctorContact],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', gap: '4px', marginBottom: '4px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '700', color: theme.cardTitle, minWidth: '80px', flexShrink: 0 }}>{label}:</span>
              <span style={{ fontSize: '10px', color: '#334155', borderBottom: '1px dotted #cbd5e1', flex: 1, minHeight: '14px' }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div style={{ border: `1px solid ${theme.cardBorder}`, borderRadius: '8px', padding: '12px' }}>
          <div style={{ fontSize: '12px', fontWeight: '800', color: theme.cardTitle, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            ✏️ {L.notes}
          </div>
          <div style={{ fontSize: '10px', color: '#334155', lineHeight: '1.8', whiteSpace: 'pre-wrap', minHeight: '60px' }}>
            {data.notes || ''}
          </div>
          {/* Ruled lines */}
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ borderBottom: '1px dotted #e2e8f0', height: '14px' }} />
          ))}
        </div>
      </div>

      {/* Footer */}
      {footerImage ? (
        <img
          src={footerImage}
          alt="Itinerary Footer"
          style={{ width: '100%', display: 'block', maxHeight: '70px', objectFit: 'cover' }}
        />
      ) : (
        <div style={{
          background: theme.footerBg,
          color: theme.footerText,
          textAlign: 'center',
          padding: '12px 20px',
          fontSize: '15px',
          fontWeight: '800',
          letterSpacing: '1px',
        }}>
          {L.blessing}
        </div>
      )}
    </div>
  );

  // ── Page Layout ──────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @media print {
          .itinerary-no-print { display: none !important; }
          .itinerary-preview-wrap { width: 100% !important; overflow: visible !important; box-shadow: none !important; border: none !important; }
          body, html { background: #fff !important; }
        }
        @media (max-width: 768px) {
          .itin-split { flex-direction: column !important; height: auto !important; }
          .itin-form-pane { width: 100% !important; height: auto !important; border-right: none !important; border-bottom: 1px solid #e2e8f0 !important; }
          .itin-preview-pane { width: 100% !important; }
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 40px)' }}>
        {/* Page Header */}
        <div className="itinerary-no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', margin: 0 }}>🗺️ Itinerary Builder</h1>
            <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '13px' }}>Create and download custom tour itineraries — zero storage used</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Mobile tab toggles */}
            <div className="itin-mobile-tabs" style={{ display: 'none' }}>
              {(['edit', 'preview'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '2px solid',
                    borderColor: activeTab === tab ? theme.accent : '#e2e8f0',
                    background: activeTab === tab ? theme.accent : '#fff',
                    color: activeTab === tab ? '#fff' : '#475569',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {tab === 'edit' ? '✏️ Edit' : '👁️ Preview'}
                </button>
              ))}
            </div>
            <button
              onClick={handleDownloadPNG}
              disabled={downloading}
              style={{ padding: '9px 16px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: downloading ? 'wait' : 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {downloading ? '⏳ Generating...' : '🖼️ Download PNG'}
            </button>
            <button
              onClick={handlePrint}
              style={{ padding: '9px 16px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              📄 Print / PDF
            </button>
          </div>
        </div>

        {/* Split Pane */}
        <div
          className="itin-split"
          style={{ display: 'flex', flex: 1, background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden', minHeight: 0 }}
        >
          {/* Left: Form */}
          <div
            className="itin-form-pane itinerary-no-print"
            style={{ width: '38%', borderRight: '1px solid #e2e8f0', overflowY: 'auto', flexShrink: 0 }}
          >
            <FormPanel />
          </div>

          {/* Right: Preview */}
          <div
            className="itin-preview-pane itinerary-preview-wrap"
            style={{ flex: 1, overflowY: 'auto', background: '#f8fafc' }}
          >
            <div style={{ padding: '16px', minHeight: '100%' }}>
              <div
                style={{
                  background: '#fff',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  overflow: 'hidden',
                }}
              >
                <PreviewPanel />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Shared Styles ────────────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: '700',
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '13px',
  outline: 'none',
  boxSizing: 'border-box',
  background: '#fff',
};

const smallInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '7px 10px',
  border: '1px solid #e2e8f0',
  borderRadius: '6px',
  fontSize: '12px',
  outline: 'none',
  boxSizing: 'border-box',
  background: '#fff',
};

const addBtnStyle = (accent: string): React.CSSProperties => ({
  padding: '5px 12px',
  background: accent,
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  fontWeight: '700',
  fontSize: '12px',
  cursor: 'pointer',
});
