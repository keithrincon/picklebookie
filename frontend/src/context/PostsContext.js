import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useRef,
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

  // Flag to track if location update has been processed
  const locationUpdateProcessed = useRef(false);

  // Calculate distance between two coordinates (memoized)
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

  // Process posts with location data (memoized)
  const processPostsWithLocation = useCallback(
    (postsData) => {
      if (!userLocation) return postsData;

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

  // Request location access explicitly
  const requestLocationAccess = useCallback(() => {
    setLocationRequested(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          localStorage.setItem('locationPermission', 'granted');
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

  // Check for previously granted location permission
  useEffect(() => {
    const locationPreference = localStorage.getItem('locationPermission');
    if (locationPreference === 'granted') {
      const timer = setTimeout(() => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setUserLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
            },
            (error) => {
              console.log('Location error:', error.message);
            }
          );
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Fetch posts from Firestore
  useEffect(() => {
    if (!user) {
      setPosts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
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

            const processedPosts = processPostsWithLocation(postsList);
            const sortedPosts = [...processedPosts].sort((a, b) => {
              if (a.isNearby && !b.isNearby) return -1;
              if (!a.isNearby && b.isNearby) return 1;
              return new Date(a.date) - new Date(b.date);
            });

            setPosts(sortedPosts);
            setLoading(false);
            locationUpdateProcessed.current = false;
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
      return () => {};
    }
  }, [user, processPostsWithLocation]);

  // Handle location changes (now with proper dependencies)
  useEffect(() => {
    if (userLocation && posts.length > 0 && !locationUpdateProcessed.current) {
      locationUpdateProcessed.current = true;
      const updatedPosts = processPostsWithLocation(posts);

      const hasChanges = updatedPosts.some(
        (post, index) =>
          post.distance !== posts[index].distance ||
          post.isNearby !== posts[index].isNearby
      );

      if (hasChanges) {
        setPosts(updatedPosts);
      }
    }
  }, [userLocation, posts, processPostsWithLocation]);

  // Save location preference
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
        requestLocationAccess,
      }}
    >
      {children}
    </PostsContext.Provider>
  );
};

export default PostsProvider;
