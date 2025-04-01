// src/components/location/LocationAutocomplete.jsx
import React, { useEffect, useRef } from 'react';

const LocationAutocomplete = ({
  value,
  onChange,
  onPlaceSelected,
  placeholder = 'Enter a location',
  required = false,
}) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  // Update the input value when the value prop changes
  useEffect(() => {
    if (inputRef.current && value !== undefined) {
      inputRef.current.value = value;
    }
  }, [value]);

  useEffect(() => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.error('Google Maps API not loaded');
      return;
    }

    if (!inputRef.current) return;

    // Initialize the Google Maps Places Autocomplete
    const autocompleteOptions = {
      // Less restrictive types to allow more locations
      types: ['establishment', 'geocode'],
      fields: [
        'address_components',
        'formatted_address',
        'geometry',
        'name',
        'place_id',
      ],
    };

    // Create autocomplete instance - using the older API for now
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
        formattedAddress: place.formatted_address,
        name: place.name || place.formatted_address,
        placeId: place.place_id,
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng(),
      };

      // Pass the selected place up to the parent component
      if (onPlaceSelected) {
        onPlaceSelected(placeData);
      }

      // Update the input value in the parent's form state
      if (onChange) {
        const fakeEvent = {
          target: {
            name: 'location',
            value: place.formatted_address || place.name,
          },
        };
        onChange(fakeEvent);
      }
    });

    // Cleanup function
    return () => {
      // Clean up any listeners if necessary
      if (autocompleteRef.current && window.google && window.google.maps) {
        window.google.maps.event.clearInstanceListeners(
          autocompleteRef.current
        );
      }
    };
  }, [onPlaceSelected, onChange]);

  const handleInputChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className='location-autocomplete-container'>
      <input
        ref={inputRef}
        type='text'
        name='location'
        className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pickle-green'
        placeholder={placeholder}
        onChange={handleInputChange}
        required={required}
        autoComplete='off' // This can help with native browser autocomplete interference
        value={value || ''}
      />
    </div>
  );
};

export default LocationAutocomplete;
