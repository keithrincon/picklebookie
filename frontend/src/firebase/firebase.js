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
import { getStorage } from 'firebase/storage'; // Add this import
import { getAnalytics } from 'firebase/analytics';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import {
  getFunctions,
  httpsCallable,
  connectFunctionsEmulator,
} from 'firebase/functions';

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

// Get instances for services
const auth = getAuth(app);
// eslint-disable-next-line no-unused-vars
const analytics = getAnalytics(app);
const db = getFirestore(app);
const messaging = getMessaging(app);
const functions = getFunctions(app);
const storage = getStorage(app); // Initialize Firebase Storage

// Create Google provider
const googleProvider = new GoogleAuthProvider();

// VAPID key for web push notifications
const VAPID_KEY = process.env.REACT_APP_FIREBASE_VAPID_KEY;

// Connect to emulators in development
if (process.env.NODE_ENV === 'development') {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099'); // Auth emulator
  connectFirestoreEmulator(db, '127.0.0.1', 8080); // Firestore emulator
  connectFunctionsEmulator(functions, '127.0.0.1', 5001); // Functions emulator
}

// Function to request notification permission and save the token
export const requestNotificationPermission = async () => {
  try {
    // Check if the browser supports notifications
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return null;
    }

    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      // Get the token
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
      });

      console.log('Notification token:', token);

      // Save the token to Firestore for the current user
      const currentUser = auth.currentUser;
      if (currentUser && token) {
        await saveTokenToFirestore(currentUser.uid, token);
      }

      return token;
    } else {
      console.log('Permission not granted');
      return null;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
};

// Function to save the FCM token to Firestore
const saveTokenToFirestore = async (userId, token) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { fcmToken: token }, { merge: true });
    console.log('Token saved to Firestore');
  } catch (error) {
    console.error('Error saving token to Firestore:', error);
  }
};

// Handle foreground messages
export const onMessageListener = () => {
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      resolve(payload);
    });
  });
};

// Export the callable function
export const sendNotification = httpsCallable(functions, 'sendNotification');

// Export the objects
export { app, auth, googleProvider, db, messaging, storage, functions };
