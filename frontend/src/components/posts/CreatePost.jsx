import React, { useState } from 'react';
import { db } from '../../firebase/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const CreatePost = () => {
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
  const [locationValid, setLocationValid] = useState(false);
  const { user } = useAuth();

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

  const getTodayLocalDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === 'location') {
      setLocationValid(false);
    }

    if (error) setError('');
  };

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

    const todayStr = getTodayLocalDate();
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

    const startTime = convertTo24Hour(startHour, startMinute, startPeriod);
    const endTime = convertTo24Hour(endHour, endMinute, endPeriod);
    if (endTime <= startTime) {
      setError('End time must be after start time.');
      return false;
    }

    return true;
  };

  const convertTo24Hour = (hour, minute, period) => {
    let h = parseInt(hour);
    if (period === 'PM' && h < 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return h * 60 + parseInt(minute);
  };

  const geocodeLocation = async (location) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          location
        )}&key=AIzaSyBatTh7pr0fDw5o7WsGZnllCkov7sjFgRo`
      );

      if (response.data.results.length > 0) {
        const result = response.data.results[0];
        return {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
          formattedAddress: result.formatted_address || location,
          valid: true,
        };
      }
      return { valid: false };
    } catch (error) {
      console.error('Geocoding error:', error);
      return { valid: false };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      // Geocode the location
      const geocodeResult = await geocodeLocation(formData.location);

      if (!geocodeResult.valid) {
        toast.warn(
          'Could not verify exact location. Your post will still be created but may be harder to find.'
        );
      } else {
        setLocationValid(true);
      }

      const newPost = {
        startTime: `${formData.startHour}:${formData.startMinute} ${formData.startPeriod}`,
        endTime: `${formData.endHour}:${formData.endMinute} ${formData.endPeriod}`,
        date: formData.date,
        location: geocodeResult.formattedAddress || formData.location,
        type: formData.type,
        description: formData.description || '',
        userId: user.uid,
        userName: user.displayName || user.email,
        createdAt: Timestamp.now(),
        joinedPlayers: [],
        hasExactLocation: geocodeResult.valid,
        ...(geocodeResult.valid && {
          latitude: geocodeResult.latitude,
          longitude: geocodeResult.longitude,
        }),
      };

      await addDoc(collection(db, 'posts'), newPost);

      // Reset form
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

      setError('');
      setLocationValid(false);
      toast.success('Game created successfully!', {
        className: 'bg-success text-white',
      });
    } catch (error) {
      console.error('Submission error:', error);
      setError('Failed to create game. Please try again.');
      toast.error('Failed to create game', {
        className: 'bg-error text-white',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='bg-white p-6 rounded-lg shadow-card'>
      <h2 className='text-2xl font-bold text-pickle-green mb-6 font-poppins'>
        Create a Game Post
      </h2>

      {error && (
        <div className='mb-4 p-3 bg-error/10 border border-error/20 text-error rounded'>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className='space-y-4'>
        {/* Date Picker */}
        <div>
          <label
            htmlFor='date'
            className='block text-sm font-medium text-dark-gray mb-2'
          >
            Date <span className='text-error'>*</span>
          </label>
          <input
            type='date'
            id='date'
            name='date'
            value={formData.date}
            onChange={handleChange}
            min={getTodayLocalDate()}
            className='block w-full px-3 py-2 border border-light-gray rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pickle-green focus:border-pickle-green'
            required
          />
        </div>

        {/* Time Selection */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {/* Start Time */}
          <div>
            <label
              htmlFor='startHour'
              className='block text-sm font-medium text-dark-gray mb-2'
            >
              Start Time <span className='text-error'>*</span>
            </label>
            <div className='flex space-x-2'>
              <div className='w-1/3'>
                <select
                  id='startHour'
                  name='startHour'
                  value={formData.startHour}
                  onChange={handleChange}
                  className='block w-full px-3 py-2 border border-light-gray rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pickle-green focus:border-pickle-green text-sm'
                  required
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
                  className='block w-full px-3 py-2 border border-light-gray rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pickle-green focus:border-pickle-green text-sm'
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
                  className='block w-full px-3 py-2 border border-light-gray rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pickle-green focus:border-pickle-green text-sm'
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
              className='block text-sm font-medium text-dark-gray mb-2'
            >
              End Time <span className='text-error'>*</span>
            </label>
            <div className='flex space-x-2'>
              <div className='w-1/3'>
                <select
                  id='endHour'
                  name='endHour'
                  value={formData.endHour}
                  onChange={handleChange}
                  className='block w-full px-3 py-2 border border-light-gray rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pickle-green focus:border-pickle-green text-sm'
                  required
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
                  className='block w-full px-3 py-2 border border-light-gray rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pickle-green focus:border-pickle-green text-sm'
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
                  className='block w-full px-3 py-2 border border-light-gray rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pickle-green focus:border-pickle-green text-sm'
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
            className='block text-sm font-medium text-dark-gray mb-2'
          >
            Location <span className='text-error'>*</span>
          </label>
          <div className='relative'>
            <input
              type='text'
              id='location'
              name='location'
              value={formData.location}
              onChange={handleChange}
              list='locationSuggestions'
              placeholder='Enter court name or address'
              className='block w-full px-3 py-2 border border-light-gray rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pickle-green focus:border-pickle-green'
              required
            />
            {locationValid && (
              <span className='absolute right-3 top-2.5 text-success'>
                ✓ Verified
              </span>
            )}
          </div>
          <datalist id='locationSuggestions'>
            {locationSuggestions.map((loc) => (
              <option key={loc} value={loc} />
            ))}
          </datalist>
          <p className='mt-1 text-xs text-medium-gray'>
            Include city/state for better results (e.g., "Central Park, New
            York")
          </p>
        </div>

        {/* Game Type */}
        <div>
          <label
            htmlFor='type'
            className='block text-sm font-medium text-dark-gray mb-2'
          >
            Game Type <span className='text-error'>*</span>
          </label>
          <select
            id='type'
            name='type'
            value={formData.type}
            onChange={handleChange}
            className='block w-full px-3 py-2 border border-light-gray rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pickle-green focus:border-pickle-green'
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
          <label
            htmlFor='description'
            className='block text-sm font-medium text-dark-gray mb-2'
          >
            Description <span className='text-medium-gray'>(optional)</span>
          </label>
          <textarea
            id='description'
            name='description'
            value={formData.description}
            onChange={handleChange}
            placeholder='Add any additional details (skill level, equipment needed, etc.)'
            rows={3}
            className='block w-full px-3 py-2 border border-light-gray rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pickle-green focus:border-pickle-green'
          />
        </div>

        {/* Submit Button */}
        <button
          type='submit'
          disabled={isSubmitting}
          className={`w-full bg-pickle-green text-white py-2 px-4 rounded-md hover:bg-pickle-green-dark focus:outline-none focus:ring-2 focus:ring-pickle-green-light focus:ring-offset-2 transition-colors ${
            isSubmitting ? 'opacity-75' : ''
          }`}
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
