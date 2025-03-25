import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  browserLocalPersistence,
  GoogleAuthProvider,
  browserPopupRedirectResolver,
} from 'firebase/auth';
import {
  getFirestore,
  enableIndexedDbPersistence,
  doc,
  onSnapshot,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getFunctions, httpsCallable } from 'firebase/functions';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: 'picklebookie.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Enhanced Auth Initialization
const auth = initializeAuth(app, {
  persistence: browserLocalPersistence,
  popupRedirectResolver: browserPopupRedirectResolver,
});

// Configure Google Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
  login_hint: '', // You can pre-fill email if available
  hd: '', // Restrict to specific domain if needed
});

// Firestore with enhanced error handling
const db = getFirestore(app);
const enablePersistence = async () => {
  try {
    await enableIndexedDbPersistence(db);
    console.log('Offline persistence enabled');
  } catch (err) {
    if (err.code === 'failed-precondition') {
      console.warn(
        'Persistence failed: Multiple tabs open. Only one tab can have persistence enabled.'
      );
    } else if (err.code === 'unimplemented') {
      console.warn(
        'Persistence failed: Browser does not support all required features.'
      );
    }
    console.warn('Offline data will not be persisted:', err);
  }
};
enablePersistence();

// Initialize other services
const messaging = getMessaging(app);
const storage = getStorage(app);
const functions = getFunctions(app, 'us-central1'); // Explicit region

// Connection Monitor with cleanup
const initConnectionMonitor = (callback) => {
  const unsubscribe = onSnapshot(doc(db, '.info/connected'), (doc) => {
    callback(doc.data()?.connected || false);
  });
  return () => {
    unsubscribe();
    console.debug('Connection monitor cleaned up');
  };
};

// Enhanced Notification Functions
const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported in this browser');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
    }).catch((err) => {
      console.error('Failed to get FCM token:', err);
      return null;
    });

    return token || null;
  } catch (error) {
    console.error('Notification permission error:', error);
    return null;
  }
};

// Message Listener with error handling
const onMessageListener = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onMessage(messaging, (payload) => {
      resolve(payload);
      unsubscribe(); // Auto-cleanup after first message
    });

    // Timeout if no message received
    setTimeout(() => {
      unsubscribe();
      reject(new Error('FCM message timeout'));
    }, 30000);
  });
};

// Cloud Functions helper
const callFunction = (name, data) => {
  const func = httpsCallable(functions, name);
  return func(data).catch((err) => {
    console.error(`Cloud Function ${name} failed:`, err);
    throw err;
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
  callFunction,
};
