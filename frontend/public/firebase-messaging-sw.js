/* eslint-disable no-undef, no-restricted-globals */
importScripts(
  'https://www.gstatic.com/firebasejs/9.6.10/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.6.10/firebase-messaging-compat.js'
);

// Initialize Firebase
firebase.initializeApp({
  apiKey: 'AIzaSyCJxpMsMUGsxlD54bGjj3-aftTK3pm5DRk',
  authDomain: 'picklebookie.firebaseapp.com',
  projectId: 'picklebookie',
  storageBucket: 'picklebookie.appspot.com',
  messagingSenderId: '921444216697',
  appId: '1:921444216697:web:f0d6001e28e44a4bee89a8',
});

const messaging = firebase.messaging();

// Notification assets fallback
const DEFAULT_ICON = '/logo192.png';
const DEFAULT_BADGE = '/badge.png'; // Will silently fail if missing

messaging.onBackgroundMessage((payload) => {
  try {
    const notificationOptions = {
      title: payload.notification?.title || 'New update',
      body: payload.notification?.body || 'You have a new notification',
      icon: payload.notification?.icon || DEFAULT_ICON,
      data: payload.data || {},
      // Badge will be ignored if missing - no error thrown
      ...(payload.notification?.badge && { badge: DEFAULT_BADGE }),
    };

    self.registration.showNotification(
      notificationOptions.title,
      notificationOptions
    );

    // Broadcast to clients
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'FCM_MESSAGE',
          payload: payload,
        });
      });
    });
  } catch (error) {
    console.error('[SW] Notification failed, showing fallback');
    self.registration.showNotification('New message', {
      body: 'Open the app to view',
    });
  }
});

// Optional: Cache badge on install
self.addEventListener('install', (event) => {
  const cacheBadge = async () => {
    const cache = await caches.open('notifications');
    await cache.add(DEFAULT_BADGE).catch(() => {});
  };
  event.waitUntil(cacheBadge());
});
