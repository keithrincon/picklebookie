import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { FirebaseProvider } from './context/FirebaseContext';
import { PostsProvider } from './context/PostsContext';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';

// ========================
// CRITICAL INITIALIZATION
// ========================

// 1. Configure reCAPTCHA before React loads
window.recaptchaOptions = {
  sitekey: process.env.REACT_APP_RECAPTCHA_SITE_KEY,
  hl: 'en',
};

// 2. Service Worker Registration
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  navigator.serviceWorker
    .register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('Service Worker registered with scope:', registration.scope);
    })
    .catch((error) => {
      console.error('Service Worker registration failed:', error);
    });
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
