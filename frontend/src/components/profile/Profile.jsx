import React, { useEffect, useState } from 'react';
import { db } from '../../firebase/firebase';
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from 'firebase/firestore';
import FollowButton from './FollowButton';

const Profile = ({ userId }) => {
  const [userPosts, setUserPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Fetch user data
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData({ id: userSnap.id, ...userSnap.data() });
        }

        // Fetch user posts
        const postsQuery = query(
          collection(db, 'posts'),
          where('userId', '==', userId)
        );
        const postsSnapshot = await getDocs(postsQuery);
        setUserPosts(
          postsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );

        // Fetch followers
        const followersQuery = query(
          collection(db, 'followers'),
          where('followingId', '==', userId)
        );
        const followersSnapshot = await getDocs(followersQuery);
        setFollowers(
          followersSnapshot.docs.map((doc) => doc.data().followerId)
        );

        // Fetch following
        const followingQuery = query(
          collection(db, 'followers'),
          where('followerId', '==', userId)
        );
        const followingSnapshot = await getDocs(followingQuery);
        setFollowing(
          followingSnapshot.docs.map((doc) => doc.data().followingId)
        );
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId]);

  if (loading) {
    return <div className='text-center py-4'>Loading profile...</div>;
  }

  return (
    <div className='space-y-6 max-w-2xl mx-auto p-4'>
      <div className='bg-white rounded-lg shadow p-6'>
        <div className='flex justify-between items-start'>
          <div>
            <h2 className='text-2xl font-bold'>{userData?.name || 'User'}</h2>
            {userData?.email && (
              <p className='text-gray-600'>{userData.email}</p>
            )}
            {userData?.createdAt && (
              <p className='text-sm text-gray-500'>
                Member since:{' '}
                {new Date(
                  userData.createdAt.seconds * 1000
                ).toLocaleDateString()}
              </p>
            )}
          </div>
          <FollowButton userId={userId} />
        </div>

        <div className='flex mt-4 space-x-6'>
          <div>
            <span className='font-bold'>{userPosts.length}</span> posts
          </div>
          <div>
            <span className='font-bold'>{followers.length}</span> followers
          </div>
          <div>
            <span className='font-bold'>{following.length}</span> following
          </div>
        </div>
      </div>

      <div className='bg-white rounded-lg shadow p-6'>
        <h3 className='text-xl font-bold mb-4'>Posts</h3>
        {userPosts.length > 0 ? (
          <div className='space-y-4'>
            {userPosts.map((post) => (
              <div key={post.id} className='bg-gray-50 p-4 rounded border'>
                <p>
                  <strong>Time:</strong> {post.time}
                </p>
                <p>
                  <strong>Location:</strong> {post.location}
                </p>
                <p>
                  <strong>Game Type:</strong> {post.type}
                </p>
                {post.createdAt && (
                  <p className='text-sm text-gray-500 mt-2'>
                    Posted:{' '}
                    {new Date(
                      post.createdAt.seconds * 1000
                    ).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className='text-gray-500'>No posts yet</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
