import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { requestNotificationPermission } from '../../firebase/firebase';
import { Link, useNavigate } from 'react-router-dom';

const LogIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { logIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Reset error on new attempt

    if (!email || !password) {
      setError('Please enter both email and password.');
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
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      <div className='bg-white p-8 rounded-lg shadow-md w-full max-w-md'>
        <h2 className='text-2xl font-bold mb-6 text-center text-green-600'>
          Login to Picklebookie
        </h2>
        {error && (
          <p className='text-red-500 text-sm mb-4 text-center'>{error}</p>
        )}
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-gray-700'
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
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500'
              required
            />
          </div>
          <div>
            <label
              htmlFor='password'
              className='block text-sm font-medium text-gray-700'
            >
              Password
            </label>
            <input
              type='password'
              id='password'
              name='password'
              placeholder='Enter your password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500'
              required
            />
          </div>
          <button
            type='submit'
            className='w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
          >
            Log In
          </button>
        </form>
        <p className='mt-6 text-center text-sm text-gray-600'>
          Don’t have an account?{' '}
          <Link to='/signup' className='text-green-600 hover:underline'>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LogIn;
