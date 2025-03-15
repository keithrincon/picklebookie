import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { FirebaseProvider } from './context/FirebaseContext';
import { Routes, Route } from 'react-router-dom'; // Import Routes and Route
import './index.css';

import Navbar from './components/shared/Navbar';
import NotificationComponent from './components/notifications/NotificationComponent';
import Home from './pages/Home'; // Import Home page
import Matches from './pages/Matches'; // Import Matches page
import Profile from './pages/Profile'; // Import Profile page

function App() {
  return (
    <AuthProvider>
      <FirebaseProvider>
        <div className='min-h-screen bg-gray-100 flex flex-col'>
          <Navbar />
          <NotificationComponent />
          <main className='flex-1 p-4'>
            <Routes>
              <Route path='/' element={<Home />} /> {/* Home Page */}
              <Route path='/matches/:matchId' element={<Matches />} />{' '}
              {/* Match Details Page */}
              <Route path='/profile/:userId' element={<Profile />} />{' '}
              {/* Profile Page */}
            </Routes>
          </main>
        </div>
      </FirebaseProvider>
    </AuthProvider>
  );
}

export default App;
