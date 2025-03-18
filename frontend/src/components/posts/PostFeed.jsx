import React, { useEffect, useState } from 'react';
import { db } from '../../firebase/firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

const PostFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        console.log('Fetching posts...');
        const postsQuery = query(
          collection(db, 'posts'),
          orderBy('date', 'asc')
        );
        const postsSnapshot = await getDocs(postsQuery);
        console.log('Posts snapshot:', postsSnapshot);

        if (postsSnapshot.empty) {
          console.log('No posts found.');
          setError('No posts found.');
          return;
        }

        const postsData = postsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log('Posts data:', postsData);
        setPosts(postsData);
      } catch (error) {
        console.error('Firestore Error:', error.message, error.stack);
        setError('Failed to load posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPosts();
    } else {
      setError('You must be logged in to view posts.');
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600'></div>
      </div>
    );
  }

  if (error) {
    return <p className='text-center text-red-600 py-4'>{error}</p>;
  }

  return (
    <div className='space-y-4'>
      {posts.map((post) => (
        <div key={post.id} className='border p-4 mb-4 rounded-lg shadow-md'>
          <h2 className='text-xl font-bold'>{post.description}</h2>
          <p className='text-gray-600'>{post.location}</p>
          <p className='text-gray-600'>
            {post.date} | {post.startTime} - {post.endTime}
          </p>
          <p className='text-gray-600'>Type: {post.type}</p>
          <p className='text-gray-600'>Posted by: {post.userName}</p>
        </div>
      ))}
    </div>
  );
};

export default PostFeed;
