import React from 'react';
import Navbar from './components/Navbar';
import './index.css';
import CreatePost from './components/CreatePost';
import PostFeed from './components/PostFeed';

function App() {
  return (
    <div className='min-h-screen bg-gray-100 flex flex-col'>
      <Navbar />
      <header className='bg-blue-600 text-white p-4 shadow-md'>
        <h1 className='text-3xl font-bold'>Picklebookie</h1>
      </header>
      <main className='flex-1 p-4'>
        <p className='text-gray-700'>Welcome to Picklebookie!</p>
        <CreatePost />
        <PostFeed />
      </main>
    </div>
  );
}

export default App;
