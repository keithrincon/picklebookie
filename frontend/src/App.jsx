import React, { Suspense } from 'react';
import { AuthProvider } from './context/AuthContext';
import { FirebaseProvider } from './context/FirebaseContext';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import useFirebase from './hooks/useFirebase';

// Component imports
import Navbar from './components/shared/Navbar';
import Footer from './components/shared/Footer';
import ErrorBoundary from './components/shared/ErrorBoundary';
import FeedbackButton from './components/feedback/FeedbackButton'; // Add this import

// Lazy-loaded components
const Home = React.lazy(() => import('./pages/Home'));
const Matches = React.lazy(() => import('./pages/Matches'));
const Profile = React.lazy(() => import('./pages/Profile'));
const SignUp = React.lazy(() => import('./components/auth/SignUp'));
const LogIn = React.lazy(() => import('./components/auth/LogIn'));
const ForgotPassword = React.lazy(() =>
  import('./components/auth/ForgotPassword')
);
const NotFound = React.lazy(() => import('./pages/NotFound'));
// Lazy load the admin component
const FeedbackAdmin = React.lazy(() =>
  import('./components/feedback/FeedbackAdmin')
);

function App() {
  useFirebase();

  return (
    <AuthProvider>
      <FirebaseProvider>
        <div className='min-h-screen bg-off-white flex flex-col'>
          <Navbar />
          <main className='flex-1 p-4 mt-4'>
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path='/' element={<Home />} />
                  <Route path='/signup' element={<SignUp />} />
                  <Route path='/login' element={<LogIn />} />
                  <Route path='/forgot-password' element={<ForgotPassword />} />
                  <Route path='/matches/:matchId' element={<Matches />} />
                  <Route path='/profile/:userId' element={<Profile />} />
                  {/* Add admin route for feedback */}
                  <Route path='/admin/feedback' element={<FeedbackAdmin />} />
                  <Route path='*' element={<NotFound />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </main>
          <Footer />
          {/* Add the FeedbackButton component */}
          <FeedbackButton />
          <ToastContainer position='top-right' autoClose={3000} />
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
