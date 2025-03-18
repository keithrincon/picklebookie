import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { FirebaseProvider } from './context/FirebaseContext'; // Import FirebaseProvider
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import App from './App.jsx'; // Updated import
import SignUp from './components/auth/SignUp.jsx'; // Updated import
import LogIn from './components/auth/LogIn.jsx'; // Updated import
import Profile from './pages/Profile.jsx'; // Updated import

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
      {' '}
      {/* Wrap with FirebaseProvider */}
      <Router>
        <Routes>
          <Route path='/' element={<App />} />
          <Route path='/signup' element={<SignUp />} />
          <Route path='/login' element={<LogIn />} />
          <Route path='/profile/:userId' element={<Profile />} />
        </Routes>
      </Router>
    </FirebaseProvider>
  </AuthProvider>
);
