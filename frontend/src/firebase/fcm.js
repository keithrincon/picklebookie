import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
} from 'firebase/messaging';
import { app } from './config'; // Import app from your existing config

// Initialize messaging variable
let messaging = null;

// Initialize messaging conditionally
const initializeMessaging = async () => {
  try {
    // Check if Firebase Cloud Messaging is enabled in environment
    if (process.env.REACT_APP_ENABLE_PUSH_NOTIFICATIONS !== 'true') {
      console.log('FCM integration is disabled by configuration');
      return false;
    }

    // Check if browser supports FCM
    const isMessagingSupported = await isSupported();

    if (!isMessagingSupported) {
      console.log('Firebase Cloud Messaging is not supported in this browser');
      return false;
    }

    // Initialize messaging
    messaging = getMessaging(app);
    return true;
  } catch (error) {
    console.error('Error initializing Firebase Messaging:', error);
    return false;
  }
};

/**
 * Request notification permission and get FCM token
 * @returns {Promise<string|null>} FCM token or null if not available
 */
export const requestNotificationPermission = async () => {
  try {
    // Check if messaging is initialized
    if (!messaging && !(await initializeMessaging())) {
      console.log('FCM messaging could not be initialized');
      return null;
    }

    // Check if browser supports notifications
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return null;
    }

    // Check if auto-request is enabled
    if (process.env.REACT_APP_AUTO_REQUEST_NOTIFICATIONS !== 'true') {
      console.log('Auto-request for notifications is disabled');
      // Still proceed if manually called
    }

    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission not granted');
      return null;
    }

    try {
      // Get token using VAPID key from environment variables
      const vapidKey = process.env.REACT_APP_VAPID_PUBLIC_KEY;

      if (!vapidKey) {
        console.error('VAPID key is missing');
        return null;
      }

      const token = await getToken(messaging, { vapidKey });
      console.log('FCM token obtained:', token);
      return token;
    } catch (tokenError) {
      console.error('Error getting FCM token:', tokenError);

      // Handle API blocked errors more gracefully
      if (tokenError.message && tokenError.message.includes('are blocked')) {
        console.warn(
          'FCM API access is blocked - check Firebase console settings'
        );
      }

      return null;
    }
  } catch (error) {
    console.error('Error in notification permission process:', error);
    return null;
  }
};

/**
 * Setup foreground message handler
 * @param {Function} callback Function to call when message is received
 * @returns {Function|null} Unsubscribe function or null if not available
 */
export const setupMessageListener = (callback) => {
  try {
    if (!messaging) {
      console.log('FCM messaging is not initialized');
      return null;
    }

    return onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);
      if (typeof callback === 'function') {
        callback(payload);
      }

      // You can also show a notification manually here if needed
      if (Notification.permission === 'granted') {
        const title = payload.notification?.title || 'New Message';
        const options = {
          body: payload.notification?.body || 'You have a new notification',
          icon: payload.notification?.icon || '/logo192.png',
        };

        // Show notification in foreground
        new Notification(title, options);
      }
    });
  } catch (error) {
    console.error('Error setting up message listener:', error);
    return null;
  }
};

// Initialize messaging automatically
initializeMessaging().then((success) => {
  if (success) {
    console.log('Firebase Cloud Messaging initialized successfully');
  } else {
    console.log(
      'Firebase Cloud Messaging initialization failed or was skipped'
    );
  }
});

export { messaging };
