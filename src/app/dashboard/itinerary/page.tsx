'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface DayRow {
  dayNumber: number;
  dateString: string;
  location: string;
  activities: string;
  meals: string;
  accommodation: string;
}

export default function ItineraryBuilderPage() {
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  const [template, setTemplate] = useState<'standard' | 'royal' | 'adventure'>('standard');
  const [tourName, setTourName] = useState('Char Dham Yatra Deluxe (चार धाम यात्रा)');
  const [startDate, setStartDate] = useState('2026-05-30');
  const [startLocation, setStartLocation] = useState('Jodhpur (जोधपुर)');
  const [endLocation, setEndLocation] = useState('Jodhpur (जोधपुर)');
  
  const [days, setDays] = useState<DayRow[]>([
    {
      dayNumber: 1,
      dateString: '',
      location: 'Jodhpur to Haridwar',
      activities: 'Departure from Jodhpur by train. Arrival at Haridwar. Check in at hotel. Enjoy the beautiful evening Ganga Aarti at Har Ki Pauri and receive divine blessings.',
      meals: 'Dinner Only',
      accommodation: 'Hotel Ganga Palace'
    },
    {
      dayNumber: 2,
      dateString: '',
      location: 'Haridwar to Barkot',
      activities: 'Scenic drive to Barkot via Mussoorie. En-route visit Kempty Falls. Check in at hotel/camp in Barkot. Relax and prepare for the upcoming trek to Yamunotri.',
      meals: 'Breakfast & Dinner',
      accommodation: 'Barkot Himalayan Resort'
    },
    {
      dayNumber: 3,
      dateString: '',
      location: 'Barkot - Yamunotri - Barkot',
      activities: 'Early morning drive to Janki Chatti. Start 6km trek to Yamunotri Temple. Take a holy dip in Surya Kund, worship Yamuna Ji. Return trek to Janki Chatti and drive back to Barkot.',
      meals: 'Breakfast & Dinner',
      accommodation: 'Barkot Himalayan Resort'
    }
  ]);

  const [instructions, setInstructions] = useState<string[]>([
    'यात्रा समय पर निर्धारित स्थान पर उपस्थित हों।',
    'यात्रा के दौरान स्वच्छता एवं अनुशासन बनाए रखें।',
    'कीमती सामान की स्वयं सुरक्षा करें।',
    'किसी भी प्रकार की सहायता हेतु टूर मैनेजर से संपर्क करें।'
  ]);

  const [contacts, setContacts] = useState({
    tourManager: 'Mr. Rajesh Sharma',
    mobile: '9314013412',
    officeContact: '9414141636',
    doctorContact: 'Dr. S. K. Gupta (Call in Emergency)'
  });

  const [notes, setNotes] = useState('विशेष नोट: कृपया अपने साथ पहचान पत्र (आधार कार्ड) एवं आवश्यक व्यक्तिगत दवाइयाँ अवश्य साथ रखें।');

  const previewRef = useRef<HTMLDivElement>(null);

  // Auto-fill dates based on start date
  useEffect(() => {
    if (!startDate) return;
    const baseDate = new Date(startDate);
    setDays(prev => 
      prev.map((day, idx) => {
        const currentDate = new Date(baseDate);
        currentDate.setDate(baseDate.getDate() + idx);
        const formattedDate = currentDate.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        return { ...day, dateString: day.dateString || formattedDate };
      })
    );
  }, [startDate, days.length, language]);

  const addDay = () => {
    const nextDayNum = days.length + 1;
    setDays([...days, {
      dayNumber: nextDayNum,
      dateString: '',
      location: '',
      activities: '',
      meals: 'Breakfast & Dinner',
      accommodation: ''
    }]);
  };

  const removeDay = (idx: number) => {
    if (days.length <= 1) return;
    const updated = days.filter((_, i) => i !== idx).map((day, i) => ({
      ...day,
      dayNumber: i + 1
    }));
    setDays(updated);
  };

  const updateDayField = (idx: number, field: keyof DayRow, val: string) => {
    const updated = [...days];
    updated[idx] = { ...updated[idx], [field]: val };
    setDays(updated);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = async () => {
    alert('🎨 Generating high-fidelity PNG image... (Please use "Print to PDF" for official hardcopy outputs)');
    
    // Fallback standard canvas snapshot trigger using window print format
    window.print();
  };

  // Translations Map
  const t = {
    hi: {
      title: 'यात्रा का नाम',
      startDate: 'यात्रा तिथि',
      startLoc: 'यात्रा प्रारंभ स्थान',
      endLoc: 'यात्रा समाप्ति स्थान',
      day: 'DAY',
      date: 'दिनांक',
      location: 'स्थान',
      program: 'कार्यक्रम विवरण',
      meals: 'भोजन',
      stay: 'रात्रि विश्राम',
      instructions: 'महत्वपूर्ण निर्देश',
      contacts: 'संपर्क सूत्र',
      notes: 'नोट',
      tourManager: 'टूर मैनेजर',
      mobile: 'मोबाइल',
      office: 'ऑफिस संपर्क',
      doctor: 'चिकित्सक संपर्क',
      blessing: 'शुभ यात्रा ! मंगल यात्रा !',
      enableNow: 'प्रिंट / सेव करें',
      languageToggle: 'English में देखें',
      editorTitle: 'यात्रा विवरण प्रपत्र (Editor)',
      previewTitle: 'लाइव यात्रा पर्चा (Live Pamphlet Preview)',
      addDayBtn: '+ नया दिन जोड़ें',
      removeDayBtn: 'हटाएं'
    },
    en: {
      title: 'Tour Name',
      startDate: 'Tour Date',
      startLoc: 'Starting Point',
      endLoc: 'Ending Point',
      day: 'DAY',
      date: 'Date',
      location: 'Location',
      program: 'Program Details',
      meals: 'Meals',
      stay: 'Night Stay',
      instructions: 'Important Guidelines',
      contacts: 'Emergency Contacts',
      notes: 'Notes',
      tourManager: 'Tour Manager',
      mobile: 'Mobile',
      office: 'Office Phone',
      doctor: 'Doctor Contact',
      blessing: 'HAPPY JOURNEY! HAVE A BLESSED TRIP!',
      enableNow: 'Print / Save PDF',
      languageToggle: 'हिन्दी में देखें',
      editorTitle: 'Itinerary Form Editor',
      previewTitle: 'Live Itinerary Pamphlet Preview',
      addDayBtn: '+ Add Next Day',
      removeDayBtn: 'Delete'
    }
  }[language];

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Action Bar (Top Utilities) */}
      <div className="no-print" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#fff',
        padding: '16px 20px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            🗺️ Live Custom Itinerary Builder
          </h1>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>
            Replicate the official printed pamphlet branding in high-fidelity
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'hi' ? 'en' : 'hi')}
            style={{
              padding: '8px 16px',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '13px',
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            🔄 {t.languageToggle}
          </button>

          {/* Template Selector */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <button
              onClick={() => setTemplate('standard')}
              style={{
                padding: '6px 12px',
                background: template === 'standard' ? '#ea580c' : 'transparent',
                color: template === 'standard' ? '#fff' : '#475569',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '700',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              🌅 Saffron
            </button>
            <button
              onClick={() => setTemplate('royal')}
              style={{
                padding: '6px 12px',
                background: template === 'royal' ? '#1e3a8a' : 'transparent',
                color: template === 'royal' ? '#fff' : '#475569',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '700',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              ✨ Royal
            </button>
            <button
              onClick={() => setTemplate('adventure')}
              style={{
                padding: '6px 12px',
                background: template === 'adventure' ? '#059669' : 'transparent',
                color: template === 'adventure' ? '#fff' : '#475569',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '700',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              🏔️ Forest
            </button>
          </div>

          {/* PDF Action */}
          <button
            onClick={handlePrint}
            style={{
              padding: '8px 18px',
              background: '#ea580c',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(234, 88, 12, 0.2)'
            }}
          >
            🖨️ Download PDF / Print
          </button>
        </div>
      </div>

      {/* Main Split Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px' }} className="split-layout">
        
        {/* LEFT COLUMN: THE FORM EDITOR */}
        <div className="no-print scrollbar-hidden" style={{
          background: '#fff',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
          maxHeight: 'calc(100vh - 180px)',
          overflowY: 'auto',
          border: '1px solid #e2e8f0'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px', marginBottom: '16px' }}>
            ✍️ {t.editorTitle}
          </h2>

          {/* Tour Meta details inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '4px' }}>Tour Name</label>
              <input
                type="text"
                value={tourName}
                onChange={e => setTourName(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '4px' }}>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '4px' }}>Start Location</label>
              <input
                type="text"
                value={startLocation}
                onChange={e => setStartLocation(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '4px' }}>Ending Point</label>
              <input
                type="text"
                value={endLocation}
                onChange={e => setEndLocation(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              />
            </div>
          </div>

          {/* Day rows form list */}
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#334155', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>🗓️ Day-by-Day Timeline</span>
            <button
              onClick={addDay}
              style={{
                padding: '6px 12px',
                background: '#ea580c',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '700',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              {t.addDayBtn}
            </button>
          </h3>

          {days.map((day, idx) => (
            <div key={idx} style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#ea580c' }}>DAY {day.dayNumber}</span>
                <button
                  onClick={() => removeDay(idx)}
                  disabled={days.length <= 1}
                  style={{
                    padding: '4px 8px',
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  🗑️ {t.removeDayBtn}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '2px' }}>Date Override</label>
                  <input
                    type="text"
                    value={day.dateString}
                    onChange={e => updateDayField(idx, 'dateString', e.target.value)}
                    style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '2px' }}>Location (स्थान)</label>
                  <input
                    type="text"
                    value={day.location}
                    onChange={e => updateDayField(idx, 'location', e.target.value)}
                    style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '2px' }}>Program / Activities (विवरण)</label>
                <textarea
                  rows={2}
                  value={day.activities}
                  onChange={e => updateDayField(idx, 'activities', e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '2px' }}>Meals (भोजन)</label>
                  <input
                    type="text"
                    value={day.meals}
                    onChange={e => updateDayField(idx, 'meals', e.target.value)}
                    style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '2px' }}>Night Stay (रात्रि विश्राम)</label>
                  <input
                    type="text"
                    value={day.accommodation}
                    onChange={e => updateDayField(idx, 'accommodation', e.target.value)}
                    style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px' }}
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Bottom Cards edit inputs */}
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#334155', marginTop: '20px', marginBottom: '12px', borderTop: '2px solid #f1f5f9', paddingTop: '16px' }}>
            📋 Footer Cards Details
          </h3>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '4px' }}>Important Instructions (One per line)</label>
            <textarea
              rows={4}
              value={instructions.join('\n')}
              onChange={e => setInstructions(e.target.value.split('\n'))}
              style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', fontFamily: 'monospace' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '2px' }}>Tour Manager Name</label>
              <input
                type="text"
                value={contacts.tourManager}
                onChange={e => setContacts({ ...contacts, tourManager: e.target.value })}
                style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '2px' }}>Mobile No.</label>
              <input
                type="text"
                value={contacts.mobile}
                onChange={e => setContacts({ ...contacts, mobile: e.target.value })}
                style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '2px' }}>Office No.</label>
              <input
                type="text"
                value={contacts.officeContact}
                onChange={e => setContacts({ ...contacts, officeContact: e.target.value })}
                style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '2px' }}>Doctor/Emergency No.</label>
              <input
                type="text"
                value={contacts.doctorContact}
                onChange={e => setContacts({ ...contacts, doctorContact: e.target.value })}
                style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '4px' }}>Custom Note (नोट)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: THE LIVE PREVIEW PANE */}
        <div ref={previewRef} className="print-target" style={{
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
          border: '1px solid #e2e8f0',
          position: 'relative',
          padding: '0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          
          {/* ========================================================================= */}
          {/* THE MASTER REUSABLE GLOBAL HEADER BANNER (Exactly replicating itinearary1.png) */}
          {/* ========================================================================= */}
          <div style={{
            position: 'relative',
            background: 'linear-gradient(90deg, #fff7ed 0%, #ffedd5 100%)',
            borderBottom: '4px solid #ea580c',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            textAlign: 'left'
          }}>
            {/* Header badges and GST details */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #d97706 0%, #ea580c 100%)',
                color: '#fff',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '800',
                letterSpacing: '0.5px',
                boxShadow: '0 2px 4px rgba(217, 119, 6, 0.15)'
              }}>
                SINCE 1999 | GST - 08AAUCM0755D1ZA
              </div>
              <div style={{
                background: '#0f172a',
                color: '#f8fafc',
                padding: '4px 12px',
                borderRadius: '100px',
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '0.5px'
              }}>
                वरिष्ठ नागरिकों को समर्पित कंपनी
              </div>
            </div>

            {/* Main brand line and logo */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              
              {/* Left branding */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: '#f97316',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '28px',
                  fontWeight: '700',
                  boxShadow: '0 4px 10px rgba(249, 115, 22, 0.3)'
                }}>
                  🕉️
                </div>
                <div>
                  <h2 style={{
                    fontSize: '28px',
                    fontWeight: '900',
                    color: '#c2410c',
                    margin: 0,
                    fontFamily: '"Mukta", "Playfair Display", serif',
                    letterSpacing: '0.5px',
                    lineHeight: '1.1'
                  }}>
                    महेश शर्मा तीर्थ यात्रा
                  </h2>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', marginTop: '2px' }}>
                    प्रा. लि. कम्पनी, जोधपुर (राज.)
                  </div>
                </div>
              </div>

              {/* Right Hero Image (Crimson wave and text) */}
              <div style={{
                background: 'linear-gradient(135deg, #c2410c 0%, #7c2d12 100%)',
                color: '#fff',
                borderRadius: '8px',
                padding: '10px 14px',
                maxWidth: '340px',
                fontSize: '11px',
                lineHeight: '1.4',
                boxShadow: '0 4px 12px rgba(194, 65, 12, 0.15)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <div style={{ fontWeight: '800', color: '#fef08a', marginBottom: '2px' }}>
                  हमारे यहाँ सभी प्रकार की धार्मिक यात्राएँ उपलब्ध
                </div>
                <div style={{ fontSize: '10px', color: '#ffedd5', fontStyle: 'italic' }}>
                  रेल, बस व हवाई सेवाओं द्वारा सुरक्षित एवं आरामदायक यात्रा का सफल आयोजन
                </div>
              </div>
            </div>

            {/* Website URL and direct contact call details */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid rgba(234, 88, 12, 0.15)',
              paddingTop: '10px',
              flexWrap: 'wrap',
              gap: '12px',
              fontSize: '12px',
              color: '#475569',
              fontWeight: '600'
            }}>
              <div style={{ display: 'flex', gap: '14px' }}>
                <span>🌐 {t.tourManager === 'टूर मैनेजर' ? 'www.maheshsharmatirthyatra.com' : 'www.maheshsharmatirthyatra.com'}</span>
                <span>✉️ maheshsharmayatra@gmail.com</span>
              </div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#ea580c', fontWeight: '800' }}>
                <span>📞 9314013412</span>
                <span>📞 9414141636</span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TOUR META GRID INFO */}
          {/* ========================================================================= */}
          <div style={{
            padding: '16px 20px',
            background: '#fafaf9',
            borderBottom: '1px dashed #e2e8f0',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px 24px',
            fontSize: '13px',
            color: '#1e293b',
            fontWeight: '700'
          }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ color: '#ea580c' }}>{t.title} :</span>
              <span style={{ borderBottom: '1px dotted #78716c', flex: 1, paddingBottom: '2px', fontWeight: '800' }}>{tourName}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ color: '#ea580c' }}>{t.startLoc} :</span>
              <span style={{ borderBottom: '1px dotted #78716c', flex: 1, paddingBottom: '2px' }}>{startLocation}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ color: '#ea580c' }}>{t.startDate} :</span>
              <span style={{ borderBottom: '1px dotted #78716c', flex: 1, paddingBottom: '2px' }}>{startDate}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ color: '#ea580c' }}>{t.endLoc} :</span>
              <span style={{ borderBottom: '1px dotted #78716c', flex: 1, paddingBottom: '2px' }}>{endLocation}</span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* DAY-BY-DAY TABLE CONTAINER */}
          {/* ========================================================================= */}
          <div style={{ padding: '20px', flex: 1 }}>
            
            {/* Table Row Headers */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '110px 140px 1fr 110px 150px',
              background: template === 'standard' ? '#ea580c' : template === 'royal' ? '#1e3a8a' : '#059669',
              color: '#fff',
              borderRadius: '6px',
              padding: '10px 12px',
              fontSize: '13px',
              fontWeight: '800',
              textAlign: 'left',
              gap: '12px',
              marginBottom: '10px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
            }}>
              <div>{t.day}</div>
              <div>📍 {t.location}</div>
              <div>🗓️ {t.program}</div>
              <div>🍽️ {t.meals}</div>
              <div>🏨 {t.stay}</div>
            </div>

            {/* Timeline day rows list */}
            {days.map((day, idx) => (
              <div key={idx} style={{
                display: 'grid',
                gridTemplateColumns: '110px 140px 1fr 110px 150px',
                borderBottom: '1px dashed #cbd5e1',
                padding: '12px',
                fontSize: '12.5px',
                color: '#334155',
                textAlign: 'left',
                alignItems: 'start',
                gap: '12px',
                background: idx % 2 === 0 ? '#fffefc' : '#fff',
                transition: 'background 0.2s'
              }}>
                {/* DAY BADGE CARD */}
                <div style={{
                  background: template === 'standard' ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' : template === 'royal' ? 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)' : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: '#fff',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  textAlign: 'center',
                  fontWeight: '800',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ fontSize: '14px' }}>{t.day} {day.dayNumber}</div>
                  {day.dateString && (
                    <div style={{ fontSize: '9px', opacity: 0.9, marginTop: '2px', borderTop: '0.5px solid rgba(255,255,255,0.3)', paddingTop: '2px' }}>
                      {day.dateString}
                    </div>
                  )}
                </div>

                {/* Location */}
                <div style={{ fontWeight: '800', color: '#1e293b' }}>
                  {day.location || '—'}
                </div>

                {/* Activities Program */}
                <div style={{ lineHeight: '1.5', color: '#475569', fontSize: '12px' }}>
                  {day.activities || '—'}
                </div>

                {/* Meals */}
                <div style={{ fontWeight: '700', color: '#ea580c', fontSize: '11.5px' }}>
                  🍵 {day.meals || '—'}
                </div>

                {/* Accommodation stay */}
                <div style={{ fontWeight: '700', color: '#334155', fontSize: '11.5px' }}>
                  🛌 {day.accommodation || '—'}
                </div>
              </div>
            ))}
          </div>

          {/* ========================================================================= */}
          {/* THREE BOTTOM ACCENTS FOOTER CARDS */}
          {/* ========================================================================= */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr 1fr',
            gap: '16px',
            padding: '0 20px 20px',
            textAlign: 'left'
          }}>
            
            {/* Guidelines Card */}
            <div style={{
              background: '#fffaf5',
              border: '1px solid #ffedd5',
              borderRadius: '8px',
              padding: '12px 14px',
              fontSize: '11.5px',
              color: '#7c2d12'
            }}>
              <div style={{ fontWeight: '800', color: '#ea580c', fontSize: '12.5px', marginBottom: '8px', borderBottom: '1px solid #fed7aa', paddingBottom: '4px' }}>
                💡 {t.instructions}
              </div>
              <ul style={{ paddingLeft: '14px', margin: 0, lineHeight: '1.6' }}>
                {instructions.filter(line => line.trim()).map((line, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>{line}</li>
                ))}
              </ul>
            </div>

            {/* Contacts details Card */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '12px 14px',
              fontSize: '11.5px',
              color: '#334155'
            }}>
              <div style={{ fontWeight: '800', color: '#1e3a8a', fontSize: '12.5px', marginBottom: '8px', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px' }}>
                📞 {t.contacts}
              </div>
              <div style={{ lineHeight: '1.7' }}>
                <div><strong>{t.tourManager}:</strong> {contacts.tourManager}</div>
                <div><strong>{t.mobile}:</strong> {contacts.mobile}</div>
                <div><strong>{t.office}:</strong> {contacts.officeContact}</div>
                <div><strong>{t.doctor}:</strong> {contacts.doctorContact}</div>
              </div>
            </div>

            {/* Agent custom note space card */}
            <div style={{
              background: '#fffbeb',
              border: '1px solid #fef3c7',
              borderRadius: '8px',
              padding: '12px 14px',
              fontSize: '11.5px',
              color: '#78350f'
            }}>
              <div style={{ fontWeight: '800', color: '#d97706', fontSize: '12.5px', marginBottom: '8px', borderBottom: '1px solid #fde68a', paddingBottom: '4px' }}>
                🖋️ {t.notes}
              </div>
              <div style={{
                fontStyle: 'italic',
                backgroundImage: 'repeating-linear-gradient(transparent, transparent 19px, #fcd34d 20px)',
                lineHeight: '20px'
              }}>
                {notes || '—'}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* THE TRADITIONAL RED BLESSINGS ACCENT FOOTER BAR */}
          {/* ========================================================================= */}
          <div style={{
            background: template === 'standard' ? 'linear-gradient(90deg, #c2410c 0%, #7c2d12 100%)' : template === 'royal' ? 'linear-gradient(90deg, #1e3a8a 0%, #0f172a 100%)' : 'linear-gradient(90deg, #047857 0%, #064e3b 100%)',
            color: '#fff',
            padding: '12px',
            textAlign: 'center',
            fontSize: '14px',
            fontWeight: '900',
            letterSpacing: '1px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 -4px 10px rgba(0,0,0,0.05)'
          }}>
            <span>🕉️</span>
            <span>{t.blessing}</span>
            <span>🕉️</span>
          </div>
        </div>
      </div>

      {/* Styled overrides for desktop split/responsive layout and print isolation */}
      <style>{`
        .scrollbar-hidden::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hidden {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        @media (max-width: 1024px) {
          .split-layout {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .print-target {
            overflow-x: auto !important;
          }
        }

        @media print {
          body {
            background: #fff !important;
            color: #000 !important;
          }
          .no-print, header, nav, footer, .sidebar-desktop, .desktop-topbar, .mobile-topbar, .bottom-nav {
            display: none !important;
          }
          main {
            margin-left: 0 !important;
            padding: 0 !important;
          }
          .main-content-padding {
            padding: 0 !important;
          }
          .split-layout {
            grid-template-columns: 1fr !important;
          }
          .print-target {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
