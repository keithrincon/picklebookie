import React, { Suspense } from 'react';
import { AuthProvider } from './context/AuthContext';
import { FirebaseProvider } from './context/FirebaseContext';
import { Routes, Route } from 'react-router-dom';
import './index.css';

import Navbar from './components/shared/Navbar';
import NotificationComponent from './components/notifications/NotificationComponent';
import Footer from './components/shared/Footer';
import Home from './pages/Home';
import Matches from './pages/Matches';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound'; // Import the NotFound component

function App() {
  return (
    <AuthProvider>
      <FirebaseProvider>
        <div className='min-h-screen bg-off-white flex flex-col'>
          {/* Navbar */}
          <Navbar />

          {/* Notification Component */}
          <NotificationComponent />

          {/* Main Content */}
          <main role='main' className='flex-1 p-4'>
            {/* Skip to Content Link (for accessibility) */}
            <a href='#main-content' className='sr-only focus:not-sr-only'>
              Skip to content
            </a>

            {/* Main Content Area */}
            <div id='main-content'>
              {/* Suspense for Loading State */}
              <Suspense
                fallback={
                  <div className='flex justify-center items-center h-64'>
                    <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pickle-green'></div>
                  </div>
                }
              >
                {/* Routes */}
                <Routes>
                  <Route path='/' element={<Home />} />
                  <Route path='/matches/:matchId' element={<Matches />} />
                  <Route path='/profile/:userId' element={<Profile />} />
                  <Route path='*' element={<NotFound />} />{' '}
                  {/* Catch-all route for 404 */}
                </Routes>
              </Suspense>
            </div>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </FirebaseProvider>
    </AuthProvider>
  );
}

export default App;
