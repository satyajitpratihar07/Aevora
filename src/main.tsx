import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { startAutomationOrchestrator } from './services/automationOrchestrator.js';
import { initAnalytics } from './services/firebase.js';

// Start real-time automation orchestrator for demo organization
startAutomationOrchestrator('org-apex-01');

// Initialize Firebase Analytics (non-blocking)
initAnalytics().catch(() => {});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
