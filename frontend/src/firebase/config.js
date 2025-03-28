import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  browserLocalPersistence,
  GoogleAuthProvider,
  browserPopupRedirectResolver,
  // setLogLevel,
} from 'firebase/auth';
import {
  getFirestore,
  enableIndexedDbPersistence,
  doc,
  onSnapshot,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, getToken } from 'firebase/messaging';
import { getFunctions } from 'firebase/functions';

// Enable debug logging in development
// if (process.env.NODE_ENV === 'development') {
//   setLogLevel('debug');
// }

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

// Initialize other services
const db = getFirestore(app);
const storage = getStorage(app);
const messaging = getMessaging(app);
const functions = getFunctions(app, 'us-central1');

// Configure Google Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
  login_hint: '',
  hd: '',
});

// Enable Firestore offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Persistence already enabled in another tab');
  } else if (err.code === 'unimplemented') {
    console.warn('Browser does not support offline persistence');
  }
});

// Connection Monitor
const initConnectionMonitor = (callback) => {
  return onSnapshot(doc(db, '.info/connected'), (doc) => {
    callback(doc.data()?.connected || false);
  });
};

// Notification Permission - Modified to skip in development mode
const requestNotificationPermission = async () => {
  // Skip FCM in development mode
  if (process.env.NODE_ENV === 'development') {
    console.log('FCM disabled in development mode');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    const token = await getToken(messaging, {
      vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
    });
    return token;
  } catch (error) {
    console.error('Notification error:', error);
    return null;
  }
};

export {
  app,
  auth,
  db,
  storage,
  messaging,
  functions,
  googleProvider,
  initConnectionMonitor,
  requestNotificationPermission,
};
