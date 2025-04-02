import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { requestNotificationPermission } from '../../firebase/fcm';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../shared/AuthLayout';
import FormInput from '../shared/FormInput';
import Button from '../shared/Button';
import ErrorAlert from '../shared/ErrorAlert';

const SignUp = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    username: '',
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, logInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { email, password, username, name } = formData;

    if (!email || !password || !username) {
      setError('Please fill out all required fields.');
      setIsLoading(false);
      return;
    }

    try {
      await signUp(email, password, username, name);
      navigate('/');

      const token = await requestNotificationPermission();
      if (token) console.log('FCM token saved:', token);
    } catch (error) {
      setError(error.message || 'Sign up failed');
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      const result = await logInWithGoogle();
      console.log('Google signup successful', result);
      navigate('/');

      const token = await requestNotificationPermission();
      if (token) console.log('FCM token saved:', token);
    } catch (error) {
      setError(error.message || 'Google sign-up failed');
      console.error('Google sign-up error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title='Join Picklebookie'
      subtitle='Find your pickleball partners and schedule games!'
    >
      <ErrorAlert message={error} />

      <Button
        onClick={handleGoogleSignUp}
        disabled={isLoading}
        isPrimary={false}
        fullWidth
        className='mb-6 gap-3'
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='currentColor'
        >
          <path d='M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.613 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 15.827 0 12.48 0 5.691 0 0 5.691 0 12s5.691 12 12.48 12c3.347 0 5.877-1.107 7.84-3.08 2.027-2.027 2.667-4.88 2.667-7.187 0-.713-.053-1.387-.16-1.933H12.48z' />
        </svg>
        {isLoading ? 'Signing up...' : 'Sign up with Google'}
      </Button>

      <div className='relative flex items-center justify-center mb-6'>
        <div className='border-t border-gray-300 absolute left-0 right-0'></div>
        <span className='px-4 text-sm text-gray-500 bg-white relative z-10'>
          or sign up with email
        </span>
        <div className='border-t border-gray-300 absolute left-0 right-0'></div>
      </div>

      <form onSubmit={handleSubmit} className='space-y-4'>
        <FormInput
          id='username'
          label='Username'
          value={formData.username}
          onChange={handleChange}
          placeholder='Choose your Picklebookie username'
          required
        />

        <FormInput
          id='name'
          label='Full Name'
          value={formData.name}
          onChange={handleChange}
          placeholder='Enter your full name'
        />

        <FormInput
          id='email'
          label='Email Address'
          type='email'
          value={formData.email}
          onChange={handleChange}
          placeholder='Enter your email'
          required
        />

        <FormInput
          id='password'
          label='Password'
          type='password'
          value={formData.password}
          onChange={handleChange}
          placeholder='Create a strong password'
          required
        />

        <Button type='submit' disabled={isLoading} fullWidth>
          {isLoading ? 'Signing Up...' : 'Create Account'}
        </Button>
      </form>

      <p className='mt-6 text-center text-sm text-gray-600'>
        Already have an account?{' '}
        <Link
          to='/login'
          className='text-pickle-green hover:text-green-700 font-semibold hover:underline'
        >
          Log In
        </Link>
      </p>
    </AuthLayout>
  );
};

export default SignUp;
