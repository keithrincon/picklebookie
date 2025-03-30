// src/pages/MyPlaces.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import SearchSection from '../components/search/SearchSection';
import {
  getUserSavedLocations,
  toggleFavoriteLocation,
  removeSavedLocation,
  updateSavedLocation,
} from '../services/savedLocationsService';
import { toast } from 'react-toastify';

const LocationCard = ({ location, onToggleFavorite, onRemove, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(location.name);
  const [editedNotes, setEditedNotes] = useState(location.notes || '');

  const handleSaveEdit = () => {
    onEdit(location.id, {
      name: editedName,
      notes: editedNotes,
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedName(location.name);
    setEditedNotes(location.notes || '');
    setIsEditing(false);
  };

  return (
    <div className='bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow'>
      {isEditing ? (
        <div className='space-y-3'>
          <input
            type='text'
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500'
            placeholder='Location name'
          />
          <textarea
            value={editedNotes}
            onChange={(e) => setEditedNotes(e.target.value)}
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500'
            placeholder='Notes about this location...'
            rows={3}
          />
          <div className='flex justify-end space-x-2'>
            <button
              onClick={handleCancelEdit}
              className='px-3 py-1 text-sm text-gray-600 hover:text-gray-800'
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className='px-3 py-1 text-sm bg-pickle-green text-white rounded hover:bg-green-600'
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className='flex justify-between items-start'>
            <h3 className='text-lg font-medium text-gray-800'>
              {location.name}
            </h3>
            <button
              onClick={() => onToggleFavorite(location.id)}
              className='text-xl focus:outline-none'
              aria-label={
                location.isFavorite
                  ? 'Remove from favorites'
                  : 'Add to favorites'
              }
            >
              {location.isFavorite ? '⭐' : '☆'}
            </button>
          </div>
          <p className='text-gray-600 text-sm mt-1'>{location.address}</p>

          {location.notes && (
            <div className='mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded'>
              {location.notes}
            </div>
          )}

          <div className='mt-3 pt-2 border-t border-gray-100 flex justify-between'>
            <div className='text-xs text-gray-500'>
              Saved on{' '}
              {location.createdAt?.toLocaleDateString() || 'Unknown date'}
            </div>
            <div className='flex space-x-2'>
              <button
                onClick={() => setIsEditing(true)}
                className='text-pickle-green text-sm hover:underline'
              >
                Edit
              </button>
              <button
                onClick={() => onRemove(location.id)}
                className='text-red-500 text-sm hover:underline'
              >
                Remove
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const MyPlaces = () => {
  const { user } = useAuth();
  const [savedLocations, setSavedLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'favorites'

  useEffect(() => {
    const fetchSavedLocations = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const locations = await getUserSavedLocations(user.uid);
        setSavedLocations(locations);
      } catch (error) {
        console.error('Error fetching saved locations:', error);
        toast.error('Failed to load your saved locations');
      } finally {
        setLoading(false);
      }
    };

    fetchSavedLocations();
  }, [user]);

  const handleToggleFavorite = async (locationId) => {
    try {
      const newStatus = await toggleFavoriteLocation(locationId);

      // Update local state
      setSavedLocations((prev) =>
        prev.map((location) =>
          location.id === locationId
            ? { ...location, isFavorite: newStatus }
            : location
        )
      );

      toast.success(
        newStatus ? 'Added to favorites' : 'Removed from favorites'
      );
    } catch (error) {
      console.error('Error toggling favorite status:', error);
      toast.error('Failed to update favorite status');
    }
  };

  const handleRemoveLocation = async (locationId) => {
    if (
      window.confirm('Are you sure you want to remove this saved location?')
    ) {
      try {
        await removeSavedLocation(locationId);

        // Update local state
        setSavedLocations((prev) =>
          prev.filter((location) => location.id !== locationId)
        );

        toast.success('Location removed from your saved places');
      } catch (error) {
        console.error('Error removing location:', error);
        toast.error('Failed to remove location');
      }
    }
  };

  const handleEditLocation = async (locationId, updateData) => {
    try {
      await updateSavedLocation(locationId, updateData);

      // Update local state
      setSavedLocations((prev) =>
        prev.map((location) =>
          location.id === locationId ? { ...location, ...updateData } : location
        )
      );

      toast.success('Location updated successfully');
    } catch (error) {
      console.error('Error updating location:', error);
      toast.error('Failed to update location');
    }
  };

  // Filter locations based on current filter
  const filteredLocations =
    filter === 'all'
      ? savedLocations
      : savedLocations.filter((location) => location.isFavorite);

  // Sort locations - favorites first, then alphabetically
  const sortedLocations = [...filteredLocations].sort((a, b) => {
    // Sort by favorite status first
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;

    // Then sort alphabetically by name
    return a.name.localeCompare(b.name);
  });

  if (!user) {
    return (
      <div className='flex flex-col min-h-screen bg-gray-50'>
        <SearchSection
          placeholder='Find your favorite courts...'
          className='sticky top-14 z-30'
          showFilters={false}
        />
        <div className='container mx-auto px-4 py-6'>
          <div className='p-4 bg-blue-50 text-blue-700 rounded-lg text-center'>
            <p>Please log in to view your saved places.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col min-h-screen bg-gray-50'>
      <SearchSection
        placeholder='Find courts and locations...'
        className='sticky top-14 z-30'
      />

      <div className='container mx-auto px-4 py-6'>
        <h1 className='text-2xl font-bold text-pickle-green mb-6'>My Places</h1>

        <div className='mb-6 flex justify-between items-center'>
          <div className='space-x-2'>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'all'
                  ? 'bg-pickle-green text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Places
            </button>
            <button
              onClick={() => setFilter('favorites')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'favorites'
                  ? 'bg-pickle-green text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Favorites
            </button>
          </div>

          <div className='text-sm text-gray-500'>
            {filteredLocations.length}{' '}
            {filteredLocations.length === 1 ? 'place' : 'places'} saved
          </div>
        </div>

        {loading ? (
          <div className='flex justify-center py-12'>
            <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pickle-green'></div>
          </div>
        ) : sortedLocations.length > 0 ? (
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {sortedLocations.map((location) => (
              <LocationCard
                key={location.id}
                location={location}
                onToggleFavorite={handleToggleFavorite}
                onRemove={handleRemoveLocation}
                onEdit={handleEditLocation}
              />
            ))}
          </div>
        ) : (
          <div className='bg-gray-50 p-12 rounded-lg text-center'>
            <p className='text-gray-500 mb-4'>
              You haven't saved any places yet!
            </p>
            <p className='text-sm text-gray-400'>
              When you find places you like, save them for quick access later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPlaces;
