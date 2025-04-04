import { useState, useEffect } from 'react';

export default function useGoogleMaps() {
  const [mapsLoaded, setMapsLoaded] = useState(!!window.google);

  useEffect(() => {
    if (!mapsLoaded && window.lazyLoadMaps) {
      window.lazyLoadMaps();
      const checkInterval = setInterval(() => {
        if (window.google) {
          setMapsLoaded(true);
          clearInterval(checkInterval);
        }
      }, 500);

      return () => clearInterval(checkInterval);
    }
  }, [mapsLoaded]); // Added dependency

  return mapsLoaded;
}
