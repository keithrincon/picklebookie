import React, { useState, useEffect } from 'react';
import { onMessageListener } from '../context/firebase';
import { Toast, ToastContainer } from 'react-bootstrap';
// Note: You'll need to install react-bootstrap with: npm install react-bootstrap bootstrap

const NotificationComponent = () => {
  const [show, setShow] = useState(false);
  const [notification, setNotification] = useState({ title: '', body: '' });

  useEffect(() => {
    const unsubscribe = onMessageListener()
      .then((payload) => {
        setNotification({
          title: payload.notification.title,
          body: payload.notification.body,
        });
        setShow(true);
      })
      .catch((err) =>
        console.log('Failed to receive foreground notification: ', err)
      );

    return () => {
      unsubscribe.catch((err) => console.log(err));
    };
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
