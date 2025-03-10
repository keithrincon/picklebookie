// src/context/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; // Importing Firebase Authentication
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration for your app
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

// Get instances for Firebase Authentication and Analytics
const auth = getAuth(app);
const analytics = getAnalytics(app);
const db = getFirestore(app); // Initialize Firestore

// Export the auth object so it can be used in AuthContext
export { auth, db };
