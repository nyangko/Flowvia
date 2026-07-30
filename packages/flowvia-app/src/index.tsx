import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import 'react-quill-new/dist/quill.snow.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorBoundaryFallbackUI from './components/ErrorBoundary';
import {I18nextProvider} from 'react-i18next';
import i18n from './i18n';

// One-time migration: this app was renamed from FossFLOW to Flowvia, and its
// localStorage keys along with it. Existing users have their saved diagrams
// and settings under the old 'fossflow'-prefixed keys — copy them forward so
// nothing appears to have vanished. Old keys are left in place (harmless) in
// case this ever needs to be re-run or inspected.
try {
  const oldKeys: string[] = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key && key.startsWith('fossflow')) oldKeys.push(key);
  }
  oldKeys.forEach((oldKey) => {
    const newKey = `flowvia${oldKey.slice('fossflow'.length)}`;
    if (localStorage.getItem(newKey) !== null) return;
    const value = localStorage.getItem(oldKey);
    if (value !== null) localStorage.setItem(newKey, value);
  });
} catch {
  // localStorage can throw in restricted contexts (private browsing, etc.) —
  // skip migration rather than block app startup.
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
        <ErrorBoundary FallbackComponent={ErrorBoundaryFallbackUI}>
            <App />
        </ErrorBoundary>
    </I18nextProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// Service worker registration - only in production for PWA functionality
if (process.env.NODE_ENV === 'production') {
  serviceWorkerRegistration.register({
    onSuccess: () => console.log('Service worker registered successfully'),
    onUpdate: () => console.log('Service worker update available')
  });
} else {
  // Disable service worker in development to avoid cache issues
  serviceWorkerRegistration.unregister();
}
