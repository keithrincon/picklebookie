import React, { useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import { addDoc, collection } from 'firebase/firestore';
import axios from 'axios';
import { db } from '../../firebase/firebase'; // Adjust the path if needed

const PostForm = ({ user }) => {
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
    latitude: null,
    longitude: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateForm = () => {
    // Add your form validation logic here
    return formData.location && formData.date;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      // Add debug log
      console.log('Starting geocoding for location:', formData.location);

      const geocodeResponse = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          formData.location
        )}&key=AIzaSyBatTh7pr0fDw5o7WsGZnllCkov7sjFgRo`
      );

      console.log('Geocoding response:', geocodeResponse.data);

      if (geocodeResponse.data.results.length === 0) {
        throw new Error('Location not found in geocoding results');
      }

      const { lat, lng } = geocodeResponse.data.results[0].geometry.location;
      console.log('Obtained coordinates:', { lat, lng });

      const newPost = {
        startTime: `${formData.startHour}:${formData.startMinute} ${formData.startPeriod}`,
        endTime: `${formData.endHour}:${formData.endMinute} ${formData.endPeriod}`,
        date: formData.date,
        location: formData.location,
        latitude: lat,
        longitude: lng,
        type: formData.type,
        description: formData.description || '',
        userId: user.uid,
        userName: user.displayName || user.email,
        createdAt: Timestamp.now(),
        joinedPlayers: [], // Initialize empty array for joined players
      };

      console.log('Prepared post data:', newPost);

      // Add debug log before Firestore operation
      console.log('Attempting to add document to Firestore...');
      const docRef = await addDoc(collection(db, 'posts'), newPost);
      console.log('Document written with ID: ', docRef.id);

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
        latitude: null,
        longitude: null,
      });

      setError('');
      setSuccess('Your game post has been created!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Full error details:', {
        error: error.message,
        stack: error.stack,
        response: error.response?.data,
      });
      setError(`Something went wrong. ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Location</label>
        <input
          type='text'
          value={formData.location}
          onChange={(e) =>
            setFormData({ ...formData, location: e.target.value })
          }
        />
      </div>

      <div>
        <label>Start Time</label>
        <input
          type='number'
          value={formData.startHour}
          onChange={(e) =>
            setFormData({ ...formData, startHour: e.target.value })
          }
        />
        <input
          type='number'
          value={formData.startMinute}
          onChange={(e) =>
            setFormData({ ...formData, startMinute: e.target.value })
          }
        />
        <select
          value={formData.startPeriod}
          onChange={(e) =>
            setFormData({ ...formData, startPeriod: e.target.value })
          }
        >
          <option value='AM'>AM</option>
          <option value='PM'>PM</option>
        </select>
      </div>

      <div>
        <label>End Time</label>
        <input
          type='number'
          value={formData.endHour}
          onChange={(e) =>
            setFormData({ ...formData, endHour: e.target.value })
          }
        />
        <input
          type='number'
          value={formData.endMinute}
          onChange={(e) =>
            setFormData({ ...formData, endMinute: e.target.value })
          }
        />
        <select
          value={formData.endPeriod}
          onChange={(e) =>
            setFormData({ ...formData, endPeriod: e.target.value })
          }
        >
          <option value='AM'>AM</option>
          <option value='PM'>PM</option>
        </select>
      </div>

      <div>
        <label>Type</label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
        >
          <option value='Practice'>Practice</option>
          <option value='Game'>Game</option>
        </select>
      </div>

      <div>
        <label>Description</label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <button type='submit' disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Create Post'}
      </button>
    </form>
  );
};

export default PostForm;
