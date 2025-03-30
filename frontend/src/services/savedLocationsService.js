// src/services/savedLocationsService.js
import { db } from '../firebase/config';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  getDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';

/**
 * Saves a location to the user's favorites
 * @param {Object} locationData - The location data to save
 * @param {string} userId - The user's ID
 * @returns {Promise<string>} - ID of the newly created saved location
 */
export const saveLocation = async (locationData, userId) => {
  try {
    // Check if this location is already saved by the user
    const existingLocation = await checkIfLocationSaved(
      locationData.placeId || locationData.formattedAddress,
      userId
    );

    if (existingLocation) {
      return existingLocation; // Return the ID if already saved
    }

    // Add new saved location
    const savedLocationRef = await addDoc(collection(db, 'savedLocations'), {
      userId,
      name: locationData.name || 'Unnamed Location',
      address: locationData.formattedAddress,
      placeId: locationData.placeId || null,
      latitude: locationData.latitude || null,
      longitude: locationData.longitude || null,
      notes: locationData.notes || '',
      tags: locationData.tags || [],
      createdAt: Timestamp.now(),
      hasVisited: locationData.hasVisited || false,
      isFavorite: locationData.isFavorite || false,
    });

    return savedLocationRef.id;
  } catch (error) {
    console.error('Error saving location:', error);
    throw error;
  }
};

/**
 * Check if a location is already saved by the user
 * @param {string} identifier - Place ID or address to check
 * @param {string} userId - The user's ID
 * @returns {Promise<string|null>} - ID of saved location if found, null otherwise
 */
export const checkIfLocationSaved = async (identifier, userId) => {
  try {
    // Try to find by placeId first
    let savedLocationsQuery = query(
      collection(db, 'savedLocations'),
      where('userId', '==', userId),
      where('placeId', '==', identifier)
    );

    let snapshot = await getDocs(savedLocationsQuery);

    // If not found by placeId, try by address
    if (snapshot.empty) {
      savedLocationsQuery = query(
        collection(db, 'savedLocations'),
        where('userId', '==', userId),
        where('address', '==', identifier)
      );

      snapshot = await getDocs(savedLocationsQuery);
    }

    if (!snapshot.empty) {
      return snapshot.docs[0].id;
    }

    return null;
  } catch (error) {
    console.error('Error checking saved location:', error);
    return null;
  }
};

/**
 * Gets all saved locations for a user
 * @param {string} userId - The user's ID
 * @returns {Promise<Array>} - Array of saved locations
 */
export const getUserSavedLocations = async (userId) => {
  try {
    const savedLocationsQuery = query(
      collection(db, 'savedLocations'),
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(savedLocationsQuery);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    }));
  } catch (error) {
    console.error('Error getting saved locations:', error);
    throw error;
  }
};

/**
 * Removes a saved location
 * @param {string} locationId - ID of the saved location to remove
 * @returns {Promise<void>}
 */
export const removeSavedLocation = async (locationId) => {
  try {
    await deleteDoc(doc(db, 'savedLocations', locationId));
  } catch (error) {
    console.error('Error removing saved location:', error);
    throw error;
  }
};

/**
 * Updates a saved location
 * @param {string} locationId - ID of the saved location to update
 * @param {Object} updateData - The data to update
 * @returns {Promise<void>}
 */
export const updateSavedLocation = async (locationId, updateData) => {
  try {
    await updateDoc(doc(db, 'savedLocations', locationId), updateData);
  } catch (error) {
    console.error('Error updating saved location:', error);
    throw error;
  }
};

/**
 * Toggles the favorite status of a saved location
 * @param {string} locationId - ID of the saved location
 * @returns {Promise<boolean>} - New favorite status
 */
export const toggleFavoriteLocation = async (locationId) => {
  try {
    const locationRef = doc(db, 'savedLocations', locationId);
    const locationDoc = await getDoc(locationRef);

    if (locationDoc.exists()) {
      const currentStatus = locationDoc.data().isFavorite || false;
      const newStatus = !currentStatus;

      await updateDoc(locationRef, {
        isFavorite: newStatus,
      });

      return newStatus;
    }

    return false;
  } catch (error) {
    console.error('Error toggling favorite status:', error);
    throw error;
  }
};
