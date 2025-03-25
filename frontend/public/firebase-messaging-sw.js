/* eslint-disable no-undef, no-restricted-globals, no-unused-vars */
// Service Worker for Firebase Cloud Messaging

// 1. Import required Firebase scripts
importScripts(
  'https://www.gstatic.com/firebasejs/9.6.10/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.6.10/firebase-messaging-compat.js'
);

// 2. Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyCJxpMsMUGsxlD54bGjj3-aftTK3pm5DRk',
  authDomain: 'picklebookie.firebaseapp.com',
  projectId: 'picklebookie',
  storageBucket: 'picklebookie.appspot.com',
  messagingSenderId: '921444216697',
  appId: '1:921444216697:web:f0d6001e28e44a4bee89a8',
  measurementId: 'G-Z4SW9ZNEW2',
};

// 3. Initialize Firebase
const firebaseApp = firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// 4. Notification assets
const DEFAULT_ICON = '/logo192.png';
const DEFAULT_BADGE = '/badge.png';

// 5. Background message handler
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'New message';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: payload.notification?.icon || DEFAULT_ICON,
    badge: payload.notification?.badge || DEFAULT_BADGE,
    data: payload.data || {},
    vibrate: [200, 100, 200],
  };

  // Show notification
  return self.registration
    .showNotification(notificationTitle, notificationOptions)
    .then(() => console.log('[SW] Notification shown'))
    .catch((err) => console.error('[SW] Notification error:', err));
});

// 6. Cache important assets during install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open('fcm-assets-v1')
      .then((cache) => cache.addAll([DEFAULT_ICON, DEFAULT_BADGE]))
      .then(() => self.skipWaiting())
  );
});

// 7. Claim clients immediately with proper cache cleanup
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Clean up old caches - fixed array-callback-return
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cache) => cache !== 'fcm-assets-v1')
            .map((cache) => caches.delete(cache))
        );
      }),
    ])
  );
});
