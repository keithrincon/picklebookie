// 1. Create a new context file: src/context/PostsContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { db } from '../firebase/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';

const PostsContext = createContext();

export const usePosts = () => useContext(PostsContext);

export const PostsProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  // Function to force refresh posts
  const refreshPosts = () => {
    setLastRefresh(Date.now());
  };

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
          return {
            id: doc.id,
            ...data,
            createdAt:
              data.createdAt instanceof Timestamp
                ? data.createdAt.toDate()
                : new Date(data.createdAt),
          };
        });

        // Sort posts client-side
        postsList.sort((a, b) => {
          // First by date (ascending)
          const dateComparison = a.date.localeCompare(b.date);
          if (dateComparison !== 0) return dateComparison;

          // Then by createdAt (descending)
          return b.createdAt - a.createdAt;
        });

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
  }, [lastRefresh]);

  const value = {
    posts,
    loading,
    error,
    refreshPosts,
  };

  return (
    <PostsContext.Provider value={value}>{children}</PostsContext.Provider>
  );
};
