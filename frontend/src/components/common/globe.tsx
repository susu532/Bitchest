// ============================================================================
// Import de React et des hooks nécessaires.
// useEffect exécute du code après le rendu du composant.
// useRef crée une référence mutable persistante entre les rendus.
// ============================================================================
import React, { useEffect, useRef } from 'react';

// ============================================================================
// Extension de l'interface Window globale pour TypeScript.
// 'declare global' permet d'ajouter des propriétés à window.
// VANTA et THREE sont les bibliothèques chargées dynamiquement.
// ============================================================================
declare global {
  interface Window {
    // VANTA est la bibliothèque d'effets visuels 3D.
    VANTA?: any;
    // THREE est la bibliothèque Three.js pour le rendu 3D.
    THREE?: any;
  }
}

// ============================================================================
// Interface définissant les props configurables du globe.
// Toutes les props sont optionnelles avec des valeurs par défaut.
// ============================================================================
interface GlobeProps {
  // color est la couleur des points du globe (format hexadécimal).
  color?: number;
  // backgroundColor est la couleur de fond.
  backgroundColor?: number;
  // points est le nombre de points sur le globe.
  points?: number;
  // spacing est l'espacement entre les points.
  spacing?: number;
  // mouseControls active l'interaction à la souris.
  mouseControls?: boolean;
  // touchControls active l'interaction tactile.
  touchControls?: boolean;
  // gyroControls active l'interaction avec le gyroscope.
  gyroControls?: boolean;
  // minHeight est la hauteur minimale du conteneur.
  minHeight?: number;
  // minWidth est la largeur minimale du conteneur.
  minWidth?: number;
  // scale est le facteur d'échelle du globe.
  scale?: number;
  // scaleMobile est le facteur d'échelle sur mobile.
  scaleMobile?: number;
}

// ============================================================================
// Composant Globe créant un effet globe 3D avec Vanta.js.
// React.FC<GlobeProps> type le composant fonctionnel avec ses props.
// Ce composant charge dynamiquement Three.js et Vanta.js depuis des CDN.
// ============================================================================
const Globe: React.FC<GlobeProps> = ({
  // Valeurs par défaut pour toutes les props.
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
  // ============================================================================
  // Référence au div conteneur pour Vanta.
  // useRef<HTMLDivElement>(null) crée une référence typée initialisée à null.
  // Cette référence est passée à Vanta pour le rendu 3D.
  // ============================================================================
  const globeRef = useRef<HTMLDivElement>(null);
  
  // ============================================================================
  // Référence pour stocker l'instance de l'effet Vanta.
  // Cette référence permet de détruire l'effet lors du nettoyage.
  // ============================================================================
  const vantaEffectRef = useRef<any>(null);

  // ============================================================================
  // Effet pour charger et initialiser Vanta.js.
  // Cet effet gère le chargement dynamique des scripts externes.
  // ============================================================================
  useEffect(() => {
    // ============================================================================
    // Création d'un élément script pour Three.js.
    // document.createElement('script') crée un élément <script>.
    // ============================================================================
    const threeScript = document.createElement('script');
    threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js';
    // defer charge le script de manière non bloquante.
    threeScript.defer = true;
    // id permet de vérifier si le script est déjà chargé.
    threeScript.id = 'three-js-script';
    
    // Vérifie si Three.js n'est pas déjà chargé.
    if (!document.getElementById('three-js-script')) {
      document.body.appendChild(threeScript);
    }

    // ============================================================================
    // Création d'un élément script pour Vanta.js Globe.
    // ============================================================================
    const vantaScript = document.createElement('script');
    vantaScript.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.globe.min.js';
    vantaScript.defer = true;
    vantaScript.id = 'vanta-globe-script';
    
    // ============================================================================
    // Callback exécuté quand le script Vanta est chargé.
    // onload se déclenche après le chargement complet du script.
    // ============================================================================
    vantaScript.onload = () => {
      // Vérifie que VANTA.GLOBE est disponible et que le ref existe.
      if (typeof window.VANTA !== 'undefined' && typeof window.VANTA.GLOBE === 'function' && globeRef.current) {
        // Initialisation de l'effet Vanta Globe.
        vantaEffectRef.current = window.VANTA.GLOBE({
          // el est l'élément DOM cible.
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
          // backgroundAlpha: 0.0 rend le fond transparent.
          backgroundAlpha: 0.0,
          points,
          spacing
        });
      }
    };
    
    // Vérifie si Vanta.js n'est pas déjà chargé.
    if (!document.getElementById('vanta-globe-script')) {
      document.body.appendChild(vantaScript);
    } else if (typeof window.VANTA !== 'undefined' && typeof window.VANTA.GLOBE === 'function' && globeRef.current) {
      // Si le script est déjà chargé, initialise immédiatement.
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

    // ============================================================================
    // Fonction de nettoyage exécutée au démontage du composant.
    // return () => {...} définit le cleanup de l'effet.
    // ============================================================================
    return () => {
      // destroy() libère les ressources WebGL de Vanta.
      if (vantaEffectRef.current) {
        vantaEffectRef.current.destroy();
      }
    };
  }, [color, backgroundColor, points, spacing, mouseControls, touchControls, gyroControls, minHeight, minWidth, scale, scaleMobile]);

  // ============================================================================
  // Rendu du div conteneur pour l'effet 3D.
  // Le style position: absolute permet au globe de couvrir tout le parent.
  // ============================================================================
  return <div ref={globeRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />;
};

// Export par défaut du composant Globe.
export default Globe;

