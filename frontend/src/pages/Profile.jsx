import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  orderBy,
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import FollowButton from '../components/profile/FollowButton';

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  // Function to fetch followers data
  const fetchFollowers = useCallback(async () => {
    try {
      const followersQuery = query(
        collection(db, 'followers'),
        where('followingId', '==', userId)
      );
      const followersSnapshot = await getDocs(followersQuery);
      const followersData = followersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Get latest follower count from user document
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        // Use the counter from the document, fallback to array length
        setFollowerCount(userData.followerCount ?? followersData.length);
      }
    } catch (error) {
      console.error('Error fetching followers:', error);
    }
  }, [userId]);

  // Function to fetch following data
  const fetchFollowing = useCallback(async () => {
    try {
      const followingQuery = query(
        collection(db, 'followers'),
        where('followerId', '==', userId)
      );
      const followingSnapshot = await getDocs(followingQuery);
      const followingData = followingSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Get latest following count from user document
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        // Use the counter from the document, fallback to array length
        setFollowingCount(userData.followingCount ?? followingData.length);
      }
    } catch (error) {
      console.error('Error fetching following:', error);
    }
  }, [userId]);

  // Fetch profile data
  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch user data
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        console.log('User data:', userSnap.data());
        const userData = userSnap.data();
        setUser({ id: userSnap.id, ...userData });

        // Initialize counts from user document if available
        if (userData.followerCount !== undefined) {
          setFollowerCount(userData.followerCount);
        }

        if (userData.followingCount !== undefined) {
          setFollowingCount(userData.followingCount);
        }
      } else {
        console.log('User not found in Firestore');
      }

      // Fetch user posts
      const postsQuery = query(
        collection(db, 'posts'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const postsSnapshot = await getDocs(postsQuery);
      setPosts(
        postsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );

      // Fetch followers
      await fetchFollowers();

      // Fetch following
      await fetchFollowing();
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, fetchFollowers, fetchFollowing]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  // Handle follow status change
  const handleFollowStatusChange = useCallback(
    async (isNowFollowing) => {
      // Re-fetch followers when follow status changes
      await fetchFollowers();

      // If the current user is viewing their own profile and they followed/unfollowed someone
      // we should also update their following count
      if (currentUser && currentUser.uid === userId) {
        await fetchFollowing();
      }
    },
    [fetchFollowers, fetchFollowing, currentUser, userId]
  );

  if (loading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <div className='animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600'></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-100'>
      {/* Header with user info */}
      <div className='bg-white shadow'>
        <div className='max-w-5xl mx-auto px-4 py-8'>
          <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-6'>
            <div className='flex items-center gap-5'>
              <div className='bg-green-600 text-white text-2xl font-bold h-20 w-20 rounded-full flex items-center justify-center'>
                {user?.name?.charAt(0) || '?'}
              </div>
              <div>
                <h1 className='text-3xl font-bold'>{user?.name || 'User'}</h1>
                {user?.email && <p className='text-gray-600'>{user.email}</p>}
              </div>
            </div>
            <div className='flex gap-3 w-full md:w-auto'>
              {currentUser && currentUser.uid === userId ? (
                <button
                  onClick={() => navigate('/settings')}
                  className='w-full bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded transition'
                >
                  Delete Account
                </button>
              ) : (
                currentUser && (
                  <div className='w-full'>
                    <FollowButton
                      userId={userId}
                      onFollowStatusChange={handleFollowStatusChange}
                    />
                  </div>
                )
              )}
            </div>
          </div>

          {/* Stats */}
          <div className='flex justify-around md:justify-start md:gap-16 mt-8 border-t border-gray-200 pt-5'>
            <div className='text-center md:text-left'>
              <p className='text-2xl font-bold'>{posts.length}</p>
              <p className='text-gray-600'>Posts</p>
            </div>
            <div className='text-center md:text-left'>
              <p className='text-2xl font-bold'>{followerCount}</p>
              <p className='text-gray-600'>Followers</p>
            </div>
            <div className='text-center md:text-left'>
              <p className='text-2xl font-bold'>{followingCount}</p>
              <p className='text-gray-600'>Following</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='max-w-5xl mx-auto px-4 py-6'>
        <div className='bg-white rounded-lg p-6 shadow-sm'>
          <h2 className='text-xl font-bold mb-4'>Posts</h2>
          {posts.length > 0 ? (
            posts.map((post) => (
              <div
                key={post.id}
                className='bg-white p-5 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow mb-4'
              >
                <div className='flex justify-between items-center mb-4'>
                  <span className='text-green-600 font-medium text-lg'>
                    {post.userName || 'Unknown User'}
                  </span>
                  <span className='text-sm text-gray-500'>
                    {new Date(
                      post.createdAt?.seconds * 1000
                    ).toLocaleDateString()}
                  </span>
                </div>
                <div className='grid md:grid-cols-3 gap-4 border-t border-gray-100 pt-4'>
                  <div className='bg-green-50 p-3 rounded'>
                    <p className='text-sm text-gray-500 mb-1'>Time</p>
                    <p className='font-medium'>{post.time}</p>
                  </div>
                  <div className='bg-green-50 p-3 rounded'>
                    <p className='text-sm text-gray-500 mb-1'>Location</p>
                    <p className='font-medium'>{post.location}</p>
                  </div>
                  <div className='bg-green-50 p-3 rounded'>
                    <p className='text-sm text-gray-500 mb-1'>Game Type</p>
                    <p className='font-medium'>{post.type}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className='text-center py-8'>
              <p className='text-gray-500'>No posts yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
