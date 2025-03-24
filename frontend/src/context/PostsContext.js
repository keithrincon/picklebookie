import React, { createContext, useState, useContext, useEffect } from 'react';
import { db } from '../firebase/firebase';
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
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Location access denied, using default radius');
          setUserLocation(null);
        }
      );
    }
  }, []);

  // Calculate distance between two coordinates (Haversine formula)
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
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate() || new Date(),
              distance: userLocation
                ? calculateDistance(
                    userLocation.lat,
                    userLocation.lng,
                    data.latitude,
                    data.longitude
                  ).toFixed(1)
                : null,
            };
          });

          // Filter posts within 10 miles if location available
          const filteredPosts = userLocation
            ? postsList.filter((post) => post.distance <= 10)
            : postsList;

          setPosts(filteredPosts);
        } catch (err) {
          setError('Error processing posts');
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
    <PostsContext.Provider value={{ posts, loading, error, userLocation }}>
      {children}
    </PostsContext.Provider>
  );
};
