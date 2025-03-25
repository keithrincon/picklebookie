import React, { Suspense, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { FirebaseProvider } from './context/FirebaseContext';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

// Firebase imports
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
} from 'firebase/messaging';
import { app } from '../firebase/config'; // Adjust path as needed

// Components
import Navbar from './components/shared/Navbar';
import Footer from './components/shared/Footer';
import ErrorBoundary from './components/shared/ErrorBoundary';

// Lazy load components
const Home = React.lazy(() => import('./pages/Home'));
const Matches = React.lazy(() => import('./pages/Matches'));
const Profile = React.lazy(() => import('./pages/Profile'));
const SignUp = React.lazy(() => import('./components/auth/SignUp'));
const LogIn = React.lazy(() => import('./components/auth/LogIn'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

function App() {
  useEffect(() => {
    const initializeFCM = async () => {
      try {
        // Check if FCM is supported in this browser
        const isFcmSupported = await isSupported();
        if (
          !isFcmSupported ||
          !process.env.REACT_APP_ENABLE_PUSH_NOTIFICATIONS
        ) {
          console.log('FCM not supported or disabled');
          return;
        }

        const messaging = getMessaging(app);

        // Only auto-request if enabled
        if (process.env.REACT_APP_AUTO_REQUEST_NOTIFICATIONS === 'true') {
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') return;
        }

        // Get FCM token
        const token = await getToken(messaging, {
          vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
        });

        if (token) {
          console.log('FCM Token:', token);
          // TODO: Send token to your backend
        }

        // Handle foreground messages
        onMessage(messaging, (payload) => {
          console.log('Foreground message:', payload);
          toast(payload.notification?.body || 'New notification', {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        });
      } catch (error) {
        console.error('FCM Error:', error);
      }
    };

    initializeFCM();
  }, []);

  return (
    <AuthProvider>
      <FirebaseProvider>
        <div className='min-h-screen bg-off-white flex flex-col overflow-auto'>
          <Navbar />

          <main role='main' className='flex-1 p-4 mt-4'>
            <div id='main-content' className='pb-8'>
              <ErrorBoundary>
                <Suspense fallback={<LoadingSpinner />}>
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

          <Footer />

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

const LoadingSpinner = () => (
  <div className='flex justify-center items-center h-64'>
    <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pickle-green'></div>
  </div>
);

export default App;
