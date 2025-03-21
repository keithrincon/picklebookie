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

    console.log('Fetching posts from Firestore...'); // Debug log

    // Set up a real-time listener
    const unsubscribe = onSnapshot(
      postsQuery,
      (querySnapshot) => {
        console.log('Firestore query snapshot:', querySnapshot); // Debug log

        const postsList = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          console.log('Fetched post:', data); // Debug log

          // Handle missing or invalid createdAt field
          let createdAt;
          if (data.createdAt instanceof Timestamp) {
            createdAt = data.createdAt.toDate();
          } else if (data.createdAt) {
            createdAt = new Date(data.createdAt);
          } else {
            console.warn('Post is missing createdAt field:', doc.id); // Debug log
            createdAt = new Date(); // Fallback to current date
          }

          // Handle missing or invalid date field
          let date;
          if (data.date) {
            date = data.date; // Use the string value directly
          } else {
            console.warn('Post is missing date field:', doc.id); // Debug log
            date = new Date().toISOString().split('T')[0]; // Fallback to current date
          }

          return {
            id: doc.id,
            ...data,
            createdAt,
            date,
          };
        });

        console.log('All posts:', postsList); // Debug log
        setPosts(postsList);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching posts:', err); // Debug log
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
