// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignUp from './components/SignUp';
import LogIn from './components/LogIn';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AuthProvider>
    <Router>
      <Routes>
        <Route path='/' element={<App />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/login' element={<LogIn />} />
      </Routes>
    </Router>
  </AuthProvider>
);
