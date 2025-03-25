import React, { createContext, useState, useContext, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from './AuthContext';

const PostsContext = createContext();

export const usePosts = () => useContext(PostsContext);

export const PostsProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const { user } = useAuth();

  // Get user location
  useEffect(() => {
    const getLocation = async () => {
      try {
        if (navigator.geolocation) {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        }
      } catch (err) {
        console.log('Using location services disabled');
        setUserLocation(null);
      }
    };

    getLocation();
  }, []);

  // Calculate distance between two coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
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
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const postsQuery = query(collection(db, 'posts'), orderBy('date', 'asc'));

    const unsubscribe = onSnapshot(
      postsQuery,
      (querySnapshot) => {
        try {
          const postsList = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            const distance =
              userLocation && data.latitude
                ? calculateDistance(
                    userLocation.lat,
                    userLocation.lng,
                    data.latitude,
                    data.longitude
                  )
                : null;

            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate() || new Date(),
              distance: distance ? parseFloat(distance.toFixed(1)) : null,
              isNearby: distance ? distance <= 10 : false,
            };
          });

          // Sort posts: nearby first, then others
          const sortedPosts = [...postsList].sort((a, b) => {
            if (a.isNearby && !b.isNearby) return -1;
            if (!a.isNearby && b.isNearby) return 1;
            return new Date(a.date) - new Date(b.date);
          });

          setPosts(sortedPosts);
        } catch (err) {
          setError('Error loading posts');
          console.error(err);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError('Failed to load posts');
        setLoading(false);
        console.error(err);
      }
    );

    return () => unsubscribe();
  }, [user, userLocation]);

  return (
    <PostsContext.Provider
      value={{
        posts,
        loading,
        error,
        userLocation,
        locationEnabled: !!userLocation,
      }}
    >
      {children}
    </PostsContext.Provider>
  );
};
