import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase/config';
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy,
  limit,
} from 'firebase/firestore';
import { useAuth } from './AuthContext';

const PostsContext = createContext();

export const usePosts = () => useContext(PostsContext);

export const PostsProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState('pending'); // 'granted', 'denied', 'pending'
  const [userPreferences, setUserPreferences] = useState(null); // Added for personalization
  const { user } = useAuth(); // Added to access current user

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

  // NEW: Fetch user preferences for personalization
  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (!user) return;

      try {
        // Query userPreferences collection for the current user
        const userPrefsQuery = query(
          collection(db, 'userPreferences'),
          where('userId', '==', user.uid),
          limit(1)
        );

        const snapshot = await getDocs(userPrefsQuery);

        if (!snapshot.empty) {
          setUserPreferences(snapshot.docs[0].data());
        } else {
          // If no preferences found, set default values
          setUserPreferences({
            userId: user.uid,
            skillLevel: null,
            preferredLocations: [],
            joinedGames: [],
          });
        }
      } catch (error) {
        console.error('Error fetching user preferences:', error);
      }
    };

    fetchUserPreferences();
  }, [user]);

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

  // NEW: Filter posts based on content filter (for "For You" tab)
  const getFilteredPosts = (contentFilter) => {
    if (!contentFilter || contentFilter === 'all') {
      return posts;
    }

    // For "For You" tab, apply personalization logic
    if (contentFilter === 'forYou' && user) {
      return posts.filter((post) => {
        // If user has joined this game, include it
        const userJoined = post.joinedPlayers?.includes(user.uid);

        // Include games nearby (if location data is available)
        const isNearby =
          userLocation && post.latitude && post.longitude
            ? calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                post.latitude,
                post.longitude
              ) < 10
            : false;

        // Include games that match user's skill level (if set in preferences and in post)
        const skillMatch =
          userPreferences?.skillLevel &&
          post.skillLevel &&
          post.skillLevel === userPreferences.skillLevel;

        // Include games at preferred locations
        const locationMatch =
          userPreferences?.preferredLocations?.length > 0 &&
          userPreferences.preferredLocations.includes(post.location);

        // Include the post if any of these criteria are met
        return userJoined || isNearby || skillMatch || locationMatch;
      });
    }

    return posts;
  };

  // Helper function to calculate distance between two points (for personalization)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 0.621371; // Convert to miles
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
        userPreferences, // NEW: Exposing user preferences
        getFilteredPosts, // NEW: Exposing the filter function
      }}
    >
      {children}
    </PostsContext.Provider>
  );
};

export default PostsContext;
