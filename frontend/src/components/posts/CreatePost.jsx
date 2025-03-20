import React, { useState } from 'react';
import { db } from '../../../firebase/firebase'; // Adjust the path
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext'; // Adjust the path
import { usePosts } from '../../../context/PostsContext'; // Adjust the path

const CreatePost = () => {
  // Form state
  const [formData, setFormData] = useState({
    startHour: '',
    startMinute: '00',
    startPeriod: 'AM',
    endHour: '',
    endMinute: '00',
    endPeriod: 'PM',
    date: '',
    location: '',
    type: 'Practice',
    description: '',
  });

  // UI state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  // Options for select fields
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5).map((m) =>
    m < 10 ? `0${m}` : `${m}`
  );
  const gameTypes = ['Practice', 'Singles', 'Doubles'];
  const locationSuggestions = [
    'Main Court - Downtown',
    'Memorial Park Courts',
    'Riverside Recreation Center',
    'Community Center',
    'Oak Park Courts',
  ];

  // Handle all form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (error) setError('');
  };

  // Validate form data
  const validateForm = () => {
    const {
      startHour,
      startMinute,
      startPeriod,
      endHour,
      endMinute,
      endPeriod,
      date,
      location,
      type,
    } = formData;

    if (!startHour || !endHour || !date || !location || !type) {
      setError('Please fill in all required fields.');
      return false;
    }

    // Compare date strings directly instead of Date objects
    const todayStr = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

    if (date < todayStr) {
      setError('Please select today or a future date.');
      return false;
    }

    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    const maxDateStr = maxDate.toISOString().split('T')[0];

    if (date > maxDateStr) {
      setError('You can only create posts up to 3 months in advance.');
      return false;
    }

    // Create Date objects for time comparison
    const startTime = convertTo24Hour(startHour, startMinute, startPeriod);
    const endTime = convertTo24Hour(endHour, endMinute, endPeriod);

    if (endTime <= startTime) {
      setError('End time must be after start time.');
      return false;
    }

    return true;
  };

  // Helper function to convert time to 24-hour format for comparison
  const convertTo24Hour = (hour, minute, period) => {
    let h = parseInt(hour);
    if (period === 'PM' && h < 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return h * 60 + parseInt(minute);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const newPost = {
        startTime: `${formData.startHour}:${formData.startMinute} ${formData.startPeriod}`,
        endTime: `${formData.endHour}:${formData.endMinute} ${formData.endPeriod}`,
        date: formData.date,
        location: formData.location,
        type: formData.type,
        description: formData.description || '',
        userId: user.uid,
        userName: user.displayName || user.email,
        createdAt: Timestamp.now(), // Use Firestore Timestamp
      };

      // Add the document to Firestore
      await addDoc(collection(db, 'posts'), newPost);

      // Clear the form
      setFormData({
        startHour: '',
        startMinute: '00',
        startPeriod: 'AM',
        endHour: '',
        endMinute: '00',
        endPeriod: 'PM',
        date: '',
        location: '',
        type: 'Practice',
        description: '',
      });

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

      {error && (
        <div className='mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded'>
          {error}
        </div>
      )}

      {success && (
        <div className='mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded'>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className='space-y-4'>
        {/* Date Picker */}
        <div>
          <label
            htmlFor='date'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Date <span className='text-red-500'>*</span>
          </label>
          <input
            type='date'
            id='date'
            name='date'
            value={formData.date}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500'
            required
            aria-label='Select date'
          />
        </div>

        {/* Time Selection */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {/* Start Time */}
          <div>
            <label
              htmlFor='startHour'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Start Time <span className='text-red-500'>*</span>
            </label>
            <div className='flex space-x-2'>
              <div className='w-1/3'>
                <select
                  id='startHour'
                  name='startHour'
                  value={formData.startHour}
                  onChange={handleChange}
                  className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm'
                  required
                  aria-label='Select start hour'
                >
                  <option value='' disabled>
                    Hour
                  </option>
                  {hours.map((h) => (
                    <option key={`start-${h}`} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div className='w-1/3'>
                <select
                  id='startMinute'
                  name='startMinute'
                  value={formData.startMinute}
                  onChange={handleChange}
                  className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm'
                  aria-label='Select start minute'
                >
                  {minutes.map((m) => (
                    <option key={`start-min-${m}`} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className='w-1/3'>
                <select
                  id='startPeriod'
                  name='startPeriod'
                  value={formData.startPeriod}
                  onChange={handleChange}
                  className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm'
                  aria-label='Select start period'
                >
                  <option value='AM'>AM</option>
                  <option value='PM'>PM</option>
                </select>
              </div>
            </div>
          </div>

          {/* End Time */}
          <div>
            <label
              htmlFor='endHour'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              End Time <span className='text-red-500'>*</span>
            </label>
            <div className='flex space-x-2'>
              <div className='w-1/3'>
                <select
                  id='endHour'
                  name='endHour'
                  value={formData.endHour}
                  onChange={handleChange}
                  className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm'
                  required
                  aria-label='Select end hour'
                >
                  <option value='' disabled>
                    Hour
                  </option>
                  {hours.map((h) => (
                    <option key={`end-${h}`} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div className='w-1/3'>
                <select
                  id='endMinute'
                  name='endMinute'
                  value={formData.endMinute}
                  onChange={handleChange}
                  className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm'
                  aria-label='Select end minute'
                >
                  {minutes.map((m) => (
                    <option key={`end-min-${m}`} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className='w-1/3'>
                <select
                  id='endPeriod'
                  name='endPeriod'
                  value={formData.endPeriod}
                  onChange={handleChange}
                  className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm'
                  aria-label='Select end period'
                >
                  <option value='AM'>AM</option>
                  <option value='PM'>PM</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <label
            htmlFor='location'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Location <span className='text-red-500'>*</span>
          </label>
          <input
            type='text'
            id='location'
            name='location'
            value={formData.location}
            onChange={handleChange}
            list='locationSuggestions'
            placeholder='Enter or select a location'
            className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500'
            required
            aria-label='Enter location'
          />
          <datalist id='locationSuggestions'>
            {locationSuggestions.map((loc) => (
              <option key={loc} value={loc} />
            ))}
          </datalist>
        </div>

        {/* Game Type */}
        <div>
          <label
            htmlFor='type'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Game Type <span className='text-red-500'>*</span>
          </label>
          <select
            id='type'
            name='type'
            value={formData.type}
            onChange={handleChange}
            className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500'
            required
            aria-label='Select game type'
          >
            {gameTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor='description'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Description <span className='text-gray-400'>(optional)</span>
          </label>
          <textarea
            id='description'
            name='description'
            value={formData.description}
            onChange={handleChange}
            placeholder='Add any additional details about this game...'
            rows={3}
            className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500'
            aria-label='Enter description'
          />
        </div>

        {/* Submit Button */}
        <button
          type='submit'
          disabled={isSubmitting}
          className='w-full bg-pickle-green text-white py-2 px-4 rounded-md hover:bg-pickle-green-dark focus:outline-none focus:ring-2 focus:ring-pickle-green-light focus:ring-offset-2 transition-colors disabled:opacity-75'
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
