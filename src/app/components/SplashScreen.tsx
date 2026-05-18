'use client';

import { useState, useEffect } from 'react';

export default function SplashScreen() {
  const [show, setShow] = useState(true);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // Start fade out animation a bit before removing component
    const fadeTimer = setTimeout(() => {
      setFade(true);
    }, 2500);

    const removeTimer = setTimeout(() => {
      setShow(false);
    }, 3000); // Total 3 seconds

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#000',
      overflow: 'hidden',
      transition: 'opacity 0.5s ease',
      opacity: fade ? 0 : 1,
      pointerEvents: fade ? 'none' : 'auto'
    }}>
      <style>{`
        @keyframes zoomIn {
          from { transform: scale(1); }
          to { transform: scale(1.1); }
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
      
      {/* Background Image with Zoom Animation */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: 'url(/image2.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        animation: 'zoomIn 4s ease-out forwards',
        opacity: 0.6,
        zIndex: 1
      }} />

      {/* Overlay to darken background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7))',
        zIndex: 2
      }} />

      {/* Logo with Fade/Scale Animation */}
      <div style={{
        position: 'relative',
        zIndex: 3,
        textAlign: 'center',
        animation: 'fadeInScale 1.2s ease-out forwards'
      }}>
        <img 
          src="/msty_logo.png" 
          alt="MSTY Logo" 
          style={{ width: '120px', height: 'auto', marginBottom: '16px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }} 
        />
        <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: '800', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>MSTY CRM</h1>
        <p style={{ color: '#f1f5f9', fontSize: '14px', marginTop: '4px', textShadow: '0 1px 2px rgba(0,0,0,0.6)', letterSpacing: '1px' }}>TIRTH YATRA MANAGEMENT</p>
      </div>
    </div>
  );
}
