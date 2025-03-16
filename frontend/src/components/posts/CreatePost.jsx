import React, { useState } from 'react';
import { db } from '../../firebase/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

const CreatePost = () => {
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple validation to ensure all fields are filled
    if (!time || !location || !type) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await addDoc(collection(db, 'posts'), {
        time,
        location,
        type,
        userId: user.uid,
        createdAt: new Date(),
      });

      // Clear form and show success message
      setTime('');
      setLocation('');
      setType('');
      setError('');
      setSuccess('Your game post has been created!');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      {error && <p className='text-red-600'>{error}</p>}
      {success && <p className='text-green-600'>{success}</p>}

      <input
        type='text'
        placeholder='Time (e.g., 1:00 PM)'
        value={time}
        onChange={(e) => setTime(e.target.value)}
        className='w-full p-2 border rounded'
      />
      <input
        type='text'
        placeholder='Location (e.g., Sun Oaks)'
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className='w-full p-2 border rounded'
      />
      <input
        type='text'
        placeholder='Game Type (e.g., Doubles)'
        value={type}
        onChange={(e) => setType(e.target.value)}
        className='w-full p-2 border rounded'
      />
      <button
        type='submit'
        className='w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700'
      >
        Post Game
      </button>
    </form>
  );
};

export default CreatePost;
