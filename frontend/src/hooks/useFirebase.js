import { useEffect } from 'react';
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
} from 'firebase/messaging';
import { app } from '../firebase/config';
import { toast } from 'react-toastify';

export default function useFirebase() {
  useEffect(() => {
    const initializeFCM = async () => {
      try {
        // Skip FCM in development mode completely
        if (process.env.NODE_ENV === 'development') {
          console.log('FCM disabled in development mode');
          return;
        }

        const supported = await isSupported();
        if (!supported || !process.env.REACT_APP_ENABLE_PUSH_NOTIFICATIONS)
          return;

        const messaging = getMessaging(app);

        if (process.env.REACT_APP_AUTO_REQUEST_NOTIFICATIONS === 'true') {
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') return;
        }

        const token = await getToken(messaging, {
          vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
        });

        if (token) {
          console.log('FCM Token:', token);
          // TODO: Send token to backend
        }

        onMessage(messaging, (payload) => {
          console.log('Foreground message:', payload);
          toast(payload.notification?.body || 'New notification', {
            position: 'top-right',
            autoClose: 5000,
          });
        });
      } catch (error) {
        console.error('FCM Error:', error);
      }
    };

    initializeFCM();
  }, []);
}
