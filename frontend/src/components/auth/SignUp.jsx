import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { requestNotificationPermission } from '../context/firebase';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Add name field
  const [error, setError] = useState(null);
  const { signUp, logInWithGoogle } = useAuth(); // Add logInWithGoogle

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Reset error on new attempt

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      // Pass name as a third parameter to signUp
      await signUp(email, password, name);
      setEmail('');
      setPassword('');
      setName('');
      alert('Sign-up successful!'); // Replace with navigation if needed

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
    }
  };

  // Function to handle Google Sign-In
  const handleGoogleSignUp = async () => {
    try {
      await logInWithGoogle();
      alert('Signed up with Google successfully!');

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
    }
  };

  return (
    <div className='space-y-4 p-4 border rounded-md shadow-md max-w-sm mx-auto'>
      <form onSubmit={handleSubmit} className='space-y-4'>
        {error && <p className='text-red-600 text-sm'>{error}</p>}

        <input
          type='text'
          placeholder='Name (optional)'
          value={name}
          onChange={(e) => setName(e.target.value)}
          className='w-full p-2 border rounded'
        />

        <input
          type='email'
          placeholder='Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='w-full p-2 border rounded'
          required
        />

        <input
          type='password'
          placeholder='Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className='w-full p-2 border rounded'
          required
        />

        <button
          type='submit'
          className='w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700'
        >
          Sign Up
        </button>
      </form>

      {/* Google Sign-In Button */}
      <button
        onClick={handleGoogleSignUp}
        className='w-full bg-red-600 text-white p-2 rounded hover:bg-red-700'
      >
        Sign Up with Google
      </button>
    </div>
  );
};

export default SignUp;
