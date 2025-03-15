// src/components/PostFeed.js
import React, { useEffect, useState } from 'react';
import { db } from '../../firebase/firebase'; // Updated import path
import { collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const PostFeed = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'posts'));
        const postsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPosts(postsList);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };
    fetchPosts();
  }, []);

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
                <strong>Created At:</strong>{' '}
                {new Date(post.createdAt.seconds * 1000).toLocaleString()}
              </p>
            )}
          </div>
        ))
      ) : (
        <p>No posts available</p>
      )}
    </div>
  );
};

export default PostFeed;
