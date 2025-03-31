// src/components/navigation/AppHeader.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SidebarNav from './SidebarNav'; // Import the SidebarNav component

// UserAvatar component - now directly navigates to profile
const UserAvatar = ({ user, onClick }) => {
  return (
    <div onClick={onClick} className='cursor-pointer'>
      {user?.photoURL ? (
        <img
          src={user.photoURL}
          alt='Profile'
          className='w-10 h-10 rounded-full border-2 border-white shadow-sm hover:border-ball-yellow transition-all duration-200'
          onError={(e) => {
            e.target.src = '/default-avatar.png';
          }}
        />
      ) : (
        <div className='w-10 h-10 rounded-full bg-white text-pickle-green flex items-center justify-center font-semibold border-2 border-white shadow-sm hover:border-ball-yellow transition-all duration-200'>
          {(user?.displayName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
        </div>
      )}
    </div>
  );
};

const AppHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Handle loading state for user data
  useEffect(() => {
    if (user !== undefined) {
      setIsLoading(false);
    }
  }, [user]);

  // Close sidebar when changing routes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Navigate to home on logo click
  const handleLogoClick = () => {
    navigate('/');
  };

  // Toggle sidebar function
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Navigate directly to profile on avatar click
  const navigateToProfile = () => {
    if (user) {
      navigate(`/profile/${user.uid}`);
    }
  };

  return (
    <>
      {/* Add the SidebarNav component */}
      <SidebarNav
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <header className='bg-pickle-green text-white sticky top-0 z-40 shadow-md'>
        <div className='flex items-center justify-between h-14 px-4'>
          {/* Left: Menu button or spacer */}
          {user ? (
            <button
              onClick={toggleSidebar}
              className='focus:outline-none p-1 rounded-md hover:bg-pickle-green-dark transition-colors'
              aria-label='Toggle navigation menu'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-6 w-6'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 6h16M4 12h16M4 18h16'
                />
              </svg>
            </button>
          ) : (
            <div className='w-6' aria-hidden='true'></div>
          )}

          {/* Center: App name */}
          <h1
            onClick={handleLogoClick}
            className='font-poppins font-bold text-xl mx-auto cursor-pointer hover:text-white transition-colors'
          >
            PICKLEBOOKIE
          </h1>

          {/* Right: User section */}
          <div className='flex items-center'>
            {!isLoading && (
              <>
                {user ? (
                  <UserAvatar user={user} onClick={navigateToProfile} />
                ) : (
                  <Link
                    to='/login'
                    className='bg-white text-pickle-green px-3 py-1 rounded-lg text-sm hover:bg-gray-100 transition-colors font-medium'
                  >
                    Log In
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default AppHeader;
