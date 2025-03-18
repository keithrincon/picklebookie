import React from 'react';
import CreatePost from '../components/posts/CreatePost';
import PostFeed from '../components/posts/PostFeed';

const Home = () => {
  return (
    <div>
      {/* Description Section */}
      <div className='bg-pickle-green text-white p-4 shadow-md'>
        <div className='container mx-auto'>
          <h1 className='font-poppins text-3xl font-bold mb-2'>
            Welcome to Picklebookie
          </h1>
          <p className='font-poppins text-lg'>
            Picklebookie is your go-to app for scheduling and sharing pickleball
            games. Post your game details, connect with other players, and never
            miss a match!
          </p>
        </div>
      </div>

      {/* Create Post and Post Feed */}
      <div className='space-y-8 p-4'>
        <CreatePost />
        <PostFeed />
      </div>
    </div>
  );
};

export default Home;
