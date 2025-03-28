import React, { useState, useCallback, useMemo } from 'react';
import { db } from '../../firebase/config';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { geocodeLocation } from '../../services/locationServices';

const CreatePost = () => {
  // Form state
  const [formData, setFormData] = useState({
    startHour: '',
    startMinute: '00',
    startPeriod: 'AM',
    endHour: '',
    endMinute: '00',
    endPeriod: 'AM',
    date: '',
    location: '',
    type: 'Practice',
    description: '',
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  // Memoize constant values
  const hours = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);

  const minutes = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => i * 5).map((m) =>
        m.toString().padStart(2, '0')
      ),
    []
  );

  const gameTypes = useMemo(() => ['Practice', 'Singles', 'Doubles'], []);

  const locationSuggestions = useMemo(
    () => [
      'Enterprise Park, Redding',
      'Redding Pickleball Courts',
      'Caldwell Park, Redding',
      'Big League Dreams, Redding',
    ],
    []
  );

  // Get today's date in YYYY-MM-DD format
  const getTodayLocalDate = useCallback(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }, []);

  // Compute min/max date constraints
  const minDate = useMemo(() => getTodayLocalDate(), [getTodayLocalDate]);

  const maxDate = useMemo(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 3);
    return date.toISOString().split('T')[0];
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  }, []);

  const validateForm = useCallback(() => {
    const { startHour, endHour, date, location, type } = formData;

    if (!startHour || !endHour || !date || !location || !type) {
      setError('Please fill in all required fields.');
      return false;
    }

    if (date < minDate) {
      setError('Please select today or a future date.');
      return false;
    }

    if (date > maxDate) {
      setError('You can only create posts up to 3 months in advance.');
      return false;
    }

    // Validate time format (start time should be before end time on same day)
    const startTimeValue =
      parseInt(formData.startHour) +
      (formData.startPeriod === 'PM' && formData.startHour !== '12' ? 12 : 0) -
      (formData.startPeriod === 'AM' && formData.startHour === '12' ? 12 : 0);

    const endTimeValue =
      parseInt(formData.endHour) +
      (formData.endPeriod === 'PM' && formData.endHour !== '12' ? 12 : 0) -
      (formData.endPeriod === 'AM' && formData.endHour === '12' ? 12 : 0);

    if (startTimeValue > endTimeValue) {
      setError('End time must be after start time.');
      return false;
    }

    return true;
  }, [formData, minDate, maxDate]);

  const resetForm = useCallback(() => {
    setFormData({
      startHour: '',
      startMinute: '00',
      startPeriod: 'AM',
      endHour: '',
      endMinute: '00',
      endPeriod: 'AM',
      date: '',
      location: '',
      type: 'Practice',
      description: '',
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const geocodeResult = await geocodeLocation(formData.location);

      await addDoc(collection(db, 'posts'), {
        startTime: `${formData.startHour}:${formData.startMinute} ${formData.startPeriod}`,
        endTime: `${formData.endHour}:${formData.endMinute} ${formData.endPeriod}`,
        date: formData.date,
        location: geocodeResult.formattedAddress || formData.location,
        type: formData.type,
        description: formData.description.trim(),
        userId: user.uid,
        userName: user.displayName || user.email,
        createdAt: Timestamp.now(),
        joinedPlayers: [],
        hasExactLocation: geocodeResult.isValid,
        ...(geocodeResult.isValid && {
          latitude: geocodeResult.latitude,
          longitude: geocodeResult.longitude,
        }),
      });

      // Reset form
      resetForm();
      toast.success('Game created successfully!');
    } catch (error) {
      console.error('Error creating game:', error);
      setError('Failed to create game. Please try again.');
      toast.error('Failed to create game');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Custom time select component to reduce repetition
  const TimeSelect = ({ prefix, label, required = false }) => (
    <div>
      <label className='block text-sm font-medium text-gray-700 mb-2'>
        {label} {required && <span className='text-red-500'>*</span>}
      </label>
      <div className='flex space-x-2'>
        <select
          name={`${prefix}Hour`}
          value={formData[`${prefix}Hour`]}
          onChange={handleChange}
          className='w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm'
          required={required}
        >
          <option value='' disabled>
            Hour
          </option>
          {hours.map((hour) => (
            <option key={`${prefix}-${hour}`} value={hour}>
              {hour}
            </option>
          ))}
        </select>

        <select
          name={`${prefix}Minute`}
          value={formData[`${prefix}Minute`]}
          onChange={handleChange}
          className='w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm'
        >
          {minutes.map((minute) => (
            <option key={`${prefix}-min-${minute}`} value={minute}>
              {minute}
            </option>
          ))}
        </select>

        <select
          name={`${prefix}Period`}
          value={formData[`${prefix}Period`]}
          onChange={handleChange}
          className='w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm'
        >
          <option value='AM'>AM</option>
          <option value='PM'>PM</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className='bg-white p-6 rounded-lg shadow-md'>
      <h2 className='text-2xl font-bold text-pickle-green mb-6'>
        Create a Game Post
      </h2>

      {error && (
        <div className='mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded'>
          {error}
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
            min={minDate}
            max={maxDate}
            className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500'
            required
          />
        </div>

        {/* Time Selection using the reusable component */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <TimeSelect prefix='start' label='Start Time' required={true} />
          <TimeSelect prefix='end' label='End Time' required={true} />
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
            placeholder='e.g., Enterprise Park, Redding, CA'
            className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500'
            required
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
