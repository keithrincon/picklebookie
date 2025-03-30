// src/components/navigation/BottomNav.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const BottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Define navigation items
  const navItems = [
    {
      name: 'Home',
      path: '/',
      icon: (
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
            d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
          />
        </svg>
      ),
      activeIcon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-6 w-6'
          viewBox='0 0 24 24'
          fill='currentColor'
        >
          <path d='M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z' />
        </svg>
      ),
    },
    {
      name: 'Explore',
      path: '/explore',
      icon: (
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
            d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
          />
        </svg>
      ),
      activeIcon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-6 w-6'
          viewBox='0 0 24 24'
          fill='currentColor'
        >
          <path d='M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
        </svg>
      ),
    },
    {
      name: 'Create',
      path: '/create',
      icon: (
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
            d='M12 4v16m8-8H4'
          />
        </svg>
      ),
      activeIcon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-6 w-6'
          viewBox='0 0 24 24'
          fill='currentColor'
        >
          <path d='M12 4v16m8-8H4' />
        </svg>
      ),
      highlight: true,
    },
    {
      name: 'Places',
      path: '/my-places',
      icon: (
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
            d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
          />
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
          />
        </svg>
      ),
      activeIcon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-6 w-6'
          viewBox='0 0 24 24'
          fill='currentColor'
        >
          <path d='M5.05 4.05A7 7 0 0110 1.05c1.91 0 3.73.75 5.07 2.11l.88.88c.19.19.29.44.29.7v5.17a7 7 0 01-2.11 5.07l-3.88 3.88a1 1 0 01-1.41 0l-3.88-3.88A7 7 0 014.05 10V4.83c0-.27.1-.52.29-.7l.71-.71zM10 5a1 1 0 100 2 1 1 0 000-2z' />
        </svg>
      ),
    },
    {
      name: 'Profile',
      path: user ? `/profile/${user.uid}` : '/login',
      icon: (
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
            d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
          />
        </svg>
      ),
      activeIcon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-6 w-6'
          viewBox='0 0 24 24'
          fill='currentColor'
        >
          <path d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
        </svg>
      ),
    },
  ];

  // Check if a path is active (exact match or starts with for nested routes)
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  return (
    <nav className='fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-safe-area'>
      <div className='flex justify-around items-center h-16'>
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex flex-col items-center justify-center w-full h-full ${
              isActive(item.path)
                ? 'text-pickle-green'
                : 'text-gray-500 hover:text-gray-700'
            } ${item.highlight ? 'relative' : ''}`}
            aria-label={item.name}
          >
            {item.highlight && (
              <div className='absolute -top-5 w-12 h-12 bg-pickle-green rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-105'>
                <span className='text-white'>
                  {isActive(item.path) ? item.activeIcon : item.icon}
                </span>
              </div>
            )}

            {!item.highlight && (
              <span>{isActive(item.path) ? item.activeIcon : item.icon}</span>
            )}

            <span className={`text-xs mt-1 ${item.highlight ? 'mt-6' : ''}`}>
              {item.name}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
