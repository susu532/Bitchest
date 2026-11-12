// Hedha el component eli ya3mel globe 3D bel Vanta.js w Three.js, yet7amel dynamiquement mel CDN
import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    VANTA?: any;
    THREE?: any;
  }
}

// El props mta3 el globe - couleurs, points, spacing, w contrôles souris/tactile
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

  // Hne na3mlou chargement dynamique lel scripts Three.js w Vanta.js w n7ottouhom fel DOM
  useEffect(() => {
    const threeScript = document.createElement('script');
    threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js';
    threeScript.defer = true;
    threeScript.id = 'three-js-script';
    
    if (!document.getElementById('three-js-script')) {
      document.body.appendChild(threeScript);
    }

    const vantaScript = document.createElement('script');
    vantaScript.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.globe.min.js';
    vantaScript.defer = true;
    vantaScript.id = 'vanta-globe-script';
    
    // Ki yekmel el chargement, n7allou el effet Vanta Globe bel paramètres eli 3tawhom
    vantaScript.onload = () => {
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
          backgroundAlpha: 0.0,
          points,
          spacing
        });
      }
    };
    
    if (!document.getElementById('vanta-globe-script')) {
      document.body.appendChild(vantaScript);
    } else if (typeof window.VANTA !== 'undefined' && typeof window.VANTA.GLOBE === 'function' && globeRef.current) {
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

    // Cleanup: ki yet3amel unmount lel component, nkaslou el effet bech ma yeb9ach yakol ressources
    return () => {
      if (vantaEffectRef.current) {
        vantaEffectRef.current.destroy();
      }
    };
  }, [color, backgroundColor, points, spacing, mouseControls, touchControls, gyroControls, minHeight, minWidth, scale, scaleMobile]);

  return <div ref={globeRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />;
};

export default Globe;

