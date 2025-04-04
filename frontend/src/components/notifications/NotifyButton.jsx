import React from 'react';
import { requestNotificationPermission } from '../../firebase/fcm';

function NotifyButton() {
  const handleClick = async () => {
    try {
      const permission = await requestNotificationPermission('test');
      if (permission === 'granted') {
        console.log('Notification permission granted');
        // Add your notification sending logic here
      } else {
        console.log('Notification permission denied');
      }
    } catch (error) {
      console.error('Notification error:', error);
    }
  };

  return (
    <button
      onClick={handleClick}
      className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors'
    >
      Request Notification Permission
    </button>
  );
}

export default NotifyButton;
