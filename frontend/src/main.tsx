// ============================================================================
// Import de StrictMode depuis React pour activer les vérifications supplémentaires.
// StrictMode est un composant React qui active des avertissements en développement.
// Il détecte les effets secondaires inattendus et les API obsolètes.
// ============================================================================
import { StrictMode } from 'react';

// ============================================================================
// Import de createRoot pour le nouveau mode de rendu concurrent de React 18.
// createRoot remplace l'ancienne API ReactDOM.render() de React 17.
// Cette API permet le rendu concurrent et améliore les performances.
// ============================================================================
import { createRoot } from 'react-dom/client';

// ============================================================================
// Import de BrowserRouter pour activer le routage côté client.
// BrowserRouter utilise l'API History HTML5 pour les URLs propres.
// Ce composant doit envelopper toute l'application pour le routage.
// ============================================================================
import { BrowserRouter } from 'react-router-dom';

// ============================================================================
// Import du composant App, le composant racine de l'application.
// App contient tous les providers et la configuration du routage.
// C'est le point d'entrée principal de la logique applicative.
// ============================================================================
import App from './App';

// ============================================================================
// Import des styles CSS globaux de l'application.
// './styles/global.css' contient les styles de base appliqués partout.
// Les imports CSS en JavaScript sont gérés par le bundler (Vite).
// ============================================================================
import './styles/global.css';

// ============================================================================
// Récupération de l'élément DOM où monter l'application React.
// document.getElementById('app') cherche l'élément avec id="app" dans index.html.
// 'const' déclare une constante, 'container' est le nom de la variable.
// ============================================================================
const container = document.getElementById('app');

// ============================================================================
// Vérification que l'élément racine existe dans le DOM.
// 'if (!container)' vérifie si container est null ou undefined.
// '!' est l'opérateur de négation qui inverse la valeur booléenne.
// ============================================================================
if (!container) {
  // ============================================================================
  // Lancement d'une erreur si l'élément n'est pas trouvé.
  // 'throw new Error()' crée et lance une exception.
  // Cette erreur interrompt l'exécution et affiche le message dans la console.
  // ============================================================================
  throw new Error('Application root element not found');
}

// ============================================================================
// Création de la racine React et rendu de l'application.
// createRoot(container) crée un conteneur React pour le rendu concurrent.
// .render() monte l'arbre de composants dans le DOM.
// ============================================================================
createRoot(container).render(
  // ============================================================================
  // StrictMode enveloppe l'application pour les vérifications de développement.
  // Ce composant n'a pas d'effet en production, seulement en développement.
  // Il aide à détecter les problèmes potentiels dans le code.
  // ============================================================================
  <StrictMode>
    {/* ============================================================================
    BrowserRouter fournit le contexte de routage à toute l'application.
    Ce composant utilise l'API History du navigateur pour la navigation.
    Toutes les routes définies dans App seront gérées par ce router.
    ============================================================================ */}
    <BrowserRouter>
      {/* ============================================================================
      App est le composant principal contenant toute la logique de l'application.
      Il inclut les providers (AuthProvider, AppStateProvider, NotificationProvider).
      Toutes les routes et composants sont rendus à l'intérieur de App.
      ============================================================================ */}
      <App />
    </BrowserRouter>
  </StrictMode>,
);

