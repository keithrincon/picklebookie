// src/pages/Home.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CreatePost from '../components/posts/CreatePost';
import PostFeed from '../components/posts/PostFeed';
import SearchSection from '../components/search/SearchSection';

const Home = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { user } = useAuth();

  const toggleCreateForm = () => {
    setShowCreateForm(!showCreateForm);
  };

  // If no user is logged in, show the landing page
  if (!user) {
    return (
      <div className='flex flex-col min-h-screen bg-off-white overflow-y-auto'>
        {/* Hero Section for Landing Page */}
        <div className='bg-gradient-to-r from-pickle-green to-court-blue text-white py-8 md:py-12 shadow-lg'>
          <div className='container mx-auto px-4 md:px-6 lg:px-8'>
            <div className='max-w-3xl mx-auto text-center'>
              <h1 className='font-poppins text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight'>
                Welcome to Picklebookie
              </h1>
              <p className='font-poppins text-lg md:text-xl opacity-90 leading-relaxed mb-6'>
                Connect with pickleball players, schedule games, and track your
                matches. The ultimate platform for pickleball enthusiasts.
              </p>

              {/* CTA Buttons */}
              <div className='flex flex-col sm:flex-row justify-center gap-4'>
                <Link
                  to='/signup'
                  className='px-8 py-3 bg-white text-pickle-green font-semibold rounded-lg shadow-lg 
                  hover:bg-gray-100 hover:scale-105 transition-all duration-300 
                  focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 
                  focus:ring-offset-pickle-green'
                >
                  Sign Up
                </Link>

                <Link
                  to='/login'
                  className='px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg
                  hover:bg-white/10 hover:scale-105 transition-all duration-300 
                  focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 
                  focus:ring-offset-pickle-green'
                >
                  Log In
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className='container mx-auto px-4 md:px-6 lg:px-8 py-8'>
          <h2 className='text-2xl font-bold text-pickle-green text-center mb-8'>
            Why join Picklebookie?
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='bg-white p-6 rounded-lg shadow-lg text-center'>
              <h3 className='text-xl font-bold text-pickle-green mb-3'>
                Find Games
              </h3>
              <p className='text-gray-600'>
                Browse and filter upcoming pickleball games in your area
              </p>
            </div>

            <div className='bg-white p-6 rounded-lg shadow-lg text-center'>
              <h3 className='text-xl font-bold text-pickle-green mb-3'>
                Schedule Games
              </h3>
              <p className='text-gray-600'>
                Create and share your own pickleball game sessions
              </p>
            </div>

            <div className='bg-white p-6 rounded-lg shadow-lg text-center'>
              <h3 className='text-xl font-bold text-pickle-green mb-3'>
                Connect
              </h3>
              <p className='text-gray-600'>
                Meet other players and build your pickleball network
              </p>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className='container mx-auto px-4 md:px-6 lg:px-8 py-8 border-t border-gray-200'>
          <h2 className='text-2xl font-bold text-pickle-green text-center mb-8'>
            How It Works
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
            <div className='text-center'>
              <div className='inline-flex items-center justify-center w-12 h-12 rounded-full bg-pickle-green text-white text-xl font-bold mb-4'>
                1
              </div>
              <h3 className='font-bold text-lg mb-2'>Sign Up</h3>
              <p className='text-gray-600'>Create your free account</p>
            </div>

            <div className='text-center'>
              <div className='inline-flex items-center justify-center w-12 h-12 rounded-full bg-pickle-green text-white text-xl font-bold mb-4'>
                2
              </div>
              <h3 className='font-bold text-lg mb-2'>Find Games</h3>
              <p className='text-gray-600'>Browse available games near you</p>
            </div>

            <div className='text-center'>
              <div className='inline-flex items-center justify-center w-12 h-12 rounded-full bg-pickle-green text-white text-xl font-bold mb-4'>
                3
              </div>
              <h3 className='font-bold text-lg mb-2'>Schedule</h3>
              <p className='text-gray-600'>
                Create your own game or join others
              </p>
            </div>

            <div className='text-center'>
              <div className='inline-flex items-center justify-center w-12 h-12 rounded-full bg-pickle-green text-white text-xl font-bold mb-4'>
                4
              </div>
              <h3 className='font-bold text-lg mb-2'>Play</h3>
              <p className='text-gray-600'>Enjoy your pickleball games!</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If user is logged in, show the main app content
  return (
    <div className='flex flex-col min-h-screen bg-gray-50 overflow-y-auto'>
      {/* Sticky search section at the top */}
      <SearchSection
        placeholder='Find pickleball games...'
        className='sticky top-14 z-30'
      />

      {/* Welcome header */}
      <div className='bg-gradient-to-r from-pickle-green to-court-blue text-white py-6 px-4'>
        <div className='max-w-2xl mx-auto text-center'>
          <h1 className='font-poppins text-2xl md:text-3xl font-bold mb-3 leading-tight'>
            Welcome back, {user.displayName || 'Pickle Player'}!
          </h1>
          <p className='font-poppins text-sm md:text-base opacity-90 leading-relaxed mb-4'>
            Ready to play some pickleball? Schedule your next game or find
            players to join!
          </p>

          {/* Schedule Game / View Games toggle button */}
          <button
            onClick={toggleCreateForm}
            className='px-6 py-2 bg-white text-pickle-green font-semibold rounded-full shadow-md 
            hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-2 mx-auto'
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

      {/* Main Content */}
      <div className='container mx-auto px-4 md:px-6 py-4 flex-1'>
        <div className='flex flex-col gap-6'>
          {/* Create Post Section */}
          {showCreateForm && (
            <div className='max-w-xl mx-auto w-full'>
              <CreatePost />

              {/* Quick Tips Box */}
              <div className='mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4'>
                <h3 className='font-medium text-blue-800 mb-2'>Quick Tips</h3>
                <ul className='text-blue-700 text-sm space-y-1'>
                  <li>• Schedule games up to 3 months in advance</li>
                  <li>• Include your skill level in the description</li>
                  <li>• Check the feed regularly for new games</li>
                  <li>• Be clear about the location details</li>
                </ul>
              </div>
            </div>
          )}

          {/* Post Feed Section */}
          {!showCreateForm && (
            <div className='max-w-2xl mx-auto w-full'>
              <h2 className='text-xl font-semibold text-pickle-green mb-4 font-poppins'>
                Available Games
              </h2>
              <PostFeed />
            </div>
          )}
        </div>
      </div>

      {/* Only show game stats section if viewing posts, not create form */}
      {!showCreateForm && (
        <div className='container mx-auto px-4 md:px-6 py-6 border-t border-gray-200 mb-16'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='bg-white p-4 rounded-lg shadow text-center'>
              <h3 className='text-lg font-bold text-pickle-green mb-2'>
                Find Games
              </h3>
              <p className='text-gray-600 text-sm'>
                Browse and filter upcoming pickleball games nearby
              </p>
            </div>
            <div className='bg-white p-4 rounded-lg shadow text-center'>
              <h3 className='text-lg font-bold text-pickle-green mb-2'>
                Schedule Games
              </h3>
              <p className='text-gray-600 text-sm'>
                Create and share your own pickleball sessions
              </p>
            </div>
            <div className='bg-white p-4 rounded-lg shadow text-center'>
              <h3 className='text-lg font-bold text-pickle-green mb-2'>
                Connect
              </h3>
              <p className='text-gray-600 text-sm'>
                Build your pickleball network
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
