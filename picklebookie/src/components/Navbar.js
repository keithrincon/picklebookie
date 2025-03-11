import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { requestNotificationPermission } from '../context/firebase';

const Navbar = () => {
  const { user, logOut } = useAuth();
  const [notificationStatus, setNotificationStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Function to handle enabling notifications
  const handleEnableNotifications = async () => {
    setIsLoading(true);
    setNotificationStatus('');

    try {
      const token = await requestNotificationPermission();

      if (token) {
        setNotificationStatus('success');
        setTimeout(() => setNotificationStatus(''), 3000);
      } else {
        setNotificationStatus('error');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      setNotificationStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <nav className='bg-blue-600 p-4 text-white'>
      <div className='container mx-auto max-w-7xl flex justify-between items-center'>
        <Link to='/' className='text-xl font-bold'>
          Picklebookie
        </Link>
        <div className='space-x-4'>
          {user ? (
            <>
              <div className='relative inline-block'>
                <button
                  onClick={handleEnableNotifications}
                  disabled={isLoading}
                  className={`px-4 py-2 rounded mr-4 transition-colors ${
                    isLoading
                      ? 'bg-gray-500'
                      : notificationStatus === 'success'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {isLoading
                    ? 'Enabling...'
                    : notificationStatus === 'success'
                    ? 'Notifications Enabled'
                    : 'Enable Notifications'}
                </button>
                {notificationStatus === 'error' && (
                  <div className='absolute bottom-full mb-2 left-0 bg-red-600 text-white px-3 py-1 rounded text-sm whitespace-nowrap'>
                    Please enable notifications in browser settings.
                  </div>
                )}
              </div>
              <button
                onClick={logOut}
                className='bg-red-600 px-4 py-2 rounded hover:bg-red-700'
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link to='/login' className='mr-4 hover:text-yellow-400'>
                Log In
              </Link>
              <Link to='/signup' className='hover:text-yellow-400'>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
