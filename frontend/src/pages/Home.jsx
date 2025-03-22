import React, { useState } from 'react';
import CreatePost from '../components/posts/CreatePost';
import PostFeed from '../components/posts/PostFeed';

const Home = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const toggleCreateForm = () => {
    setShowCreateForm(!showCreateForm);
  };

  return (
    <div className='flex flex-col min-h-screen bg-off-white overflow-y-auto'>
      {/* Hero Section */}
      <div className='bg-gradient-to-r from-pickle-green to-court-blue text-white py-12 md:py-16 shadow-lg'>
        <div className='container mx-auto px-4 md:px-6 lg:px-8'>
          <div className='max-w-3xl mx-auto text-center'>
            <h1 className='font-poppins text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight'>
              Welcome to Picklebookie
            </h1>
            <p className='font-poppins text-lg md:text-xl opacity-90 leading-relaxed mb-8'>
              Your go-to platform for scheduling and sharing pickleball games.
              Post your game details, connect with other players, and never miss
              a match!
            </p>
            {/* Enhanced CTA Button with icon */}
            <button
              onClick={toggleCreateForm}
              className='px-8 py-3 bg-white text-pickle-green font-semibold rounded-lg shadow-lg 
              hover:bg-gray-100 hover:scale-105 transition-all duration-300 
              focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 
              focus:ring-offset-pickle-green flex items-center justify-center gap-2'
            >
              {showCreateForm ? (
                <>
                  <span>View All Games</span>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-5 w-5'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path d='M10 12a2 2 0 100-4 2 2 0 000 4z' />
                    <path
                      fillRule='evenodd'
                      d='M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z'
                      clipRule='evenodd'
                    />
                  </svg>
                </>
              ) : (
                <>
                  <span>Schedule a Game</span>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-5 w-5'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path
                      fillRule='evenodd'
                      d='M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z'
                      clipRule='evenodd'
                    />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Added overflow-y-auto to ensure content is scrollable */}
      <div className='container mx-auto px-4 md:px-6 lg:px-8 py-8 flex-1 overflow-y-auto'>
        {/* Content Layout */}
        <div className='flex flex-col gap-8'>
          {/* Create Post Section */}
          {showCreateForm && (
            <div className={showCreateForm ? 'block' : 'hidden'}>
              <div className='max-w-2xl mx-auto'>
                <CreatePost />

                {/* Quick Tips Box */}
                <div className='mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6'>
                  <h3 className='font-medium text-blue-800 mb-4'>Quick Tips</h3>
                  <ul className='text-blue-700 text-sm space-y-2'>
                    <li>• Schedule games up to 3 months in advance</li>
                    <li>• Include your skill level in the description</li>
                    <li>• Check the feed regularly for new games</li>
                    <li>• Be clear about the location details</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Post Feed Section */}
          <div className={showCreateForm ? 'hidden' : 'block'}>
            <div className='max-w-6xl mx-auto'>
              <h2 className='text-2xl font-semibold text-pickle-green mb-6 font-poppins'>
                Available Games
              </h2>
              <PostFeed />
            </div>
          </div>
        </div>

        {/* Game Stats Section */}
        <div className='mt-12 py-8 border-t border-gray-200'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-center'>
              <h3 className='text-2xl font-bold text-pickle-green mb-4'>
                Find Games
              </h3>
              <p className='text-gray-600'>
                Browse and filter upcoming pickleball games in your area
              </p>
            </div>
            <div className='bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-center'>
              <h3 className='text-2xl font-bold text-pickle-green mb-4'>
                Schedule Games
              </h3>
              <p className='text-gray-600'>
                Create and share your own pickleball game sessions
              </p>
            </div>
            <div className='bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-center'>
              <h3 className='text-2xl font-bold text-pickle-green mb-4'>
                Connect
              </h3>
              <p className='text-gray-600'>
                Meet other players and build your pickleball network
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
