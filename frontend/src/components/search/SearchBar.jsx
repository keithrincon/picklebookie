import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getFunctions, httpsCallable } from 'firebase/functions';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(null);
  const searchRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const prevResultsRef = useRef([]);

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

  // Debounced search function
  const debouncedSearch = (term) => {
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
  };

  // Handle search term changes
  useEffect(() => {
    const handleSearch = async () => {
      if (searchTerm.length < 2) {
        // Keep showing previous results briefly to prevent flickering
        setTimeout(() => {
          if (searchTerm.length < 2) {
            setShowResults(false);
            setResults([]);
            setError(null);
          }
        }, 100);
        return;
      }

      // Only show loading if we don't have previous results
      if (prevResultsRef.current.length === 0) {
        setIsLoading(true);
      }

      try {
        const searchResults = await debouncedSearch(searchTerm);

        // Only update results if the search term hasn't changed
        if (searchTerm.length >= 2) {
          prevResultsRef.current = searchResults;
          setResults(searchResults);
          setShowResults(true);
          setError(null);
        }
      } catch (error) {
        setError(`Search failed: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    handleSearch();
  }, [searchTerm]);

  const handleInputFocus = () => {
    if (searchTerm.length >= 2 && results.length > 0) {
      setShowResults(true);
    }
  };

  return (
    <div className='relative' ref={searchRef}>
      <div className='relative'>
        <input
          type='text'
          placeholder='Search users by username...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={handleInputFocus}
          className='w-full p-2 pl-3 pr-10 border rounded bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500'
        />
        <button
          onClick={() => setShowResults(searchTerm.length >= 2)}
          className='absolute right-2 top-1/2 transform -translate-y-1/2 text-green-600 hover:text-green-800'
          aria-label='Search'
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
              d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
            />
          </svg>
        </button>
      </div>

      {/* Keep the results container stable in the DOM */}
      <div
        className='absolute z-10 bg-white w-full mt-1 rounded shadow-lg max-h-64 overflow-y-auto transition-opacity duration-150'
        style={{
          opacity: showResults ? 1 : 0,
          visibility: showResults ? 'visible' : 'hidden',
          pointerEvents: showResults ? 'auto' : 'none',
        }}
      >
        {isLoading ? (
          <div className='p-3 text-center text-gray-500'>Loading...</div>
        ) : error ? (
          <div className='p-3 text-center text-red-500'>{error}</div>
        ) : results.length > 0 ? (
          results.map((user) => (
            <Link
              key={user.id}
              to={`/profile/${user.id}`}
              className='flex items-center p-3 hover:bg-gray-100 border-b border-gray-100 last:border-none'
              onClick={() => setShowResults(false)}
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className='w-8 h-8 rounded-full mr-2'
                  onError={(e) => (e.target.src = '/default-avatar.png')}
                />
              ) : (
                <div className='w-8 h-8 rounded-full mr-2 bg-gray-200 flex items-center justify-center'>
                  <span className='text-sm font-medium text-gray-600'>
                    {user.displayName?.charAt(0) || '?'}
                  </span>
                </div>
              )}
              <div>
                <div className='font-medium text-gray-800'>
                  {user.displayName}
                </div>
              </div>
            </Link>
          ))
        ) : searchTerm.length >= 2 ? (
          <div className='p-3 text-center text-gray-500'>No users found</div>
        ) : null}
      </div>
    </div>
  );
};

export default SearchBar;
