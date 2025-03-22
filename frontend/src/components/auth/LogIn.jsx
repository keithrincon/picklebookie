import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { requestNotificationPermission } from '../../firebase/firebase';
import { Link, useNavigate } from 'react-router-dom';

const LogIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { logIn, logInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password.');
      setIsLoading(false);
      return;
    }

    try {
      await logIn(email, password);
      setEmail('');
      setPassword('');
      navigate('/'); // Redirect to the home page after successful login

      // Request notification permission and save the FCM token
      const token = await requestNotificationPermission();
      if (token) {
        console.log('FCM token saved:', token);
      } else {
        console.log(
          'Notification permission not granted or token not available.'
        );
      }
    } catch (error) {
      setError('Failed to log in. Check your credentials and try again.');
      console.error(error); // Log the actual error for debugging
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await logInWithGoogle();
      navigate('/'); // Redirect to the home page after successful Google login

      // Request notification permission and save the FCM token
      const token = await requestNotificationPermission();
      if (token) {
        console.log('FCM token saved:', token);
      } else {
        console.log(
          'Notification permission not granted or token not available.'
        );
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='py-16 flex items-center justify-center bg-off-white min-h-screen font-poppins'>
      <div className='bg-white p-8 rounded-lg shadow-md w-full max-w-md'>
        <h2 className='text-2xl font-bold mb-6 text-center text-pickle-green'>
          Login to Picklebookie
        </h2>
        {error && (
          <div className='bg-error bg-opacity-10 border border-error border-opacity-20 text-error px-4 py-3 rounded mb-4'>
            {error}
          </div>
        )}

        {/* Google Sign-In Button - Moved to top */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className='w-full flex items-center justify-center gap-2 bg-white text-dark-gray py-2 px-4 rounded-md border border-light-gray hover:bg-off-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-medium-gray mb-6 transition duration-150'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 48 48'
            width='24px'
            height='24px'
          >
            <path
              fill='#FFC107'
              d='M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z'
            />
            <path
              fill='#FF3D00'
              d='M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z'
            />
            <path
              fill='#4CAF50'
              d='M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z'
            />
            <path
              fill='#1976D2'
              d='M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z'
            />
          </svg>
          {isLoading ? 'Logging in...' : 'Continue with Google'}
        </button>

        <div className='relative flex items-center justify-center mb-6'>
          <div className='border-t border-light-gray flex-grow'></div>
          <span className='px-4 text-sm text-medium-gray bg-white'>
            or log in with email
          </span>
          <div className='border-t border-light-gray flex-grow'></div>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-dark-gray'
            >
              Email
            </label>
            <input
              type='email'
              id='email'
              name='email'
              placeholder='Enter your email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='mt-1 block w-full px-3 py-2 border border-light-gray rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pickle-green focus:border-pickle-green'
              required
            />
          </div>
          <div>
            <label
              htmlFor='password'
              className='block text-sm font-medium text-dark-gray'
            >
              Password
            </label>
            <div className='flex items-center justify-between'>
              <input
                type='password'
                id='password'
                name='password'
                placeholder='Enter your password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='mt-1 block w-full px-3 py-2 border border-light-gray rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pickle-green focus:border-pickle-green'
                required
              />
            </div>
            <div className='flex justify-end mt-1'>
              <Link
                to='/forgot-password'
                className='text-sm text-pickle-green hover:text-pickle-green-dark hover:underline transition duration-150'
              >
                Forgot password?
              </Link>
            </div>
          </div>
          <div className='pt-2'>
            <button
              type='submit'
              disabled={isLoading}
              className='w-full bg-pickle-green text-white py-2 px-4 rounded-md hover:bg-pickle-green-dark focus:outline-none focus:ring-2 focus:ring-pickle-green focus:ring-offset-2 flex items-center justify-center transition duration-150'
            >
              {isLoading ? (
                <>
                  <svg
                    className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    ></path>
                  </svg>
                  Logging In...
                </>
              ) : (
                'Log In'
              )}
            </button>
          </div>
        </form>

        <p className='mt-6 text-center text-sm text-medium-gray'>
          Don't have an account?{' '}
          <Link
            to='/signup'
            className='text-pickle-green hover:text-pickle-green-dark hover:underline font-medium transition duration-150'
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LogIn;
