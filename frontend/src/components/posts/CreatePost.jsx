import React, { useState } from 'react';
import { db } from '../../firebase/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

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
  const gameTypes = ['Practice', 'Singles', 'Doubles']; // Updated game types
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
    // Clear any error messages when user makes changes
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Destructure for easier validation
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

    // Validate required fields
    if (!startHour || !endHour || !date || !location || !type) {
      setError('Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }

    // Validate date (must be current day or future)
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setError('Please select today or a future date.');
      setIsSubmitting(false);
      return;
    }

    // Validate date (up to 3 months in advance)
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);

    if (selectedDate > maxDate) {
      setError('You can only create posts up to 3 months in advance.');
      setIsSubmitting(false);
      return;
    }

    // Validate end time is after start time
    const startTime = `${startHour}:${startMinute} ${startPeriod}`;
    const endTime = `${endHour}:${endMinute} ${endPeriod}`;
    const startDateTime = new Date(`${date} ${startTime}`);
    const endDateTime = new Date(`${date} ${endTime}`);

    if (endDateTime <= startDateTime) {
      setError('End time must be after start time.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Format the date as YYYY-MM-DD string for Firestore
      const formattedDate = date;

      await addDoc(collection(db, 'posts'), {
        startTime,
        endTime,
        date: formattedDate, // Store as string for easier querying
        location,
        type,
        description: formData.description || '',
        userId: user.uid,
        userName: user.displayName || user.email,
        createdAt: new Date(),
      });

      // Clear form
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

      // Clear success message after a few seconds
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

      {/* Form status messages */}
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
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Date <span className='text-red-500'>*</span>
          </label>
          <input
            type='date'
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
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Start Time <span className='text-red-500'>*</span>
            </label>
            <div className='flex space-x-2'>
              <div className='w-1/3'>
                <select
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
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              End Time <span className='text-red-500'>*</span>
            </label>
            <div className='flex space-x-2'>
              <div className='w-1/3'>
                <select
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
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Location <span className='text-red-500'>*</span>
          </label>
          <input
            type='text'
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
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Game Type <span className='text-red-500'>*</span>
          </label>
          <select
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

        {/* Description - New Field */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Description <span className='text-gray-400'>(optional)</span>
          </label>
          <textarea
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
