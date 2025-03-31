// src/components/navigation/SidebarNav.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePosts } from '../../context/PostsContext';

const SidebarNav = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, logOut } = useAuth();
  const { userPreferences } = usePosts();

  // Handle logout
  const handleLogout = async () => {
    try {
      await logOut();
      onClose(); // Close the sidebar after logout
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Check if a path is active
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  return (
    <>
      {/* Sidebar panel */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } w-4/5 max-w-xs bg-white shadow-xl z-50 transition-transform duration-300 ease-in-out overflow-y-auto`}
      >
        <div className='h-full flex flex-col'>
          {/* Header with close button */}
          <div className='flex justify-between items-center p-4 border-b border-gray-200'>
            <h2 className='font-bold text-lg text-pickle-green'>
              PickleBookie
            </h2>
            <button
              onClick={onClose}
              className='p-1 rounded-md hover:bg-gray-100 transition-colors'
              aria-label='Close menu'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-6 w-6 text-gray-500'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>

          {/* User profile section */}
          <div className='p-4 border-b border-gray-200 bg-gray-50'>
            <Link
              to={user ? `/profile/${user.uid}` : '/login'}
              onClick={onClose}
              className='flex items-center'
            >
              {user && user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt='Profile'
                  className='w-14 h-14 rounded-full mr-3 border-2 border-white shadow-sm'
                  onError={(e) => {
                    e.target.src = '/default-avatar.png';
                  }}
                />
              ) : (
                <div className='w-14 h-14 rounded-full bg-pickle-green text-white flex items-center justify-center mr-3 font-semibold border-2 border-white shadow-sm'>
                  {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                </div>
              )}
              <div>
                <h2 className='font-bold text-gray-800'>
                  {user?.displayName || 'Pickle Player'}
                </h2>
                <p className='text-sm text-gray-500'>
                  Skill Level: {userPreferences?.skillLevel || 'Not set'}
                </p>
                <span className='text-xs text-pickle-green mt-1 inline-block hover:underline'>
                  View Profile
                </span>
              </div>
            </Link>
          </div>

          {/* Main navigation section */}
          <nav className='flex-1 px-2 pt-4'>
            <div className='px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider'>
              Main
            </div>

            <div className='space-y-1 mb-6'>
              <Link
                to='/'
                className={`flex items-center px-3 py-3 rounded-md ${
                  isActive('/')
                    ? 'text-pickle-green bg-green-50 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={onClose}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5 mr-3'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path d='M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z' />
                </svg>
                <span>Home</span>
              </Link>

              <Link
                to='/explore'
                className={`flex items-center px-3 py-3 rounded-md ${
                  isActive('/explore')
                    ? 'text-pickle-green bg-green-50 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={onClose}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5 mr-3'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z'
                    clipRule='evenodd'
                  />
                </svg>
                <span>Explore</span>
              </Link>

              <Link
                to='/create'
                className={`flex items-center px-3 py-3 rounded-md ${
                  isActive('/create')
                    ? 'text-pickle-green bg-green-50 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={onClose}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5 mr-3'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z'
                    clipRule='evenodd'
                  />
                </svg>
                <span>Create Game</span>
              </Link>
            </div>

            {/* Account section */}
            <div className='px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider'>
              Your Account
            </div>

            <div className='space-y-1 mb-6'>
              <Link
                to='/my-places'
                className={`flex items-center px-3 py-3 rounded-md ${
                  isActive('/my-places')
                    ? 'text-pickle-green bg-green-50 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={onClose}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5 mr-3'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z'
                    clipRule='evenodd'
                  />
                </svg>
                <span>My Places</span>
              </Link>

              <Link
                to='/my-games'
                className={`flex items-center px-3 py-3 rounded-md ${
                  isActive('/my-games')
                    ? 'text-pickle-green bg-green-50 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={onClose}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5 mr-3'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path d='M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z' />
                </svg>
                <span>My Games</span>
              </Link>

              <Link
                to='/friends'
                className={`flex items-center px-3 py-3 rounded-md ${
                  isActive('/friends')
                    ? 'text-pickle-green bg-green-50 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={onClose}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5 mr-3'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path d='M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z' />
                </svg>
                <span>Friends</span>
              </Link>
            </div>

            {/* Settings section */}
            <div className='px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider'>
              Settings & Support
            </div>

            <div className='space-y-1'>
              <Link
                to='/settings'
                className={`flex items-center px-3 py-3 rounded-md ${
                  isActive('/settings')
                    ? 'text-pickle-green bg-green-50 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={onClose}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5 mr-3'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z'
                    clipRule='evenodd'
                  />
                </svg>
                <span>Settings</span>
              </Link>

              <Link
                to='/help'
                className={`flex items-center px-3 py-3 rounded-md ${
                  isActive('/help')
                    ? 'text-pickle-green bg-green-50 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={onClose}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5 mr-3'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z'
                    clipRule='evenodd'
                  />
                </svg>
                <span>Help & Feedback</span>
              </Link>

              {/* Added direct feedback link that takes the user straight to the feedback tab */}
              <Link
                to='/help?tab=feedback'
                className={`flex items-center px-3 py-3 rounded-md text-gray-700 hover:bg-gray-100`}
                onClick={onClose}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5 mr-3'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z'
                    clipRule='evenodd'
                  />
                </svg>
                <span>Send Feedback</span>
              </Link>
            </div>
          </nav>

          {/* Logout button at bottom */}
          <div className='mt-auto p-4 border-t border-gray-200'>
            <button
              onClick={handleLogout}
              className='w-full flex items-center px-3 py-3 text-red-600 hover:bg-red-50 rounded-md text-left transition-colors'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-5 w-5 mr-3'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5.707-5.707A1 1 0 009.586 1H3zm0 2h6v5h5v8H3V5z'
                  clipRule='evenodd'
                />
                <path d='M14 3l2.5 2.5L14 8V3z' />
              </svg>
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay to close sidebar */}
      {isOpen && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 z-40'
          onClick={onClose}
        />
      )}
    </>
  );
};

export default SidebarNav;
