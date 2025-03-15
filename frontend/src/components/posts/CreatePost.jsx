// src/components/CreatePost.js
import React, { useState } from 'react';
import { db } from '../../firebase/firebase'; // Updated import path
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

const CreatePost = () => {
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple validation to ensure all fields are filled
    if (!time || !location || !type) {
      alert('Please fill in all fields');
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
      alert('Your game post has been created!'); // Confirmation on success

      setTime('');
      setLocation('');
      setType('');
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <input
        type='text'
        placeholder='Time'
        value={time}
        onChange={(e) => setTime(e.target.value)}
        className='w-full p-2 border rounded'
      />
      <input
        type='text'
        placeholder='Location'
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className='w-full p-2 border rounded'
      />
      <input
        type='text'
        placeholder='Game Type'
        value={type}
        onChange={(e) => setType(e.target.value)}
        className='w-full p-2 border rounded'
      />
      <button
        type='submit'
        className='w-full bg-blue-600 text-white p-2 rounded'
      >
        Post Game
      </button>
    </form>
  );
};

export default CreatePost;
