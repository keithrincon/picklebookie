/* eslint-disable no-restricted-globals, no-undef */
// Service Worker for Firebase Cloud Messaging v3.1

// Configuration
const FIREBASE_VERSION = '10.11.1';
const CACHE_NAME = 'fcm-assets-v3';
const ASSETS_TO_CACHE = ['/logo192.png', '/logo512.png', '/favicon.ico'];

// Initialize Firebase
try {
  // importScripts is a special service worker global function
  /* global importScripts, firebase */
  importScripts(
    `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app-compat.js`,
    `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-messaging-compat.js`
  );

  const firebaseConfig = {
    apiKey: 'AIzaSyCJxpMsMUGsxlD54bGjj3-aftTK3pm5DRk',
    authDomain: 'picklebookie.firebaseapp.com',
    projectId: 'picklebookie',
    storageBucket: 'picklebookie.appspot.com',
    messagingSenderId: '921444216697',
    appId: '1:921444216697:web:f0d6001e28e44a4bee89a8',
  };

  const app = firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging(app);

  // Handle background messages
  messaging.onBackgroundMessage((payload) => {
    console.log('[FCM] Background message received', payload);

    const notificationTitle = payload.notification?.title || 'New message';
    const notificationOptions = {
      body: payload.notification?.body || 'You have a new notification',
      icon: payload.notification?.icon || '/logo192.png',
      data: payload.data || {},
      vibrate: [200, 100, 200],
    };

    return self.registration.showNotification(
      notificationTitle,
      notificationOptions
    );
  });
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Service Worker Lifecycle Events
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches
        .keys()
        .then((cacheNames) =>
          Promise.all(
            cacheNames
              .filter((name) => name !== CACHE_NAME)
              .map((name) => caches.delete(name))
          )
        ),
    ])
  );
});

// Fetch handler for cached assets
self.addEventListener('fetch', (event) => {
  if (ASSETS_TO_CACHE.some((asset) => event.request.url.includes(asset))) {
    event.respondWith(
      caches
        .match(event.request)
        .then((cachedResponse) => cachedResponse || fetch(event.request))
    );
  }
});
