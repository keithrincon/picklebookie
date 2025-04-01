// src/pages/SignUpLanding.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { requestNotificationPermission } from '../firebase/config';

const SignUpLanding = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { logInWithGoogle } = useAuth();
  const navigate = useNavigate();

  // If the Imgur link doesn't work, we'll fall back to a placeholder
  const [imgError, setImgError] = useState(false);

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      const result = await logInWithGoogle();
      console.log('Google sign-in result:', result);
      navigate('/');

      const token = await requestNotificationPermission();
      if (token) console.log('FCM token saved:', token);
    } catch (error) {
      console.error('Google sign-in error:', {
        code: error.code,
        message: error.message,
        fullError: error,
      });
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex flex-col min-h-screen bg-white'>
      {/* Hero Section */}
      <div className='bg-gradient-to-r from-pickle-green to-court-blue text-white py-16 md:py-24 px-4'>
        <div className='container mx-auto max-w-6xl'>
          <div className='flex flex-col md:flex-row items-center'>
            <div className='md:w-1/2 md:pr-12 mb-10 md:mb-0'>
              <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight'>
                Find Your Perfect Pickleball Match
              </h1>
              <p className='text-xl opacity-90 leading-relaxed mb-8'>
                PickleBookie connects you with players, courts, and games in
                your area. Schedule matches, track your progress, and join the
                fastest growing pickleball community.
              </p>
              <div className='flex flex-col sm:flex-row gap-4'>
                <button
                  onClick={handleGoogleSignUp}
                  disabled={isLoading}
                  className='px-8 py-4 bg-white text-pickle-green font-semibold rounded-lg shadow-lg 
                  hover:bg-gray-100 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='currentColor'
                  >
                    <path d='M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.613 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 15.827 0 12.48 0 5.691 0 0 5.691 0 12s5.691 12 12.48 12c3.347 0 5.877-1.107 7.84-3.08 2.027-2.027 2.667-4.88 2.667-7.187 0-.713-.053-1.387-.16-1.933H12.48z' />
                  </svg>
                  {isLoading ? 'Signing up...' : 'Sign up with Google'}
                </button>
                <Link
                  to='/signup'
                  className='px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg
                  hover:bg-white/10 hover:scale-105 transition-all duration-300 text-center'
                >
                  Sign up with Email
                </Link>
              </div>
              <div className='mt-6'>
                <p className='text-white/80'>
                  Already have an account?{' '}
                  <Link
                    to='/login'
                    className='text-white font-medium underline hover:text-white/90'
                  >
                    Log in
                  </Link>
                </p>
              </div>
              {error && (
                <div className='mt-6 bg-red-400 bg-opacity-20 border border-red-400 text-white px-4 py-3 rounded-md text-center'>
                  {error}
                </div>
              )}
            </div>

            {/* App mockup image - using the direct Imgur link */}
            <div className='md:w-1/2'>
              <div className='bg-white p-2 rounded-xl shadow-2xl transform rotate-2'>
                <div className='relative'>
                  <div className='aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden'>
                    {imgError ? (
                      <div className='w-full h-full flex items-center justify-center p-4 text-gray-500'>
                        <p className='text-center'>App preview image</p>
                      </div>
                    ) : (
                      <img
                        src='https://i.imgur.com/vYfxlNJ.png'
                        alt='PickleBookie App Preview'
                        className='w-full h-full object-cover'
                        onError={() => setImgError(true)}
                      />
                    )}
                  </div>

                  {/* Floating elements */}
                  <div className='absolute -top-4 -right-4 bg-white p-3 rounded-lg shadow-lg transform -rotate-3'>
                    <div className='w-16 h-16 bg-pickle-green rounded-full flex items-center justify-center'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-8 w-8 text-white'
                        viewBox='0 0 20 20'
                        fill='currentColor'
                      >
                        <path
                          fillRule='evenodd'
                          d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                          clipRule='evenodd'
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className='py-16 bg-gray-50'>
        <div className='container mx-auto px-4'>
          <h2 className='text-3xl font-bold text-center text-pickle-green mb-12'>
            Why Pickleball Players Love Our Platform
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow'>
              <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-6 w-6 text-pickle-green'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <h3 className='text-xl font-bold text-gray-800 mb-2'>
                Find Nearby Courts
              </h3>
              <p className='text-gray-600'>
                Discover pickleball courts in your area, with details on
                amenities and current activity.
              </p>
            </div>

            <div className='bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow'>
              <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-6 w-6 text-pickle-green'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path d='M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z' />
                </svg>
              </div>
              <h3 className='text-xl font-bold text-gray-800 mb-2'>
                Match with Players
              </h3>
              <p className='text-gray-600'>
                Connect with players at your skill level and schedule games that
                fit your availability.
              </p>
            </div>

            <div className='bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow'>
              <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-6 w-6 text-pickle-green'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <h3 className='text-xl font-bold text-gray-800 mb-2'>
                Schedule Games
              </h3>
              <p className='text-gray-600'>
                Create and join games, send invites, and keep track of your
                upcoming matches.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className='py-16 bg-gradient-to-r from-pickle-green to-court-blue text-white'>
        <div className='container mx-auto px-4 text-center'>
          <h2 className='text-3xl font-bold mb-6'>
            Ready to Find Your Next Game?
          </h2>
          <p className='text-xl opacity-90 mb-8 max-w-2xl mx-auto'>
            Join the PickleBookie community today and connect with pickleball
            enthusiasts in your area.
          </p>

          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <button
              onClick={handleGoogleSignUp}
              disabled={isLoading}
              className='px-8 py-4 bg-white text-pickle-green font-semibold rounded-lg shadow-lg 
              hover:bg-gray-100 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 mx-auto sm:mx-0'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='currentColor'
              >
                <path d='M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.613 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 15.827 0 12.48 0 5.691 0 0 5.691 0 12s5.691 12 12.48 12c3.347 0 5.877-1.107 7.84-3.08 2.027-2.027 2.667-4.88 2.667-7.187 0-.713-.053-1.387-.16-1.933H12.48z' />
              </svg>
              {isLoading ? 'Signing up...' : 'Sign up with Google'}
            </button>
            <Link
              to='/signup'
              className='px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg
              hover:bg-white/10 hover:scale-105 transition-all duration-300 text-center mx-auto sm:mx-0'
            >
              Sign up with Email
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className='bg-gray-800 text-white py-8'>
        <div className='container mx-auto px-4'>
          <div className='flex flex-col md:flex-row justify-between items-center'>
            <div className='mb-4 md:mb-0'>
              <h2 className='text-xl font-bold'>PickleBookie</h2>
              <p className='text-gray-400 text-sm'>
                The pickleball community platform
              </p>
            </div>

            <div className='flex space-x-4'>
              <a
                href='https://twitter.com/picklebookie'
                target='_blank'
                rel='noopener noreferrer'
                className='text-gray-400 hover:text-white'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                >
                  <path d='M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63a9.936 9.936 0 002.46-2.548l-.047-.02z' />
                </svg>
              </a>
              <a
                href='https://instagram.com/picklebookie'
                target='_blank'
                rel='noopener noreferrer'
                className='text-gray-400 hover:text-white'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                >
                  <path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' />
                </svg>
              </a>
            </div>
          </div>

          <div className='mt-8 pt-6 border-t border-gray-700 text-center text-sm text-gray-400'>
            <p>
              &copy; {new Date().getFullYear()} PickleBookie. All rights
              reserved.
            </p>
            <div className='mt-2 space-x-4'>
              <Link to='/terms' className='hover:text-white'>
                Terms of Service
              </Link>
              <Link to='/privacy' className='hover:text-white'>
                Privacy Policy
              </Link>
              <Link to='/help' className='hover:text-white'>
                Help Center
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SignUpLanding;
