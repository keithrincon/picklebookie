import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { FirebaseProvider } from './context/FirebaseContext';
import { PostsProvider } from './context/PostsContext';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import {
  app,
  requestNotificationPermission,
  messaging,
} from './firebase/config'; // Fixed import path

// ========================
// CRITICAL INITIALIZATION
// ========================

// 1. Configure reCAPTCHA before React loads
window.recaptchaOptions = {
  sitekey: process.env.REACT_APP_RECAPTCHA_SITE_KEY,
  hl: 'en',
};

// 2. Service Worker Registration with Enhanced Error Handling
const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/firebase-messaging-sw.js')
      .then((registration) => {
        console.log('SW registered for scope:', registration.scope);

        // Periodic SW update check (every 24 hours)
        setInterval(() => {
          registration.update().then(() => {
            console.debug('Service Worker updated');
          });
        }, 86400000);
      })
      .catch((error) => {
        console.error('SW registration failed:', error);

        // Retry logic for production
        if (process.env.NODE_ENV === 'production') {
          console.log('Retrying SW registration in 5 seconds...');
          setTimeout(registerServiceWorker, 5000);
        }
      });
  }
};

// Only register in production or if explicitly enabled in dev
if (
  process.env.NODE_ENV === 'production' ||
  process.env.REACT_APP_ENABLE_SW_IN_DEV === 'true'
) {
  registerServiceWorker();
}

// 3. Firebase Messaging Auto-Initialization (Optional)
if (process.env.REACT_APP_ENABLE_PUSH_NOTIFICATIONS === 'true') {
  // Directly use the imported function instead of dynamic import
  if (process.env.REACT_APP_AUTO_REQUEST_NOTIFICATIONS === 'true') {
    requestNotificationPermission().then((token) => {
      console.debug('FCM Token:', token || 'Not granted');
    });
  }
}

// ========================
// REACT RENDER
// ========================

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <FirebaseProvider>
        <PostsProvider>
          <Router>
            <App />
          </Router>
        </PostsProvider>
      </FirebaseProvider>
    </AuthProvider>
  </React.StrictMode>
);

// ========================
// PERFORMANCE MONITORING
// ========================

if (process.env.NODE_ENV === 'development') {
  console.log('Development mode enabled');
  // Verify Firebase initialization
  console.log('Firebase app initialized:', app.name);
  // Verify messaging
  console.log('Firebase messaging initialized:', messaging);
}
