import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyCJxpMsMUGsxlD54bGjj3-aftTK3pm5DRk',
  authDomain: 'picklebookie.firebaseapp.com',
  projectId: 'picklebookie',
  storageBucket: 'picklebookie.firebasestorage.app',
  messagingSenderId: '921444216697',
  appId: '1:921444216697:web:f0d6001e28e44a4bee89a8',
  measurementId: 'G-Z4SW9ZNEW2',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get instances for services
const auth = getAuth(app);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const messaging = getMessaging(app);

// VAPID key for web push notifications
const VAPID_KEY =
  'BCJXJ7IPRvaGBzTGvaNn7ZLjLSel7Cd2PveNBh9u-9QvWs741_TSZzGfQefFxdXgZPjlv_Q7XsHYjM3e51jQ0xA';

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

// Export the objects
export { auth, db, messaging };
