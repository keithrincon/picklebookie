import React, { useState } from 'react';
import CreatePost from '../components/posts/CreatePost';
import PostFeed from '../components/posts/PostFeed';

const Home = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const toggleCreateForm = () => {
    setShowCreateForm(!showCreateForm);
  };

  return (
    <div className='flex flex-col min-h-screen bg-off-white'>
      {/* Hero Section */}
      <div className='bg-gradient-to-r from-pickle-green to-court-blue text-white py-12 md:py-16 shadow-lg'>
        <div className='container mx-auto px-4 md:px-6 lg:px-8'>
          <div className='max-w-3xl text-center'>
            <h1 className='font-poppins text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight'>
              Welcome to Picklebookie
            </h1>
            <p className='font-poppins text-lg md:text-xl opacity-90 leading-relaxed mb-8'>
              Your go-to platform for scheduling and sharing pickleball games.
              Post your game details, connect with other players, and never miss
              a match!
            </p>
            <button
              onClick={toggleCreateForm}
              className='px-8 py-3 bg-white text-pickle-green font-semibold rounded-lg shadow-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-pickle-green'
            >
              {showCreateForm ? 'View All Games' : 'Schedule a Game'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='container mx-auto px-4 md:px-6 lg:px-8 py-8 flex-1'>
        {/* Content Layout */}
        <div className='flex flex-col lg:flex-row gap-8'>
          {/* Create Post Section */}
          <div
            className={`lg:w-2/5 ${
              showCreateForm ? 'block' : 'hidden'
            } lg:block`}
          >
            <div className='sticky top-24'>
              <CreatePost />

              {/* Quick tips box */}
              <div className='mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6 hidden lg:block'>
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

          {/* Post Feed Section */}
          <div
            className={`lg:w-3/5 ${
              showCreateForm ? 'hidden' : 'block'
            } lg:block`}
          >
            <h2 className='text-2xl font-semibold text-pickle-green mb-6 font-poppins'>
              Available Games
            </h2>
            <PostFeed />
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
