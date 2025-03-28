import { useEffect } from 'react';

export default function useFirebase() {
  useEffect(() => {
    // No-op implementation that doesn't try to initialize FCM
    console.log('FCM integration is disabled');

    // You could set up a feature flag here to re-enable when ready
    // if (process.env.REACT_APP_ENABLE_NOTIFICATIONS === 'true') {
    //    Initialize FCM when configuration is ready
    // }
  }, []);
}
