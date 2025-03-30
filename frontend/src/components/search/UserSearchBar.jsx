// src/components/search/UserSearchBar.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getFunctions, httpsCallable } from 'firebase/functions';

const UserSearchBar = ({ id, className = '' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(null);
  const searchRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const prevSearchTermRef = useRef('');
  const location = useLocation();

  // Initialize Firebase Functions
  const functions = getFunctions();
  const searchUsersFunction = httpsCallable(functions, 'searchUsers');

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Clear search on route change
  useEffect(() => {
    setSearchTerm('');
    setShowResults(false);
  }, [location.pathname]);

  // Debounced search function
  const debouncedSearch = useCallback(
    (term) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      return new Promise((resolve) => {
        debounceTimerRef.current = setTimeout(async () => {
          if (term.length < 2) {
            resolve([]);
            return;
          }

          try {
            const response = await searchUsersFunction({ searchTerm: term });
            resolve(response.data.results || []);
          } catch (error) {
            console.error('Search error:', error);
            resolve([]);
          }
        }, 300);
      });
    },
    [searchUsersFunction]
  );

  // Handle search term changes
  useEffect(() => {
    // Skip effect if search term hasn't changed
    if (prevSearchTermRef.current === searchTerm) {
      return;
    }

    prevSearchTermRef.current = searchTerm;

    const handleSearch = async () => {
      if (searchTerm.length < 2) {
        setShowResults(false);
        setResults([]);
        setError(null);
        return;
      }

      setIsLoading(true);

      try {
        const searchResults = await debouncedSearch(searchTerm);
        setResults(searchResults);
        setShowResults(true);
        setError(null);
      } catch (error) {
        setError(`Search failed: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    handleSearch();
  }, [searchTerm, debouncedSearch]);

  const handleInputFocus = () => {
    if (searchTerm.length >= 2) {
      setShowResults(true);
    }
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <div className='relative'>
        <input
          id={id}
          type='text'
          placeholder='Search users...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={handleInputFocus}
          className='w-full p-3 pl-10 pr-3 rounded-lg border border-gray-200 bg-white text-gray-800 
                    focus:outline-none focus:ring-2 focus:ring-pickle-green text-sm'
          aria-label='Search users'
        />

        {/* Search icon */}
        <div className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'>
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

        {/* Clear button */}
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
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

      {/* Results container */}
      {showResults && (
        <div className='absolute z-10 bg-white w-full mt-1 rounded-lg shadow-lg max-h-64 overflow-y-auto border border-gray-100'>
          {isLoading ? (
            <div className='p-4 text-center text-gray-500 flex items-center justify-center'>
              <div className='animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-pickle-green mr-2'></div>
              <span>Searching...</span>
            </div>
          ) : error ? (
            <div className='p-4 text-center text-red-500'>{error}</div>
          ) : results.length > 0 ? (
            results.map((user) => (
              <Link
                key={user.id}
                to={`/profile/${user.id}`}
                className='flex items-center p-3 hover:bg-gray-50 border-b border-gray-100 last:border-none transition-colors'
                onClick={() => {
                  setShowResults(false);
                  setSearchTerm('');
                }}
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.name}
                    className='w-10 h-10 rounded-full mr-3 object-cover'
                    onError={(e) => {
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                ) : (
                  <div className='w-10 h-10 rounded-full mr-3 bg-gradient-to-br from-green-300 to-pickle-green flex items-center justify-center'>
                    <span className='text-sm font-medium text-white'>
                      {user.name?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                )}
                <div className='flex-1'>
                  <div className='font-medium text-gray-800'>{user.name}</div>
                  {user.username && (
                    <div className='text-sm text-gray-500'>
                      @{user.username}
                    </div>
                  )}
                </div>
                <div className='text-pickle-green'>
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
                      d='M9 5l7 7-7 7'
                    />
                  </svg>
                </div>
              </Link>
            ))
          ) : (
            <div className='p-4 text-center text-gray-500'>No users found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserSearchBar;
