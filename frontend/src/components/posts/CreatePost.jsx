import React, { useState } from 'react';
import { db } from '../../firebase/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

const CreatePost = () => {
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [period, setPeriod] = useState('AM');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('Practice'); // Default to 'Practice'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5).map((m) =>
    m < 10 ? `0${m}` : `${m}`
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!hour || !minute || !location || !type) {
      setError('Please fill in all fields.');
      setIsSubmitting(false);
      return;
    }

    const formattedTime = `${hour}:${minute} ${period}`;

    try {
      await addDoc(collection(db, 'posts'), {
        time: formattedTime,
        location,
        type,
        userId: user.uid,
        userName: user.displayName || user.email,
        createdAt: new Date(),
      });

      setHour('');
      setMinute('');
      setPeriod('AM');
      setLocation('');
      setType('Practice');
      setError('');
      setSuccess('Your game post has been created!');
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
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Time
          </label>
          <div className='flex space-x-2'>
            <div className='w-1/3'>
              <select
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500'
                required
              >
                <option value='' disabled>
                  Hour
                </option>
                {hours.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            <div className='w-1/3'>
              <select
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
                className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500'
                required
              >
                <option value='' disabled>
                  Min
                </option>
                {minutes.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className='w-1/3'>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500'
              >
                <option value='AM'>AM</option>
                <option value='PM'>PM</option>
              </select>
            </div>
          </div>
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
          <select
            id='type'
            value={type}
            onChange={(e) => setType(e.target.value)}
            className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500'
            required
          >
            <option value='Practice'>Practice</option>
            <option value='Singles'>Singles</option>
            <option value='Doubles'>Doubles</option>
          </select>
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
