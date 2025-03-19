import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { FirebaseProvider } from './context/FirebaseContext';
import { PostsProvider } from './context/PostsContext'; // Import the PostsProvider
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App.jsx';

// Register the service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('Service Worker registered with scope:', registration.scope);
    })
    .catch((error) => {
      console.error('Service Worker registration failed:', error);
    });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AuthProvider>
    <FirebaseProvider>
      <PostsProvider>
        {' '}
        {/* Add PostsProvider */}
        <Router>
          <App />
        </Router>
      </PostsProvider>
    </FirebaseProvider>
  </AuthProvider>
);
