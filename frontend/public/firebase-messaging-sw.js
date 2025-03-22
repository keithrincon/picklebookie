/* eslint-disable no-undef, no-restricted-globals */
// Import Firebase scripts
importScripts(
  'https://www.gstatic.com/firebasejs/9.6.10/firebase-app-compat.js'
);
importScripts(
  'https://www.gstatic.com/firebasejs/9.6.10/firebase-messaging-compat.js'
);

// Initialize Firebase app inside the service worker using public Firebase config
firebase.initializeApp({
  apiKey: 'AIzaSyCJxpMsMUGsxlD54bGjj3-aftTK3pm5DRk', // Use your API Key directly here (cannot use env in service worker)
  authDomain: 'picklebookie.firebaseapp.com',
  projectId: 'picklebookie',
  storageBucket: 'picklebookie.firebasestorage.app',
  messagingSenderId: '921444216697',
  appId: '1:921444216697:web:f0d6001e28e44a4bee89a8',
  measurementId: 'G-Z4SW9ZNEW2',
});

// Get an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log(
    '[firebase-messaging-sw.js] Received background message:',
    payload
  );

  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new message.',
    icon: '/logo192.png', // Update with your app's icon
  };

  // Display the notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});
