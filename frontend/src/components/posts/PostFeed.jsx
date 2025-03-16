import React, { useEffect, useState } from 'react';
import { db } from '../../firebase/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const PostFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Fetch posts ordered by createdAt (newest first)
        const postsQuery = query(
          collection(db, 'posts'),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(postsQuery);
        const postsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPosts(postsList);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError('Failed to load posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Function to format the date and time
  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp.seconds * 1000); // Convert Firestore timestamp to JavaScript Date

    // Format the date (e.g., "March 11, 2025")
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Format the time (e.g., "5:34 PM")
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

    // Combine date and time (e.g., "March 11, 2025 at 5:34 PM")
    return `${formattedDate} at ${formattedTime}`;
  };

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
      {posts.length > 0 ? (
        posts.map((post) => (
          <div key={post.id} className='bg-white p-6 rounded-lg shadow-md'>
            <div className='flex items-center space-x-4 mb-4'>
              <Link
                to={`/profile/${post.userId}`}
                className='text-green-600 hover:underline font-medium'
              >
                {post.userName || 'Unknown User'}
              </Link>
              <span className='text-sm text-gray-500'>
                Posted: {formatDateTime(post.createdAt)}
              </span>
            </div>
            <div className='space-y-2'>
              <p>
                <strong className='text-green-600'>Time:</strong> {post.time}
              </p>
              <p>
                <strong className='text-green-600'>Location:</strong>{' '}
                {post.location}
              </p>
              <p>
                <strong className='text-green-600'>Game Type:</strong>{' '}
                {post.type}
              </p>
            </div>
          </div>
        ))
      ) : (
        <div className='text-center text-gray-500 py-6'>
          <p>No posts available.</p>
          <Link to='/create-post' className='text-green-600 hover:underline'>
            Be the first to create a post!
          </Link>
        </div>
      )}
    </div>
  );
};

export default PostFeed;
