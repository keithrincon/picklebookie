import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { FirebaseProvider } from './context/FirebaseContext'; // Import FirebaseProvider
import './index.css';

import Navbar from './components/shared/Navbar.jsx'; // Updated import
import NotificationComponent from './components/notifications/NotificationComponent.jsx'; // Updated import
import CreatePost from './components/posts/CreatePost.jsx'; // Updated import
import PostFeed from './components/posts/PostFeed.jsx'; // Updated import
import NotifyButton from './components/notifications/NotifyButton.jsx'; // Updated import

function App() {
  return (
    <AuthProvider>
      <FirebaseProvider>
        {' '}
        {/* Wrap with FirebaseProvider */}
        <div className='min-h-screen bg-gray-100 flex flex-col'>
          <Navbar />
          <NotificationComponent />
          <header className='bg-blue-600 text-white p-4 shadow-md'>
            <h1 className='text-3xl font-bold'>Picklebookie</h1>
          </header>
          <main className='flex-1 p-4'>
            <p className='text-gray-700'>Welcome to Picklebookie!</p>
            <NotifyButton />
            <CreatePost />
            <PostFeed />
          </main>
        </div>
      </FirebaseProvider>
    </AuthProvider>
  );
}

export default App;
