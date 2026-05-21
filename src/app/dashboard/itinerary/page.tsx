'use client';

import { useState, useRef, useEffect } from 'react';
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
  const [headerHeight, setHeaderHeight] = useState(180);
  const [language, setLanguage] = useState('en');
  const [zoom, setZoom] = useState(0.75);
  const [fontScale, setFontScale] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Pre-calculate default header height
    if (headerImage === '/style1.png') {
      const img = new Image();
      img.onload = () => {
        const ratio = img.naturalHeight / img.naturalWidth;
        setHeaderHeight(Math.round(794 * ratio));
      };
      img.src = '/style1.png';
    }
  }, []);

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
  const [showRateField, setShowRateField] = useState(true);
  const [rateLabel, setRateLabel] = useState('Rate');
  const [rate, setRate] = useState('');
  const [showExtraField, setShowExtraField] = useState(false);
  const [extraFieldLabel, setExtraFieldLabel] = useState('No. of Pax');
  const [extraFieldValue, setExtraFieldValue] = useState('');

  const [savedItineraries, setSavedItineraries] = useState<any[]>([]);
  const [showSavedModal, setShowSavedModal] = useState(false);

  // Mobile collapsible sections
  const [tourDetailsOpen, setTourDetailsOpen] = useState(true);
  const [dayByDayOpen, setDayByDayOpen] = useState(true);
  const [footerDetailsOpen, setFooterDetailsOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [dayAccordion, setDayAccordion] = useState<Record<number, boolean>>({0: true});

  const toggleDayAccordion = (idx: number) => {
    setDayAccordion(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  useEffect(() => {
    const saved = localStorage.getItem('savedItineraries');
    if (saved) {
      try {
        setSavedItineraries(JSON.parse(saved));
      } catch (e) { }
    }
  }, []);

  const handleSaveItinerary = () => {
    const data: any = {
      id: Date.now().toString(),
      saveDate: new Date().toLocaleDateString(),
      title, startLocation, endLocation, startDate,
      headerImage, language, timeline,
      instructionsTitle, inclusionsTitle, exclusionsTitle,
      inclusions, exclusions, importantInstructions,
      agentNotes, notesTitle,
      showRateField, rateLabel, rate,
      showExtraField, extraFieldLabel, extraFieldValue
    };

    const name = prompt(language === 'hi' ? "इस यात्रा कार्यक्रम को सेव करने के लिए एक नाम दर्ज करें:" : "Enter a name to save this itinerary:", title || "Untitled Itinerary");
    if (!name) return;

    data.saveName = name;

    const updated = [...savedItineraries, data];
    setSavedItineraries(updated);
    localStorage.setItem('savedItineraries', JSON.stringify(updated));
    alert(language === 'hi' ? "यात्रा कार्यक्रम सफलतापूर्वक सेव हो गया!" : "Itinerary saved successfully!");
  };

  const loadItinerary = (data: any) => {
    if (!confirm(language === 'hi' ? "क्या आप वाकई इसे लोड करना चाहते हैं? आपका वर्तमान डेटा बदल जाएगा।" : "Are you sure you want to load this? Your current data will be overwritten.")) return;

    setTitle(data.title || '');
    setStartLocation(data.startLocation || '');
    setEndLocation(data.endLocation || '');
    setStartDate(data.startDate || '');
    if (data.headerImage) setHeaderImage(data.headerImage);
    setLanguage(data.language || 'en');
    setTimeline(data.timeline || []);
    setInstructionsTitle(data.instructionsTitle || 'महत्वपूर्ण निर्देश');
    setInclusionsTitle(data.inclusionsTitle || 'क्या शामिल है (Inclusions)');
    setExclusionsTitle(data.exclusionsTitle || 'क्या शामिल नहीं है (Exclusions)');
    setInclusions(data.inclusions || '');
    setExclusions(data.exclusions || '');
    setImportantInstructions(data.importantInstructions || '');
    setAgentNotes(data.agentNotes || '');
    setNotesTitle(data.notesTitle || 'Note');
    setShowRateField(data.showRateField !== undefined ? data.showRateField : true);
    setRateLabel(data.rateLabel || 'Rate');
    setRate(data.rate || '');
    setShowExtraField(data.showExtraField !== undefined ? data.showExtraField : false);
    setExtraFieldLabel(data.extraFieldLabel || 'No. of Pax');
    setExtraFieldValue(data.extraFieldValue || '');

    setShowSavedModal(false);
  };

  const deleteSavedItinerary = (id: string) => {
    if (!confirm("Are you sure you want to delete this saved itinerary?")) return;
    const updated = savedItineraries.filter(item => item.id !== id);
    setSavedItineraries(updated);
    localStorage.setItem('savedItineraries', JSON.stringify(updated));
  };

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
          const src = event.target.result as string;
          setHeaderImage(src);
          const img = new Image();
          img.onload = () => {
            const ratio = img.naturalHeight / img.naturalWidth;
            const newHeight = Math.round(794 * ratio);
            setHeaderHeight(newHeight);
          };
          img.src = src;
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const removeHeaderImage = () => {
    setHeaderImage('');
    setHeaderHeight(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

  const translateText = async (text: string) => {
    if (!text || language !== 'hi') return text;
    try {
      const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURIComponent(text)}`);
      const data = await res.json();
      if (data && data[0]) {
        return data[0].map((x: any) => x[0]).join('');
      }
    } catch (e) {
      console.error(e);
    }
    return text;
  };

  const handleBlurTranslate = async (text: string, setter: (val: string) => void) => {
    if (language !== 'hi' || !text) return;
    const hindiChars = text.match(/[\u0900-\u097F]/g);
    if (hindiChars && hindiChars.length > text.length * 0.3) return; // already Hindi
    const translated = await translateText(text);
    if (translated) setter(translated);
  };

  const handleDayBlurTranslate = async (index: number, field: keyof TimelineDay) => {
    if (language !== 'hi') return;
    const text = timeline[index][field] as string;
    if (!text) return;
    const hindiChars = text.match(/[\u0900-\u097F]/g);
    if (hindiChars && hindiChars.length > text.length * 0.3) return; // already Hindi
    const translated = await translateText(text);
    if (translated) updateDay(index, field, translated);
  };

  const removeDay = (index: number) => {
    const newTimeline = timeline.filter((_, i) => i !== index).map((day, i) => ({ ...day, dayNumber: i + 1 }));
    setTimeline(newTimeline);
  };

  const getPages = () => {
    const pages: { days: TimelineDay[]; showHeader: boolean; showMeta: boolean; showFooter: boolean }[] = [];

    const A4_HEIGHT = 1122 / fontScale; // Adjust page capacity based on font scale

    // Determine header image height dynamically based on image aspect ratio
    const HEADER_HEIGHT = headerImage ? headerHeight : 0;

    // Meta info card height is exactly 160px based on padding/content
    const META_HEIGHT = 160;

    // Accent bar on subsequent pages
    const PAGE_ACCENT_HEIGHT = 12;

    // Inclusions + Exclusions + Details grid + banner + paddings (increased safety margin)
    const FOOTER_HEIGHT = 440;

    // Estimator function for day card heights based on text length
    const estimateDayHeight = (day: TimelineDay) => {
      let height = 160; // base height (increased for safety)

      // Calculate activities program text height (wider text block fits ~65 chars per line at 14px)
      if (day.activities) {
        const lines = Math.ceil(day.activities.length / 65);
        if (lines > 2) {
          height += (lines - 2) * 22;
        }
      }

      // Calculate meals/accommodation text height
      if (day.meals || day.accommodation) {
        const mealsLen = day.meals ? day.meals.length : 0;
        const stayLen = day.accommodation ? day.accommodation.length : 0;
        const maxLen = Math.max(mealsLen, stayLen);
        if (maxLen > 25) height += 24;
        if (maxLen > 55) height += 24;
        if (maxLen > 85) height += 24;
      }

      return height + 24; // height + spacing gap
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
        <div style={{ fontSize: '14px', color: '#334155', fontWeight: '600', lineHeight: '1.45', whiteSpace: 'pre-wrap' }}>
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
        <ul style={{ margin: 0, padding: '8px 10px 8px 16px', fontSize: '12.5px', color: color, lineHeight: '1.45', listStyleType: 'none' }}>
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
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
        @page {
          size: A4;
          margin: 0;
        }

        /* ======= MOBILE RESPONSIVE ======= */
        @media (max-width: 768px) {
          .itin-outer-shell {
            flex-direction: column !important;
            height: auto !important;
            overflow: visible !important;
          }
          .itin-header-bar {
            flex-direction: column !important;
            align-items: flex-start !important;
            padding: 12px 16px !important;
            gap: 10px !important;
          }
          .itin-header-bar h1 {
            font-size: 17px !important;
          }
          .itin-header-actions {
            flex-wrap: wrap !important;
            gap: 8px !important;
            width: 100% !important;
          }
          .itin-header-actions select {
            min-width: 110px !important;
            font-size: 12px !important;
            padding: 6px 10px !important;
          }
          .itin-header-actions button {
            padding: 6px 10px !important;
            font-size: 12px !important;
          }
          .itin-body-columns {
            flex-direction: column !important;
          }
          .itin-left-pane {
            width: 100% !important;
            border-right: none !important;
            padding: 16px !important;
            overflow: visible !important;
          }
          .itin-right-pane {
            width: 100% !important;
            padding: 16px !important;
            overflow: visible !important;
          }
          .itin-section-header {
            cursor: pointer !important;
            user-select: none !important;
          }
          .itin-section-chevron {
            display: inline-flex !important;
          }
          .itin-zoom-controls-bar {
            flex-wrap: wrap !important;
            gap: 8px !important;
            padding: 10px 12px !important;
          }
          .itin-zoom-inner {
            flex-wrap: wrap !important;
            gap: 8px !important;
          }
          .itin-font-controls {
            border-right: none !important;
            padding-right: 0 !important;
          }
          .itin-preview-scroll {
            overflow-x: auto !important;
          }
          .itin-day-card-mobile {
            cursor: pointer;
          }
        }

        /* Desktop: hide chevron & keep sections always open */
        @media (min-width: 769px) {
          .itin-section-chevron {
            display: none !important;
          }
          .itin-collapsible {
            display: block !important;
          }
          .itin-section-header {
            cursor: default !important;
            pointer-events: none !important;
          }
          .itin-section-header button,
          .itin-section-header input {
            pointer-events: auto !important;
          }
          .itin-day-card-mobile {
            cursor: default !important;
            pointer-events: none !important;
          }
          .itin-day-card-mobile button,
          .itin-day-card-mobile input {
            pointer-events: auto !important;
          }
          .itin-day-collapsible {
            display: block !important;
          }
        }
      `}} />

      <div className="itin-outer-shell" style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f8fafc', overflow: 'hidden', fontFamily: "'Outfit', sans-serif" }}>

        {/* Top Header Bar */}
        <div className="no-print itin-header-bar" style={{
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

          <div className="itin-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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

            {/* Saved Itineraries Button */}
            <button
              onClick={() => setShowSavedModal(true)}
              style={{
                background: '#475569',
                color: '#fff',
                padding: '8px 14px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
            >
              📁 {language === 'hi' ? 'सेव की गई यात्राएं' : 'Saved'}
            </button>

            {/* Save Button */}
            <button
              onClick={handleSaveItinerary}
              style={{
                background: '#3b82f6',
                color: '#fff',
                padding: '8px 14px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
            >
              💾 {language === 'hi' ? 'सेव करें' : 'Save'}
            </button>

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
              📤 {language === 'hi' ? 'इमेज' : 'Image'}
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
              🖨️ {language === 'hi' ? 'पीडीएफ' : 'PDF'}
            </button>
          </div>
        </div>

        {/* Two Columns Body */}
        <div className="itin-body-columns" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* Left Pane - Form Editor */}
          <div className="no-print itin-left-pane" style={{ width: '45%', overflowY: 'auto', padding: '24px', borderRight: '1px solid #e2e8f0', background: '#fff' }}>

            {/* Tour Details Box */}
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <h2
                className="itin-section-header"
                onClick={() => setTourDetailsOpen(prev => !prev)}
                style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', margin: 0, marginBottom: tourDetailsOpen ? '16px' : '0' }}
              >
                <span>Tour Details & Header</span>
                <span className="itin-section-chevron" style={{ fontSize: '18px', transition: 'transform 0.2s', transform: tourDetailsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>⌄</span>
              </h2>

              <div className="itin-collapsible" style={{ display: tourDetailsOpen ? 'block' : 'none' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>
                  {language === 'hi' ? 'कस्टम हेडर इमेज (वैकल्पिक)' : 'Custom Header Image (Optional)'}
                </label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                    style={{
                      width: '100%',
                      fontSize: '13px',
                      color: '#64748b',
                      padding: '8px 32px 8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      boxSizing: 'border-box'
                    }}
                  />
                  {headerImage && (
                    <button
                      onClick={removeHeaderImage}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        color: '#94a3b8',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px',
                        borderRadius: '50%'
                      }}
                      onMouseOver={e => e.currentTarget.style.color = '#ef4444'}
                      onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}
                      title="Remove Image"
                    >
                      ✕
                    </button>
                  )}
                </div>
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
                    onBlur={(e) => handleBlurTranslate(e.target.value, setTitle)}
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
                    onBlur={(e) => handleBlurTranslate(e.target.value, setStartLocation)}
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
                    onBlur={(e) => handleBlurTranslate(e.target.value, setEndLocation)}
                    maxLength={40}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
                {showRateField ? (
                  <div style={{ background: '#fff', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <input
                        type="text"
                        value={rateLabel}
                        onChange={e => setRateLabel(e.target.value)}
                        style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', border: '1px dashed #cbd5e1', outline: 'none', padding: '2px 6px', background: 'transparent', borderRadius: '4px', width: '70%' }}
                      />
                      <button onClick={() => setShowRateField(false)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>
                        ✖
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder={language === 'hi' ? 'मूल्य दर्ज करें' : 'Enter value'}
                      value={rate}
                      onChange={e => setRate(e.target.value)}
                      onBlur={(e) => handleBlurTranslate(e.target.value, setRate)}
                      maxLength={30}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                    />
                  </div>
                ) : (
                  <div>
                    <button onClick={() => setShowRateField(true)} style={{ color: '#ea580c', background: 'none', border: '1px dashed #ea580c', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700', width: '100%', height: '100%', minHeight: '82px' }}>
                      + Add Field
                    </button>
                  </div>
                )}

                {showExtraField ? (
                  <div style={{ background: '#fff', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <input
                        type="text"
                        value={extraFieldLabel}
                        onChange={e => setExtraFieldLabel(e.target.value)}
                        style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', border: '1px dashed #cbd5e1', outline: 'none', padding: '2px 6px', background: 'transparent', borderRadius: '4px', width: '70%' }}
                      />
                      <button onClick={() => setShowExtraField(false)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>
                        ✖
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder={language === 'hi' ? 'विवरण दर्ज करें' : 'Enter value'}
                      value={extraFieldValue}
                      onChange={e => setExtraFieldValue(e.target.value)}
                      onBlur={(e) => handleBlurTranslate(e.target.value, setExtraFieldValue)}
                      maxLength={30}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                    />
                  </div>
                ) : (
                  <div>
                    <button onClick={() => setShowExtraField(true)} style={{ color: '#ea580c', background: 'none', border: '1px dashed #ea580c', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700', width: '100%', height: '100%', minHeight: '82px' }}>
                      + Add Field
                    </button>
                  </div>
                )}
              </div>
            </div>
            </div>

            {/* Day-by-Day Editor Box */}
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <div
                className="itin-section-header"
                onClick={() => setDayByDayOpen(prev => !prev)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: dayByDayOpen ? '16px' : '0', cursor: 'default' }}
              >
                <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Day-by-Day Itinerary</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); addDay(); }}
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
                  <span className="itin-section-chevron" style={{ fontSize: '18px', transition: 'transform 0.2s', transform: dayByDayOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>⌄</span>
                </div>
              </div>

              <div className="itin-collapsible" style={{ display: dayByDayOpen ? 'block' : 'none' }}>
              {timeline.map((day, idx) => {
                const isDayOpen = dayAccordion[idx] !== false;
                return (
                <div key={idx} style={{ background: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                  <div
                    className="itin-day-card-mobile"
                    onClick={() => toggleDayAccordion(idx)}
                    style={{ display: 'flex', justifyContent: 'space-between', marginBottom: isDayOpen ? '12px' : '0', alignItems: 'center' }}
                  >
                    <strong style={{ fontSize: '14px', color: '#ea580c', fontWeight: '700' }}>Day {day.dayNumber}</strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {timeline.length > 1 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); removeDay(idx); }}
                          style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                        >
                          Remove
                        </button>
                      )}
                      <span className="itin-section-chevron" style={{ fontSize: '16px', transition: 'transform 0.2s', transform: isDayOpen ? 'rotate(180deg)' : 'rotate(0deg)', color: '#94a3b8' }}>⌄</span>
                    </div>
                  </div>

                  <div className="itin-day-collapsible" style={{ display: isDayOpen ? 'block' : 'none' }}>
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
                      <span style={{ fontSize: '9px', color: day.activities.length > 470 ? '#ef4444' : '#64748b' }}>
                        {day.activities.length}/500
                      </span>
                    </div>
                    <textarea
                      placeholder={language === 'hi' ? 'विवरण दर्ज करें' : 'Enter activities description'}
                      value={day.activities}
                      onChange={e => updateDay(idx, 'activities', e.target.value)}
                      onBlur={() => handleDayBlurTranslate(idx, 'activities')}
                      maxLength={500}
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
                        onBlur={() => handleDayBlurTranslate(idx, 'meals')}
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
                        onBlur={() => handleDayBlurTranslate(idx, 'accommodation')}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none' }}
                      />
                    </div>
                  </div>
                  </div>
                </div>
              );
              })}
              </div>
            </div>

            {/* Footer details editor box */}
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <h2
                className="itin-section-header"
                onClick={() => setFooterDetailsOpen(prev => !prev)}
                style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: 0, marginBottom: footerDetailsOpen ? '16px' : '0' }}
              >
                <span>Footer Details & Content</span>
                <span className="itin-section-chevron" style={{ fontSize: '18px', transition: 'transform 0.2s', transform: footerDetailsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>⌄</span>
              </h2>

              {/* Inclusions Group */}
              <div className="itin-collapsible" style={{ display: footerDetailsOpen ? 'block' : 'none' }}>
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
                    <span style={{ fontSize: '10px', color: inclusions.length > 370 ? '#ef4444' : '#64748b' }}>
                      {inclusions.length}/400
                    </span>
                  </div>
                  <textarea
                    value={inclusions}
                    onChange={e => setInclusions(e.target.value)}
                    onBlur={(e) => handleBlurTranslate(e.target.value, setInclusions)}
                    maxLength={400}
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
                    <span style={{ fontSize: '10px', color: exclusions.length > 370 ? '#ef4444' : '#64748b' }}>
                      {exclusions.length}/400
                    </span>
                  </div>
                  <textarea
                    value={exclusions}
                    onChange={e => setExclusions(e.target.value)}
                    onBlur={(e) => handleBlurTranslate(e.target.value, setExclusions)}
                    maxLength={400}
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
                    <span style={{ fontSize: '10px', color: importantInstructions.length > 370 ? '#ef4444' : '#64748b' }}>
                      {importantInstructions.length}/400
                    </span>
                  </div>
                  <textarea
                    value={importantInstructions}
                    onChange={e => setImportantInstructions(e.target.value)}
                    onBlur={(e) => handleBlurTranslate(e.target.value, setImportantInstructions)}
                    maxLength={400}
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
                    <span style={{ fontSize: '10px', color: agentNotes.length > 370 ? '#ef4444' : '#64748b' }}>{agentNotes.length}/400</span>
                  </div>
                  <textarea
                    value={agentNotes}
                    onChange={e => setAgentNotes(e.target.value)}
                    maxLength={400}
                    placeholder={language === 'hi' ? 'अतिरिक्त नोट्स यहाँ लिखें...' : 'Write additional notes here...'}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', minHeight: '80px', outline: 'none', resize: 'vertical' }}
                  />
                </div>
              </div>
            </div>
            </div>
          </div>

          {/* Right Pane - Live Preview */}
          <div className="itin-right-pane" style={{ width: '55%', overflowY: 'auto', padding: '24px', background: '#e2e8f0', display: 'flex', flexDirection: 'column' }}>

            {/* Zoom Controls Header */}
            <div className="no-print itin-zoom-controls-bar" style={{
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

              <div className="itin-zoom-inner" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Font Size Controls */}
                <div className="itin-font-controls" style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRight: '1px solid #e2e8f0', paddingRight: '16px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569', marginRight: '4px' }}>
                    {language === 'hi' ? 'फ़ॉन्ट:' : 'Font:'}
                  </span>
                  <button
                    onClick={() => setFontScale(prev => Math.max(0.7, prev - 0.05))}
                    style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
                    title="Decrease Font Size"
                  >A-</button>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', minWidth: '45px', textAlign: 'center', color: '#1e293b' }}>
                    {Math.round(fontScale * 100)}%
                  </span>
                  <button
                    onClick={() => setFontScale(prev => Math.min(1.4, prev + 0.05))}
                    style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
                    title="Increase Font Size"
                  >A+</button>
                </div>

                {/* Zoom Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569', marginRight: '4px' }}>
                    {language === 'hi' ? 'ज़ूम:' : 'Zoom:'}
                  </span>
                  <button
                    onClick={() => setZoom(prev => Math.max(0.3, prev - 0.05))}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '16px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                    title="Zoom Out"
                  >-</button>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', minWidth: '45px', textAlign: 'center', color: '#1e293b' }}>
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={() => setZoom(prev => Math.min(1.5, prev + 0.05))}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '16px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                    title="Zoom In"
                  >+</button>
                  <button
                    onClick={() => setZoom(0.55)}
                    style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: '700', color: '#475569' }}
                  >Reset</button>
                </div>
              </div>
            </div>

            {/* Scrollable Container with centered scale preview */}
            <div className="itin-preview-scroll" style={{
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
                      boxSizing: 'border-box',
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{
                      width: `${100 / fontScale}%`,
                      height: `${100 / fontScale}%`,
                      transform: `scale(${fontScale})`,
                      transformOrigin: 'top left',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative'
                    }}>

                      {/* Header Image (Page 1 Only) */}
                      {page.showHeader && headerImage && (
                        <div style={{ width: '100%', borderBottom: '3px solid #ea580c' }}>
                          <img src={headerImage} alt="Header" style={{ width: '100%', height: 'auto', display: 'block' }} />
                        </div>
                      )}

                      {/* Subtle Top Accent bar for page 2+ */}
                      {!page.showHeader && (
                        <div style={{ height: '12px', width: '100%', background: 'linear-gradient(to right, #ea580c, #dc2626)' }} />
                      )}

                      {/* Tour Meta Info (Page 1 Only) */}
                      {page.showMeta && (
                        <div style={{ padding: '24px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 40px', fontSize: '15px', borderBottom: '1px solid #f1f5f9' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                            <span style={{ fontWeight: 'bold', color: '#334155', minWidth: '105px', paddingBottom: '2px' }}>
                              {language === 'hi' ? 'यात्रा का नाम :' : 'Tour Name :'}
                            </span>
                            <span style={{ color: '#ea580c', fontWeight: 'bold', borderBottom: '1px solid #cbd5e1', flex: 1, paddingBottom: '2px', marginLeft: '6px', minHeight: '20px' }}>
                              {title || ' '}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                            <span style={{ fontWeight: 'bold', color: '#334155', minWidth: '135px', paddingBottom: '2px' }}>
                              {language === 'hi' ? 'यात्रा प्रारंभ स्थान :' : 'Start Location :'}
                            </span>
                            <span style={{ color: '#334155', fontWeight: '600', borderBottom: '1px solid #cbd5e1', flex: 1, paddingBottom: '2px', marginLeft: '6px', minHeight: '20px' }}>
                              {startLocation || ' '}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                            <span style={{ fontWeight: 'bold', color: '#334155', minWidth: '105px', paddingBottom: '2px' }}>
                              {language === 'hi' ? 'यात्रा तिथि :' : 'Tour Date :'}
                            </span>
                            <span style={{ color: '#334155', fontWeight: '600', borderBottom: '1px solid #cbd5e1', flex: 1, paddingBottom: '2px', marginLeft: '6px', minHeight: '20px' }}>
                              {startDate || ' '}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                            <span style={{ fontWeight: 'bold', color: '#334155', minWidth: '135px', paddingBottom: '2px' }}>
                              {language === 'hi' ? 'यात्रा समाप्ति स्थान :' : 'End Location :'}
                            </span>
                            <span style={{ color: '#334155', fontWeight: '600', borderBottom: '1px solid #cbd5e1', flex: 1, paddingBottom: '2px', marginLeft: '6px', minHeight: '20px' }}>
                              {endLocation || ' '}
                            </span>
                          </div>
                          {showRateField && (
                            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                              <span style={{ fontWeight: 'bold', color: '#334155', minWidth: '105px', paddingBottom: '2px' }}>
                                {rateLabel || 'Rate'} :
                              </span>
                              <span style={{ color: '#16a34a', fontWeight: '800', borderBottom: '1px solid #cbd5e1', flex: 1, paddingBottom: '2px', marginLeft: '6px', minHeight: '20px' }}>
                                {rate ? rate : ' '}
                              </span>
                            </div>
                          )}
                          {showExtraField && (
                            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                              <span style={{ fontWeight: 'bold', color: '#334155', minWidth: '135px', paddingBottom: '2px' }}>
                                {extraFieldLabel || 'Extra'} :
                              </span>
                              <span style={{ color: '#334155', fontWeight: '600', borderBottom: '1px solid #cbd5e1', flex: 1, paddingBottom: '2px', marginLeft: '6px', minHeight: '20px' }}>
                                {extraFieldValue ? extraFieldValue : ' '}
                              </span>
                            </div>
                          )}
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
                                <div style={{ fontSize: '13px', fontWeight: 'bold', letterSpacing: '1.5px' }}>DAY</div>
                                <div style={{ fontSize: '42px', fontWeight: '900', lineHeight: '1', marginTop: '2px' }}>
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
                                padding: '10px 0',
                                borderTop: '1px solid #fed7aa'
                              }}>
                                <div style={{ fontSize: '12px', color: '#71717a', fontWeight: 'bold', marginBottom: '2px' }}>
                                  {language === 'hi' ? 'दिनांक' : 'Date'}
                                </div>
                                <div style={{ fontSize: '14px', color: '#ea580c', fontWeight: 'bold' }}>
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
                                <div style={{ fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                                  📅 <span style={{ color: '#0f172a', fontWeight: '800' }}>{language === 'hi' ? 'कार्यक्रम' : 'Program'}</span>
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
                                  <div style={{ fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                                    🍽️ <span style={{ color: '#0f172a', fontWeight: '800' }}>{language === 'hi' ? 'भोजन' : 'Meals'}</span>
                                  </div>
                                  {renderDottedOrText(day.meals, 1)}
                                </div>

                                {/* Stay */}
                                <div>
                                  <div style={{ fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                                    🏨 <span style={{ color: '#0f172a', fontWeight: '800' }}>{language === 'hi' ? 'रात्रि विश्राम' : 'Stay'}</span>
                                  </div>
                                  {renderDottedOrText(day.accommodation, 1)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        {page.showFooter && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                            {/* Inclusions & Exclusions Row */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                              {/* Inclusions Box */}
                              <div style={{ border: '1px solid #bbf7d0', borderRadius: '6px', background: '#f0fdf4', overflow: 'hidden' }}>
                                <div style={{ background: '#16a34a', color: '#fff', padding: '8px 12px', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span>✅</span>
                                  <input
                                    type="text"
                                    value={inclusionsTitle}
                                    onChange={e => setInclusionsTitle(e.target.value)}
                                    maxLength={40}
                                    style={{ background: 'transparent', color: '#fff', border: 'none', fontSize: '14px', fontWeight: 'bold', fontFamily: 'inherit', outline: 'none', width: '100%', padding: '0', cursor: 'text' }}
                                  />
                                </div>
                                {renderListOrDotted(inclusions, '•', '#166534', 3)}
                              </div>

                              {/* Exclusions Box */}
                              <div style={{ border: '1px solid #fecaca', borderRadius: '6px', background: '#fef2f2', overflow: 'hidden' }}>
                                <div style={{ background: '#dc2626', color: '#fff', padding: '8px 12px', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span>❌</span>
                                  <input
                                    type="text"
                                    value={exclusionsTitle}
                                    onChange={e => setExclusionsTitle(e.target.value)}
                                    maxLength={40}
                                    style={{ background: 'transparent', color: '#fff', border: 'none', fontSize: '14px', fontWeight: 'bold', fontFamily: 'inherit', outline: 'none', width: '100%', padding: '0', cursor: 'text' }}
                                  />
                                </div>
                                {renderListOrDotted(exclusions, '•', '#991b1b', 3)}
                              </div>
                            </div>

                            {/* Footer Details Grid — Instructions + Notes (2 cols) */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                              {/* Instructions Card */}
                              <div style={{ border: '1px solid #fed7aa', borderRadius: '6px', background: '#fffbf5', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ background: '#ea580c', color: '#fff', padding: '8px 12px', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span>💡</span>
                                  <input
                                    type="text"
                                    value={instructionsTitle}
                                    onChange={e => setInstructionsTitle(e.target.value)}
                                    maxLength={40}
                                    style={{ background: 'transparent', color: '#fff', border: 'none', fontSize: '14px', fontWeight: 'bold', fontFamily: 'inherit', outline: 'none', width: '100%', padding: '0', cursor: 'text' }}
                                  />
                                </div>
                                <div style={{ flex: 1 }}>{renderListOrDotted(importantInstructions, '•', '#334155', 4)}</div>
                              </div>

                              {/* Notes Card (extended, editable title) */}
                              <div style={{ border: '1px solid #fed7aa', borderRadius: '6px', background: '#fffbf5', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ background: '#ea580c', color: '#fff', padding: '8px 12px', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span>🖊️</span>
                                  <input
                                    type="text"
                                    value={notesTitle}
                                    onChange={e => setNotesTitle(e.target.value)}
                                    maxLength={40}
                                    style={{ background: 'transparent', color: '#fff', border: 'none', fontSize: '14px', fontWeight: 'bold', fontFamily: 'inherit', outline: 'none', width: '100%', padding: '0', cursor: 'text' }}
                                  />
                                </div>
                                <div style={{ flex: 1, padding: '10px 14px', fontSize: '12.5px', color: '#334155', whiteSpace: 'pre-wrap', lineHeight: '1.55', background: '#fffbf5', minHeight: '60px' }}>
                                  {agentNotes || ''}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Footer Cards & Bottom Bar (Page Last only) */}
                      {page.showFooter && (
                        <div style={{ marginTop: 'auto' }}>
                          {/* Disclaimer line */}
                          <div style={{ padding: '6px 40px 8px', textAlign: 'center' }}>
                            <span style={{ fontSize: '10px', color: '#94a3b8', fontStyle: 'italic', letterSpacing: '0.1px' }}>
                              {language === 'hi'
                                ? 'नोट: यात्रा कार्यक्रम मौसम, समय एवं परिस्थितियों के अनुसार परिवर्तित किया जा सकता है।'
                                : 'Note: The itinerary may be subject to change depending on weather, time, and prevailing circumstances.'}
                            </span>
                          </div>

                          {/* Bottom Banner Bar */}
                          <div style={{ background: 'linear-gradient(to right, #ea580c, #dc2626)', padding: '14px 40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', margin: 0, letterSpacing: '1px' }}>
                              🌸 {language === 'hi' ? 'शुभ यात्रा ! मंगल यात्रा !' : 'Happy & Auspicious Journey !'} 🌸
                            </h2>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Saved Itineraries Modal */}
      {showSavedModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', width: '500px', maxWidth: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#0f172a' }}>
                {language === 'hi' ? 'सेव की गई यात्राएं' : 'Saved Itineraries'}
              </h2>
              <button onClick={() => setShowSavedModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✖</button>
            </div>

            {savedItineraries.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '14px', textAlign: 'center' }}>
                {language === 'hi' ? 'कोई यात्रा सेव नहीं की गई है।' : 'No saved itineraries yet.'}
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {savedItineraries.map((saved, idx) => (
                  <div key={idx} style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#1e293b' }}>{saved.saveName}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{language === 'hi' ? 'दिनांक' : 'Date'}: {saved.saveDate}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => loadItinerary(saved)} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                        {language === 'hi' ? 'लोड करें' : 'Load'}
                      </button>
                      <button onClick={() => deleteSavedItinerary(saved.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                        {language === 'hi' ? 'हटाएं' : 'Delete'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
