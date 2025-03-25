import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  browserLocalPersistence,
  GoogleAuthProvider,
} from 'firebase/auth';
import {
  getFirestore,
  enableIndexedDbPersistence,
  doc,
  onSnapshot,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: 'picklebookie.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
const auth = initializeAuth(app, {
  persistence: browserLocalPersistence,
});

// Initialize Firestore with offline support
const db = getFirestore(app);
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.error(
      'Multiple tabs open, persistence can only be enabled in one tab at a time'
    );
  } else if (err.code === 'unimplemented') {
    console.error('The current browser does not support offline persistence');
  }
});

const messaging = getMessaging(app);
const storage = getStorage(app);
const functions = getFunctions(app);
const googleProvider = new GoogleAuthProvider();

// Connection monitoring
const initConnectionMonitor = (callback) => {
  const unsubscribe = onSnapshot(doc(db, '.info/connected'), (doc) => {
    callback(doc.data()?.connected || false);
  });
  return unsubscribe;
};

// Notification functions
const requestNotificationPermission = async () => {
  try {
    if (!('Notification' in window)) return null;
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

const onMessageListener = () => {
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
};

export {
  app,
  auth,
  db,
  messaging,
  storage,
  functions,
  googleProvider,
  initConnectionMonitor,
  requestNotificationPermission,
  onMessageListener,
};
