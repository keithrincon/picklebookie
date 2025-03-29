import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase/config';
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy,
} from 'firebase/firestore';

const PostsContext = createContext();

export const usePosts = () => useContext(PostsContext);

export const PostsProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState('pending'); // 'granted', 'denied', 'pending'

  // Fetch posts from Firestore
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);

        // Create a date for today at midnight
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Query posts with date today or in the future
        const postsQuery = query(
          collection(db, 'posts'),
          where('date', '>=', today.toISOString().split('T')[0]),
          orderBy('date', 'asc')
        );

        const snapshot = await getDocs(postsQuery);

        const fetchedPosts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt:
            doc.data().createdAt instanceof Timestamp
              ? doc.data().createdAt.toDate()
              : new Date(doc.data().createdAt),
        }));

        setPosts(fetchedPosts);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load games. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Check for stored location permission
  useEffect(() => {
    const storedPermission = localStorage.getItem('locationPermission');
    if (storedPermission) {
      setLocationPermission(storedPermission);

      // If permission was previously granted, get location
      if (storedPermission === 'granted') {
        getCurrentLocation();
      }
    }
  }, []);

  // Function to get current user location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        // Success callback
        (position) => {
          const userCoords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setUserLocation(userCoords);
          setLocationPermission('granted');
          localStorage.setItem('locationPermission', 'granted');
        },
        // Error callback
        (error) => {
          console.error('Error getting location:', error);
          setLocationPermission('denied');
          localStorage.setItem('locationPermission', 'denied');
        },
        // Options
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 600000 }
      );
    } else {
      console.error('Geolocation is not supported by this browser');
      setLocationPermission('unsupported');
    }
  };

  // Function to handle location access request
  const requestLocationAccess = () => {
    getCurrentLocation();
  };

  // Clear location permission (for testing or user request)
  const clearLocationPermission = () => {
    localStorage.removeItem('locationPermission');
    setLocationPermission('pending');
    setUserLocation(null);
  };

  return (
    <PostsContext.Provider
      value={{
        posts,
        loading,
        error,
        userLocation,
        locationPermission,
        requestLocationAccess,
        clearLocationPermission,
      }}
    >
      {children}
    </PostsContext.Provider>
  );
};
