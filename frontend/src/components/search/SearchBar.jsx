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

  // Debounce search with cloud function
  useEffect(() => {
    const performSearch = async () => {
      if (searchTerm.length < 2) {
        setResults([]);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await searchUsersFunction({ searchTerm });
        console.log('Search response:', response.data); // Log the response
        const searchResults = response.data.results || [];
        setResults(searchResults);
        setShowResults(true);
      } catch (error) {
        console.error('Search error details:', error);
        setError(`Search failed: ${error.message}`);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      if (searchTerm.length >= 2) {
        performSearch();
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, searchUsersFunction]);

  const handleInputFocus = () => {
    if (searchTerm.length >= 2) {
      setShowResults(true);
    }
  };

  const handleSearchButtonClick = () => {
    if (searchTerm.length >= 2) {
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
          onClick={handleSearchButtonClick}
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

      {showResults && (
        <div className='absolute z-10 bg-white w-full mt-1 rounded shadow-lg max-h-64 overflow-y-auto'>
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
      )}
    </div>
  );
};

export default SearchBar;
