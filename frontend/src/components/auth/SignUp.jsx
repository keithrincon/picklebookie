import React, { useState } from 'react';

// Placeholder for authentication
const useAuth = () => ({
  signUp: async (email, password, username, name) => {
    console.log('Signing up picklebookie user:', { email, username, name });
    // Simulate async signup process
    return new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
  },
  logInWithGoogle: async () => {
    console.log('Google sign-up for Picklebookie initiated');
    return new Promise((resolve) => {
      setTimeout(
        () => resolve({ user: { email: 'example@google.com' } }),
        1000
      );
    });
  },
});

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, logInWithGoogle } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!email || !password || !username) {
      setError('Please fill out all required fields.');
      setIsLoading(false);
      return;
    }

    try {
      await signUp(email, password, username, name);
      console.log('Signup successful, ready to play pickleball!');
    } catch (error) {
      setError(error.message || 'Sign up failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      const result = await logInWithGoogle();
      console.log('Google signup successful for Picklebookie', result);
    } catch (error) {
      setError(error.message || 'Google sign-up failed');
      console.error('Google sign-up error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex items-center justify-center px-4 py-16 font-sans'>
      <div className='w-full max-w-md bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden'>
        <div className='p-8'>
          <h2 className='text-3xl font-bold text-center text-pickle-green mb-4'>
            Join Picklebookie
          </h2>
          <p className='text-center text-gray-600 mb-8'>
            Find your pickleball partners and schedule games!
          </p>

          {error && (
            <div className='bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6 text-center'>
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleSignUp}
            disabled={isLoading}
            className='w-full flex items-center justify-center gap-3 bg-white text-gray-700 py-3 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pickle-green focus:ring-offset-2 transition duration-300 mb-6'
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
          </button>

          <div className='relative flex items-center justify-center mb-6'>
            <div className='border-t border-gray-300 absolute left-0 right-0'></div>
            <span className='px-4 text-sm text-gray-500 bg-white relative z-10'>
              or sign up with email
            </span>
            <div className='border-t border-gray-300 absolute left-0 right-0'></div>
          </div>

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label
                htmlFor='username'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Username *
              </label>
              <input
                type='text'
                id='username'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className='w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pickle-green focus:border-transparent transition duration-300'
                placeholder='Choose your Picklebookie username'
                required
              />
            </div>

            <div>
              <label
                htmlFor='name'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Full Name
              </label>
              <input
                type='text'
                id='name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pickle-green focus:border-transparent transition duration-300'
                placeholder='Enter your full name'
              />
            </div>

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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pickle-green focus:border-transparent transition duration-300'
                placeholder='Enter your email'
                required
              />
            </div>

            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Password *
              </label>
              <input
                type='password'
                id='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pickle-green focus:border-transparent transition duration-300'
                placeholder='Create a strong password'
                required
              />
            </div>

            <button
              type='submit'
              disabled={isLoading}
              className='w-full bg-pickle-green text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-pickle-green focus:ring-offset-2 transition duration-300 flex items-center justify-center'
            >
              {isLoading ? 'Signing Up...' : 'Create Account'}
            </button>
          </form>

          <p className='mt-6 text-center text-sm text-gray-600'>
            Already have an account?{' '}
            <a
              href='/login'
              className='text-pickle-green hover:text-green-700 font-semibold hover:underline'
            >
              Log In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
