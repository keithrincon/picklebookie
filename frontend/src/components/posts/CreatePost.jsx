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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const validateTime = (time) => {
    const timeRegex = /^(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$/i;
    return timeRegex.test(time);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation
    if (!time || !location || !type) {
      setError('Please fill in all fields.');
      setIsSubmitting(false);
      return;
    }

    if (!validateTime(time)) {
      setError('Please enter a valid time (e.g., 1:00 PM).');
      setIsSubmitting(false);
      return;
    }

    try {
      await addDoc(collection(db, 'posts'), {
        time,
        location,
        type,
        userId: user.uid,
        userName: user.displayName || user.email,
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='bg-white p-6 rounded-lg shadow-md'>
      <h2 className='text-2xl font-bold text-pickle-green mb-6 font-poppins'>
        Create a Game Post
      </h2>
      <form onSubmit={handleSubmit} className='space-y-4'>
        {error && <p className='text-red-500 text-sm'>{error}</p>}
        {success && <p className='text-green-500 text-sm'>{success}</p>}

        <div>
          <label
            htmlFor='time'
            className='block text-sm font-medium text-gray-700'
          >
            Time
          </label>
          <input
            type='text'
            id='time'
            aria-label='Time'
            placeholder='Time (e.g., 1:00 PM)'
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500'
            required
          />
        </div>
        <div>
          <label
            htmlFor='location'
            className='block text-sm font-medium text-gray-700'
          >
            Location
          </label>
          <input
            type='text'
            id='location'
            aria-label='Location'
            placeholder='Location (e.g., Sun Oaks)'
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500'
            required
          />
        </div>
        <div>
          <label
            htmlFor='type'
            className='block text-sm font-medium text-gray-700'
          >
            Game Type
          </label>
          <input
            type='text'
            id='type'
            aria-label='Game Type'
            placeholder='Game Type (e.g., Doubles)'
            value={type}
            onChange={(e) => setType(e.target.value)}
            className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500'
            required
          />
        </div>
        <button
          type='submit'
          disabled={isSubmitting}
          className='w-full bg-pickle-green text-white py-2 px-4 rounded-md hover:bg-pickle-green-dark focus:outline-none focus:ring-2 focus:ring-pickle-green-light focus:ring-offset-2'
        >
          {isSubmitting ? (
            <div className='flex justify-center items-center'>
              <div className='animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white'></div>
            </div>
          ) : (
            'Post Game'
          )}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
