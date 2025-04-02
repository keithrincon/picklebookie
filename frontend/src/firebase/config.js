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
import { getMessaging, isSupported } from 'firebase/messaging';

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
const firestoreSettings = {
  cache: {
    subscribe: true, // Enable long-lived persistence
  },
};

const db = initializeFirestore(app, firestoreSettings);
const storage = getStorage(app);
const functions = getFunctions(app, 'us-central1');

// Initialize messaging conditionally
let messaging = null;

// Helper function to initialize messaging if supported
const initMessaging = async () => {
  try {
    // Check if FCM is enabled in environment
    if (process.env.REACT_APP_ENABLE_PUSH_NOTIFICATIONS !== 'true') {
      console.log('FCM integration is disabled by configuration');
      return null;
    }

    // Check browser support for FCM
    const isFCMSupported = await isSupported();
    if (!isFCMSupported) {
      console.log('Firebase Cloud Messaging is not supported in this browser');
      return null;
    }

    // Initialize messaging
    return getMessaging(app);
  } catch (error) {
    console.error('Error initializing Firebase Cloud Messaging:', error);
    return null;
  }
};

// Initialize messaging asynchronously
initMessaging().then((msgInstance) => {
  messaging = msgInstance;
  if (messaging) {
    console.log('Firebase Cloud Messaging initialized');
  } else {
    console.log('FCM integration is disabled');
  }
});

// Configure Google Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
  login_hint: '',
  hd: '',
});

// Connection Monitor
const initConnectionMonitor = (callback) => {
  try {
    // Skip in development mode to avoid permission errors
    if (process.env.NODE_ENV === 'development') {
      console.log('Connection monitor disabled in development mode');
      callback(true); // Assume always connected in development
      return () => {}; // Return empty unsubscribe function
    }

    return onSnapshot(doc(db, '.info/connected'), (doc) => {
      callback(doc.data()?.connected || false);
    });
  } catch (error) {
    console.warn('Connection monitor error:', error);
    callback(true); // Fallback to assume connected
    return () => {}; // Return empty unsubscribe function
  }
};

// Export everything
export {
  app,
  auth,
  db,
  storage,
  functions,
  googleProvider,
  initConnectionMonitor,
  messaging, // This may be null initially but will be updated asynchronously
};
