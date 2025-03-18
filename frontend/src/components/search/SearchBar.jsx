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
          console.log('Raw API response:', response); // Debug the raw response
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
        console.log('Processed search results:', searchResults); // Debug processed results

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

  // Helper function to safely extract user properties
  const getUserProperty = (user, property, fallback = '') => {
    if (!user) return fallback;

    // Try to access the property directly
    if (user[property] !== undefined && user[property] !== null) {
      return user[property];
    }

    // Try with data property (common in Firebase results)
    if (
      user.data &&
      user.data[property] !== undefined &&
      user.data[property] !== null
    ) {
      return user.data[property];
    }

    return fallback;
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

      {/* Results container */}
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
        ) : results && results.length > 0 ? (
          results.map((user, index) => {
            // Debug each user object
            console.log(`User ${index}:`, user);

            // Extract user properties safely
            const userId = getUserProperty(user, 'id', `user-${index}`);
            const displayName = getUserProperty(
              user,
              'displayName',
              'Unknown User'
            );
            const username = getUserProperty(user, 'username', '');
            const photoURL = getUserProperty(user, 'photoURL', '');

            return (
              <Link
                key={userId}
                to={`/profile/${userId}`}
                className='flex items-center p-3 hover:bg-gray-100 border-b border-gray-100 last:border-none'
                onClick={() => setShowResults(false)}
              >
                {photoURL ? (
                  <img
                    src={photoURL}
                    alt={displayName}
                    className='w-8 h-8 rounded-full mr-2'
                    onError={(e) => {
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                ) : (
                  <div className='w-8 h-8 rounded-full mr-2 bg-gray-200 flex items-center justify-center'>
                    <span className='text-sm font-medium text-gray-600'>
                      {displayName.charAt(0) || '?'}
                    </span>
                  </div>
                )}
                <div className='flex-1'>
                  <div className='font-medium text-gray-800'>{displayName}</div>
                  {username && (
                    <div className='text-sm text-gray-500'>@{username}</div>
                  )}
                </div>
              </Link>
            );
          })
        ) : searchTerm.length >= 2 ? (
          <div className='p-3 text-center text-gray-500'>No users found</div>
        ) : null}
      </div>
    </div>
  );
};

export default SearchBar;
