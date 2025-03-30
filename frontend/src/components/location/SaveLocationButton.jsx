// src/components/location/SaveLocationButton.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  saveLocation,
  checkIfLocationSaved,
} from '../../services/savedLocationsService';
import { toast } from 'react-toastify';

/**
 * Button component to save a location to the user's favorites
 * @param {Object} locationData - Location data containing address, coordinates, etc.
 */
const SaveLocationButton = ({ locationData }) => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [locationName, setLocationName] = useState(
    locationData.name ||
      locationData.formattedAddress?.split(',')[0] ||
      'This Location'
  );

  // Check if location is already saved when component mounts
  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!user || !locationData) return;

      try {
        const identifier =
          locationData.placeId || locationData.formattedAddress;
        const savedLocationId = await checkIfLocationSaved(
          identifier,
          user.uid
        );

        setIsSaved(!!savedLocationId);
      } catch (error) {
        console.error('Error checking saved status:', error);
      }
    };

    checkSavedStatus();
  }, [user, locationData]);

  const handleSaveLocation = async () => {
    if (!user) {
      toast.error('Please log in to save locations');
      return;
    }

    if (isSaved) {
      toast.info('This location is already in your saved places');
      return;
    }

    setShowNotes(true);
  };

  const handleConfirmSave = async () => {
    try {
      setSaving(true);

      // Prepare location data with user input
      const enrichedLocationData = {
        ...locationData,
        name: locationName.trim(),
        notes: notes.trim(),
        isFavorite: false,
        hasVisited: true, // Assume the user has visited since they're saving from an event
      };

      await saveLocation(enrichedLocationData, user.uid);

      setIsSaved(true);
      setShowNotes(false);
      toast.success('Location saved to your places!');
    } catch (error) {
      console.error('Error saving location:', error);
      toast.error('Failed to save location');
    } finally {
      setSaving(false);
    }
  };

  if (
    !locationData ||
    (!locationData.formattedAddress && !locationData.placeId)
  ) {
    return null; // Don't render if no valid location data
  }

  return (
    <div>
      {showNotes ? (
        <div className='bg-white rounded-lg shadow-md p-4 border border-gray-200 mt-3'>
          <h4 className='font-medium text-gray-700 mb-2'>Save this location</h4>

          <div className='mb-3'>
            <label className='block text-sm font-medium text-gray-600 mb-1'>
              Location Name
            </label>
            <input
              type='text'
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500'
              placeholder='Enter a name for this location'
              maxLength={50}
            />
          </div>

          <div className='mb-3'>
            <label className='block text-sm font-medium text-gray-600 mb-1'>
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500'
              placeholder='Add notes about this location...'
              rows={3}
              maxLength={200}
            />
          </div>

          <div className='flex justify-end space-x-2'>
            <button
              onClick={() => setShowNotes(false)}
              className='px-3 py-1 text-sm text-gray-600 hover:text-gray-800'
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmSave}
              className='px-4 py-1 text-sm bg-pickle-green text-white rounded hover:bg-green-600 disabled:opacity-70'
              disabled={saving || !locationName.trim()}
            >
              {saving ? 'Saving...' : 'Save Place'}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={handleSaveLocation}
          className={`flex items-center space-x-1 ${
            isSaved
              ? 'text-green-600 cursor-default'
              : 'text-pickle-green hover:text-green-600'
          }`}
          disabled={isSaved}
        >
          <span role='img' aria-label='save'>
            {isSaved ? '✅' : '📍'}
          </span>
          <span>{isSaved ? 'Saved to My Places' : 'Save to My Places'}</span>
        </button>
      )}
    </div>
  );
};

export default SaveLocationButton;
