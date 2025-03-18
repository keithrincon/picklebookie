import React, { useState, useEffect } from 'react';
import { onMessageListener } from '../../firebase/firebase';
import { Toast, ToastContainer } from 'react-bootstrap';

const NotificationComponent = () => {
  const [show, setShow] = useState(false);
  const [notification, setNotification] = useState({ title: '', body: '' });

  useEffect(() => {
    const setupMessageListener = async () => {
      try {
        const unsubscribe = await onMessageListener();
        unsubscribe((payload) => {
          console.log('Foreground notification received:', payload);
          setNotification({
            title: payload.notification.title,
            body: payload.notification.body,
          });
          setShow(true);
        });

        // Cleanup listener on unmount
        return () => {
          unsubscribe();
        };
      } catch (err) {
        console.error('Failed to set up message listener:', err);
      }
    };

    setupMessageListener();
  }, []);

  return (
    <ToastContainer position='top-end' className='p-3' style={{ zIndex: 1 }}>
      <Toast onClose={() => setShow(false)} show={show} delay={4000} autohide>
        <Toast.Header>
          <strong className='me-auto'>{notification.title}</strong>
        </Toast.Header>
        <Toast.Body>{notification.body}</Toast.Body>
      </Toast>
    </ToastContainer>
  );
};

export default NotificationComponent;
