// src/components/navigation/AppHeader.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// UserAvatar component
const UserAvatar = ({ user, onClick }) => {
  return (
    <div onClick={onClick} className='cursor-pointer'>
      {user?.photoURL ? (
        <img
          src={user.photoURL}
          alt='Profile'
          className='w-8 h-8 rounded-full border-2 border-white shadow-sm hover:border-ball-yellow transition-all duration-200'
          onError={(e) => {
            e.target.src = '/default-avatar.png';
          }}
        />
      ) : (
        <div className='w-8 h-8 rounded-full bg-white text-pickle-green flex items-center justify-center font-semibold border-2 border-white shadow-sm hover:border-ball-yellow transition-all duration-200'>
          {(user?.displayName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
        </div>
      )}
    </div>
  );
};

const AppHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef(null);

  // Handle loading state for user data
  useEffect(() => {
    if (user !== undefined) {
      setIsLoading(false);
    }
  }, [user]);

  // Get current page title based on path
  const getPageTitle = () => {
    const path = location.pathname;

    if (path === '/') return 'Feed';
    if (path === '/explore') return 'Explore';
    if (path === '/create') return 'Create';
    if (path === '/my-places') return 'My Places';
    if (path.startsWith('/profile')) return 'Profile';
    if (path === '/search') return 'Search';

    // Extract dynamic segments like /profile/userId
    if (path.startsWith('/profile/')) return 'Profile';
    if (path.startsWith('/matches/')) return 'Match Details';

    return 'PickleBookie';
  };

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown when changing routes
  useEffect(() => {
    setIsDropdownOpen(false);
  }, [location.pathname]);

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await logOut();
      navigate('/');
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleDropdown = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsDropdownOpen(!isDropdownOpen);
  };

  const navigateToProfile = () => {
    if (user) {
      navigate(`/profile/${user.uid}`);
      setIsDropdownOpen(false);
    }
  };

  return (
    <header className='bg-pickle-green text-white sticky top-0 z-40 shadow-md'>
      <div className='flex items-center justify-between h-14 px-4'>
        {/* Logo/Home button */}
        <div
          onClick={handleLogoClick}
          className='flex items-center space-x-2 cursor-pointer'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-8 w-8'
            viewBox='0 0 20 20'
            fill='currentColor'
          >
            <path
              fillRule='evenodd'
              d='M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z'
              clipRule='evenodd'
            />
          </svg>
          <h1 className='font-poppins font-bold text-xl hidden sm:block'>
            PICKLEBOOKIE
          </h1>
        </div>

        {/* Page Title - shows on mobile */}
        <div className='font-medium text-lg sm:hidden'>{getPageTitle()}</div>

        {/* Right side actions */}
        <div className='flex items-center space-x-3'>
          {/* User Account Section or Login/Signup Buttons */}
          {!isLoading && (
            <>
              {user ? (
                <div className='relative' ref={dropdownRef}>
                  <div onClick={toggleDropdown} className='cursor-pointer'>
                    <UserAvatar user={user} onClick={toggleDropdown} />
                  </div>

                  {/* User Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50'>
                      <div
                        onClick={navigateToProfile}
                        className='block px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer'
                      >
                        Profile
                      </div>
                      <div className='border-t border-gray-200 my-1'></div>
                      <div
                        onClick={handleLogout}
                        className='block px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer'
                      >
                        Log Out
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className='flex items-center space-x-2'>
                  <Link
                    to='/login'
                    className='bg-white text-pickle-green px-3 py-1 rounded-lg text-sm hover:bg-gray-100 transition-colors font-medium'
                  >
                    Log In
                  </Link>
                  <Link
                    to='/signup'
                    className='hidden sm:block border border-white px-3 py-1 rounded-lg text-sm hover:bg-pickle-green-dark transition-colors font-medium'
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
