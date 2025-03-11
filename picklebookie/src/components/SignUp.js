import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Add name field
  const [error, setError] = useState(null);
  const { signUp } = useAuth();

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
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='space-y-4 p-4 border rounded-md shadow-md max-w-sm mx-auto'
    >
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
  );
};

export default SignUp;
