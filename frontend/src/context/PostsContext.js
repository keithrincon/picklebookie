import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from 'react';
import { db } from '../firebase/config';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
} from 'firebase/firestore';
import { useAuth } from './AuthContext';

const PostsContext = createContext();

export const usePosts = () => useContext(PostsContext);

export const PostsProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationRequested, setLocationRequested] = useState(false);
  const { user } = useAuth();

  // Calculate distance between two coordinates - memoized for performance
  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lat2) return null;
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
  }, []);

  // Request location access explicitly (call this method on a button click)
  const requestLocationAccess = useCallback(() => {
    setLocationRequested(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Location access denied or error:', error.message);
          setUserLocation(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
      );
    } else {
      console.log('Geolocation not supported by this browser');
    }
  }, []);

  // Only request location after user interaction or mount if previously allowed
  useEffect(() => {
    // Check if location was previously granted
    const locationPreference = localStorage.getItem('locationPermission');

    if (locationPreference === 'granted') {
      requestLocationAccess();
    }
    // Don't automatically request location if not previously granted
  }, [requestLocationAccess]);

  // Process posts data with location information
  const processPostsWithLocation = useCallback(
    (postsData) => {
      return postsData.map((post) => {
        const distance =
          userLocation && post.latitude
            ? calculateDistance(
                userLocation.lat,
                userLocation.lng,
                post.latitude,
                post.longitude
              )
            : null;

        return {
          ...post,
          distance: distance ? parseFloat(distance.toFixed(1)) : null,
          isNearby: distance ? distance <= 10 : false,
        };
      });
    },
    [userLocation, calculateDistance]
  );

  // Fetch posts with better error handling
  useEffect(() => {
    if (!user) {
      setPosts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Query posts that are current or in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const postsQuery = query(
        collection(db, 'posts'),
        where('date', '>=', today.toISOString().split('T')[0]),
        orderBy('date', 'asc')
      );

      const unsubscribe = onSnapshot(
        postsQuery,
        (querySnapshot) => {
          try {
            const postsList = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate() || new Date(),
            }));

            // Apply location processing
            const processedPosts = processPostsWithLocation(postsList);

            // Sort: nearby posts first, then by date
            const sortedPosts = [...processedPosts].sort((a, b) => {
              if (a.isNearby && !b.isNearby) return -1;
              if (!a.isNearby && b.isNearby) return 1;
              return new Date(a.date) - new Date(b.date);
            });

            setPosts(sortedPosts);
            setLoading(false);
          } catch (err) {
            console.error('Error processing posts data:', err);
            setError('Error processing posts data');
            setLoading(false);
          }
        },
        (err) => {
          console.error('Firebase query error:', err);
          setError(`Failed to load posts: ${err.message}`);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error('Posts context setup error:', err);
      setError('Error setting up posts listener');
      setLoading(false);
      return () => {}; // Return empty cleanup function
    }
  }, [user, processPostsWithLocation]);

  // Update posts when location changes
  useEffect(() => {
    if (posts.length > 0 && userLocation) {
      const updatedPosts = processPostsWithLocation(posts);
      setPosts(updatedPosts);
    }
  }, [userLocation, processPostsWithLocation, posts]);

  // Save location preference when it's granted
  useEffect(() => {
    if (userLocation && locationRequested) {
      localStorage.setItem('locationPermission', 'granted');
    }
  }, [userLocation, locationRequested]);

  return (
    <PostsContext.Provider
      value={{
        posts,
        loading,
        error,
        userLocation,
        locationEnabled: !!userLocation,
        requestLocationAccess, // Expose this method for user interaction
      }}
    >
      {children}
    </PostsContext.Provider>
  );
};

export default PostsProvider;
