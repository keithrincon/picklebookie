import React from 'react';
import { sendNotification } from '../../firebase/firebase'; // Import the function

function NotifyButton() {
  const handleClick = async () => {
    const data = {
      userId: 'someUserId', // Replace with the actual user ID
      title: 'Test Notification',
      body: 'This is a test notification from the NotifyButton!',
    };

    try {
      const result = await sendNotification(data);
      console.log('Notification sent:', result.data);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  return (
    <button
      onClick={handleClick}
      className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
    >
      Send Test Notification
    </button>
  );
}

export default NotifyButton;
