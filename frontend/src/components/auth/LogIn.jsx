import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { requestNotificationPermission } from '../../firebase/firebase';
import { useNavigate } from 'react-router-dom';

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
      navigate('/');

      const token = await requestNotificationPermission();
      if (token) {
        console.log('FCM token saved:', token);
      }
    } catch (error) {
      setError('Failed to log in. Check your credentials and try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await logInWithGoogle();
      navigate('/');

      const token = await requestNotificationPermission();
      if (token) {
        console.log('FCM token saved:', token);
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
            {/* Google logo SVG */}
          </svg>
          {isLoading ? 'Logging in...' : 'Continue with Google'}
        </button>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Form fields */}
        </form>
      </div>
    </div>
  );
};

export default LogIn;
