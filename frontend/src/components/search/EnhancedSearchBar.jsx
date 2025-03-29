// src/components/search/EnhancedSearchBar.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EnhancedSearchBar = ({
  placeholder = 'Search games, players, or locations...',
}) => {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  };

  return (
    <div className='px-4 py-2 bg-white sticky top-14 z-30 shadow-sm'>
      <form
        onSubmit={handleSearch}
        className={`relative transition-all duration-200 ${
          focused ? 'scale-102' : ''
        }`}
      >
        <input
          type='text'
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className='w-full bg-gray-100 border-none rounded-full py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-pickle-green focus:bg-white transition-all'
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

        {/* Quick filters */}
        <div className='mt-2 flex space-x-2 overflow-x-auto pb-1 scrollbar-hide'>
          <button
            type='button'
            className='bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs whitespace-nowrap hover:bg-gray-200'
            onClick={() => navigate('/search?type=nearby')}
          >
            Nearby Games
          </button>
          <button
            type='button'
            className='bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs whitespace-nowrap hover:bg-gray-200'
            onClick={() => navigate('/search?type=today')}
          >
            Today
          </button>
          <button
            type='button'
            className='bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs whitespace-nowrap hover:bg-gray-200'
            onClick={() => navigate('/search?type=weekend')}
          >
            This Weekend
          </button>
          <button
            type='button'
            className='bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs whitespace-nowrap hover:bg-gray-200'
            onClick={() => navigate('/search?type=tournaments')}
          >
            Tournaments
          </button>
        </div>
      </form>
    </div>
  );
};

export default EnhancedSearchBar;
