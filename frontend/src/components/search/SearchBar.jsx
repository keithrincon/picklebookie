import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getFunctions, httpsCallable } from 'firebase/functions';

const SearchBar = ({ id }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(null);
  const searchRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const prevResultsRef = useRef([]);
  const location = useLocation(); // Track route changes

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
  }, [location.pathname]); // Runs when the route changes

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
    const handleSearch = async () => {
      if (searchTerm.length < 2) {
        setTimeout(() => {
          if (searchTerm.length < 2) {
            setShowResults(false);
            setResults([]);
            setError(null);
          }
        }, 100);
        return;
      }

      if (prevResultsRef.current.length === 0) {
        setIsLoading(true);
      }

      try {
        const searchResults = await debouncedSearch(searchTerm);

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
  }, [searchTerm, debouncedSearch]);

  const handleInputFocus = () => {
    if (searchTerm.length >= 2) {
      setShowResults(true);
    }
  };

  return (
    <div className='relative w-full' ref={searchRef}>
      <div className='relative'>
        <input
          id={id}
          type='text'
          placeholder='Search users...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={handleInputFocus}
          className='w-full p-2 pl-3 pr-10 border rounded bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm'
          aria-label='Search users'
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
                onClick={() => {
                  setShowResults(false);
                  setSearchTerm('');
                }}
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.name}
                    className='w-8 h-8 rounded-full mr-2'
                    onError={(e) => {
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                ) : (
                  <div className='w-8 h-8 rounded-full mr-2 bg-gray-200 flex items-center justify-center'>
                    <span className='text-sm font-medium text-gray-600'>
                      {user.name?.charAt(0) || '?'}
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
              </Link>
            ))
          ) : (
            <div className='p-3 text-center text-gray-500'>No users found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
