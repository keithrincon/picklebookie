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
    eventType: 'Regular Game', // Default event type
    description: '',
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  // Memoize constant values
  const gameTypes = useMemo(
    () => [
      { value: 'Practice', label: '🏋️‍♀️ Practice' },
      { value: 'Singles', label: '👤 Singles' },
      { value: 'Doubles', label: '👥 Doubles' },
      { value: 'Mixed Doubles', label: '👫 Mixed Doubles' },
      { value: 'Tournament', label: '🏆 Tournament' },
      { value: 'Clinic', label: '📚 Clinic' },
      { value: 'Drill Session', label: '🔄 Drill Session' },
      { value: 'Round Robin', label: '🔄 Round Robin' },
      { value: 'Beginner Friendly', label: '🌱 Beginner Friendly' },
      { value: 'Advanced', label: '🔥 Advanced' },
    ],
    []
  );

  // Event types for the new field
  const eventTypes = useMemo(
    () => [
      { value: 'Regular Game', label: '🎮 Regular Game' },
      { value: 'League Event', label: '🏢 League Event' },
      { value: 'Tournament', label: '🏆 Tournament' },
      { value: 'Drop-in Session', label: '🚪 Drop-in Session' },
      { value: 'Club Night', label: '🌙 Club Night' },
      { value: 'Charity Event', label: '❤️ Charity Event' },
      { value: 'Training Camp', label: '🏕️ Training Camp' },
    ],
    []
  );

  const locationSuggestions = useMemo(
    () => [
      'Enterprise Park, Redding',
      'Redding Pickleball Courts',
      'Caldwell Park, Redding',
      'Big League Dreams, Redding',
      'Shasta Lake, CA',
    ],
    []
  );

  // Get description placeholder based on event type
  const getDescriptionPlaceholder = useCallback(() => {
    switch (formData.eventType) {
      case 'League Event':
        return 'Include league name, fees, registration details, and skill level requirements...';
      case 'Tournament':
        return 'Include tournament format, prizes, registration details, and skill level requirements...';
      case 'Drop-in Session':
        return 'Include any fees, equipment requirements, and whether beginners are welcome...';
      case 'Club Night':
        return 'Include club name, membership requirements, and any fees...';
      case 'Charity Event':
        return 'Include charity name, cause, suggested donation, and any special activities...';
      default:
        return 'Add any additional details about this game...';
    }
  }, [formData.eventType]);

  // Get today's date in YYYY-MM-DD format
  const getTodayLocalDate = useCallback(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  }, []);

  const validateForm = useCallback(() => {
    const { startHour, endHour, date, location, type, eventType } = formData;

    if (!startHour || !endHour || !date || !location || !type || !eventType) {
      setError('Please fill in all required fields.');
      return false;
    }

    // Get current date and time
    const now = new Date();

    // Parse the selected date - get the local date, not UTC
    const [year, month, day] = date.split('-').map((num) => parseInt(num));
    const selectedDate = new Date(year, month - 1, day); // month is 0-indexed in JS Date

    // Set both dates to midnight for proper date comparison
    const todayDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    // Check if date is in the past
    if (selectedDate < todayDate) {
      setError('Please select today or a future date.');
      return false;
    }

    // Is the selected date today?
    const isToday = selectedDate.getTime() === todayDate.getTime();

    // Check time only if the date is today
    if (isToday) {
      // Convert form time to 24h format
      let startHour24 = parseInt(formData.startHour);
      if (formData.startPeriod === 'PM' && startHour24 !== 12)
        startHour24 += 12;
      if (formData.startPeriod === 'AM' && startHour24 === 12) startHour24 = 0;

      const startMinute = parseInt(formData.startMinute);

      // Compare with current time
      if (
        startHour24 < now.getHours() ||
        (startHour24 === now.getHours() && startMinute < now.getMinutes())
      ) {
        setError("Start time must be in the future for today's date.");
        return false;
      }
    }

    // Check if end time is after start time
    // Convert to 24h format for comparison
    let startHour24 = parseInt(formData.startHour);
    if (formData.startPeriod === 'PM' && startHour24 !== 12) startHour24 += 12;
    if (formData.startPeriod === 'AM' && startHour24 === 12) startHour24 = 0;

    let endHour24 = parseInt(formData.endHour);
    if (formData.endPeriod === 'PM' && endHour24 !== 12) endHour24 += 12;
    if (formData.endPeriod === 'AM' && endHour24 === 12) endHour24 = 0;

    // Special case: If end time is 12 AM (midnight), it's actually the next day
    if (formData.endHour === '12' && formData.endPeriod === 'AM') {
      endHour24 = 24; // Treat as 24:00 for comparison
    }

    if (
      startHour24 > endHour24 ||
      (startHour24 === endHour24 &&
        parseInt(formData.startMinute) >= parseInt(formData.endMinute))
    ) {
      setError('End time must be after start time.');
      return false;
    }

    // Check if the date is not too far in the future
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 24); // Allow up to 24 months in future
    if (selectedDate > maxDate) {
      setError('You can only create posts up to 24 months in advance.');
      return false;
    }

    return true;
  }, [formData]);

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
      eventType: 'Regular Game',
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
        eventType: formData.eventType,
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

  // Improved time selector component with hourly options
  const TimeSelector = ({ prefix, label, required = false }) => {
    // Pre-defined time options with hourly intervals
    const timeOptions = [
      { value: '7:00 AM', hour: '7', minute: '00', period: 'AM' },
      { value: '8:00 AM', hour: '8', minute: '00', period: 'AM' },
      { value: '9:00 AM', hour: '9', minute: '00', period: 'AM' },
      { value: '10:00 AM', hour: '10', minute: '00', period: 'AM' },
      { value: '11:00 AM', hour: '11', minute: '00', period: 'AM' },
      { value: '12:00 PM', hour: '12', minute: '00', period: 'PM' },
      { value: '1:00 PM', hour: '1', minute: '00', period: 'PM' },
      { value: '2:00 PM', hour: '2', minute: '00', period: 'PM' },
      { value: '3:00 PM', hour: '3', minute: '00', period: 'PM' },
      { value: '4:00 PM', hour: '4', minute: '00', period: 'PM' },
      { value: '5:00 PM', hour: '5', minute: '00', period: 'PM' },
      { value: '6:00 PM', hour: '6', minute: '00', period: 'PM' },
      { value: '7:00 PM', hour: '7', minute: '00', period: 'PM' },
      { value: '8:00 PM', hour: '8', minute: '00', period: 'PM' },
      { value: '9:00 PM', hour: '9', minute: '00', period: 'PM' },
    ];

    // Extra minute options if user wants to select a specific minute
    const minuteOptions = ['00', '15', '30', '45'];

    // State to toggle between quick select and detailed time picker
    const [showDetailedPicker, setShowDetailedPicker] = useState(false);

    // Get current displayed time (or empty)
    const getCurrentTimeDisplay = () => {
      if (!formData[`${prefix}Hour`]) return '';

      return `${formData[`${prefix}Hour`]}:${formData[`${prefix}Minute`]} ${
        formData[`${prefix}Period`]
      }`;
    };

    // Handle time selection
    const handleTimeSelect = (option) => {
      setFormData((prev) => ({
        ...prev,
        [`${prefix}Hour`]: option.hour,
        [`${prefix}Minute`]: option.minute,
        [`${prefix}Period`]: option.period,
      }));
    };

    return (
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          {label} {required && <span className='text-red-500'>*</span>}
        </label>

        <div className='relative'>
          {!showDetailedPicker ? (
            /* Standard time selection */
            <div className='flex flex-col space-y-2'>
              <div className='relative'>
                <select
                  className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                           focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500
                           appearance-none'
                  value={getCurrentTimeDisplay()}
                  onChange={(e) => {
                    const selectedOption = timeOptions.find(
                      (option) => option.value === e.target.value
                    );
                    if (selectedOption) {
                      handleTimeSelect(selectedOption);
                    }
                  }}
                  required={required}
                >
                  <option value=''>Select time</option>
                  {timeOptions.map((option) => (
                    <option
                      key={`${prefix}-${option.value}`}
                      value={option.value}
                    >
                      {option.value}
                    </option>
                  ))}
                </select>
                {/* Dropdown emoji overlay */}
                <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3'>
                  <span
                    role='img'
                    aria-label='dropdown'
                    className='text-gray-500'
                  >
                    ⏱️
                  </span>
                </div>
              </div>

              <button
                type='button'
                className='text-xs text-pickle-green hover:underline text-left'
                onClick={() => setShowDetailedPicker(true)}
              >
                Need a specific time? Click here
              </button>
            </div>
          ) : (
            /* Detailed time selection */
            <div className='space-y-2'>
              <div className='flex items-center border border-gray-300 rounded-md overflow-hidden bg-white'>
                <select
                  name={`${prefix}Hour`}
                  value={formData[`${prefix}Hour`]}
                  onChange={handleChange}
                  className='w-1/3 pl-2 pr-1 py-2 border-0 focus:outline-none focus:ring-0 text-center appearance-none bg-transparent'
                  required={required}
                  aria-label={`${label} hour`}
                >
                  <option value='' disabled>
                    Hour
                  </option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((hour) => (
                    <option key={`${prefix}-${hour}`} value={hour}>
                      {hour}
                    </option>
                  ))}
                </select>
                <span className='text-gray-500'>:</span>
                <select
                  name={`${prefix}Minute`}
                  value={formData[`${prefix}Minute`]}
                  onChange={handleChange}
                  className='w-1/3 px-1 py-2 border-0 focus:outline-none focus:ring-0 text-center appearance-none bg-transparent'
                  aria-label={`${label} minute`}
                >
                  {minuteOptions.map((minute) => (
                    <option key={`${prefix}-min-${minute}`} value={minute}>
                      {minute}
                    </option>
                  ))}
                </select>
                <select
                  name={`${prefix}Period`}
                  value={formData[`${prefix}Period`]}
                  onChange={handleChange}
                  className='w-1/3 pl-1 pr-2 py-2 border-0 focus:outline-none focus:ring-0 text-center appearance-none bg-transparent'
                  aria-label={`${label} AM/PM`}
                >
                  <option value='AM'>AM</option>
                  <option value='PM'>PM</option>
                </select>
              </div>

              <button
                type='button'
                className='text-xs text-pickle-green hover:underline text-left'
                onClick={() => setShowDetailedPicker(false)}
              >
                Back to time presets
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Custom styled select with emoji
  const EmojiSelect = ({
    name,
    value,
    onChange,
    options,
    required,
    defaultEmoji,
  }) => (
    <div className='relative'>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 
                 appearance-none'
        required={required}
      >
        {options.map((option) => (
          <option
            key={typeof option === 'object' ? option.value : option}
            value={typeof option === 'object' ? option.value : option}
          >
            {typeof option === 'object' ? option.label : option}
          </option>
        ))}
      </select>
      {/* Dropdown emoji overlay - only show if not using emoji options */}
      {options[0] && typeof options[0] !== 'object' && (
        <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3'>
          <span role='img' aria-label='dropdown' className='text-gray-500'>
            {defaultEmoji}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className='bg-white px-4 py-5 rounded-lg shadow-md'>
      {/* Compact header */}
      <h2 className='text-xl font-bold text-pickle-green mb-3'>
        Create a Game
      </h2>

      {error && (
        <div className='mb-3 p-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded'>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className='space-y-3'>
        {/* Date Picker - Enhanced for better usability */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Date <span className='text-red-500'>*</span>
          </label>
          <div className='relative'>
            <input
              type='date'
              name='date'
              value={formData.date}
              onChange={handleChange}
              min={getTodayLocalDate()}
              className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                       focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500
                       appearance-none'
              required
              style={{
                colorScheme: 'light',
              }}
              aria-label='Game date'
            />
            {/* Calendar emoji overlay */}
            <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3'>
              <span role='img' aria-label='calendar' className='text-gray-500'>
                📅
              </span>
            </div>
          </div>
        </div>

        {/* Game Type and Event Type side by side on larger screens */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          {/* Game Type with emoji select component */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Game Type <span className='text-red-500'>*</span>
            </label>
            <EmojiSelect
              name='type'
              value={formData.type}
              onChange={handleChange}
              options={gameTypes}
              required={true}
              defaultEmoji='🏓'
            />
          </div>

          {/* Event Type - new field */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Event Type <span className='text-red-500'>*</span>
            </label>
            <EmojiSelect
              name='eventType'
              value={formData.eventType}
              onChange={handleChange}
              options={eventTypes}
              required={true}
              defaultEmoji='🎯'
            />
          </div>
        </div>

        {/* Time Selection with the new component */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          <TimeSelector prefix='start' label='Start Time' required={true} />
          <TimeSelector prefix='end' label='End Time' required={true} />
        </div>

        {/* Location */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Location <span className='text-red-500'>*</span>
          </label>
          <div className='relative'>
            <input
              type='text'
              name='location'
              value={formData.location}
              onChange={handleChange}
              list='locationSuggestions'
              placeholder='e.g., Enterprise Park, Redding, CA'
              className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500'
              required
            />
            {/* Location pin emoji overlay */}
            <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3'>
              <span role='img' aria-label='location' className='text-gray-500'>
                📍
              </span>
            </div>
          </div>
          <datalist id='locationSuggestions'>
            {locationSuggestions.map((loc) => (
              <option key={loc} value={loc} />
            ))}
          </datalist>
          <p className='text-xs text-gray-500 mt-1'>
            Enter a specific location for accurate distance calculations
          </p>
        </div>

        {/* Description - with dynamic placeholder based on event type */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Description <span className='text-gray-400'>(optional)</span>
          </label>
          <div className='relative'>
            <textarea
              name='description'
              value={formData.description}
              onChange={handleChange}
              placeholder={getDescriptionPlaceholder()}
              rows={3}
              className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500'
            />
            {/* Notes emoji overlay */}
            <div className='pointer-events-none absolute top-2 right-0 flex items-start pr-3'>
              <span role='img' aria-label='notes' className='text-gray-500'>
                📝
              </span>
            </div>
          </div>
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
