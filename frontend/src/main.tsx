// Hedha el point d'entrée mta3 el app React, hne na3mlou mount lel DOM
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/global.css';

const container = document.getElementById('app');

if (!container) {
  throw new Error('Application root element not found');
}

// Na3mlou render lel app jouwwa StrictMode w BrowserRouter
createRoot(container).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
