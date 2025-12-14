import React, { useEffect, useRef } from 'react';

// Declare Vanta types for TypeScript
declare global {
  interface Window {
    VANTA?: any;
    THREE?: any;
  }
}

interface GlobeProps {
  color?: number;
  backgroundColor?: number;
  points?: number;
  spacing?: number;
  mouseControls?: boolean;
  touchControls?: boolean;
  gyroControls?: boolean;
  minHeight?: number;
  minWidth?: number;
  scale?: number;
  scaleMobile?: number;
}

// Globe Component - Creates a 3D globe effect using Vanta.js
const Globe: React.FC<GlobeProps> = ({
  color = 0x82b440,
  backgroundColor = 0x1d2125,
  points = 28.00,
  spacing = 15.00,
  mouseControls = true,
  touchControls = true,
  gyroControls = false,
  minHeight = 200.00,
  minWidth = 200.00,
  scale = 1.00,
  scaleMobile = 1.00,
}) => {
  const globeRef = useRef<HTMLDivElement>(null);
  const vantaEffectRef = useRef<any>(null);

  useEffect(() => {
    // Load Three.js from CDN
    const threeScript = document.createElement('script');
    threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js';
    threeScript.defer = true;
    threeScript.id = 'three-js-script';
    
    // Check if script is already loaded
    if (!document.getElementById('three-js-script')) {
      document.body.appendChild(threeScript);
    }

    // Load Vanta.js Globe from CDN
    const vantaScript = document.createElement('script');
    vantaScript.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.globe.min.js';
    vantaScript.defer = true;
    vantaScript.id = 'vanta-globe-script';
    
    vantaScript.onload = () => {
      // Initialize Vanta Globe effect
      if (typeof window.VANTA !== 'undefined' && typeof window.VANTA.GLOBE === 'function' && globeRef.current) {
        vantaEffectRef.current = window.VANTA.GLOBE({
          el: globeRef.current,
          mouseControls,
          touchControls,
          gyroControls,
          minHeight,
          minWidth,
          scale,
          scaleMobile,
          color,
          backgroundColor,
          backgroundAlpha: 0.0, // Make background transparent
          points,
          spacing
        });
      }
    };
    
    // Check if script is already loaded
    if (!document.getElementById('vanta-globe-script')) {
      document.body.appendChild(vantaScript);
    } else if (typeof window.VANTA !== 'undefined' && typeof window.VANTA.GLOBE === 'function' && globeRef.current) {
      // If script is already loaded, initialize immediately
      vantaEffectRef.current = window.VANTA.GLOBE({
        el: globeRef.current,
        mouseControls,
        touchControls,
        gyroControls,
        minHeight,
        minWidth,
        scale,
        scaleMobile,
        color,
        backgroundColor,
        points,
        spacing
      });
    }

    // Cleanup function
    return () => {
      if (vantaEffectRef.current) {
        vantaEffectRef.current.destroy();
      }
    };
  }, [color, backgroundColor, points, spacing, mouseControls, touchControls, gyroControls, minHeight, minWidth, scale, scaleMobile]);

  return <div ref={globeRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />;
};

export default Globe;
