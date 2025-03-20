import React, { createContext, useState, useContext, useEffect } from 'react';
import { db } from '../firebase/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';

// Create a context for posts
const PostsContext = createContext();

// Custom hook to use the posts context
export const usePosts = () => useContext(PostsContext);

// Posts provider component
export const PostsProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);

    // Create a query to get posts ordered by date
    const postsQuery = query(collection(db, 'posts'), orderBy('date', 'asc'));

    // Set up a real-time listener
    const unsubscribe = onSnapshot(
      postsQuery,
      (querySnapshot) => {
        const postsList = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          console.log('Fetched post:', data); // Log each post
          return {
            id: doc.id,
            ...data,
            createdAt:
              data.createdAt instanceof Timestamp
                ? data.createdAt.toDate()
                : new Date(data.createdAt),
          };
        });

        console.log('All posts:', postsList); // Log all posts
        setPosts(postsList);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching posts:', err);
        setError('Failed to load posts. Please try again later.');
        setLoading(false);
      }
    );

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  // Value to provide to the context
  const value = {
    posts,
    loading,
    error,
  };

  return (
    <PostsContext.Provider value={value}>{children}</PostsContext.Provider>
  );
};
