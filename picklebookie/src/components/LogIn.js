import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LogIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { logIn } = useAuth();

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
      alert('Login successful!'); // Replace with navigation if needed
    } catch (error) {
      setError('Failed to log in. Check your credentials and try again.');
      console.error(error); // Log the actual error for debugging
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='space-y-4 p-4 border rounded-md shadow-md max-w-sm mx-auto'
    >
      {error && <p className='text-red-600 text-sm'>{error}</p>}
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
        className='w-full bg-green-600 text-white p-2 rounded hover:bg-green-700'
      >
        Log In
      </button>
    </form>
  );
};

export default LogIn;
