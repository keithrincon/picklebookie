// src/components/location/LocationAutocomplete.jsx
import React, { useEffect, useRef } from 'react';

const LocationAutocomplete = ({
  onPlaceSelect,
  defaultValue = '',
  placeholder = 'Enter a location',
}) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.error('Google Maps API not loaded');
      return;
    }

    if (!inputRef.current) return;

    // Initialize the Google Maps Places Autocomplete
    const autocompleteOptions = {
      types: ['address', 'establishment', '(regions)'],
      fields: [
        'address_components',
        'formatted_address',
        'geometry',
        'name',
        'place_id',
      ],
    };

    // Create autocomplete instance
    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      inputRef.current,
      autocompleteOptions
    );

    // Add event listener for place selection
    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current.getPlace();

      if (!place.geometry) {
        console.warn('Place selected has no geometry data');
        return;
      }

      // Create a structured place object to pass back
      const placeData = {
        formatted_address: place.formatted_address,
        name: place.name || place.formatted_address,
        placeId: place.place_id,
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng(),
      };

      // Pass the selected place up to the parent component
      if (onPlaceSelect) {
        onPlaceSelect(placeData);
      }
    });

    // Set default value if provided
    if (defaultValue) {
      inputRef.current.value = defaultValue;
    }

    // Cleanup function
    return () => {
      // Clean up any listeners if necessary
      if (autocompleteRef.current && window.google && window.google.maps) {
        window.google.maps.event.clearInstanceListeners(
          autocompleteRef.current
        );
      }
    };
  }, [onPlaceSelect, defaultValue]);

  return (
    <div className='location-autocomplete-container'>
      <input
        ref={inputRef}
        type='text'
        className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pickle-green'
        placeholder={placeholder}
        defaultValue={defaultValue}
      />
    </div>
  );
};

export default LocationAutocomplete;
