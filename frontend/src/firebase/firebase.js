import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  connectAuthEmulator,
} from 'firebase/auth';
import {
  getFirestore,
  connectFirestoreEmulator,
  enableIndexedDbPersistence,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging } from 'firebase/messaging';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// ========================
// FIREBASE CONFIGURATION
// ========================

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

// ========================
// SERVICES INITIALIZATION
// ========================

// 1. Auth
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// 2. Firestore with Offline Support
const db = getFirestore(app);
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Offline persistence already enabled');
  } else {
    console.error('Offline persistence error:', err);
  }
});

// 3. Other Services
const messaging = getMessaging(app);
const functions = getFunctions(app);
const storage = getStorage(app);

// ========================
// APP CHECK (RECAPTCHA V3)
// ========================

const initializeAppCheckWithRetry = (attempts = 0) => {
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(
        process.env.REACT_APP_RECAPTCHA_SITE_KEY
      ),
      isTokenAutoRefreshEnabled: true,
    });
    console.log('App Check initialized successfully');
  } catch (error) {
    if (attempts < 3) {
      console.warn(`App Check retry attempt ${attempts + 1}`);
      setTimeout(() => initializeAppCheckWithRetry(attempts + 1), 2000);
    } else {
      console.error('App Check failed after 3 attempts:', error);
    }
  }
};
initializeAppCheckWithRetry();

// ========================
// DEVELOPMENT EMULATORS
// ========================

if (process.env.NODE_ENV === 'development') {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectFunctionsEmulator(functions, 'localhost', 5001);

  // Debug mode for App Check
  window.self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  console.log('Firebase emulators initialized in development mode');
}

// ========================
// EXPORTS
// ========================

export { app, auth, googleProvider, db, messaging, functions, storage };
