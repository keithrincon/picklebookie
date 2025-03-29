import React, { useState, useEffect } from 'react';
import { LoadScript, Autocomplete } from '@react-google-maps/api';

const libraries = ['places'];

const LocationAutocomplete = ({
  value,
  onChange,
  placeholder,
  required,
  apiKey,
  onPlaceSelected,
}) => {
  const [autocomplete, setAutocomplete] = useState(null);
  const [apiLoaded, setApiLoaded] = useState(true);
  const [apiLoadError, setApiLoadError] = useState(false);

  // Set a timeout to detect if Google Maps API fails to load
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!window.google || !window.google.maps) {
        setApiLoaded(false);
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timeout);
  }, []);

  // Handle API load errors
  const handleLoadError = () => {
    setApiLoadError(true);
    setApiLoaded(false);
  };

  // If API fails to load, render a simple text input
  if (apiLoadError || !apiLoaded) {
    return (
      <div>
        <div className='relative'>
          <input
            type='text'
            name='location'
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500'
            required={required}
          />
          <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3'>
            <span role='img' aria-label='location' className='text-gray-500'>
              📍
            </span>
          </div>
        </div>
        <p className='text-xs text-amber-600 mt-1'>
          Enhanced location features unavailable. This may be due to an ad
          blocker.
        </p>
      </div>
    );
  }

  // Original component with Google Maps API
  return (
    <LoadScript
      googleMapsApiKey={apiKey}
      libraries={libraries}
      onError={handleLoadError}
    >
      <div className='relative'>
        <Autocomplete
          onLoad={setAutocomplete}
          onPlaceChanged={() => {
            if (autocomplete) {
              const place = autocomplete.getPlace();
              if (place.geometry) {
                // Your existing place handling code
                onChange({
                  target: {
                    name: 'location',
                    value: place.formatted_address || place.name,
                  },
                });

                onPlaceSelected?.({
                  formattedAddress: place.formatted_address || place.name,
                  latitude: place.geometry.location.lat(),
                  longitude: place.geometry.location.lng(),
                  placeId: place.place_id,
                  isValid: true,
                });
              }
            }
          }}
        >
          <input
            type='text'
            name='location'
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500'
            required={required}
          />
        </Autocomplete>
        <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3'>
          <span role='img' aria-label='location' className='text-gray-500'>
            📍
          </span>
        </div>
      </div>
    </LoadScript>
  );
};

export default LocationAutocomplete;
