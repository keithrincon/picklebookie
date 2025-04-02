import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  browserLocalPersistence,
  GoogleAuthProvider,
  browserPopupRedirectResolver,
} from 'firebase/auth';
import { initializeFirestore, doc, onSnapshot } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { getMessaging, isSupported, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence and popup resolver
const auth = initializeAuth(app, {
  persistence: browserLocalPersistence,
  popupRedirectResolver: browserPopupRedirectResolver,
});

// Initialize Firestore with improved cache settings
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true, // Better for unreliable networks
});

const storage = getStorage(app);
const functions = getFunctions(app, 'us-central1');

// Enhanced FCM initialization
let messaging = null;
let messagingReady = false;
const messagingSubscribers = [];

const initMessaging = async () => {
  try {
    if (!process.env.REACT_APP_ENABLE_PUSH_NOTIFICATIONS === 'true') {
      console.warn('Push notifications disabled by config');
      return null;
    }

    if (!(await isSupported())) {
      console.warn('FCM not supported in this environment');
      return null;
    }

    const instance = getMessaging(app);

    // Handle foreground messages
    onMessage(instance, (payload) => {
      console.log('Foreground message received:', payload);
      // You might want to dispatch this to your app state
    });

    messagingReady = true;
    messagingSubscribers.forEach((callback) => callback(instance));
    messagingSubscribers.length = 0;

    return instance;
  } catch (error) {
    console.error('FCM initialization failed:', error);
    return null;
  }
};

// Safe messaging access
const getMessagingInstance = () => {
  return new Promise((resolve) => {
    if (messagingReady && messaging) {
      resolve(messaging);
    } else {
      messagingSubscribers.push(resolve);
    }
  });
};

// Initialize immediately if enabled
if (process.env.REACT_APP_ENABLE_PUSH_NOTIFICATIONS === 'true') {
  initMessaging().then((instance) => {
    messaging = instance;
  });
}

// Configure Google Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Connection Monitor with enhanced error handling
const initConnectionMonitor = (callback) => {
  const connectionRef = doc(db, '.info/connected');

  return onSnapshot(
    connectionRef,
    (snap) => {
      try {
        callback(!!snap.data()?.connected);
      } catch (error) {
        console.error('Connection monitor callback error:', error);
        callback(true); // Fallback to connected
      }
    },
    (error) => {
      console.error('Connection monitor error:', error);
      callback(true); // Fallback to connected
    }
  );
};

export {
  app,
  auth,
  db,
  storage,
  functions,
  googleProvider,
  initConnectionMonitor,
  getMessagingInstance, // Use this instead of direct messaging access
  messaging, // Still exported but prefer getMessagingInstance()
};
