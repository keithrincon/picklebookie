import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { FirebaseProvider } from './context/FirebaseContext';
import { PostsProvider } from './context/PostsContext';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import { app } from './firebase/config';

// Configure reCAPTCHA
window.recaptchaOptions = {
  sitekey: process.env.REACT_APP_RECAPTCHA_SITE_KEY,
  hl: 'en',
};

// Service Worker Registration (simplified)
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  navigator.serviceWorker
    .register('/firebase-messaging-sw.js')
    .catch((error) => console.error('SW registration failed:', error));
}

// Render App
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

// Development logs
if (process.env.NODE_ENV === 'development') {
  console.log('Development mode enabled');
  console.log('Firebase app initialized:', app.name);
}
