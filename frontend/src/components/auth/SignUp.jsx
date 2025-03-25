import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { requestNotificationPermission } from '../../firebase/firebase';
import { Link, useNavigate } from 'react-router-dom';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, logInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!email || !password || !username) {
      setError('Please enter email, password, and username.');
      setIsLoading(false);
      return;
    }

    try {
      await signUp(email, password, username, name);
      navigate('/');

      const token = await requestNotificationPermission();
      if (token) console.log('FCM token saved:', token);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      // Add this debug line:
      console.log('Initiating Google sign-in...');

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
    <div className='py-16 flex items-center justify-center bg-off-white min-h-screen font-poppins'>
      <div className='bg-white p-8 rounded-lg shadow-md w-full max-w-md'>
        <h2 className='text-2xl font-bold mb-6 text-center text-pickle-green'>
          Sign Up for Picklebookie
        </h2>
        {error && (
          <div className='bg-error bg-opacity-10 border border-error border-opacity-20 text-error px-4 py-3 rounded mb-4'>
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleSignUp}
          disabled={isLoading}
          className='w-full flex items-center justify-center gap-2 bg-white text-dark-gray py-2 px-4 rounded-md border border-light-gray hover:bg-off-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-medium-gray mb-6 transition duration-150'
        >
          {/* Google SVG icon */}
          {isLoading ? 'Signing up...' : 'Sign up with Google'}
        </button>

        <div className='relative flex items-center justify-center mb-6'>
          <div className='border-t border-light-gray flex-grow'></div>
          <span className='px-4 text-sm text-medium-gray bg-white'>
            or sign up with email
          </span>
          <div className='border-t border-light-gray flex-grow'></div>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label
              htmlFor='username'
              className='block text-sm font-medium text-dark-gray'
            >
              Username *
            </label>
            <input
              type='text'
              id='username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className='mt-1 block w-full px-3 py-2 border border-light-gray rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pickle-green focus:border-pickle-green'
              required
            />
          </div>

          <div>
            <label
              htmlFor='name'
              className='block text-sm font-medium text-dark-gray'
            >
              Full Name
            </label>
            <input
              type='text'
              id='name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='mt-1 block w-full px-3 py-2 border border-light-gray rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pickle-green focus:border-pickle-green'
            />
          </div>

          <div>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-dark-gray'
            >
              Email *
            </label>
            <input
              type='email'
              id='email'
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
              Password *
            </label>
            <input
              type='password'
              id='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='mt-1 block w-full px-3 py-2 border border-light-gray rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pickle-green focus:border-pickle-green'
              required
            />
          </div>

          <div className='pt-2'>
            <button
              type='submit'
              disabled={isLoading}
              className='w-full bg-pickle-green text-white py-2 px-4 rounded-md hover:bg-pickle-green-dark focus:outline-none focus:ring-2 focus:ring-pickle-green focus:ring-offset-2 flex items-center justify-center transition duration-150'
            >
              {isLoading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </div>
        </form>

        <p className='mt-6 text-center text-sm text-medium-gray'>
          Already have an account?{' '}
          <Link
            to='/login'
            className='text-pickle-green hover:text-pickle-green-dark hover:underline font-medium transition duration-150'
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
