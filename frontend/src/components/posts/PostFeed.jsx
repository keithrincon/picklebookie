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
    return <p className='text-center py-4'>Loading posts...</p>;
  }

  if (error) {
    return <p className='text-center text-red-600 py-4'>{error}</p>;
  }

  return (
    <div className='space-y-4'>
      {posts.length > 0 ? (
        posts.map((post) => (
          <div key={post.id} className='bg-white p-4 rounded shadow'>
            <Link
              to={`/profile/${post.userId}`}
              className='text-blue-600 hover:underline'
            >
              View Profile
            </Link>
            <p>
              <strong>Time:</strong> {post.time}
            </p>
            <p>
              <strong>Location:</strong> {post.location}
            </p>
            <p>
              <strong>Game Type:</strong> {post.type}
            </p>
            {post.createdAt && (
              <p>
                <strong>Posted:</strong> {formatDateTime(post.createdAt)}
              </p>
            )}
          </div>
        ))
      ) : (
        <p className='text-center text-gray-500'>No posts available</p>
      )}
    </div>
  );
};

export default PostFeed;
