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
  const [template, setTemplate] = useState('pamphlet-standard');
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
            <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Tour Details</h2>
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
        <div style={{ width: '50%', overflowY: 'auto', padding: '24px', background: '#94a3b8', position: 'relative' }}>
          <div className="no-print" style={{ position: 'sticky', top: 0, display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '16px', zIndex: 10 }}>
            <select value={template} onChange={e => setTemplate(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '14px', cursor: 'pointer' }}>
              <option value="pamphlet-standard">Template 1: Pamphlet Standard</option>
              <option value="royal-deluxe">Template 2: Royal Deluxe</option>
              <option value="spiritual-adventure">Template 3: Spiritual Adventure</option>
            </select>
            <select value={language} onChange={e => setLanguage(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '14px', cursor: 'pointer' }}>
              <option value="hi">Hindi (hi)</option>
              <option value="en">English (en)</option>
            </select>
            <button onClick={handleDownloadImage} style={{ background: '#f59e0b', color: '#fff', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>⬇️ Image</button>
            <button onClick={handlePrintPdf} style={{ background: '#10b981', color: '#fff', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>🖨️ PDF</button>
          </div>
          
          <div ref={previewRef} className="printable-area" style={{ width: '210mm', minHeight: '297mm', background: '#fff', margin: '0 auto', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', fontFamily: 'sans-serif', paddingBottom: '20px' }}>
            {/* GLOBAL HEADER (Matches itinearary1.png) */}
            <div style={{ position: 'relative', width: '100%', height: '220px', background: 'linear-gradient(to right, #fff 0%, #fff 40%, #ea580c 40%, #991b1b 100%)', overflow: 'hidden' }}>
              {/* Left Side (White area) */}
              <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '8px', zIndex: 2 }}>
                <div style={{ background: 'linear-gradient(to right, #ea580c, #dc2626)', color: '#fff', padding: '4px 12px', borderRadius: '12px 0 12px 0', fontSize: '10px', fontWeight: 'bold' }}>
                  SINCE 1999 | GST- 08AAUCM0755D1ZA
                </div>
              </div>
              <div style={{ position: 'absolute', top: '10px', right: '40%', marginRight: '10px', zIndex: 2 }}>
                <div style={{ background: '#1e293b', color: '#fff', padding: '4px 16px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' }}>
                  वरिष्ठ नागरिकों को समर्पित कंपनी
                </div>
              </div>

              <div style={{ position: 'absolute', top: '40px', left: '20px', zIndex: 2 }}>
                <h1 style={{ color: '#dc2626', fontSize: '32px', fontWeight: '900', margin: 0, textShadow: '1px 1px 0px rgba(0,0,0,0.1)', fontFamily: '"Tiro Devanagari Hindi", serif' }}>महेश शर्मा तीर्थ यात्रा</h1>
                <p style={{ color: '#0f172a', fontSize: '14px', fontWeight: 'bold', margin: '4px 0 8px 0' }}>प्रा. लि. कम्पनी, जोधपुर(राज.)</p>
                <div style={{ fontSize: '10px', color: '#475569', lineHeight: '1.4' }}>
                  🌐 www.maheshsharmatirthyatra.com<br/>
                  ✉️ maheshsharmayatra@gmail.com
                </div>
                <div style={{ color: '#ea580c', fontSize: '16px', fontWeight: 'bold', marginTop: '8px' }}>
                  📞 9314013412 <span style={{ color: '#475569' }}>|</span> 📞 9414141636
                </div>
              </div>

              {/* Center Temple Logo */}
              <div style={{ position: 'absolute', top: '50px', left: '32%', width: '120px', height: '120px', background: '#f59e0b', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', zIndex: 3, border: '4px solid #fff' }}>
                <div style={{ fontSize: '24px' }}>🏛️</div>
                <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14px', color: '#78350f', lineHeight: '1.1', marginTop: '4px' }}>महेश शर्मा<br/>तीर्थ यात्रा</div>
                <div style={{ fontSize: '8px', color: '#78350f', marginTop: '2px' }}>(प्रा. लि. कम्पनी)</div>
              </div>

              {/* Right Side (Gradient area) */}
              <div style={{ position: 'absolute', top: '40px', right: '20px', width: '30%', zIndex: 2, textAlign: 'center' }}>
                <div style={{ color: '#fef08a', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>हमारे यहाँ सभी प्रकार की धार्मिक यात्राएँ उपलब्ध</div>
                <div style={{ color: '#fff', fontSize: '10px', lineHeight: '1.3', textAlign: 'center' }}>
                  यमुनोत्री, गंगोत्री, केदारनाथ, बद्रीनाथ, रामेश्वरम,<br/>
                  जगन्नाथ पुरी, तिरुपति, 12 ज्योतिर्लिंग, सोमनाथ,<br/>
                  काठमांडू (नेपाल), भूटान आदि<br/>
                  धार्मिक यात्राओं का सफल आयोजन रेल,<br/>
                  बस व हवाई सेवाओं द्वारा करवाया जाता है
                </div>
              </div>
            </div>

            {/* Tour Meta Info */}
            <div style={{ padding: '20px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 40px', fontSize: '13px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', borderBottom: '1px dotted #94a3b8', paddingBottom: '4px' }}>
                <span style={{ fontWeight: '600', width: '120px' }}>{language === 'hi' ? 'यात्रा का नाम :' : 'Tour Name :'}</span>
                <span style={{ color: '#ea580c', fontWeight: 'bold' }}>{title}</span>
              </div>
              <div style={{ display: 'flex', borderBottom: '1px dotted #94a3b8', paddingBottom: '4px' }}>
                <span style={{ fontWeight: '600', width: '140px' }}>{language === 'hi' ? 'यात्रा प्रारंभ स्थान :' : 'Start Location :'}</span>
                <span style={{ color: '#334155' }}>{startLocation}</span>
              </div>
              <div style={{ display: 'flex', borderBottom: '1px dotted #94a3b8', paddingBottom: '4px' }}>
                <span style={{ fontWeight: '600', width: '120px' }}>{language === 'hi' ? 'यात्रा तिथि :' : 'Tour Date :'}</span>
                <span style={{ color: '#334155' }}>{startDate}</span>
              </div>
              <div style={{ display: 'flex', borderBottom: '1px dotted #94a3b8', paddingBottom: '4px' }}>
                <span style={{ fontWeight: '600', width: '140px' }}>{language === 'hi' ? 'यात्रा समाप्ति स्थान :' : 'End Location :'}</span>
                <span style={{ color: '#334155' }}>{endLocation}</span>
              </div>
            </div>

            {/* Day by Day Body */}
            <div style={{ padding: '20px 40px' }}>
              {timeline.map((day, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', 
                  marginBottom: '16px', 
                  border: template === 'royal-deluxe' ? '2px solid #1e3a8a' : template === 'spiritual-adventure' ? '1px solid #10b981' : '1px solid #fed7aa',
                  borderRadius: template === 'royal-deluxe' || template === 'spiritual-adventure' ? '8px' : '4px',
                  overflow: 'hidden',
                  background: template === 'royal-deluxe' ? '#f8fafc' : '#fff'
                }}>
                  {/* Left Badge */}
                  <div style={{ 
                    width: '80px', 
                    background: template === 'royal-deluxe' ? '#1e3a8a' : template === 'spiritual-adventure' ? '#10b981' : (idx % 2 === 0 ? '#ea580c' : '#d97706'), 
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
                  <div style={{ width: '80px', background: template === 'pamphlet-standard' ? '#fffbf5' : '#fff', borderRight: '1px solid #e2e8f0', borderTop: 'none', borderBottom: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0', marginLeft: '-80px', marginTop: '60px' }}>
                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>{language === 'hi' ? 'दिनांक' : 'Date'}</div>
                    <div style={{ fontSize: '11px', color: '#0f172a', borderBottom: '1px dotted #94a3b8', width: '60px', textAlign: 'center', paddingBottom: '2px' }}>{day.dateString || '___/___'}</div>
                  </div>
                  
                  {/* Right Content */}
                  <div style={{ flex: 1, padding: '12px 16px', display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr', gap: '16px', marginLeft: '80px' }}>
                    <div>
                      <div style={{ color: template === 'royal-deluxe' ? '#1e3a8a' : '#ea580c', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                        📍 {language === 'hi' ? 'स्थान' : 'Location'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#334155', fontWeight: '600' }}>{day.location}</div>
                    </div>
                    <div>
                      <div style={{ color: template === 'royal-deluxe' ? '#1e3a8a' : '#ea580c', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                        🗓️ {language === 'hi' ? 'कार्यक्रम विवरण' : 'Program'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#475569', whiteSpace: 'pre-wrap' }}>{day.activities}</div>
                    </div>
                    <div>
                      <div style={{ color: template === 'royal-deluxe' ? '#1e3a8a' : '#ea580c', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                        🍽️ {language === 'hi' ? 'भोजन' : 'Meals'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#475569' }}>{day.meals}</div>
                    </div>
                    <div>
                      <div style={{ color: template === 'royal-deluxe' ? '#1e3a8a' : '#ea580c', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
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
    </>
  );
}
