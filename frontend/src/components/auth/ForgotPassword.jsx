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
    <div className='flex items-center justify-center px-4 py-16 font-sans'>
      <div className='w-full max-w-md bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden'>
        <div className='p-8'>
          <h2 className='text-3xl font-bold text-center text-pickle-green mb-4'>
            Forgot Password
          </h2>
          <p className='text-center text-gray-600 mb-8'>
            Enter your email to reset your password
          </p>

          {error && (
            <div className='bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6 text-center'>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Email Address *
              </label>
              <input
                type='email'
                id='email'
                name='email'
                placeholder='Enter your email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pickle-green focus:border-transparent transition duration-300'
                required
              />
            </div>

            <button
              type='submit'
              disabled={isLoading}
              className='w-full bg-pickle-green text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-pickle-green focus:ring-offset-2 transition duration-300 flex items-center justify-center'
            >
              {isLoading ? 'Sending...' : 'Send Reset Email'}
            </button>
          </form>

          <p className='mt-6 text-center text-sm text-gray-600'>
            Remember your password?{' '}
            <Link
              to='/login'
              className='text-pickle-green hover:text-green-700 font-semibold hover:underline'
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
