// src/components/search/SearchSection.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const SearchSection = ({
  placeholder = 'Search games, players, or locations...',
  showFilters = true,
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Reset search when location changes
  useEffect(() => {
    setQuery('');
    setFocused(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  // Handle quick filter selection
  const handleFilterClick = (filterType) => {
    navigate(`/search?type=${filterType}`);
  };

  return (
    <div
      className={`px-4 py-3 bg-white z-10 border-b border-gray-100 ${className}`}
    >
      <form
        onSubmit={handleSearch}
        className={`transition-all duration-200 ${focused ? 'scale-102' : ''}`}
      >
        <div className='relative'>
          <input
            type='text'
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={`w-full bg-gray-100 border-none rounded-full py-3 pl-12 pr-4 
                      outline-none transition-all text-gray-800
                      ${
                        focused
                          ? 'ring-2 ring-pickle-green bg-white shadow-sm'
                          : 'hover:bg-gray-200'
                      }`}
          />

          {/* Search icon */}
          <div className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5'
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
          </div>

          {/* Clear button - appears when there's text */}
          {query && (
            <button
              type='button'
              onClick={() => setQuery('')}
              className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
              aria-label='Clear search'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-5 w-5'
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
          )}
        </div>

        {/* Quick filters */}
        {showFilters && (
          <div className='mt-3 flex space-x-2 overflow-x-auto pb-1 hide-scrollbar'>
            <button
              type='button'
              className='bg-gray-100 text-gray-700 px-4 py-1.5 rounded-full text-sm whitespace-nowrap hover:bg-gray-200 transition-colors'
              onClick={() => handleFilterClick('nearby')}
            >
              <span className='flex items-center'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-4 w-4 mr-1'
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
                Nearby Games
              </span>
            </button>
            <button
              type='button'
              className='bg-gray-100 text-gray-700 px-4 py-1.5 rounded-full text-sm whitespace-nowrap hover:bg-gray-200 transition-colors'
              onClick={() => handleFilterClick('today')}
            >
              <span className='flex items-center'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-4 w-4 mr-1'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                  />
                </svg>
                Today
              </span>
            </button>
            <button
              type='button'
              className='bg-gray-100 text-gray-700 px-4 py-1.5 rounded-full text-sm whitespace-nowrap hover:bg-gray-200 transition-colors'
              onClick={() => handleFilterClick('weekend')}
            >
              <span className='flex items-center'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-4 w-4 mr-1'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                  />
                </svg>
                This Weekend
              </span>
            </button>
            <button
              type='button'
              className='bg-gray-100 text-gray-700 px-4 py-1.5 rounded-full text-sm whitespace-nowrap hover:bg-gray-200 transition-colors'
              onClick={() => handleFilterClick('tournaments')}
            >
              <span className='flex items-center'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-4 w-4 mr-1'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
                  />
                </svg>
                Tournaments
              </span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchSection;
