/* eslint-disable no-undef, no-restricted-globals */
importScripts(
  'https://www.gstatic.com/firebasejs/9.6.10/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.6.10/firebase-messaging-compat.js'
);

// Initialize Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyCJxpMsMUGsxlD54bGjj3-aftTK3pm5DRk',
  authDomain: 'picklebookie.firebaseapp.com',
  projectId: 'picklebookie',
  storageBucket: 'picklebookie.appspot.com',
  messagingSenderId: '921444216697',
  appId: '1:921444216697:web:f0d6001e28e44a4bee89a8',
};

// Debugging point 1
console.log('[SW] Initializing Firebase with config:', firebaseConfig);
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();
console.log('[SW] Firebase Messaging initialized');

// Notification assets
const DEFAULT_ICON = '/logo192.png';
const DEFAULT_BADGE = '/badge.png';

// Enhanced background message handler
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'New message';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: payload.notification?.icon || DEFAULT_ICON,
    data: payload.data || {},
    ...(payload.notification?.badge && { badge: DEFAULT_BADGE }),
    vibrate: [200, 100, 200], // Add vibration pattern
  };

  // Show notification
  self.registration
    .showNotification(notificationTitle, notificationOptions)
    .then(() => console.log('[SW] Notification shown successfully'))
    .catch((err) => console.error('[SW] Notification failed:', err));

  // Broadcast to all clients
  self.clients
    .matchAll({ type: 'window', includeUncontrolled: true })
    .then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'FCM_MESSAGE',
          payload: payload,
        });
      });
    });
});

// Cache important assets during install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('fcm-assets').then((cache) => {
      return cache.addAll([DEFAULT_ICON, DEFAULT_BADGE]).catch((err) => {
        console.log('[SW] Cache addAll error:', err);
      });
    })
  );
  self.skipWaiting(); // Force activate new SW immediately
});

// Optional: Claim clients to ensure immediate control
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
  console.log('[SW] Service Worker activated');
});
