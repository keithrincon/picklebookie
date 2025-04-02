import React, { useState, useEffect } from 'react';
import { getMessagingInstance, onMessage } from '../../firebase/config';
import { Toast, ToastContainer } from 'react-bootstrap';

const NotificationComponent = () => {
  const [show, setShow] = useState(false);
  const [notification, setNotification] = useState({ title: '', body: '' });
  const [isFCMSupported, setIsFCMSupported] = useState(true);

  useEffect(() => {
    let unsubscribe = () => {};

    const initializeFCM = async () => {
      try {
        const messaging = await getMessagingInstance();

        if (!messaging) {
          setIsFCMSupported(false);
          return;
        }

        unsubscribe = onMessage(messaging, (payload) => {
          console.log('Foreground notification received:', payload);
          setNotification({
            title: payload.notification?.title || 'New Notification',
            body: payload.notification?.body || '',
          });
          setShow(true);
        });
      } catch (error) {
        console.error('FCM initialization error:', error);
        setIsFCMSupported(false);
      }
    };

    initializeFCM();

    return () => {
      unsubscribe(); // Cleanup on unmount
    };
  }, []);

  if (!isFCMSupported) {
    return null; // Don't render if FCM isn't supported
  }

  return (
    <ToastContainer
      position='top-end'
      className='p-3'
      style={{
        zIndex: 9999,
        position: 'fixed',
        top: '20px',
        right: '20px',
      }}
    >
      <Toast
        onClose={() => setShow(false)}
        show={show}
        delay={5000}
        autohide
        bg='light'
      >
        <Toast.Header closeButton>
          <strong className='me-auto'>{notification.title}</strong>
          <small className='text-muted'>Just now</small>
        </Toast.Header>
        <Toast.Body>{notification.body}</Toast.Body>
      </Toast>
    </ToastContainer>
  );
};

export default NotificationComponent;
