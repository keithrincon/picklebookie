import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
} from 'firebase/messaging';
import { app } from './config';

let messaging = null;
let messagingInitialized = false;

const initializeMessaging = async () => {
  if (messagingInitialized) return messaging;

  try {
    if (process.env.REACT_APP_ENABLE_PUSH_NOTIFICATIONS !== 'true') {
      console.log('FCM is disabled in environment variables');
      return null;
    }

    const supported = await isSupported();
    if (!supported) {
      console.log('FCM not supported in this environment');
      return null;
    }

    messaging = getMessaging(app);
    messagingInitialized = true;

    // Handle incoming messages
    onMessage(messaging, (payload) => {
      console.log('Message received:', payload);
      // Add your message handling logic here
    });

    return messaging;
  } catch (error) {
    console.error('Messaging initialization error:', error);
    return null;
  }
};

export const requestNotificationPermission = async (context = 'general') => {
  try {
    const messaging = await initializeMessaging();
    if (!messaging) return null;

    // Custom messages based on context
    const messages = {
      test: 'We need permission to send test notifications',
      match: 'Get notified when your pickleball match starts!',
      chat: 'Receive messages from other players',
      default: 'Stay updated with pickleball activities',
    };

    console.log(messages[context] || messages.default);

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
      });
      console.log('FCM Token:', token);
      return token;
    }
    return null;
  } catch (error) {
    console.error('Notification permission error:', error);
    return null;
  }
};

export const setupMessageListener = (callback) => {
  if (!messaging) return null;

  return onMessage(messaging, (payload) => {
    console.log('Message received:', payload);
    callback?.(payload);
  });
};

// Initialize messaging when imported
initializeMessaging();

export { messaging };
