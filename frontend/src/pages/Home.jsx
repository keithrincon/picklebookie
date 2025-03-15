import React from 'react';
import CreatePost from '../components/posts/CreatePost';
import PostFeed from '../components/posts/PostFeed';

const Home = () => {
  return (
    <div>
      <header className='bg-blue-600 text-white p-4 shadow-md'>
        <h1 className='text-3xl font-bold'>Picklebookie</h1>
      </header>
      <div className='p-4'>
        <CreatePost />
        <PostFeed />
      </div>
    </div>
  );
};

export default Home;
