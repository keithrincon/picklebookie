import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!email) {
      setError('Please enter your email address.');
      setIsLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success(
        'A password reset email has been sent to your email address.'
      );
      setEmail('');
    } catch (error) {
      setError('Failed to send password reset email. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='py-16 flex items-center justify-center bg-gray-100'>
      <div className='bg-white p-8 rounded-lg shadow-md w-full max-w-md'>
        <h2 className='text-2xl font-bold mb-6 text-center text-green-600'>
          Forgot Password
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
          <button
            type='submit'
            disabled={isLoading}
            className='w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
          >
            {isLoading ? 'Sending...' : 'Send Reset Email'}
          </button>
        </form>
        <p className='mt-6 text-center text-sm text-gray-600'>
          Remember your password?{' '}
          <Link to='/login' className='text-green-600 hover:underline'>
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
