import React from 'react';
import CreatePost from '../components/posts/CreatePost';
import PostFeed from '../components/posts/PostFeed';

const Home = () => {
  return (
    <div>
      <header className='bg-pickle-green text-white p-4 shadow-md'>
        <h1 className='font-poppins text-3xl font-bold'>Picklebookie</h1>
      </header>
      <div className='space-y-8 p-4'>
        <CreatePost />
        <PostFeed />
      </div>
    </div>
  );
};

export default Home;
