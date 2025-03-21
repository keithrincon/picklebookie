import React, { Suspense } from 'react';
import { AuthProvider } from './context/AuthContext';
import { FirebaseProvider } from './context/FirebaseContext';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

import Navbar from './components/shared/Navbar';
import NotificationComponent from './components/notifications/NotificationComponent';
import Footer from './components/shared/Footer';
import ErrorBoundary from './components/shared/ErrorBoundary'; // Import ErrorBoundary

// Lazy load components
const Home = React.lazy(() => import('./pages/Home'));
const Matches = React.lazy(() => import('./pages/Matches'));
const Profile = React.lazy(() => import('./pages/Profile'));
const SignUp = React.lazy(() => import('./components/auth/SignUp'));
const LogIn = React.lazy(() => import('./components/auth/LogIn'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <AuthProvider>
      <FirebaseProvider>
        <div className='min-h-screen bg-off-white flex flex-col overflow-auto'>
          {/* Navbar */}
          <Navbar />

          {/* Notification Component */}
          <NotificationComponent />

          {/* Main Content */}
          <main role='main' className='flex-1 p-4'>
            {/* Skip to Content Link */}
            <a href='#main-content' className='sr-only focus:not-sr-only'>
              Skip to content
            </a>

            {/* Main Content Area */}
            <div id='main-content'>
              <ErrorBoundary>
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
                    <Route path='/signup' element={<SignUp />} />
                    <Route path='/login' element={<LogIn />} />
                    <Route path='/matches/:matchId' element={<Matches />} />
                    <Route path='/profile/:userId' element={<Profile />} />
                    <Route path='*' element={<NotFound />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </div>
          </main>

          {/* Footer */}
          <Footer />

          {/* Toast Container */}
          <ToastContainer
            position='top-right'
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            toastStyle={{ backgroundColor: '#f0f4f8', color: '#1a365d' }}
          />
        </div>
      </FirebaseProvider>
    </AuthProvider>
  );
}

export default App;
