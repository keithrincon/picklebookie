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

// Mock messaging object with all potentially needed methods
const messaging = {
  getToken: async () => null,
  onMessage: () => () => {},
  deleteToken: async () => {},
  isSupported: async () => false,
};

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

// Create a dummy FCM function that does nothing
const requestNotificationPermission = async () => {
  console.log('Notifications are currently disabled');
  return null;
};

// Make sure all these are explicitly exported
export {
  app,
  auth,
  db,
  storage,
  functions,
  googleProvider,
  initConnectionMonitor,
  requestNotificationPermission,
  messaging, // Explicitly export the mock messaging object
};
