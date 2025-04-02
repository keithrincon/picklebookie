/* eslint-disable no-undef, no-restricted-globals, no-unused-vars */
// Service Worker for Firebase Cloud Messaging

// 1. Import required Firebase scripts with error handling
try {
  importScripts(
    'https://www.gstatic.com/firebasejs/9.6.10/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/9.6.10/firebase-messaging-compat.js'
  );
} catch (e) {
  console.error('Error importing Firebase scripts:', e);
}

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

let messaging = null;

// 3. Initialize Firebase with error handling
try {
  if (typeof firebase !== 'undefined') {
    const firebaseApp = firebase.initializeApp(firebaseConfig);
    messaging = firebase.messaging();
    console.log('[SW] Firebase messaging initialized successfully');
  } else {
    console.error('[SW] Firebase is not defined');
  }
} catch (initError) {
  console.error('[SW] Error initializing Firebase:', initError);
}

// 4. Notification assets
const DEFAULT_ICON = '/logo192.png';
const DEFAULT_BADGE = '/badge.png';

// 5. Background message handler with error handling
if (messaging) {
  messaging.onBackgroundMessage((payload) => {
    try {
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
    } catch (error) {
      console.error('[SW] Error processing background message:', error);
    }
  });
} else {
  console.warn('[SW] Firebase messaging is not available');
}

// 6. Cache important assets during install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open('fcm-assets-v1')
      .then((cache) => cache.addAll([DEFAULT_ICON, DEFAULT_BADGE]))
      .then(() => self.skipWaiting())
      .catch((err) => console.error('[SW] Cache installation error:', err))
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
    ]).catch((err) => console.error('[SW] Activation error:', err))
  );
});

// Log successful service worker registration
console.log('[SW] Firebase messaging service worker registered');
