// src/App.jsx
import React, { Suspense, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { FirebaseProvider } from './context/FirebaseContext';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import useFirebase from './hooks/useFirebase';

// Component imports
import AppHeader from './components/navigation/AppHeader';
import BottomNav from './components/navigation/BottomNav';
import ErrorBoundary from './components/shared/ErrorBoundary';

// Lazy-loaded components
const Home = React.lazy(() => import('./pages/Home'));
const Explore = React.lazy(() => import('./pages/Explore'));
const CreatePost = React.lazy(() => import('./components/posts/CreatePost'));
const Matches = React.lazy(() => import('./pages/Matches'));
const Profile = React.lazy(() => import('./pages/Profile'));
const MyPlaces = React.lazy(() => import('./pages/MyPlaces'));
const SignUp = React.lazy(() => import('./components/auth/SignUp'));
const LogIn = React.lazy(() => import('./components/auth/LogIn'));
const ForgotPassword = React.lazy(() =>
  import('./components/auth/ForgotPassword')
);
const Search = React.lazy(() => import('./pages/Search'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
// Lazy load the admin component
const FeedbackAdmin = React.lazy(() =>
  import('./components/feedback/FeedbackAdmin')
);
// New page components
const Settings = React.lazy(() => import('./pages/Settings'));
const HelpAndFeedback = React.lazy(() => import('./pages/HelpAndFeedback'));
// Sign-up landing page
const SignUpLanding = React.lazy(() => import('./pages/SignUpLanding'));

function App() {
  useFirebase();
  const location = useLocation();

  // Effect to set the active tab in the Help page based on URL parameters
  useEffect(() => {
    if (location.pathname === '/help' && location.search === '?tab=feedback') {
      // Wait for the component to load, then set the active tab
      setTimeout(() => {
        const feedbackTabButton = document.querySelector(
          '[data-section="feedback"]'
        );
        if (feedbackTabButton) {
          feedbackTabButton.click();
        }
      }, 100);
    }
  }, [location]);

  return (
    <AuthProvider>
      <FirebaseProvider>
        <div className='min-h-screen bg-gray-50 flex flex-col'>
          <AppHeader />
          <main className='flex-1 pb-20'>
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  {/* Landing page route */}
                  <Route path='/welcome' element={<SignUpLanding />} />

                  {/* Existing routes */}
                  <Route path='/' element={<Home />} />
                  <Route path='/explore' element={<Explore />} />
                  <Route path='/create' element={<CreatePost />} />
                  <Route path='/my-places' element={<MyPlaces />} />
                  <Route path='/search' element={<Search />} />
                  <Route path='/signup' element={<SignUp />} />
                  <Route path='/login' element={<LogIn />} />
                  <Route path='/forgot-password' element={<ForgotPassword />} />
                  <Route path='/matches/:matchId' element={<Matches />} />
                  <Route path='/profile/:userId' element={<Profile />} />
                  {/* Admin route for feedback */}
                  <Route path='/admin/feedback' element={<FeedbackAdmin />} />

                  {/* New Routes */}
                  <Route path='/settings' element={<Settings />} />
                  <Route path='/help' element={<HelpAndFeedback />} />

                  <Route path='*' element={<NotFound />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </main>
          <BottomNav />
          {/* Remove the FeedbackButton component since we're now accessing it from the sidebar */}
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
