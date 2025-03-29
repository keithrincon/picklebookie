// src/pages/Explore.jsx
import React from 'react';
import EnhancedSearchBar from '../components/search/EnhancedSearchBar';

const Explore = () => {
  return (
    <div className='flex flex-col min-h-screen bg-off-white'>
      <EnhancedSearchBar placeholder='Explore players, locations, events...' />

      <div className='p-4'>
        <h1 className='text-2xl font-bold text-pickle-green mb-4'>Explore</h1>

        {/* Nearby section */}
        <section className='mb-6'>
          <h2 className='text-lg font-semibold text-gray-800 mb-3'>
            Nearby Games
          </h2>
          <div className='bg-gray-100 rounded-lg p-8 text-center text-gray-500'>
            <p>Map view coming soon!</p>
            <p className='text-sm mt-2'>Find games happening near you</p>
          </div>
        </section>

        {/* Popular locations */}
        <section className='mb-6'>
          <h2 className='text-lg font-semibold text-gray-800 mb-3'>
            Popular Locations
          </h2>
          <div className='grid grid-cols-2 gap-3'>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className='bg-white rounded-lg shadow p-3'>
                <div className='bg-gray-200 h-24 rounded mb-2'></div>
                <p className='font-medium'>Enterprise Park</p>
                <p className='text-xs text-gray-500'>Redding, CA</p>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming tournaments */}
        <section>
          <h2 className='text-lg font-semibold text-gray-800 mb-3'>
            Upcoming Tournaments
          </h2>
          <div className='space-y-3'>
            {[1, 2].map((i) => (
              <div key={i} className='bg-white rounded-lg shadow p-4'>
                <span className='inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full mb-2'>
                  Tournament
                </span>
                <h3 className='font-medium'>Summer Smash Tournament</h3>
                <p className='text-xs text-gray-500 mb-2'>
                  July 15, 2023 • Enterprise Park
                </p>
                <div className='flex justify-between'>
                  <span className='text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded'>
                    12 spots left
                  </span>
                  <button className='text-xs text-pickle-green hover:underline'>
                    View details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Explore;
