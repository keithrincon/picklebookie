import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { requestNotificationPermission } from '../../firebase/firebase';
import { Link, useNavigate } from 'react-router-dom';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      await signUp(email, password, username);
      setEmail('');
      setPassword('');
      setUsername('');
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

  const handleGoogleSignUp = async () => {
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
          {/* Google logo SVG */}
          {isLoading ? 'Signing up...' : 'Sign up with Google'}
        </button>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Form fields */}
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
