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
      name: 'Feed',
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
            d='M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1M19 20a2 2 0 002-2V8a2 2 0 00-2-2h-1'
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
          <path d='M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1M19 20a2 2 0 002-2V8a2 2 0 00-2-2h-1' />
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
          <path d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
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
          <path d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
          <path d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
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
    <div className='fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-safe-area'>
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
              <div className='absolute -top-5 w-12 h-12 bg-pickle-green rounded-full flex items-center justify-center shadow-lg'>
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
    </div>
  );
};

export default BottomNav;
