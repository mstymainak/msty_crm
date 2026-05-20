'use client';

import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';

type TimelineDay = {
  dayNumber: number;
  dateString: string;
  location: string;
  activities: string;
  meals: string;
  accommodation: string;
};

export default function ItineraryBuilder() {
  const [title, setTitle] = useState('');
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [headerImage, setHeaderImage] = useState('/style1.png');
  const [language, setLanguage] = useState('hi');
  
  const [timeline, setTimeline] = useState<TimelineDay[]>([
    { dayNumber: 1, dateString: '', location: '', activities: '', meals: '', accommodation: '' }
  ]);
  
  const [importantInstructions, setImportantInstructions] = useState(
    'यात्रा समय पर निर्धारित स्थान पर उपस्थित हों।\nयात्रा के दौरान स्वच्छता एवं अनुशासन बनाए रखें।\nकीमती सामान की स्वयं सुरक्षा करें।\nकिसी भी प्रकार की सहायता हेतु टूर मैनेजर से संपर्क करें।'
  );
  
  const [tourManager, setTourManager] = useState('');
  const [mobile, setMobile] = useState('');
  const [officeContact, setOfficeContact] = useState('');
  const [doctorContact, setDoctorContact] = useState('');
  const [agentNotes, setAgentNotes] = useState('');

  const previewRef = useRef<HTMLDivElement>(null);

  const handleDownloadImage = async () => {
    if (previewRef.current) {
      const canvas = await html2canvas(previewRef.current, { scale: 2 });
      const link = document.createElement('a');
      link.download = 'Itinerary.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setHeaderImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const addDay = () => {
    setTimeline(prev => [
      ...prev,
      { dayNumber: prev.length + 1, dateString: '', location: '', activities: '', meals: '', accommodation: '' }
    ]);
  };

  const updateDay = (index: number, field: keyof TimelineDay, value: string) => {
    const newTimeline = [...timeline];
    newTimeline[index] = { ...newTimeline[index], [field]: value };
    setTimeline(newTimeline);
  };

  const removeDay = (index: number) => {
    const newTimeline = timeline.filter((_, i) => i !== index).map((day, i) => ({ ...day, dayNumber: i + 1 }));
    setTimeline(newTimeline);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          .printable-area, .printable-area * { visibility: visible; }
          .printable-area { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; margin: 0 !important; }
          .no-print { display: none !important; }
          /* Fix background colors for print */
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}} />
      <div style={{ display: 'flex', height: '100vh', background: '#f8fafc', overflow: 'hidden' }}>
        {/* Left Pane - Form Editor */}
        <div className="no-print" style={{ width: '50%', overflowY: 'auto', padding: '24px', borderRight: '1px solid #e2e8f0', background: '#fff' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', marginBottom: '20px' }}>🗺️ Custom Itinerary Builder</h1>
          
          <div style={{ background: '#f1f5f9', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Tour Details & Header</h2>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Custom Header Image (Optional)</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ width: '100%', fontSize: '12px' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b' }}>Tour Name</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b' }}>Date</label>
                <input type="text" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b' }}>Start Location</label>
                <input type="text" value={startLocation} onChange={e => setStartLocation(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b' }}>End Location</label>
                <input type="text" value={endLocation} onChange={e => setEndLocation(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
              </div>
            </div>
          </div>

          <div style={{ background: '#f1f5f9', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600' }}>Day-by-Day Itinerary</h2>
              <button onClick={addDay} style={{ background: '#ea580c', color: '#fff', padding: '4px 12px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', border: 'none' }}>+ Add Day</button>
            </div>
            
            {timeline.map((day, idx) => (
              <div key={idx} style={{ background: '#fff', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '14px', color: '#f97316' }}>Day {day.dayNumber}</strong>
                  {timeline.length > 1 && (
                    <button onClick={() => removeDay(idx)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Remove</button>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                  <input placeholder="Date (e.g. 12/05/2026)" value={day.dateString} onChange={e => updateDay(idx, 'dateString', e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                  <input placeholder="Location" value={day.location} onChange={e => updateDay(idx, 'location', e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                </div>
                <textarea placeholder="Activities Description" value={day.activities} onChange={e => updateDay(idx, 'activities', e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px', minHeight: '60px', marginBottom: '8px' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <input placeholder="Meals (e.g. Breakfast & Dinner)" value={day.meals} onChange={e => updateDay(idx, 'meals', e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                  <input placeholder="Accommodation (Hotel Name)" value={day.accommodation} onChange={e => updateDay(idx, 'accommodation', e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: '#f1f5f9', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Footer Details</h2>
            <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Important Instructions</label>
            <textarea value={importantInstructions} onChange={e => setImportantInstructions(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px', minHeight: '80px', marginBottom: '12px' }} />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b' }}>Tour Manager</label>
                <input type="text" value={tourManager} onChange={e => setTourManager(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b' }}>Mobile</label>
                <input type="text" value={mobile} onChange={e => setMobile(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b' }}>Office Contact</label>
                <input type="text" value={officeContact} onChange={e => setOfficeContact(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b' }}>Doctor Contact</label>
                <input type="text" value={doctorContact} onChange={e => setDoctorContact(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
              </div>
            </div>
            
            <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginTop: '12px', marginBottom: '4px' }}>Custom Notes</label>
            <textarea value={agentNotes} onChange={e => setAgentNotes(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px', minHeight: '60px' }} />
          </div>
        </div>
        
        {/* Right Pane - Live Preview */}
        <div style={{ width: '50%', overflowY: 'auto', background: '#e2e8f0', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <div className="no-print" style={{ position: 'sticky', top: 0, padding: '16px 24px', background: 'rgba(203, 213, 225, 0.9)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'flex-end', gap: '8px', zIndex: 50, borderBottom: '1px solid #94a3b8' }}>
            <select value={language} onChange={e => setLanguage(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '14px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <option value="hi">Hindi (hi)</option>
              <option value="en">English (en)</option>
            </select>
            <button onClick={handleDownloadImage} style={{ background: '#f59e0b', color: '#fff', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>⬇️ Image</button>
            <button onClick={handlePrintPdf} style={{ background: '#10b981', color: '#fff', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>🖨️ PDF</button>
          </div>
          
          <div style={{ padding: '32px 24px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ transform: 'scale(0.85)', transformOrigin: 'top center', paddingBottom: '100px' }}>
              <div ref={previewRef} className="printable-area" style={{ width: '210mm', minHeight: '297mm', background: '#fff', margin: '0 auto', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column' }}>
            {/* GLOBAL HEADER (User Uploaded or Default) */}
            <div style={{ width: '100%', overflow: 'hidden', borderBottom: '2px solid #ea580c' }}>
              {headerImage && <img src={headerImage} alt="Header" style={{ width: '100%', height: 'auto', display: 'block' }} />}
            </div>

            {/* Tour Meta Info */}
            <div style={{ padding: '24px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 40px', fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', borderBottom: '1px dotted #94a3b8', paddingBottom: '4px' }}>
                <span style={{ fontWeight: '600', marginRight: '8px', whiteSpace: 'nowrap' }}>{language === 'hi' ? 'यात्रा का नाम :' : 'Tour Name :'}</span>
                <span style={{ color: '#ea580c', fontWeight: 'bold', flex: 1 }}>{title}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', borderBottom: '1px dotted #94a3b8', paddingBottom: '4px' }}>
                <span style={{ fontWeight: '600', marginRight: '8px', whiteSpace: 'nowrap' }}>{language === 'hi' ? 'यात्रा प्रारंभ स्थान :' : 'Start Location :'}</span>
                <span style={{ color: '#334155', flex: 1 }}>{startLocation}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', borderBottom: '1px dotted #94a3b8', paddingBottom: '4px' }}>
                <span style={{ fontWeight: '600', marginRight: '8px', whiteSpace: 'nowrap' }}>{language === 'hi' ? 'यात्रा तिथि :' : 'Tour Date :'}</span>
                <span style={{ color: '#334155', flex: 1 }}>{startDate}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', borderBottom: '1px dotted #94a3b8', paddingBottom: '4px' }}>
                <span style={{ fontWeight: '600', marginRight: '8px', whiteSpace: 'nowrap' }}>{language === 'hi' ? 'यात्रा समाप्ति स्थान :' : 'End Location :'}</span>
                <span style={{ color: '#334155', flex: 1 }}>{endLocation}</span>
              </div>
            </div>

            {/* Day by Day Body */}
            <div style={{ padding: '20px 40px', flex: 1 }}>
              {timeline.map((day, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', 
                  marginBottom: '16px', 
                  border: '1px solid #fed7aa',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  background: '#fff',
                  pageBreakInside: 'avoid'
                }}>
                  {/* Left Badge */}
                  <div style={{ 
                    width: '80px', 
                    background: idx % 2 === 0 ? '#ea580c' : '#d97706', 
                    color: '#fff', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    padding: '12px 0'
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px' }}>DAY</div>
                    <div style={{ fontSize: '28px', fontWeight: '900', lineHeight: '1' }}>{day.dayNumber.toString().padStart(2, '0')}</div>
                  </div>
                  <div style={{ width: '80px', background: '#fffbf5', borderRight: '1px solid #e2e8f0', borderTop: 'none', borderBottom: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0', marginLeft: '-80px', marginTop: '60px' }}>
                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>{language === 'hi' ? 'दिनांक' : 'Date'}</div>
                    <div style={{ fontSize: '11px', color: '#0f172a', borderBottom: '1px dotted #94a3b8', width: '60px', textAlign: 'center', paddingBottom: '2px' }}>{day.dateString || '___/___'}</div>
                  </div>
                  
                  {/* Right Content */}
                  <div style={{ flex: 1, padding: '12px 16px', display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr', gap: '16px' }}>
                    <div>
                      <div style={{ color: '#ea580c', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                        📍 {language === 'hi' ? 'स्थान' : 'Location'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#334155', fontWeight: '600' }}>{day.location}</div>
                    </div>
                    <div>
                      <div style={{ color: '#ea580c', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                        🗓️ {language === 'hi' ? 'कार्यक्रम विवरण' : 'Program'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#475569', whiteSpace: 'pre-wrap' }}>{day.activities}</div>
                    </div>
                    <div>
                      <div style={{ color: '#ea580c', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                        🍽️ {language === 'hi' ? 'भोजन' : 'Meals'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#475569' }}>{day.meals}</div>
                    </div>
                    <div>
                      <div style={{ color: '#ea580c', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                        🏨 {language === 'hi' ? 'रात्रि विश्राम' : 'Stay'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#475569' }}>{day.accommodation}</div>
                    </div>
                  </div>
                </div>
              ))}
              
              <div style={{ textAlign: 'center', margin: '20px 0', color: '#ea580c', fontSize: '12px', fontWeight: 'bold' }}>
                --- {language === 'hi' ? 'इसी प्रकार आगे...' : 'And so on...'} ---
              </div>
            </div>

            <div style={{ marginTop: 'auto', pageBreakInside: 'avoid' }}>
              {/* Footer Cards */}
              <div style={{ padding: '0 40px', display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '16px' }}>
              <div style={{ border: '1px solid #fed7aa', borderRadius: '4px', background: '#fffbf5', overflow: 'hidden' }}>
                <div style={{ background: '#ea580c', color: '#fff', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  💡 {language === 'hi' ? 'महत्वपूर्ण निर्देश' : 'Instructions'}
                </div>
                <ul style={{ margin: 0, padding: '12px 12px 12px 24px', fontSize: '10px', color: '#475569', lineHeight: '1.6' }}>
                  {importantInstructions.split('\n').filter(Boolean).map((line, i) => <li key={i}>{line}</li>)}
                </ul>
              </div>
              <div style={{ border: '1px solid #fed7aa', borderRadius: '4px', background: '#fffbf5', overflow: 'hidden' }}>
                <div style={{ background: '#ea580c', color: '#fff', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  📞 {language === 'hi' ? 'संपर्क सूत्र' : 'Contacts'}
                </div>
                <div style={{ padding: '12px', fontSize: '10px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{language === 'hi' ? 'टूर मैनेजर' : 'Tour Mgr'} :</span> <strong>{tourManager}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{language === 'hi' ? 'मोबाइल' : 'Mobile'} :</span> <strong>{mobile}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{language === 'hi' ? 'ऑफिस संपर्क' : 'Office'} :</span> <strong>{officeContact}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{language === 'hi' ? 'चिकित्सक' : 'Doctor'} :</span> <strong>{doctorContact}</strong></div>
                </div>
              </div>
              <div style={{ border: '1px solid #fed7aa', borderRadius: '4px', background: '#fffbf5', overflow: 'hidden' }}>
                <div style={{ background: '#ea580c', color: '#fff', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🖊️ {language === 'hi' ? 'नोट' : 'Note'}
                </div>
                <div style={{ padding: '12px', fontSize: '11px', color: '#475569', whiteSpace: 'pre-wrap', lineHeight: '1.8', background: 'repeating-linear-gradient(transparent, transparent 19px, #e2e8f0 20px)' }}>
                  {agentNotes || '\n\n\n\n'}
                </div>
              </div>
            </div>

              {/* Bottom Bar */}
              <div style={{ background: 'linear-gradient(to right, #ea580c, #dc2626)', marginTop: '24px', padding: '12px 40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                 <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
                   🌸 {language === 'hi' ? 'शुभ यात्रा ! मंगल यात्रा !' : 'Happy & Auspicious Journey !'} 🌸
                 </h2>
              </div>
            </div>
          </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
