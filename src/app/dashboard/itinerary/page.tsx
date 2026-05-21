'use client';

import { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';

type TimelineDay = {
  dayNumber: number;
  dateString: string;
  location?: string;
  activities: string;
  meals: string;
  accommodation: string;
};

type SavedItinerary = {
  id: string;
  saveName: string;
  saveDate: string;
  title: string;
  startLocation: string;
  endLocation: string;
  startDate: string;
  headerImage: string;
  language: string;
  timeline: TimelineDay[];
  instructionsTitle: string;
  inclusionsTitle: string;
  exclusionsTitle: string;
  inclusions: string;
  exclusions: string;
  importantInstructions: string;
  agentNotes: string;
  notesTitle: string;
  showRateField: boolean;
  rateLabel: string;
  rate: string;
  showExtraField: boolean;
  extraFieldLabel: string;
  extraFieldValue: string;
};


export default function ItineraryBuilder() {
  const [title, setTitle] = useState('');
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [headerImage, setHeaderImage] = useState('/style1.png');
  const [headerHeight, setHeaderHeight] = useState(180);
  const [language, setLanguage] = useState('en');
  const [zoom, setZoom] = useState(0.85);
  const [fontScale, setFontScale] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [showPreviewPanel, setShowPreviewPanel] = useState(true);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const embeddedScrollRef = useRef<HTMLDivElement>(null);
  const fullscreenScrollRef = useRef<HTMLDivElement>(null);
  const [embeddedPage, setEmbeddedPage] = useState(1);
  const [fullscreenPage, setFullscreenPage] = useState(1);

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

  // Detect mobile and auto-set zoom to fit A4 page width
  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      const mobile = width <= 768;
      setIsMobile(mobile);
      if (mobile) {
        const availableWidth = width - 32; // 16px padding each side
        const a4WidthPx = 794; // 210mm at 96dpi
        const autoZoom = Math.min(1, availableWidth / a4WidthPx);
        setZoom(Math.round(autoZoom * 100) / 100);
      } else if (width <= 1280) {
        setZoom(0.75); // slightly smaller zoom for smaller laptops to prevent overflow
      } else {
        setZoom(0.85); // default zoom for large desktop screens
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [timeline, setTimeline] = useState<TimelineDay[]>([
    { dayNumber: 1, dateString: '', location: '', activities: '', meals: '', accommodation: '' }
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

  const [savedItineraries, setSavedItineraries] = useState<SavedItinerary[]>([]);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [showFullscreenPreview, setShowFullscreenPreview] = useState(false);

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
        const parsed = JSON.parse(saved) as SavedItinerary[];
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSavedItineraries(parsed);
      } catch { }
    }
  }, []);

  const handleSaveItinerary = () => {
    const data: SavedItinerary = {
      id: Date.now().toString(),
      saveName: '',
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

  const loadItinerary = (data: SavedItinerary) => {
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

  const scrollToPage = (pageIdx: number, isFullscreen: boolean) => {
    const container = isFullscreen ? fullscreenScrollRef.current : embeddedScrollRef.current;
    if (!container) return;
    const pageElements = container.querySelectorAll('.itin-page-snap-wrapper');
    if (pageElements[pageIdx]) {
      const target = pageElements[pageIdx] as HTMLElement;
      const offsetTop = target.offsetTop - (container.clientHeight - target.clientHeight) / 2;
      container.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = (isFullscreen: boolean) => {
    const container = isFullscreen ? fullscreenScrollRef.current : embeddedScrollRef.current;
    if (!container) return;
    const pageElements = container.querySelectorAll('.itin-page-snap-wrapper');
    if (pageElements.length === 0) return;

    let closestPage = 0;
    let minDiff = Infinity;
    const containerScrollTop = container.scrollTop;
    const containerCenter = containerScrollTop + container.clientHeight / 2;

    pageElements.forEach((el, idx) => {
      const targetElement = el as HTMLElement;
      const elementCenter = targetElement.offsetTop + targetElement.clientHeight / 2;
      const diff = Math.abs(elementCenter - containerCenter);
      if (diff < minDiff) {
        minDiff = diff;
        closestPage = idx;
      }
    });

    if (isFullscreen) {
      setFullscreenPage(closestPage + 1);
    } else {
      setEmbeddedPage(closestPage + 1);
    }
  };

  const handlePrevPage = (isFullscreen: boolean) => {
    const currentPage = isFullscreen ? fullscreenPage : embeddedPage;
    if (currentPage > 1) {
      scrollToPage(currentPage - 2, isFullscreen);
    }
  };

  const handleNextPage = (isFullscreen: boolean) => {
    const currentPage = isFullscreen ? fullscreenPage : embeddedPage;
    if (currentPage < pages.length) {
      scrollToPage(currentPage, isFullscreen);
    }
  };

  const renderItineraryPageContent = (page: typeof pages[0], pageIdx: number, isEditable: boolean) => {
    return (
      <>
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
                  <div style={{ fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      📅 <span style={{ color: '#0f172a', fontWeight: '800' }}>{language === 'hi' ? 'कार्यक्रम' : 'Program'}</span>
                    </div>
                    {day.location && (
                      <span style={{ fontSize: '12.5px', color: '#ea580c', fontWeight: 'bold', background: '#fff7ed', padding: '2px 8px', borderRadius: '12px', border: '1px solid #fed7aa', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        📍 {day.location}
                      </span>
                    )}
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
                    {isEditable ? (
                      <input
                        type="text"
                        value={inclusionsTitle}
                        onChange={e => setInclusionsTitle(e.target.value)}
                        maxLength={40}
                        style={{ background: 'transparent', color: '#fff', border: 'none', fontSize: '14px', fontWeight: 'bold', fontFamily: 'inherit', outline: 'none', width: '100%', padding: '0', cursor: 'text' }}
                      />
                    ) : (
                      <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold', fontFamily: 'inherit' }}>{inclusionsTitle}</span>
                    )}
                  </div>
                  {renderListOrDotted(inclusions, '•', '#166534', 3)}
                </div>

                {/* Exclusions Box */}
                <div style={{ border: '1px solid #fecaca', borderRadius: '6px', background: '#fef2f2', overflow: 'hidden' }}>
                  <div style={{ background: '#dc2626', color: '#fff', padding: '8px 12px', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>❌</span>
                    {isEditable ? (
                      <input
                        type="text"
                        value={exclusionsTitle}
                        onChange={e => setExclusionsTitle(e.target.value)}
                        maxLength={40}
                        style={{ background: 'transparent', color: '#fff', border: 'none', fontSize: '14px', fontWeight: 'bold', fontFamily: 'inherit', outline: 'none', width: '100%', padding: '0', cursor: 'text' }}
                      />
                    ) : (
                      <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold', fontFamily: 'inherit' }}>{exclusionsTitle}</span>
                    )}
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
                    {isEditable ? (
                      <input
                        type="text"
                        value={instructionsTitle}
                        onChange={e => setInstructionsTitle(e.target.value)}
                        maxLength={40}
                        style={{ background: 'transparent', color: '#fff', border: 'none', fontSize: '14px', fontWeight: 'bold', fontFamily: 'inherit', outline: 'none', width: '100%', padding: '0', cursor: 'text' }}
                      />
                    ) : (
                      <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold', fontFamily: 'inherit' }}>{instructionsTitle}</span>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>{renderListOrDotted(importantInstructions, '•', '#334155', 4)}</div>
                </div>

                {/* Notes Card (extended, editable title) */}
                <div style={{ border: '1px solid #fed7aa', borderRadius: '6px', background: '#fffbf5', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ background: '#ea580c', color: '#fff', padding: '8px 12px', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🖊️</span>
                    {isEditable ? (
                      <input
                        type="text"
                        value={notesTitle}
                        onChange={e => setNotesTitle(e.target.value)}
                        maxLength={40}
                        style={{ background: 'transparent', color: '#fff', border: 'none', fontSize: '14px', fontWeight: 'bold', fontFamily: 'inherit', outline: 'none', width: '100%', padding: '0', cursor: 'text' }}
                      />
                    ) : (
                      <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold', fontFamily: 'inherit' }}>{notesTitle}</span>
                    )}
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
      </>
    );
  };

  const handleDownloadImage = async () => {
    const container = document.getElementById('itin-print-pages-container');
    if (!container) return;

    const pageElements = container.querySelectorAll('.pdf-page-render');
    if (pageElements.length === 0) return;

    // Create a temporary hidden container on body to render the clean clones without parent transforms
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    tempContainer.style.width = '794px';
    tempContainer.style.height = 'auto';
    tempContainer.style.transform = 'none';
    tempContainer.style.zoom = '1';
    tempContainer.style.background = '#ffffff';
    document.body.appendChild(tempContainer);

    try {
      for (let i = 0; i < pageElements.length; i++) {
        const originalElement = pageElements[i] as HTMLElement;
        const clone = originalElement.cloneNode(true) as HTMLElement;
        
        // Explicitly copy current dynamic input/textarea values since cloneNode doesn't copy current state values
        const originalInputs = originalElement.querySelectorAll('input, textarea, select');
        const clonedInputs = clone.querySelectorAll('input, textarea, select');
        originalInputs.forEach((originalInput, index) => {
          const clonedInput = clonedInputs[index] as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
          if (clonedInput) {
            clonedInput.value = (originalInput as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;
          }
        });

        clone.style.boxShadow = 'none';
        clone.style.border = 'none';
        clone.style.margin = '0';
        clone.style.position = 'relative';
        
        tempContainer.appendChild(clone);

        // Brief delay to ensure styles and layouts are resolved
        await new Promise(resolve => setTimeout(resolve, 100));

        const canvas = await html2canvas(clone, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: clone.offsetWidth,
          height: clone.offsetHeight
        });

        tempContainer.removeChild(clone);

        const link = document.createElement('a');
        link.download = `Itinerary_Page_${i + 1}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        // Delay to ensure browser processes each download sequentially
        await new Promise(resolve => setTimeout(resolve, 350));
      }
    } catch (error) {
      console.error('Image capture failed:', error);
    } finally {
      document.body.removeChild(tempContainer);
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
      { dayNumber: prev.length + 1, dateString: '', location: '', activities: '', meals: '', accommodation: '' }
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
      const data = (await res.json()) as Array<Array<[string, string]>>;
      if (data && data[0]) {
        return data[0].map((x: [string, string]) => x[0]).join('');
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
        @media screen {
          .print-only-itinerary-container {
            display: none !important;
          }
          .preview-page {
            width: 794px !important;
            min-width: 794px !important;
            max-width: 794px !important;
            height: 1123px !important;
            min-height: 1123px !important;
            max-height: 1123px !important;
          }
        }
        @media print {
          /* Reset parent layout wrappers for clean printing */
          html, body, #__next, main, [data-reactroot] {
            display: block !important;
            position: static !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            transform: none !important;
            scale: 1 !important;
            zoom: 1 !important;
            background: white !important;
          }

          /* Hide absolutely all screen components completely */
          .itin-outer-shell,
          .itin-fullscreen-modal,
          .no-print,
          .itin-preview-slider,
          .itin-preview-scroll,
          .itin-preview-scroll-x,
          .itin-fullscreen-scroll-x,
          .itin-scale-wrapper,
          .pdf-pages-container-wrapper,
          .preview-slider,
          .preview-wrapper,
          .zoom-container,
          .page-navigation,
          .preview-controls {
            display: none !important;
          }

          /* Force export A4 container print width */
          .print-only-itinerary-container {
            display: block !important;
            width: 794px !important;
            min-height: 1123px !important;
            background: white !important;
            margin: 0 auto !important;
            transform: none !important;
            scale: 1 !important;
            zoom: 1 !important;
          }

          /* Force A4 page size and reset scaling transforms */
          .pdf-page-render.itinerary-page,
          .itinerary-page {
            display: block !important;
            width: 794px !important;
            height: 1123px !important;
            min-height: 1123px !important;
            transform: none !important;
            scale: 1 !important;
            zoom: 1 !important;
            page-break-after: always !important;
            break-after: page !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 auto !important;
            padding: 0 !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
            background: white !important;
            position: relative !important;
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

        /* Centered Shell layout for wide screens */
        @media (min-width: 1200px) {
          .itin-outer-shell {
            max-width: 1512px !important;
            margin: 0 auto !important;
            border-left: 1px solid #cbd5e1 !important;
            border-right: 1px solid #cbd5e1 !important;
            box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04) !important;
          }
        }

        /* Custom Slim Premium Scrollbars */
        .itin-left-pane::-webkit-scrollbar,
        .itin-fullscreen-modal div:not(.itin-fullscreen-scroll-x)::-webkit-scrollbar,
        .itin-saved-modal-body::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .itin-left-pane::-webkit-scrollbar-track,
        .itin-fullscreen-modal div:not(.itin-fullscreen-scroll-x)::-webkit-scrollbar-track,
        .itin-saved-modal-body::-webkit-scrollbar-track {
          background: transparent;
        }
        .itin-left-pane::-webkit-scrollbar-thumb,
        .itin-fullscreen-modal div:not(.itin-fullscreen-scroll-x)::-webkit-scrollbar-thumb,
        .itin-saved-modal-body::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .itin-left-pane::-webkit-scrollbar-thumb:hover,
        .itin-fullscreen-modal div:not(.itin-fullscreen-scroll-x)::-webkit-scrollbar-thumb:hover,
        .itin-saved-modal-body::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* Custom Slim Premium Scrollbars for preview scroll areas */
        .itin-preview-scroll-x::-webkit-scrollbar,
        .itin-fullscreen-scroll-x::-webkit-scrollbar {
          width: 6px !important;
          height: 6px !important;
          display: block !important;
        }
        .itin-preview-scroll-x::-webkit-scrollbar-track,
        .itin-fullscreen-scroll-x::-webkit-scrollbar-track {
          background: transparent !important;
        }
        .itin-preview-scroll-x::-webkit-scrollbar-thumb,
        .itin-fullscreen-scroll-x::-webkit-scrollbar-thumb {
          background: #cbd5e1 !important;
          border-radius: 4px !important;
        }
        .itin-preview-scroll-x::-webkit-scrollbar-thumb:hover,
        .itin-fullscreen-scroll-x::-webkit-scrollbar-thumb:hover {
          background: #94a3b8 !important;
        }

        /* Uniform CRM Buttons styling */
        .itin-btn {
          height: 38px !important;
          padding: 0 16px !important;
          border-radius: 8px !important;
          font-weight: 700 !important;
          font-size: 13px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 6px !important;
          cursor: pointer !important;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
          border: 1px solid transparent !important;
          box-sizing: border-box !important;
          white-space: nowrap !important;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
        }
        .itin-btn:active {
          transform: scale(0.97) !important;
        }
        .itin-btn-primary {
          background: #ea580c !important;
          color: #ffffff !important;
        }
        .itin-btn-primary:hover {
          background: #c2410c !important;
        }
        .itin-btn-secondary {
          background: #ffffff !important;
          color: #334155 !important;
          border: 1px solid #cbd5e1 !important;
        }
        .itin-btn-secondary:hover {
          background: #f8fafc !important;
          color: #0f172a !important;
          border-color: #94a3b8 !important;
        }
        .itin-btn-slate {
          background: #475569 !important;
          color: #ffffff !important;
        }
        .itin-btn-slate:hover {
          background: #334155 !important;
        }
        .itin-btn-blue {
          background: #2563eb !important;
          color: #ffffff !important;
        }
        .itin-btn-blue:hover {
          background: #1d4ed8 !important;
        }
        .itin-btn-green {
          background: #10b981 !important;
          color: #ffffff !important;
        }
        .itin-btn-green:hover {
          background: #059669 !important;
        }

        /* Select styled */
        .itin-select {
          height: 38px !important;
          padding: 0 32px 0 12px !important;
          border-radius: 8px !important;
          border: 1px solid #cbd5e1 !important;
          background: #ffffff !important;
          font-size: 13px !important;
          color: #475569 !important;
          cursor: pointer !important;
          font-weight: 700 !important;
          outline: none !important;
          box-sizing: border-box !important;
          -webkit-appearance: none !important;
          -moz-appearance: none !important;
          appearance: none !important;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e") !important;
          background-repeat: no-repeat !important;
          background-position: right 10px center !important;
          background-size: 14px !important;
        }
        .itin-select:hover {
          border-color: #94a3b8 !important;
        }

        /* Premium CRM Form Fields */
        .itin-input {
          width: 100% !important;
          height: 38px !important;
          padding: 8px 12px !important;
          border-radius: 8px !important;
          border: 1px solid #cbd5e1 !important;
          background: #ffffff !important;
          font-size: 13px !important;
          color: #334155 !important;
          outline: none !important;
          transition: all 0.15s ease !important;
          box-sizing: border-box !important;
        }
        .itin-input:focus {
          border-color: #ea580c !important;
          box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.1) !important;
        }
        .itin-textarea {
          width: 100% !important;
          padding: 10px 12px !important;
          border-radius: 8px !important;
          border: 1px solid #cbd5e1 !important;
          background: #ffffff !important;
          font-size: 13px !important;
          color: #334155 !important;
          outline: none !important;
          transition: all 0.15s ease !important;
          box-sizing: border-box !important;
        }
        .itin-textarea:focus {
          border-color: #ea580c !important;
          box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.1) !important;
        }
        .itin-label {
          display: block !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          color: #475569 !important;
          margin-bottom: 6px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
        }

        /* Grouped zoom controls */
        .itin-controls-group {
          display: inline-flex !important;
          align-items: center !important;
          background: #f1f5f9 !important;
          padding: 3px !important;
          border-radius: 8px !important;
          border: 1px solid #cbd5e1 !important;
        }
        .itin-controls-btn {
          width: 28px !important;
          height: 28px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          border: none !important;
          background: #ffffff !important;
          color: #475569 !important;
          font-weight: 800 !important;
          border-radius: 6px !important;
          cursor: pointer !important;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
          transition: all 0.15s ease !important;
        }
        .itin-controls-btn:hover {
          background: #f8fafc !important;
          color: #0f172a !important;
        }
        .itin-controls-btn:active {
          transform: scale(0.95) !important;
        }
        .itin-controls-val {
          font-size: 12px !important;
          font-weight: 700 !important;
          min-width: 46px !important;
          text-align: center !important;
          color: #334155 !important;
        }

        /* Sticky Frosted Zoom Bar */
        .itin-zoom-controls-bar {
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          padding: 12px 20px !important;
          background: #f8fafc !important;
          backdrop-filter: blur(12px) !important;
          -webkit-backdrop-filter: blur(12px) !important;
          border-bottom: 1px solid #cbd5e1 !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02) !important;
          z-index: 20 !important;
          position: sticky !important;
          top: 0 !important;
        }

        /* Card and Grids standard styling */
        .itin-editor-card {
          background: #f8fafc;
          padding: 20px;
          border-radius: 12px !important; /* rounded-xl */
          border: 1px solid #cbd5e1;
          margin-bottom: 20px;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03) !important; /* shadow-sm */
        }
        .itin-day-editor-card {
          background: #ffffff;
          padding: 16px;
          border-radius: 12px !important; /* rounded-xl */
          border: 1px solid #cbd5e1;
          margin-bottom: 16px;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important; /* shadow-sm */
        }
        .itin-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        /* Floating Action Button for Add Day on Mobile */
        .itin-add-day-fab {
          display: none !important;
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
            gap: 12px !important;
          }
          .itin-header-bar h1 {
            font-size: 17px !important;
          }

          /* PREVIEW TOOLBAR FIX */
          .itin-header-actions, .preview-toolbar {
            display: flex !important;
            gap: 10px !important;
            overflow-x: auto !important;
            white-space: nowrap !important;
            padding-bottom: 6px !important;
            width: 100% !important;
            -webkit-overflow-scrolling: touch !important;
            grid-template-columns: none !important;
          }
          .itin-header-actions::-webkit-scrollbar, .preview-toolbar::-webkit-scrollbar {
            display: none !important; /* Hide scrollbar aesthetically */
          }
          .itin-header-actions > *, .preview-toolbar > * {
            flex-shrink: 0 !important;
            width: auto !important;
            margin: 0 !important;
          }

          /* BUTTON & SELECT SIZE FIX */
          .itin-btn, .itin-select {
            height: 40px !important;
            padding: 0 14px !important;
            font-size: 13px !important;
            border-radius: 10px !important;
          }
          
          /* Custom Select Arrow Styling on mobile */
          .itin-header-actions select {
            padding: 0 12px !important;
            -webkit-appearance: none !important;
            -moz-appearance: none !important;
            appearance: none !important;
            background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e") !important;
            background-repeat: no-repeat !important;
            background-position: right 12px center !important;
            background-size: 16px !important;
            padding-right: 32px !important;
          }
          
          /* MAIN LAYOUT FIX */
          .itin-body-columns, .itinerary-layout {
            display: flex !important;
            flex-direction: column !important;
            gap: 16px !important;
            height: auto !important;
            overflow: visible !important;
          }
          .itin-left-pane {
            width: 100% !important;
            border-right: none !important;
            padding: 16px !important;
            overflow: visible !important;
          }

          /* DAY CARD & EDITOR CARD FIX */
          .itin-editor-card {
            padding: 16px !important;
            margin-bottom: 16px !important;
          }
          .itin-day-editor-card, .day-card {
            padding: 14px !important;
            border-radius: 14px !important;
            margin-bottom: 12px !important;
            gap: 8px !important;
          }
          .day-card label, .day-card input, .day-card textarea {
            font-size: 12px !important;
          }

          /* FORM GRID FIX */
          .itin-form-grid, .form-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }

          /* PREVIEW PANEL HIDDEN BY DEFAULT ON MOBILE */
          .itin-right-pane, .preview-panel {
            display: none !important; /* Hidden on mobile to improve performance massively */
            width: 100% !important;
            overflow: hidden !important;
            border-radius: 16px !important;
          }

          /* PREVIEW SCROLL FIX */
          .preview-scroll {
            overflow-x: auto !important;
            overflow-y: hidden !important;
            -webkit-overflow-scrolling: touch !important;
            padding-bottom: 8px !important;
          }

          /* PREVIEW HEADER/ZOOM TOPBAR FIX */
          .itin-zoom-controls-bar, .preview-topbar {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            gap: 10px !important;
            flex-wrap: wrap !important;
          }
          .itin-zoom-controls-bar {
            display: none !important; /* Hide zoom controls bar on main page */
          }
          
          /* Hide desktop specific buttons on mobile */
          .itin-hide-preview-btn,
          .itin-fullscreen-btn {
            display: none !important;
          }

          /* FULLSCREEN MOBILE PREVIEW */
          .itin-fullscreen-modal {
            position: fixed !important;
            inset: 0 !important;
            z-index: 9999 !important;
            background: #f3f4f6 !important;
            overflow: auto !important;
            display: flex !important;
            flex-direction: column !important;
          }
          .itin-fullscreen-scroll-x {
            background: #f3f4f6 !important;
          }

          /* A4 PAGE MOBILE SCALING */
          .page-scale-wrapper .itinerary-page {
            transform: scale(0.42) !important;
            transform-origin: top left !important;
          }
          .itin-scale-wrapper {
            transform: none !important;
            width: 794px !important;
            height: 1123px !important;
          }
          .itin-page-snap-wrapper, .page-scale-wrapper {
            height: 520px !important;
            overflow: hidden !important;
            display: flex !important;
            justify-content: flex-start !important;
            align-items: flex-start !important;
          }

          .itin-day-card-mobile {
            cursor: pointer;
          }
          .itin-mobile-preview-title {
            display: flex !important;
          }
          .itin-add-day-fab {
            position: fixed !important;
            bottom: 24px !important;
            right: 24px !important;
            z-index: 40 !important;
            background: #ea580c !important;
            color: #fff !important;
            padding: 12px 20px !important;
            border-radius: 50px !important;
            box-shadow: 0 4px 12px rgba(234, 88, 12, 0.45) !important;
            font-weight: bold !important;
            font-size: 14px !important;
            border: none !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 6px !important;
            cursor: pointer !important;
            transition: transform 0.1s ease-in-out !important;
          }
          .itin-add-day-fab:active {
            transform: scale(0.95) !important;
          }
        }

        .itin-view-preview-btn {
          display: none !important;
        }
        @media (max-width: 768px) {
          .itin-view-preview-btn {
            display: flex !important;
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
          .itin-mobile-preview-title {
            display: none !important;
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

          <div className="itin-header-actions preview-toolbar" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Language Selector */}
            <select
              className="itin-select"
              value={language}
              onChange={e => setLanguage(e.target.value)}
            >
              <option value="en">English (en)</option>
              <option value="hi">हिन्दी (hi)</option>
            </select>

            {/* Saved Itineraries Button */}
            <button
              className="itin-btn itin-btn-slate"
              onClick={() => setShowSavedModal(true)}
            >
              📁 {language === 'hi' ? 'सेव की गई यात्राएं' : 'Saved'}
            </button>

            {/* Save Button */}
            <button
              className="itin-btn itin-btn-blue"
              onClick={handleSaveItinerary}
            >
              💾 {language === 'hi' ? 'सेव करें' : 'Save'}
            </button>

            {/* Hide Preview Button (Desktop Only) */}
            <button
              className="itin-btn itin-btn-secondary itin-hide-preview-btn"
              onClick={() => setShowPreviewPanel(prev => !prev)}
            >
              {showPreviewPanel ? (
                <>👁️‍🗨️ {language === 'hi' ? 'पूर्वावलोकन छिपाएं' : 'Hide Preview'}</>
              ) : (
                <>👁️ {language === 'hi' ? 'पूर्वावलोकन दिखाएं' : 'Show Preview'}</>
              )}
            </button>

            {/* Fullscreen Preview Button (Desktop Only) */}
            <button
              className="itin-btn itin-btn-secondary itin-fullscreen-btn"
              onClick={() => setShowFullscreenPreview(true)}
            >
              🖵 {language === 'hi' ? 'पूर्ण स्क्रीन' : 'Fullscreen'}
            </button>

            {/* View Preview Button (Mobile Only) */}
            <button
              className="itin-btn itin-btn-slate itin-view-preview-btn"
              onClick={() => {
                // When opening preview modal on mobile, fit zoom appropriately
                const availableWidth = window.innerWidth - 32;
                const a4WidthPx = 794;
                const autoZoom = Math.min(1, availableWidth / a4WidthPx);
                setZoom(Math.round(autoZoom * 100) / 100);
                setShowFullscreenPreview(true);
              }}
            >
              👁️ {language === 'hi' ? 'पूर्वावलोकन देखें' : 'View Preview'}
            </button>

            {/* Image Download Button */}
            <button
              className="itin-btn itin-btn-primary"
              onClick={handleDownloadImage}
            >
              📤 {language === 'hi' ? 'इमेज' : 'Image'}
            </button>

            {/* PDF Print Button */}
            <button
              className="itin-btn itin-btn-green"
              onClick={handlePrintPdf}
            >
              🖨️ {language === 'hi' ? 'पीडीएफ' : 'PDF'}
            </button>
          </div>
        </div>

        {/* Two Columns Body */}
        <div className="itin-body-columns itinerary-layout" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* Left Pane - Form Editor */}
          <div
            className="no-print itin-left-pane"
            style={{
              width: showPreviewPanel ? '45%' : '100%',
              overflowY: 'auto',
              padding: '24px',
              borderRight: showPreviewPanel ? '1px solid #e2e8f0' : 'none',
              background: '#fff',
              transition: 'width 0.3s ease-in-out'
            }}
          >

            {/* Tour Details Box */}
            <div className="itin-editor-card">
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
                <label className="itin-label">
                  {language === 'hi' ? 'कस्टम हेडर इमेज (वैकल्पिक)' : 'Custom Header Image (Optional)'}
                </label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                    className="itin-input"
                    style={{ paddingRight: '32px' }}
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

              <div className="itin-form-grid form-grid" style={{ marginBottom: '12px' }}>
                <div>
                  <label className="itin-label">
                    {language === 'hi' ? 'यात्रा का नाम' : 'Tour Name'}
                  </label>
                  <input
                    type="text"
                    placeholder={language === 'hi' ? 'नाम दर्ज करें' : 'Enter tour name'}
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    onBlur={(e) => handleBlurTranslate(e.target.value, setTitle)}
                    maxLength={50}
                    className="itin-input"
                  />
                </div>
                <div>
                  <label className="itin-label">
                    {language === 'hi' ? 'तिथि' : 'Date'}
                  </label>
                  <input
                    type="text"
                    placeholder={language === 'hi' ? 'तिथि चुनें या लिखें' : 'Select or enter date'}
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    maxLength={30}
                    className="itin-input"
                  />
                </div>
              </div>

              <div className="itin-form-grid form-grid">
                <div>
                  <label className="itin-label">
                    {language === 'hi' ? 'प्रस्थान स्थान' : 'Start Location'}
                  </label>
                  <input
                    type="text"
                    placeholder={language === 'hi' ? 'प्रस्थान स्थान दर्ज करें' : 'Enter start location'}
                    value={startLocation}
                    onChange={e => setStartLocation(e.target.value)}
                    onBlur={(e) => handleBlurTranslate(e.target.value, setStartLocation)}
                    maxLength={40}
                    className="itin-input"
                  />
                </div>
                <div>
                  <label className="itin-label">
                    {language === 'hi' ? 'समाप्ति स्थान' : 'End Location'}
                  </label>
                  <input
                    type="text"
                    placeholder={language === 'hi' ? 'समाप्ति स्थान दर्ज करें' : 'Enter end location'}
                    value={endLocation}
                    onChange={e => setEndLocation(e.target.value)}
                    onBlur={(e) => handleBlurTranslate(e.target.value, setEndLocation)}
                    maxLength={40}
                    className="itin-input"
                  />
                </div>
              </div>

              <div className="itin-form-grid form-grid" style={{ marginTop: '16px' }}>
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
                      className="itin-input"
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
                      className="itin-input"
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
            <div className="itin-editor-card">
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
                <div key={idx} className="itin-day-editor-card day-card">
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
                  <div className="itin-form-grid form-grid" style={{ marginBottom: '12px' }}>
                    <div>
                      <label className="itin-label">
                        {language === 'hi' ? 'दिनांक' : 'Date'}
                      </label>
                      <input
                        placeholder="dd/mm/yyyy"
                        value={day.dateString}
                        onChange={e => updateDay(idx, 'dateString', e.target.value)}
                        maxLength={30}
                        className="itin-input"
                      />
                    </div>
                    <div>
                      <label className="itin-label">
                        {language === 'hi' ? 'स्थान' : 'Location'}
                      </label>
                      <input
                        placeholder={language === 'hi' ? 'स्थान दर्ज करें' : 'Enter location'}
                        value={day.location || ''}
                        onChange={e => updateDay(idx, 'location', e.target.value)}
                        onBlur={() => handleDayBlurTranslate(idx, 'location')}
                        maxLength={40}
                        className="itin-input"
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label className="itin-label" style={{ marginBottom: 0 }}>
                        {language === 'hi' ? 'कार्यक्रम विवरण' : 'Activities Description'}
                      </label>
                      <span style={{ fontSize: '10px', fontWeight: 'bold', color: day.activities.length > 470 ? '#ef4444' : '#64748b' }}>
                        {day.activities.length}/500
                      </span>
                    </div>
                    <textarea
                      placeholder={language === 'hi' ? 'विवरण दर्ज करें' : 'Enter activities description'}
                      value={day.activities}
                      onChange={e => updateDay(idx, 'activities', e.target.value)}
                      onBlur={() => handleDayBlurTranslate(idx, 'activities')}
                      maxLength={500}
                      className="itin-textarea"
                      rows={3}
                    />
                  </div>

                  <div className="itin-form-grid form-grid">
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label className="itin-label" style={{ marginBottom: 0 }}>
                          {language === 'hi' ? 'भोजन' : 'Meals'}
                        </label>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#94a3b8' }}>{day.meals.length}/65</span>
                      </div>
                      <input
                        placeholder={language === 'hi' ? 'उदा. नाश्ता और रात का भोजन' : 'e.g. Breakfast & Dinner'}
                        value={day.meals}
                        onChange={e => updateDay(idx, 'meals', e.target.value)}
                        onBlur={() => handleDayBlurTranslate(idx, 'meals')}
                        className="itin-input"
                      />
                    </div>
                    <div>
                      <label className="itin-label">
                        {language === 'hi' ? 'आवास' : 'Accommodation'}
                      </label>
                      <input
                        placeholder={language === 'hi' ? 'उदा. होटल का नाम' : 'e.g. Hotel Name'}
                        value={day.accommodation}
                        onChange={e => updateDay(idx, 'accommodation', e.target.value)}
                        onBlur={() => handleDayBlurTranslate(idx, 'accommodation')}
                        className="itin-input"
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
            <div className="itin-editor-card">
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
              <div style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                <div>
                  <label className="itin-label">
                    {language === 'hi' ? 'क्या शामिल है शीर्षक (Inclusions Title)' : 'Inclusions Title'}
                  </label>
                  <input
                    type="text"
                    value={inclusionsTitle}
                    onChange={e => setInclusionsTitle(e.target.value)}
                    maxLength={40}
                    className="itin-input"
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="itin-label" style={{ marginBottom: 0 }}>
                      {language === 'hi' ? 'क्या शामिल है विवरण' : 'Inclusions Content'}
                    </label>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: inclusions.length > 370 ? '#ef4444' : '#64748b' }}>
                      {inclusions.length}/400
                    </span>
                  </div>
                  <textarea
                    value={inclusions}
                    onChange={e => setInclusions(e.target.value)}
                    onBlur={(e) => handleBlurTranslate(e.target.value, setInclusions)}
                    maxLength={400}
                    placeholder={language === 'hi' ? 'उदा. टोल टैक्स, पार्किंग शामिल है।' : 'e.g. All sightseeing, Hotels daily breakfast'}
                    className="itin-textarea"
                    rows={3}
                  />
                </div>
              </div>

              {/* Exclusions Group */}
              <div style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                <div>
                  <label className="itin-label">
                    {language === 'hi' ? 'क्या शामिल नहीं है शीर्षक (Exclusions Title)' : 'Exclusions Title'}
                  </label>
                  <input
                    type="text"
                    value={exclusionsTitle}
                    onChange={e => setExclusionsTitle(e.target.value)}
                    maxLength={40}
                    className="itin-input"
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="itin-label" style={{ marginBottom: 0 }}>
                      {language === 'hi' ? 'क्या शामिल नहीं है विवरण' : 'Exclusions Content'}
                    </label>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: exclusions.length > 370 ? '#ef4444' : '#64748b' }}>
                      {exclusions.length}/400
                    </span>
                  </div>
                  <textarea
                    value={exclusions}
                    onChange={e => setExclusions(e.target.value)}
                    onBlur={(e) => handleBlurTranslate(e.target.value, setExclusions)}
                    maxLength={400}
                    placeholder={language === 'hi' ? 'उदा. हवाई टिकट का किराया।' : 'e.g. Flight ticket fare, monument entry fees'}
                    className="itin-textarea"
                    rows={3}
                  />
                </div>
              </div>

              {/* Instructions Group */}
              <div style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                <div>
                  <label className="itin-label">
                    {language === 'hi' ? 'निर्देश शीर्षक (Instructions Title)' : 'Instructions Title'}
                  </label>
                  <input
                    type="text"
                    value={instructionsTitle}
                    onChange={e => setInstructionsTitle(e.target.value)}
                    maxLength={40}
                    className="itin-input"
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="itin-label" style={{ marginBottom: 0 }}>
                      {language === 'hi' ? 'महत्वपूर्ण निर्देश' : 'Important Instructions'}
                    </label>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: importantInstructions.length > 370 ? '#ef4444' : '#64748b' }}>
                      {importantInstructions.length}/400
                    </span>
                  </div>
                  <textarea
                    value={importantInstructions}
                    onChange={e => setImportantInstructions(e.target.value)}
                    onBlur={(e) => handleBlurTranslate(e.target.value, setImportantInstructions)}
                    maxLength={400}
                    className="itin-textarea"
                    rows={3}
                  />
                </div>
              </div>

              {/* Notes Group */}
              <div style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                <div>
                  <label className="itin-label">
                    Notes Title
                  </label>
                  <input
                    type="text"
                    value={notesTitle}
                    onChange={e => setNotesTitle(e.target.value)}
                    maxLength={40}
                    className="itin-input"
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="itin-label" style={{ marginBottom: 0 }}>Notes Content</label>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: agentNotes.length > 370 ? '#ef4444' : '#64748b' }}>{agentNotes.length}/400</span>
                  </div>
                  <textarea
                    value={agentNotes}
                    onChange={e => setAgentNotes(e.target.value)}
                    maxLength={400}
                    placeholder={language === 'hi' ? 'अतिरिक्त नोट्स यहाँ लिखें...' : 'Write additional notes here...'}
                    className="itin-textarea"
                    rows={3}
                  />
                </div>
              </div>
            </div>
            </div>
          </div>

          {/* Right Pane - Live Preview */}
          <div
            className="itin-right-pane preview-panel"
            style={{
              width: '55%',
              overflow: 'hidden',
              padding: isMobile ? '16px' : '0',
              background: '#f1f5f9',
              display: isMobile ? 'flex' : (showPreviewPanel ? 'flex' : 'none'),
              flexDirection: 'column'
            }}
          >

            {/* Mobile-only Preview & Settings heading */}
            <div className="itin-mobile-preview-title" style={{ display: 'none', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Preview & Settings</h2>
            </div>

            {/* Zoom Controls Header */}
            <div className="no-print itin-zoom-controls-bar preview-topbar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#334155' }}>
                  📄 {language === 'hi' ? 'पूर्वावलोकन :' : 'Preview :'}
                </span>
                <span style={{ fontSize: '12px', fontWeight: '600', background: '#fee2e2', color: '#ef4444', padding: '2px 8px', borderRadius: '12px' }}>
                  {isMobile ? `${pages.length} ${language === 'hi' ? 'पेज' : 'Pages'}` : (
                    language === 'hi'
                      ? `पेज ${embeddedPage} / ${pages.length}`
                      : `Viewing Page ${embeddedPage} / ${pages.length}`
                  )}
                </span>
              </div>

              <div className="itin-zoom-inner" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Font Size Controls */}
                <div className="itin-font-controls" style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRight: '1px solid #e2e8f0', paddingRight: '16px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569', marginRight: '4px' }}>
                    {language === 'hi' ? 'फ़ॉन्ट:' : 'Font:'}
                  </span>
                  <div className="itin-controls-group">
                    <button
                      className="itin-controls-btn"
                      onClick={() => setFontScale(prev => Math.max(0.7, prev - 0.05))}
                      title="Decrease Font Size"
                    >A-</button>
                    <span className="itin-controls-val">
                      {Math.round(fontScale * 100)}%
                    </span>
                    <button
                      className="itin-controls-btn"
                      onClick={() => setFontScale(prev => Math.min(1.4, prev + 0.05))}
                      title="Increase Font Size"
                    >A+</button>
                  </div>
                </div>

                {/* Zoom Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569', marginRight: '4px' }}>
                    {language === 'hi' ? 'ज़ूम:' : 'Zoom:'}
                  </span>
                  <div className="itin-controls-group">
                    <button
                      className="itin-controls-btn"
                      onClick={() => setZoom(prev => Math.max(0.3, prev - 0.05))}
                      title="Zoom Out"
                    >-</button>
                    <span className="itin-controls-val">
                      {Math.round(zoom * 100)}%
                    </span>
                    <button
                      className="itin-controls-btn"
                      onClick={() => setZoom(prev => Math.min(1.5, prev + 0.05))}
                      title="Zoom In"
                    >+</button>
                  </div>
                  <button
                    className="itin-btn itin-btn-secondary"
                    style={{ height: '34px', padding: '0 12px' }}
                    onClick={() => setZoom(0.85)}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable Container with centered scale preview */}
            {isMobile ? (
              <div
                ref={embeddedScrollRef}
                className="itin-preview-scroll preview-scroll"
                onClick={() => {
                  // Fit zoom for mobile fullscreen modal
                  const availableWidth = window.innerWidth - 32;
                  const a4WidthPx = 794;
                  const autoZoom = Math.min(1, availableWidth / a4WidthPx);
                  setZoom(Math.round(autoZoom * 100) / 100);
                  setShowFullscreenPreview(true);
                }}
                style={{
                  flex: 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  background: '#cbd5e1',
                  borderRadius: '12px',
                  border: '2px dashed #94a3b8',
                  padding: '16px',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <div className="itin-scale-wrapper" style={{ width: 'calc(794px * 0.24)', height: '270px', overflow: 'hidden', pointerEvents: 'none' }}>
                  <div className="pdf-pages-container-wrapper" style={{ transform: 'scale(0.24)', transformOrigin: 'top left', width: '794px', pointerEvents: 'none', position: 'absolute', top: 0, left: 0 }}>
                    <div
                      className="pdf-page-render preview-page"
                      style={{
                        width: '794px',
                        height: '1123px',
                        backgroundColor: '#ffffff',
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
                        {renderItineraryPageContent(pages[0], 0, false)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ position: 'relative', flex: 1, display: 'flex', width: '100%', overflow: 'hidden' }}>
                {/* Scrollable Vertical Container */}
                <div
                  ref={embeddedScrollRef}
                  onScroll={() => handleScroll(false)}
                  className="itin-preview-scroll-x preview-scroll"
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: '32px',
                    scrollBehavior: 'smooth',
                    width: '100%',
                    height: 'calc(100vh - 180px)',
                    position: 'relative',
                    padding: '24px',
                    boxSizing: 'border-box'
                  }}
                >
                  {pages.map((page, pageIdx) => (
                    <div
                      key={pageIdx}
                      className="itin-page-snap-wrapper page-scale-wrapper"
                      style={{
                        width: '100%',
                        height: `calc(1123px * ${zoom})`,
                        flexShrink: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'flex-start'
                      }}
                    >
                      <div
                        className="itin-scale-wrapper"
                        style={{
                          width: '794px',
                          height: '1123px',
                          minHeight: '1123px',
                          transform: `scale(${zoom})`,
                          transformOrigin: 'top center',
                          overflow: 'hidden',
                          position: 'relative',
                          boxShadow: '0 4px 18px rgba(0,0,0,0.08)',
                          borderRadius: '12px',
                          backgroundColor: '#ffffff',
                          flexShrink: 0,
                          transition: 'transform 0.15s ease-out'
                        }}
                      >
                        <div
                          className="pdf-page-render itinerary-page preview-page"
                          style={{
                            width: '794px',
                            height: '1123px',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            backgroundColor: '#ffffff'
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
                            {renderItineraryPageContent(page, pageIdx, false)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Saved Itineraries Modal */}
      {showSavedModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="itin-saved-modal-body" style={{ background: '#fff', padding: '24px', borderRadius: '8px', width: '500px', maxWidth: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
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

      {isMobile && dayByDayOpen && (
        <button
          className="itin-add-day-fab no-print"
          onClick={addDay}
        >
          ➕ {language === 'hi' ? 'दिन जोड़ें' : 'Add Day'}
        </button>
      )}

      {/* Fullscreen Preview Modal */}
      {showFullscreenPreview && (
        <div className="itin-fullscreen-modal no-print" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: '#0f172a',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          color: '#fff'
        }}>
          {/* Modal Header/Toolbar */}
          <div className="preview-topbar" style={{
            background: '#1e293b',
            padding: '12px 16px',
            borderBottom: '1px solid #334155',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                  📄 {language === 'hi' ? 'यात्रा कार्यक्रम पूर्वावलोकन' : 'Itinerary Preview'}
                </span>
                <span style={{ fontSize: '12px', fontWeight: '600', background: '#fee2e2', color: '#ef4444', padding: '2px 8px', borderRadius: '12px', marginLeft: '12px' }}>
                  {isMobile ? `${pages.length} ${language === 'hi' ? 'पेज' : 'Pages'}` : (
                    language === 'hi'
                      ? `पेज ${fullscreenPage} / ${pages.length}`
                      : `Viewing Page ${fullscreenPage} / ${pages.length}`
                  )}
                </span>
              </div>
              <button
                onClick={() => setShowFullscreenPreview(false)}
                style={{
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '13px'
                }}
              >
                {language === 'hi' ? 'बंद करें' : 'Close'}
              </button>
            </div>

            {/* Controls Row */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              paddingTop: '4px'
            }}>
              {/* Font Scale */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                  {language === 'hi' ? 'फ़ॉन्ट:' : 'Font:'}
                </span>
                <button
                  onClick={() => setFontScale(prev => Math.max(0.7, prev - 0.05))}
                  style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #475569', background: '#334155', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
                >-</button>
                <span style={{ fontSize: '13px', fontWeight: 'bold', minWidth: '40px', textAlign: 'center' }}>
                  {Math.round(fontScale * 100)}%
                </span>
                <button
                  onClick={() => setFontScale(prev => Math.min(1.4, prev + 0.05))}
                  style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #475569', background: '#334155', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
                >+</button>
              </div>



              {/* Zoom */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                  {language === 'hi' ? 'ज़ूम:' : 'Zoom:'}
                </span>
                <button
                  onClick={() => setZoom(prev => Math.max(0.3, prev - 0.05))}
                  style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #475569', background: '#334155', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
                >-</button>
                <span style={{ fontSize: '13px', fontWeight: 'bold', minWidth: '40px', textAlign: 'center' }}>
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom(prev => Math.min(1.5, prev + 0.05))}
                  style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #475569', background: '#334155', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
                >+</button>
                <button
                  onClick={() => {
                    const availableWidth = window.innerWidth - 32;
                    const a4WidthPx = 794;
                    const autoZoom = Math.min(1, availableWidth / a4WidthPx);
                    setZoom(Math.round(autoZoom * 100) / 100);
                  }}
                  style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #475569', background: '#334155', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                >
                  Fit
                </button>
              </div>
            </div>
          </div>

          {/* Modal Content Scrollable Area */}
          <div style={{ position: 'relative', flex: 1, display: 'flex', width: '100%', overflow: 'hidden' }}>
            {/* Scrollable Vertical Container */}
            <div
              ref={fullscreenScrollRef}
              onScroll={() => handleScroll(true)}
              className="itin-fullscreen-scroll-x preview-scroll"
              style={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: '32px',
                scrollBehavior: 'smooth',
                width: '100%',
                height: 'calc(100vh - 180px)',
                position: 'relative',
                padding: '24px',
                boxSizing: 'border-box',
                background: '#0f172a'
              }}
            >
              {pages.map((page, pageIdx) => (
                <div
                  key={pageIdx}
                  className="itin-page-snap-wrapper page-scale-wrapper"
                  style={{
                    width: '100%',
                    height: `calc(1123px * ${zoom})`,
                    flexShrink: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start'
                  }}
                >
                  <div
                    className="itin-scale-wrapper"
                    style={{
                      width: '794px',
                      height: '1123px',
                      minHeight: '1123px',
                      transform: `scale(${zoom})`,
                      transformOrigin: 'top center',
                      overflow: 'hidden',
                      position: 'relative',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                      borderRadius: '12px',
                      backgroundColor: '#ffffff',
                      flexShrink: 0,
                      transition: 'transform 0.15s ease-out'
                    }}
                  >
                    <div
                      className="pdf-page-render itinerary-page preview-page"
                      style={{
                        width: '794px',
                        height: '1123px',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        backgroundColor: '#ffffff'
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
                        {renderItineraryPageContent(page, pageIdx, false)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hidden Print-only Container for clean prints/captures */}
      <div id="itin-print-pages-container" className="print-only-itinerary-container">
        {pages.map((page, pageIdx) => (
          <div
            key={pageIdx}
            className="pdf-page-render itinerary-page"
            style={{
              width: '794px',
              height: '1123px',
              backgroundColor: '#ffffff',
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
              {renderItineraryPageContent(page, pageIdx, false)}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
