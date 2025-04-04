import { useEffect } from 'react';
import { useFirebase } from '../../hooks/useFirebase';

const MapLoader = () => {
  const { loadGoogleMaps } = useFirebase();

  useEffect(() => {
    loadGoogleMaps();
  }, [loadGoogleMaps]);

  return null;
};

export default MapLoader;
