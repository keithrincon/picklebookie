import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  connectAuthEmulator,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  connectFirestoreEmulator,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: 'picklebookie',
  storageBucket: 'picklebookie.appspot.com',
  messagingSenderId: '921444216697',
  appId: '1:921444216697:web:f0d6001e28e44a4bee89a8',
  measurementId: 'G-Z4SW9ZNEW2',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize App Check (no variable assignment needed)
initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider(process.env.REACT_APP_RECAPTCHA_SITE_KEY),
  isTokenAutoRefreshEnabled: true, // Auto-refresh enabled for 7-day TTL
});

// Get service instances
const auth = getAuth(app);
const db = getFirestore(app);
const messaging = getMessaging(app);
const functions = getFunctions(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// Connect to emulators in development
if (process.env.NODE_ENV === 'development') {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099');
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  connectFunctionsEmulator(functions, '127.0.0.1', 5001);

  // Debug mode for App Check
  window.self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  console.log('Firebase emulators & App Check debug enabled');
}

// Notification handler
export const requestNotificationPermission = async () => {
  try {
    if (!('Notification' in window)) {
      console.warn("Browser doesn't support notifications");
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    const token = await getToken(messaging, {
      vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
    });

    if (auth.currentUser?.uid && token) {
      await setDoc(
        doc(db, 'users', auth.currentUser.uid),
        { fcmToken: token },
        { merge: true }
      );
    }

    return token;
  } catch (error) {
    console.error('Notification error:', error);
    return null;
  }
};

// Foreground message handler
export const onMessageListener = () => {
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.debug('New FCM message:', payload);
      resolve(payload);
    });
  });
};

// Exports
export { app, auth, googleProvider, db, messaging, storage, functions };
