'use client';

import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';

type TimelineDay = {
  dayNumber: number;
  dateString: string;
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
  const [language, setLanguage] = useState('en');
  const [zoom, setZoom] = useState(0.75);

  const [timeline, setTimeline] = useState<TimelineDay[]>([
    { dayNumber: 1, dateString: '', activities: '', meals: '', accommodation: '' }
  ]);

  const [instructionsTitle, setInstructionsTitle] = useState('महत्वपूर्ण निर्देश');
  const [inclusionsTitle, setInclusionsTitle] = useState('क्या शामिल है (Inclusions)');
  const [exclusionsTitle, setExclusionsTitle] = useState('क्या शामिल नहीं है (Exclusions)');

  const [inclusions, setInclusions] = useState(
    'सभी दर्शनीय स्थलों की यात्रा वाहन से।\nहोटल में प्रतिदिन नाश्ता और रात्रि भोजन।\nटोल टैक्स, पार्किंग और ड्राइवर शुल्क।'
  );

  const [exclusions, setExclusions] = useState(
    'व्यक्तिगत खर्च जैसे लॉन्ड्री, फोन कॉल।\nस्मारकों के प्रवेश शुल्क एवं गाइड शुल्क।\nकोई भी अतिरिक्त भोजन या दर्शनीय स्थल।'
  );

  const [importantInstructions, setImportantInstructions] = useState(
    'यात्रा समय पर निर्धारित स्थान पर उपस्थित हों।\nयात्रा के दौरान स्वच्छता एवं अनुशासन बनाए रखें।\nकीमती सामान की स्वयं सुरक्षा करें।\nकिसी भी प्रकार की सहायता हेतु टूर मैनेजर से संपर्क करें।'
  );

  const [tourManager, setTourManager] = useState('');
  const [mobile, setMobile] = useState('');
  const [officeContact, setOfficeContact] = useState('');
  const [doctorContact, setDoctorContact] = useState('');
  const [agentNotes, setAgentNotes] = useState('');
  const [notesTitle, setNotesTitle] = useState('Note');

  const handleDownloadImage = async () => {
    const pageElements = document.querySelectorAll('.pdf-page-render');
    if (pageElements.length === 0) return;

    for (let i = 0; i < pageElements.length; i++) {
      const element = pageElements[i] as HTMLElement;
      // Temporarily hide shadow during capture for a clean image
      const originalShadow = element.style.boxShadow;
      element.style.boxShadow = 'none';

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      element.style.boxShadow = originalShadow;

      const link = document.createElement('a');
      link.download = `Itinerary_Page_${i + 1}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      // Delay to ensure browser processes each download
      await new Promise(resolve => setTimeout(resolve, 350));
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
      { dayNumber: prev.length + 1, dateString: '', activities: '', meals: '', accommodation: '' }
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

  const getPages = () => {
    const pages: { days: TimelineDay[]; showHeader: boolean; showMeta: boolean; showFooter: boolean }[] = [];
    
    const A4_HEIGHT = 1122; // 297mm at ~3.78 pixels/mm (96 DPI)
    
    // Determine header image height dynamically (140px if present, 0px otherwise)
    const HEADER_HEIGHT = headerImage ? 140 : 0;
    
    // Meta info card height on Page 1 is approx 100px
    const META_HEIGHT = 100;
    
    // Accent bar on subsequent pages
    const PAGE_ACCENT_HEIGHT = 12;
    
    // Inclusions + Exclusions (120px) + 2-col details grid (100px) + bottom banner (45px) + paddings/gaps (25px) = ~290px
    const FOOTER_HEIGHT = 290;
    
    // Estimator function for day card heights based on text length
    const estimateDayHeight = (day: TimelineDay) => {
      let height = 110; // base height
      
      // Calculate activities program text height (wider text block fits ~95 chars per line)
      if (day.activities) {
        const lines = Math.ceil(day.activities.length / 95);
        if (lines > 2) {
          height += (lines - 2) * 15;
        }
      }
      
      // Calculate meals/accommodation text height
      if (day.meals || day.accommodation) {
        const mealsLen = day.meals ? day.meals.length : 0;
        const stayLen = day.accommodation ? day.accommodation.length : 0;
        const maxLen = Math.max(mealsLen, stayLen);
        if (maxLen > 40) {
          height += 15;
        }
      }
      
      return height + 16; // height + spacing gap
    };

    let currentPageDays: TimelineDay[] = [];
    let currentHeight = HEADER_HEIGHT + META_HEIGHT + 24; // Page 1 initial height
    let isFirstPage = true;
    
    // Try single page fit check
    const totalDaysHeight = timeline.reduce((sum, d) => sum + estimateDayHeight(d), 0);
    if ((currentHeight + totalDaysHeight + FOOTER_HEIGHT) <= A4_HEIGHT) {
      pages.push({
        days: timeline,
        showHeader: true,
        showMeta: true,
        showFooter: true
      });
      return pages;
    }
    
    // Dynamic multi-page pagination algorithm
    for (let i = 0; i < timeline.length; i++) {
      const day = timeline[i];
      const dayHeight = estimateDayHeight(day);
      const isLastDay = i === timeline.length - 1;
      const maxHeight = A4_HEIGHT;
      
      if (isLastDay) {
        // Must pack both this day card and the footer on this page
        if (currentHeight + dayHeight + FOOTER_HEIGHT <= maxHeight) {
          currentPageDays.push(day);
          pages.push({
            days: currentPageDays,
            showHeader: isFirstPage,
            showMeta: isFirstPage,
            showFooter: true
          });
        } else {
          // Push current page without footer
          if (currentPageDays.length > 0) {
            pages.push({
              days: currentPageDays,
              showHeader: isFirstPage,
              showMeta: isFirstPage,
              showFooter: false
            });
          }
          // Day card + footer pushed to next page
          pages.push({
            days: [day],
            showHeader: false,
            showMeta: false,
            showFooter: true
          });
        }
      } else {
        // Fits on current page?
        if (currentHeight + dayHeight <= maxHeight - 20) {
          currentPageDays.push(day);
          currentHeight += dayHeight;
        } else {
          // Doesn't fit, seal page and open next page
          pages.push({
            days: currentPageDays,
            showHeader: isFirstPage,
            showMeta: isFirstPage,
            showFooter: false
          });
          
          currentPageDays = [day];
          isFirstPage = false;
          currentHeight = PAGE_ACCENT_HEIGHT + 24 + dayHeight;
        }
      }
    }
    
    return pages;
  };

  const renderDottedOrText = (text: string, placeholderLines = 2) => {
    if (text && text.trim() !== '') {
      return (
        <div style={{ fontSize: '11px', color: '#334155', fontWeight: '600', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
          {text}
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
        {Array.from({ length: placeholderLines }).map((_, idx) => (
          <div key={idx} style={{ borderBottom: '1px dotted #cbd5e1', width: '100%', height: '4px' }} />
        ))}
      </div>
    );
  };

  const renderListOrDotted = (text: string, bulletChar: string, color: string, count = 3) => {
    if (text && text.trim() !== '') {
      return (
        <ul style={{ margin: 0, padding: '8px 10px 8px 14px', fontSize: '9px', color: color, lineHeight: '1.4', listStyleType: 'none' }}>
          {text.split('\n').filter(Boolean).map((line, i) => (
            <li key={i} style={{ display: 'flex', gap: '6px', marginBottom: '3px', alignItems: 'flex-start' }}>
              <span>{bulletChar}</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      );
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px 14px' }}>
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} style={{ borderBottom: '1px dotted #cbd5e1', width: '100%', height: '4px' }} />
        ))}
      </div>
    );
  };

  const pages = getPages();

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          body {
            background: #ffffff;
            margin: 0;
            padding: 0;
            visibility: hidden;
          }
          .no-print {
            display: none !important;
          }
          .pdf-pages-container-wrapper,
          .pdf-pages-container-wrapper *,
          .pdf-page-render,
          .pdf-page-render * {
            visibility: visible;
          }
          .pdf-pages-container-wrapper {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm !important;
            height: auto !important;
            transform: none !important;
            zoom: 1 !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
          }
          .pdf-page-render {
            width: 210mm !important;
            height: 297mm !important;
            page-break-after: always !important;
            break-after: always !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden;
            box-sizing: border-box;
            background: #ffffff !important;
            position: relative;
          }
          /* Force colors to print correctly */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
        @page {
          size: A4;
          margin: 0;
        }
      `}} />

      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f8fafc', overflow: 'hidden', fontFamily: "'Outfit', sans-serif" }}>

        {/* Top Header Bar */}
        <div className="no-print" style={{
          background: '#ffffff',
          padding: '16px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          zIndex: 10
        }}>
          <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            🗺️ {language === 'hi' ? 'कस्टम यात्रा कार्यक्रम निर्माता' : 'Custom Itinerary Builder'}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Language Selector */}
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              style={{
                padding: '8px 16px 8px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#fff',
                fontSize: '13px',
                color: '#475569',
                cursor: 'pointer',
                fontWeight: '600',
                outline: 'none',
                minWidth: '130px'
              }}
            >
              <option value="en">English (en)</option>
              <option value="hi">हिन्दी (hi)</option>
            </select>

            {/* Image Download Button */}
            <button
              onClick={handleDownloadImage}
              style={{
                background: '#ea580c',
                color: '#fff',
                padding: '8px 18px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'background 0.2s',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
              onMouseOver={e => e.currentTarget.style.background = '#c2410c'}
              onMouseOut={e => e.currentTarget.style.background = '#ea580c'}
            >
              📤 {language === 'hi' ? 'इमेज डाउनलोड' : 'Image'}
            </button>

            {/* PDF Print Button */}
            <button
              onClick={handlePrintPdf}
              style={{
                background: '#10b981',
                color: '#fff',
                padding: '8px 18px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'background 0.2s',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
              onMouseOver={e => e.currentTarget.style.background = '#059669'}
              onMouseOut={e => e.currentTarget.style.background = '#10b981'}
            >
              🖨️ {language === 'hi' ? 'पीडीएफ प्रिंट' : 'PDF'}
            </button>
          </div>
        </div>

        {/* Two Columns Body */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* Left Pane - Form Editor */}
          <div className="no-print" style={{ width: '45%', overflowY: 'auto', padding: '24px', borderRight: '1px solid #e2e8f0', background: '#fff' }}>

            {/* Tour Details Box */}
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Tour Details & Header
              </h2>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>
                  {language === 'hi' ? 'कस्टम हेडर इमेज (वैकल्पिक)' : 'Custom Header Image (Optional)'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{
                    width: '100%',
                    fontSize: '13px',
                    color: '#64748b',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>
                    {language === 'hi' ? 'यात्रा का नाम' : 'Tour Name'}
                  </label>
                  <input
                    type="text"
                    placeholder={language === 'hi' ? 'नाम दर्ज करें' : 'Enter tour name'}
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    maxLength={50}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>
                    {language === 'hi' ? 'तिथि' : 'Date'}
                  </label>
                  <input
                    type="text"
                    placeholder={language === 'hi' ? 'तिथि चुनें या लिखें' : 'Select or enter date'}
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    maxLength={30}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>
                    {language === 'hi' ? 'प्रस्थान स्थान' : 'Start Location'}
                  </label>
                  <input
                    type="text"
                    placeholder={language === 'hi' ? 'प्रस्थान स्थान दर्ज करें' : 'Enter start location'}
                    value={startLocation}
                    onChange={e => setStartLocation(e.target.value)}
                    maxLength={40}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>
                    {language === 'hi' ? 'समाप्ति स्थान' : 'End Location'}
                  </label>
                  <input
                    type="text"
                    placeholder={language === 'hi' ? 'समाप्ति स्थान दर्ज करें' : 'Enter end location'}
                    value={endLocation}
                    onChange={e => setEndLocation(e.target.value)}
                    maxLength={40}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  />
                </div>
              </div>
            </div>

            {/* Day-by-Day Editor Box */}
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Day-by-Day Itinerary</h2>
                <button
                  onClick={addDay}
                  style={{
                    background: '#ea580c',
                    color: '#fff',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    border: 'none',
                    fontWeight: '700',
                    boxShadow: '0 1px 2px rgba(234, 88, 12, 0.2)'
                  }}
                >
                  + Add Day
                </button>
              </div>

              {timeline.map((day, idx) => (
                <div key={idx} style={{ background: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                    <strong style={{ fontSize: '14px', color: '#ea580c', fontWeight: '700' }}>Day {day.dayNumber}</strong>
                    {timeline.length > 1 && (
                      <button
                        onClick={() => removeDay(idx)}
                        style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div style={{ marginBottom: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>
                        {language === 'hi' ? 'दिनांक' : 'Date'}
                      </label>
                      <input
                        placeholder="dd/mm/yyyy"
                        value={day.dateString}
                        onChange={e => updateDay(idx, 'dateString', e.target.value)}
                        maxLength={30}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b' }}>
                        {language === 'hi' ? 'कार्यक्रम विवरण' : 'Activities Description'}
                      </label>
                      <span style={{ fontSize: '9px', color: day.activities.length > 220 ? '#ef4444' : '#64748b' }}>
                        {day.activities.length}/250
                      </span>
                    </div>
                    <textarea
                      placeholder={language === 'hi' ? 'विवरण दर्ज करें' : 'Enter activities description'}
                      value={day.activities}
                      onChange={e => updateDay(idx, 'activities', e.target.value)}
                      maxLength={250}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', minHeight: '60px', outline: 'none', resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b' }}>
                          {language === 'hi' ? 'भोजन' : 'Meals'}
                        </label>
                        <span style={{ fontSize: '9px', color: '#94a3b8' }}>{day.meals.length}/65</span>
                      </div>
                      <input
                        placeholder={language === 'hi' ? 'उदा. नाश्ता और रात का भोजन' : 'e.g. Breakfast & Dinner'}
                        value={day.meals}
                        onChange={e => updateDay(idx, 'meals', e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>
                        {language === 'hi' ? 'आवास' : 'Accommodation'}
                      </label>
                      <input
                        placeholder={language === 'hi' ? 'उदा. होटल का नाम' : 'e.g. Hotel Name'}
                        value={day.accommodation}
                        onChange={e => updateDay(idx, 'accommodation', e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer details editor box */}
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', marginBottom: '16px' }}>Footer Details & Content</h2>

              {/* Inclusions Group */}
              <div style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>
                    {language === 'hi' ? 'क्या शामिल है शीर्षक (Inclusions Title)' : 'Inclusions Title'}
                  </label>
                  <input
                    type="text"
                    value={inclusionsTitle}
                    onChange={e => setInclusionsTitle(e.target.value)}
                    maxLength={40}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none' }}
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>
                      {language === 'hi' ? 'क्या शामिल है विवरण' : 'Inclusions Content'}
                    </label>
                    <span style={{ fontSize: '10px', color: inclusions.length > 170 ? '#ef4444' : '#64748b' }}>
                      {inclusions.length}/200
                    </span>
                  </div>
                  <textarea
                    value={inclusions}
                    onChange={e => setInclusions(e.target.value)}
                    maxLength={200}
                    placeholder={language === 'hi' ? 'उदा. टोल टैक्स, पार्किंग शामिल है।' : 'e.g. All sightseeing, Hotels daily breakfast'}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', minHeight: '60px', outline: 'none', resize: 'vertical' }}
                  />
                </div>
              </div>

              {/* Exclusions Group */}
              <div style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>
                    {language === 'hi' ? 'क्या शामिल नहीं है शीर्षक (Exclusions Title)' : 'Exclusions Title'}
                  </label>
                  <input
                    type="text"
                    value={exclusionsTitle}
                    onChange={e => setExclusionsTitle(e.target.value)}
                    maxLength={40}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none' }}
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>
                      {language === 'hi' ? 'क्या शामिल नहीं है विवरण' : 'Exclusions Content'}
                    </label>
                    <span style={{ fontSize: '10px', color: exclusions.length > 170 ? '#ef4444' : '#64748b' }}>
                      {exclusions.length}/200
                    </span>
                  </div>
                  <textarea
                    value={exclusions}
                    onChange={e => setExclusions(e.target.value)}
                    maxLength={200}
                    placeholder={language === 'hi' ? 'उदा. हवाई टिकट का किराया।' : 'e.g. Flight ticket fare, monument entry fees'}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', minHeight: '60px', outline: 'none', resize: 'vertical' }}
                  />
                </div>
              </div>

              {/* Instructions Group */}
              <div style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>
                    {language === 'hi' ? 'निर्देश शीर्षक (Instructions Title)' : 'Instructions Title'}
                  </label>
                  <input
                    type="text"
                    value={instructionsTitle}
                    onChange={e => setInstructionsTitle(e.target.value)}
                    maxLength={40}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none' }}
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>
                      {language === 'hi' ? 'महत्वपूर्ण निर्देश' : 'Important Instructions'}
                    </label>
                    <span style={{ fontSize: '10px', color: importantInstructions.length > 170 ? '#ef4444' : '#64748b' }}>
                      {importantInstructions.length}/200
                    </span>
                  </div>
                  <textarea
                    value={importantInstructions}
                    onChange={e => setImportantInstructions(e.target.value)}
                    maxLength={200}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', minHeight: '60px', outline: 'none', resize: 'vertical' }}
                  />
                </div>
              </div>

              {/* Notes Group */}
              <div style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>
                    Notes Title
                  </label>
                  <input
                    type="text"
                    value={notesTitle}
                    onChange={e => setNotesTitle(e.target.value)}
                    maxLength={40}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none' }}
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Notes Content</label>
                    <span style={{ fontSize: '10px', color: agentNotes.length > 220 ? '#ef4444' : '#64748b' }}>{agentNotes.length}/250</span>
                  </div>
                  <textarea
                    value={agentNotes}
                    onChange={e => setAgentNotes(e.target.value)}
                    maxLength={250}
                    placeholder={language === 'hi' ? 'अतिरिक्त नोट्स यहाँ लिखें...' : 'Write additional notes here...'}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', minHeight: '80px', outline: 'none', resize: 'vertical' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Pane - Live Preview */}
          <div style={{ width: '55%', overflowY: 'auto', padding: '24px', background: '#e2e8f0', display: 'flex', flexDirection: 'column' }}>

            {/* Zoom Controls Header */}
            <div className="no-print" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              background: '#ffffff',
              borderRadius: '8px',
              marginBottom: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              border: '1px solid #cbd5e1'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#334155' }}>
                  📄 {language === 'hi' ? 'पूर्वावलोकन :' : 'Preview :'}
                </span>
                <span style={{ fontSize: '12px', fontWeight: '600', background: '#fee2e2', color: '#ef4444', padding: '2px 8px', borderRadius: '12px' }}>
                  {pages.length} {pages.length > 1 ? (language === 'hi' ? 'पेज' : 'Pages') : (language === 'hi' ? 'पेज' : 'Page')}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setZoom(prev => Math.max(0.4, prev - 0.05))}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'}
                  onMouseOut={e => e.currentTarget.style.background = '#fff'}
                  title="Zoom Out"
                >
                  -
                </button>
                <span style={{ fontSize: '13px', fontWeight: 'bold', minWidth: '50px', textAlign: 'center', color: '#1e293b' }}>
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom(prev => Math.min(1.5, prev + 0.05))}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'}
                  onMouseOut={e => e.currentTarget.style.background = '#fff'}
                  title="Zoom In"
                >
                  +
                </button>
                <button
                  onClick={() => setZoom(0.75)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#475569',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'}
                  onMouseOut={e => e.currentTarget.style.background = '#fff'}
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Scrollable Container with centered scale preview */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingBottom: '40px'
            }}>
              <div
                className="pdf-pages-container-wrapper"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top center',
                  width: '210mm',
                  height: `calc((${pages.length} * 297mm + ${pages.length - 1} * 20px) * ${zoom})`,
                  transition: 'transform 0.15s ease-out, height 0.15s ease-out',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px'
                }}
              >
                {pages.map((page, pageIdx) => (
                  <div
                    key={pageIdx}
                    className="pdf-page-render"
                    style={{
                      width: '210mm',
                      height: '297mm',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      boxSizing: 'border-box',
                      overflow: 'hidden',
                      background: '#ffffff'
                    }}
                  >

                    {/* Header Image (Page 1 Only) */}
                    {page.showHeader && (
                      <div style={{ width: '100%', overflow: 'hidden', borderBottom: '3px solid #ea580c' }}>
                        {headerImage && <img src={headerImage} alt="Header" style={{ width: '100%', height: 'auto', display: 'block' }} />}
                      </div>
                    )}

                    {/* Subtle Top Accent bar for page 2+ */}
                    {!page.showHeader && (
                      <div style={{ height: '12px', background: 'linear-gradient(to right, #ea580c, #dc2626)', width: '100%' }} />
                    )}

                    {/* Tour Meta Info (Page 1 Only) */}
                    {page.showMeta && (
                      <div style={{ padding: '20px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 40px', fontSize: '13px', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ fontWeight: 'bold', color: '#334155', minWidth: '90px' }}>
                            {language === 'hi' ? 'यात्रा का नाम :' : 'Tour Name :'}
                          </span>
                          <span style={{ color: '#ea580c', fontWeight: 'bold', borderBottom: '1px dotted #cbd5e1', flex: 1, paddingBottom: '2px', marginLeft: '6px' }}>
                            {title || '_______________________________________'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ fontWeight: 'bold', color: '#334155', minWidth: '110px' }}>
                            {language === 'hi' ? 'यात्रा प्रारंभ स्थान :' : 'Start Location :'}
                          </span>
                          <span style={{ color: '#334155', fontWeight: '600', borderBottom: '1px dotted #cbd5e1', flex: 1, paddingBottom: '2px', marginLeft: '6px' }}>
                            {startLocation || '_________________________________'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ fontWeight: 'bold', color: '#334155', minWidth: '90px' }}>
                            {language === 'hi' ? 'यात्रा तिथि :' : 'Tour Date :'}
                          </span>
                          <span style={{ color: '#334155', fontWeight: '600', borderBottom: '1px dotted #cbd5e1', flex: 1, paddingBottom: '2px', marginLeft: '6px' }}>
                            {startDate || '_______________________________________'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ fontWeight: 'bold', color: '#334155', minWidth: '110px' }}>
                            {language === 'hi' ? 'यात्रा समाप्ति स्थान :' : 'End Location :'}
                          </span>
                          <span style={{ color: '#334155', fontWeight: '600', borderBottom: '1px dotted #cbd5e1', flex: 1, paddingBottom: '2px', marginLeft: '6px' }}>
                            {endLocation || '_________________________________'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Day Cards list */}
                    <div style={{ padding: '24px 40px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {page.days.map((day, idx) => (
                        <div key={idx} style={{
                          display: 'flex',
                          border: '1px solid #fed7aa',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          background: '#fff',
                          minHeight: '110px',
                          boxShadow: '0 2px 4px rgba(234, 88, 12, 0.02)'
                        }}>

                          {/* Left Vertical Badge */}
                          <div style={{
                            width: '90px',
                            display: 'flex',
                            flexDirection: 'column',
                            borderRight: '1px solid #fed7aa'
                          }}>
                            {/* DAY Title & Number */}
                            <div style={{
                              background: 'linear-gradient(135deg, #ea580c, #f97316)',
                              color: '#fff',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '8px 0',
                              flex: 1
                            }}>
                              <div style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px' }}>DAY</div>
                              <div style={{ fontSize: '28px', fontWeight: '900', lineHeight: '1', marginTop: '2px' }}>
                                {day.dayNumber.toString().padStart(2, '0')}
                              </div>
                            </div>

                            {/* Date Area */}
                            <div style={{
                              background: '#fffbf5',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '6px 0',
                              borderTop: '1px solid #fed7aa'
                            }}>
                              <div style={{ fontSize: '9px', color: '#71717a', fontWeight: 'bold', marginBottom: '1px' }}>
                                {language === 'hi' ? 'दिनांक' : 'Date'}
                              </div>
                              <div style={{ fontSize: '10px', color: '#ea580c', fontWeight: 'bold' }}>
                                {day.dateString || '__/__/____'}
                              </div>
                            </div>
                          </div>

                          {/* Right Content Section */}
                          <div style={{
                            flex: 1,
                            padding: '12px 16px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                          }}>
                            {/* Program Section (Top) */}
                            <div style={{ flex: 1, marginBottom: '8px' }}>
                              <div style={{ fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '4px' }}>
                                📅 <span style={{ color: '#0f172a', fontWeight: '700' }}>{language === 'hi' ? 'कार्यक्रम' : 'Program'}</span>
                              </div>
                              {renderDottedOrText(day.activities, 2)}
                            </div>

                            {/* Meals & Stay Row (Bottom) */}
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr',
                              gap: '16px',
                              paddingTop: '8px',
                              borderTop: '1px dashed #fed7aa'
                            }}>
                              {/* Meals */}
                              <div>
                                <div style={{ fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '4px' }}>
                                  🍽️ <span style={{ color: '#0f172a', fontWeight: '700' }}>{language === 'hi' ? 'भोजन' : 'Meals'}</span>
                                </div>
                                {renderDottedOrText(day.meals, 1)}
                              </div>

                              {/* Stay */}
                              <div>
                                <div style={{ fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '4px' }}>
                                  🏨 <span style={{ color: '#0f172a', fontWeight: '700' }}>{language === 'hi' ? 'रात्रि विश्राम' : 'Stay'}</span>
                                </div>
                                {renderDottedOrText(day.accommodation, 1)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                     {/* Footer Cards & Bottom Bar (Page Last only) */}
                    {page.showFooter && (
                      <div>

                        {/* Inclusions & Exclusions Row */}
                        <div style={{ padding: '0 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                          
                          {/* Inclusions Box */}
                          <div style={{ border: '1px solid #bbf7d0', borderRadius: '6px', background: '#f0fdf4', overflow: 'hidden' }}>
                            <div style={{ background: '#16a34a', color: '#fff', padding: '6px 12px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>✅</span>
                              <input
                                type="text"
                                value={inclusionsTitle}
                                onChange={e => setInclusionsTitle(e.target.value)}
                                maxLength={40}
                                style={{
                                  background: 'transparent',
                                  color: '#fff',
                                  border: 'none',
                                  fontSize: '11px',
                                  fontWeight: 'bold',
                                  fontFamily: 'inherit',
                                  outline: 'none',
                                  width: '100%',
                                  padding: '0',
                                  cursor: 'text'
                                }}
                              />
                            </div>
                            {renderListOrDotted(inclusions, '•', '#166534', 3)}
                          </div>

                          {/* Exclusions Box */}
                          <div style={{ border: '1px solid #fecaca', borderRadius: '6px', background: '#fef2f2', overflow: 'hidden' }}>
                            <div style={{ background: '#dc2626', color: '#fff', padding: '6px 12px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>❌</span>
                              <input
                                type="text"
                                value={exclusionsTitle}
                                onChange={e => setExclusionsTitle(e.target.value)}
                                maxLength={40}
                                style={{
                                  background: 'transparent',
                                  color: '#fff',
                                  border: 'none',
                                  fontSize: '11px',
                                  fontWeight: 'bold',
                                  fontFamily: 'inherit',
                                  outline: 'none',
                                  width: '100%',
                                  padding: '0',
                                  cursor: 'text'
                                }}
                              />
                            </div>
                            {renderListOrDotted(exclusions, '•', '#991b1b', 3)}
                          </div>

                        </div>

                        {/* Footer Details Grid — Instructions + Notes (2 cols) */}
                        <div style={{ padding: '0 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>

                          {/* Instructions Card */}
                          <div style={{ border: '1px solid #fed7aa', borderRadius: '6px', background: '#fffbf5', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ background: '#ea580c', color: '#fff', padding: '6px 12px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>💡</span>
                              <input
                                type="text"
                                value={instructionsTitle}
                                onChange={e => setInstructionsTitle(e.target.value)}
                                maxLength={40}
                                style={{
                                  background: 'transparent',
                                  color: '#fff',
                                  border: 'none',
                                  fontSize: '11px',
                                  fontWeight: 'bold',
                                  fontFamily: 'inherit',
                                  outline: 'none',
                                  width: '100%',
                                  padding: '0',
                                  cursor: 'text'
                                }}
                              />
                            </div>
                            <div style={{ flex: 1 }}>{renderListOrDotted(importantInstructions, '•', '#334155', 4)}</div>
                          </div>

                          {/* Notes Card (extended, editable title) */}
                          <div style={{ border: '1px solid #fed7aa', borderRadius: '6px', background: '#fffbf5', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ background: '#ea580c', color: '#fff', padding: '6px 12px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>🖊️</span>
                              <input
                                type="text"
                                value={notesTitle}
                                onChange={e => setNotesTitle(e.target.value)}
                                maxLength={40}
                                style={{
                                  background: 'transparent',
                                  color: '#fff',
                                  border: 'none',
                                  fontSize: '11px',
                                  fontWeight: 'bold',
                                  fontFamily: 'inherit',
                                  outline: 'none',
                                  width: '100%',
                                  padding: '0',
                                  cursor: 'text'
                                }}
                              />
                            </div>
                            <div style={{
                              flex: 1,
                              padding: '8px 12px',
                              fontSize: '9.5px',
                              color: '#334155',
                              whiteSpace: 'pre-wrap',
                              lineHeight: '1.55',
                              background: '#fffbf5',
                              minHeight: '60px'
                            }}>
                              {agentNotes || ''}
                            </div>
                          </div>
                        </div>

                        {/* Disclaimer line */}
                        <div style={{ padding: '4px 40px 6px', textAlign: 'center' }}>
                          <span style={{ fontSize: '7.5px', color: '#94a3b8', fontStyle: 'italic', letterSpacing: '0.1px' }}>
                            {language === 'hi'
                              ? 'नोट: यात्रा कार्यक्रम मौसम, समय एवं परिस्थितियों के अनुसार परिवर्तित किया जा सकता है।'
                              : 'Note: The itinerary may be subject to change depending on weather, time, and prevailing circumstances.'}
                          </span>
                        </div>

                        {/* Bottom Banner Bar */}
                        <div style={{ background: 'linear-gradient(to right, #ea580c, #dc2626)', padding: '12px 40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <h2 style={{ color: '#fff', fontSize: '15px', fontWeight: 'bold', margin: 0, letterSpacing: '1px' }}>
                            🌸 {language === 'hi' ? 'शुभ यात्रा ! मंगल यात्रा !' : 'Happy & Auspicious Journey !'} 🌸
                          </h2>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
