import React, { useEffect, useRef, useState } from 'react';

const LocationAutocomplete = ({
  value,
  onChange,
  onPlaceSelected,
  placeholder = 'Enter a location',
  required = false,
}) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);

  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.onload = () => setMapsLoaded(true);
      document.head.appendChild(script);
    } else {
      setMapsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!mapsLoaded) return;

    const initAutocomplete = () => {
      if (!inputRef.current) return;

      const options = {
        types: ['establishment', 'geocode'],
        fields: ['formatted_address', 'geometry', 'name', 'place_id'],
      };

      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        options
      );

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        if (!place.geometry) return;

        const placeData = {
          formattedAddress: place.formatted_address,
          name: place.name,
          placeId: place.place_id,
          location: {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          },
        };

        onPlaceSelected?.(placeData);
        onChange?.({
          target: {
            name: 'location',
            value: place.formatted_address,
          },
        });
      });
    };

    initAutocomplete();

    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(
          autocompleteRef.current
        );
      }
    };
  }, [mapsLoaded, onChange, onPlaceSelected]);

  return (
    <div className='location-autocomplete-container'>
      <input
        ref={inputRef}
        type='text'
        name='location'
        className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pickle-green'
        placeholder={placeholder}
        onChange={(e) => onChange?.(e)}
        required={required}
        autoComplete='off'
        value={value || ''}
      />
      {!mapsLoaded && (
        <p className='text-sm text-gray-500 mt-1'>Loading maps...</p>
      )}
    </div>
  );
};

export default LocationAutocomplete;
