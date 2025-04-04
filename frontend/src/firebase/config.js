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

// Initialize Auth
const auth = initializeAuth(app, {
  persistence: browserLocalPersistence,
  popupRedirectResolver: browserPopupRedirectResolver,
});

// Initialize Firestore
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

const storage = getStorage(app);
const functions = getFunctions(app, 'us-central1');

// Messaging setup (simplified)
let messaging = null;
if (process.env.REACT_APP_ENABLE_PUSH_NOTIFICATIONS === 'true') {
  isSupported().then((supported) => {
    if (supported) {
      messaging = getMessaging(app);
      onMessage(messaging, (payload) => {
        console.log('Message received:', payload);
      });
    }
  });
}

// Google Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Connection Monitor
const initConnectionMonitor = (callback) => {
  const connectionRef = doc(db, '.info/connected');
  return onSnapshot(connectionRef, (snap) => {
    callback(!!snap.data()?.connected);
  });
};

export {
  app,
  auth,
  db,
  storage,
  functions,
  googleProvider,
  initConnectionMonitor,
  messaging,
};
