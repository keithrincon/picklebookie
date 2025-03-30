// src/pages/Search.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchSection from '../components/search/SearchSection';
import UserSearchBar from '../components/search/UserSearchBar';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const type = searchParams.get('type'); // For filter-based searches

  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);

      // Simulate API call - replace with actual search logic
      setTimeout(() => {
        // Mock data
        setResults([
          {
            id: 1,
            type: 'game',
            title: 'Doubles Game at Enterprise Park',
            date: 'Tomorrow, 3:00 PM',
            players: 4,
            skillLevel: 'Intermediate',
          },
          {
            id: 2,
            type: 'player',
            name: 'Sarah Johnson',
            wins: 12,
            location: 'Redding, CA',
            skillLevel: 'Advanced',
          },
          {
            id: 3,
            type: 'location',
            name: 'Enterprise Park',
            games: 5,
            distance: '2.3 mi',
            address: '123 Main St, Redding, CA',
          },
          {
            id: 4,
            type: 'game',
            title: 'Singles Practice',
            date: 'Saturday, 10:00 AM',
            players: 2,
            skillLevel: 'Beginner',
          },
          {
            id: 5,
            type: 'player',
            name: 'John Smith',
            wins: 8,
            location: 'Redding, CA',
            skillLevel: 'Intermediate',
          },
          {
            id: 6,
            type: 'location',
            name: 'Community Center Courts',
            games: 3,
            distance: '4.1 mi',
            address: '456 Oak St, Redding, CA',
          },
        ]);
        setLoading(false);
      }, 1200);
    };

    fetchResults();
  }, [query, type]);

  const filteredResults =
    activeTab === 'all'
      ? results
      : results.filter((result) => result.type === activeTab);

  // Get descriptive search title
  const getSearchTitle = () => {
    if (query) return `Results for "${query}"`;
    if (type === 'nearby') return 'Nearby Games';
    if (type === 'today') return 'Games Today';
    if (type === 'weekend') return 'Weekend Games';
    if (type === 'tournaments') return 'Tournaments';
    return 'Search Results';
  };

  return (
    <div className='flex flex-col min-h-screen bg-gray-50'>
      {/* Sticky search section at the top */}
      <SearchSection
        placeholder='Search games, players, locations...'
        className='sticky top-14 z-30'
      />

      <div className='max-w-2xl mx-auto w-full px-4 py-4'>
        <div className='mb-4'>
          <h1 className='text-xl font-bold text-gray-800'>
            {getSearchTitle()}
          </h1>
          <p className='text-sm text-gray-500 mt-1'>
            {loading
              ? 'Searching...'
              : `${filteredResults.length} results found`}
          </p>
        </div>

        {/* User search box - for finding specific people */}
        <div className='mb-6'>
          <h2 className='text-sm font-medium text-gray-700 mb-2'>
            Looking for a specific player?
          </h2>
          <UserSearchBar id='user-search' className='w-full' />
        </div>

        {/* Tabs */}
        <div className='flex border-b border-gray-200 mb-4 overflow-x-auto hide-scrollbar'>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
              activeTab === 'all'
                ? 'text-pickle-green border-b-2 border-pickle-green'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All Results
          </button>
          <button
            onClick={() => setActiveTab('game')}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
              activeTab === 'game'
                ? 'text-pickle-green border-b-2 border-pickle-green'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Games
          </button>
          <button
            onClick={() => setActiveTab('player')}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
              activeTab === 'player'
                ? 'text-pickle-green border-b-2 border-pickle-green'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Players
          </button>
          <button
            onClick={() => setActiveTab('location')}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
              activeTab === 'location'
                ? 'text-pickle-green border-b-2 border-pickle-green'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Locations
          </button>
        </div>

        {/* Results */}
        {loading ? (
          <div className='flex flex-col items-center justify-center py-12'>
            <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pickle-green mb-3'></div>
            <p className='text-gray-500 text-sm'>
              Searching for the perfect match...
            </p>
          </div>
        ) : filteredResults.length > 0 ? (
          <div className='space-y-3 mb-16'>
            {filteredResults.map((result) => (
              <div
                key={result.id}
                className='bg-white rounded-lg shadow p-4 hover:shadow-md transition-all cursor-pointer'
              >
                {result.type === 'game' && (
                  <>
                    <div className='flex justify-between'>
                      <span className='inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mb-2'>
                        Game
                      </span>
                      <span className='text-xs text-gray-500'>
                        {result.skillLevel}
                      </span>
                    </div>
                    <h3 className='font-medium text-gray-900'>
                      {result.title}
                    </h3>
                    <div className='flex justify-between items-center mt-2'>
                      <p className='text-sm text-gray-600'>{result.date}</p>
                      <p className='text-xs bg-gray-100 px-2 py-1 rounded-full'>
                        {result.players} player{result.players !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </>
                )}

                {result.type === 'player' && (
                  <div className='flex items-center'>
                    <div className='w-12 h-12 bg-gradient-to-br from-green-300 to-pickle-green rounded-full flex items-center justify-center text-white font-medium'>
                      {result.name.charAt(0)}
                    </div>
                    <div className='ml-3'>
                      <h3 className='font-medium text-gray-900'>
                        {result.name}
                      </h3>
                      <p className='text-xs text-gray-500'>
                        {result.wins} wins • {result.location} •{' '}
                        {result.skillLevel}
                      </p>
                    </div>
                  </div>
                )}

                {result.type === 'location' && (
                  <>
                    <div className='flex justify-between items-start'>
                      <div>
                        <h3 className='font-medium text-gray-900'>
                          {result.name}
                        </h3>
                        <p className='text-xs text-gray-500 mt-1'>
                          {result.address}
                        </p>
                      </div>
                      <span className='text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full'>
                        {result.distance}
                      </span>
                    </div>
                    <p className='text-sm text-gray-600 mt-2'>
                      {result.games} upcoming games
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className='bg-white p-8 rounded-lg text-center shadow-sm mb-16'>
            <div className='w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-100'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-8 w-8 text-gray-400'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={1.5}
                  d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
            <p className='text-gray-600 mb-4'>No results found</p>
            <p className='text-gray-500 text-sm'>
              Try adjusting your search or filters to find what you're looking
              for.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
