// src/pages/Search.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import EnhancedSearchBar from '../components/search/EnhancedSearchBar';

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
          { id: 1, type: 'game', title: 'Doubles Game at Enterprise Park', date: 'Tomorrow, 3:00 PM' },
          { id: 2, type: 'player', name: 'Sarah Johnson', wins: 12, location: 'Redding, CA' },
          { id: 3, type: 'location', name: 'Enterprise Park', games: 5, distance: '2.3 mi' },
          { id: 4, type: 'game', title: 'Singles Practice', date: 'Saturday, 10:00 AM' }
        ]);
        setLoading(false);
      }, 1000);
    };
    
    fetchResults();
  }, [query, type]);
  
  const filteredResults = activeTab === 'all' 
    ? results 
    : results.filter(result => result.type === activeTab);
  
  return (
    <div className="flex flex-col min-h-screen bg-off-white">
      <EnhancedSearchBar placeholder="Search games, players, or locations..." />
      
      <div className="p-4">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-800">
            {query ? `Results for "${query}"` : type ? `${type.charAt(0).toUpperCase() + type.slice(1)} Games` : 'Search Results'}
          </h1>
          <p className="text-sm text-gray-500">
            {filteredResults.length} results found
          </p>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'all' 
                ? 'text-pickle-green border-b-2 border-pickle-green' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('game')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'game' 
                ? 'text-pickle-green border-b-2 border-pickle-green' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Games
          </button>
          <button
            onClick={() => setActiveTab('player')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'player' 
                ? 'text-pickle-green border-b-2 border-pickle-green' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Players
          </button>
          <button
            onClick={() => setActiveTab('location')}
            className={`px-4 py-2 text-sm font-medium ${
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
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pickle-green"></div>
          </div>
        ) : filteredResults.length > 0 ? (
          <div className="space-y-3">
            {filteredResults.map(result => (
              <div key={result.id} className="bg-white rounded-lg shadow p-4">
                {result.type === 'game' && (
                  <>
                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Game</span>
                    <h3 className="font-medium mt-1">{result.title}</h3>
                    <p className="text-sm text-gray-500">{result.date}</p>
                  </>
                )}
                
                {result.type === 'player' && (
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="ml-3">
                      <h3 className="font-medium">{result.name}</h3>
                      <p className="text-xs text-gray-500">{result.wins} wins • {result.location}</p>
                    </div>
                  </div>
                )}
                
                {result.type === 'location' && (
                  <>
                    <h3 className="font-medium">{result.name}</h3>
                    <p className="text-xs text-gray-500">{result.games} upcoming games • {result.distance}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <p className="text-gray-500">No results found</p>
          </div>
        )}
      </div>
    </div>