import axios from 'axios';

const GEOCODE_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

/**
 * Geocodes a text address to coordinates using Google Maps Geocoding API
 * @param {string} rawLocation - The address to geocode
 * @returns {Promise<Object>} - Object with geocoding results
 */
export const geocodeLocation = async (rawLocation) => {
  if (!GEOCODE_API_KEY) {
    console.error('Google Maps API key is missing');
    return {
      isValid: false,
      formattedAddress: rawLocation,
    };
  }

  // Add Redding, CA as default if no comma is present (local area assumption)
  const location = rawLocation.includes(',')
    ? rawLocation
    : `${rawLocation}, Redding, CA`;

  try {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/geocode/json',
      {
        params: {
          address: location,
          key: GEOCODE_API_KEY,
        },
      }
    );

    if (response.data.results?.length > 0) {
      const result = response.data.results[0];
      return {
        isValid: true,
        formattedAddress: result.formatted_address,
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        placeId: result.place_id, // Added for consistency with autocomplete
      };
    }
    return {
      isValid: false,
      formattedAddress: location,
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return {
      isValid: false,
      formattedAddress: location,
    };
  }
};

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} - Distance in miles
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;

  // Radius of the Earth in miles
  const R = 3958.8;

  // Convert degrees to radians
  const toRad = (value) => (value * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Distance in miles (rounded to 1 decimal place)
  return Math.round(R * c * 10) / 10;
};
