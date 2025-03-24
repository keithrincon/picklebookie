import axios from 'axios';

const GEOCODE_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY; // Updated to use .env

export const geocodeLocation = async (rawLocation) => {
  if (!GEOCODE_API_KEY) {
    console.error('Google Maps API key is missing');
    return {
      isValid: false,
      formattedAddress: rawLocation,
    };
  }

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
