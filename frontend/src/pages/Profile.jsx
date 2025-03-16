import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  orderBy,
} from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import FollowButton from '../components/profile/FollowButton';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Fetch user data
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUser({ id: userSnap.id, ...userSnap.data() });
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
        const followersQuery = query(
          collection(db, 'followers'),
          where('followingId', '==', userId)
        );
        const followersSnapshot = await getDocs(followersQuery);
        setFollowers(
          followersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );

        // Fetch following
        const followingQuery = query(
          collection(db, 'followers'),
          where('followerId', '==', userId)
        );
        const followingSnapshot = await getDocs(followingQuery);
        setFollowing(
          followingSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId]);

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        'Are you sure you want to delete your account? This action cannot be undone.'
      )
    ) {
      try {
        // Delete user posts
        const postsQuery = query(
          collection(db, 'posts'),
          where('userId', '==', userId)
        );
        const postsSnapshot = await getDocs(postsQuery);
        const postDeletions = postsSnapshot.docs.map((postDoc) =>
          deleteDoc(doc(db, 'posts', postDoc.id))
        );
        await Promise.all(postDeletions);

        // Delete user followers relationships
        const followersQuery = query(
          collection(db, 'followers'),
          where('followingId', '==', userId)
        );
        const followersSnapshot = await getDocs(followersQuery);
        const followerDeletions = followersSnapshot.docs.map((followerDoc) =>
          deleteDoc(doc(db, 'followers', followerDoc.id))
        );

        // Delete user following relationships
        const followingQuery = query(
          collection(db, 'followers'),
          where('followerId', '==', userId)
        );
        const followingSnapshot = await getDocs(followingQuery);
        const followingDeletions = followingSnapshot.docs.map((followingDoc) =>
          deleteDoc(doc(db, 'followers', followingDoc.id))
        );

        await Promise.all([...followerDeletions, ...followingDeletions]);

        // Delete user document
        await deleteDoc(doc(db, 'users', userId));

        // Delete user from Firebase Authentication
        await deleteUser(auth.currentUser);

        // Redirect to home page after deletion
        navigate('/');
      } catch (error) {
        console.error('Error deleting account:', error);
        alert(
          'Failed to delete account. You may need to reauthenticate before deleting your account.'
        );
      }
    }
  };

  // Function to format the date and time
  const formatDateTime = (timestamp) => {
    const date =
      timestamp instanceof Date
        ? timestamp
        : new Date(timestamp.seconds * 1000);

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600'></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-100 p-4'>
      <div className='max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md'>
        <div className='flex justify-between items-start'>
          <div>
            <h2 className='text-2xl font-bold'>{user?.name || 'User'}</h2>
            {user?.email && <p className='text-gray-600'>{user.email}</p>}
            {user?.createdAt && (
              <p className='text-sm text-gray-500'>
                Member since: {formatDateTime(user.createdAt)}
              </p>
            )}
          </div>
          {currentUser && currentUser.uid === userId && (
            <button
              onClick={handleDeleteAccount}
              className='bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700'
            >
              Delete Account
            </button>
          )}
        </div>

        <div className='flex mt-4 space-x-6'>
          <div>
            <span className='font-bold'>{posts.length}</span> posts
          </div>
          <div>
            <span className='font-bold'>{followers.length}</span> followers
          </div>
          <div>
            <span className='font-bold'>{following.length}</span> following
          </div>
        </div>

        <FollowButton userId={userId} />

        <div className='mt-4'>
          <h3 className='text-xl font-bold mb-4'>Posts</h3>
          {posts.length > 0 ? (
            <div className='space-y-4'>
              {posts.map((post) => (
                <div
                  key={post.id}
                  className='bg-white p-6 rounded-lg shadow-md'
                >
                  <div className='flex items-center space-x-4 mb-4'>
                    <span className='text-green-600 font-medium'>
                      {post.userName || 'Unknown User'}
                    </span>
                    <span className='text-sm text-gray-500'>
                      Posted: {formatDateTime(post.createdAt)}
                    </span>
                  </div>
                  <div className='space-y-2'>
                    <p>
                      <strong className='text-green-600'>Time:</strong>{' '}
                      {post.time}
                    </p>
                    <p>
                      <strong className='text-green-600'>Location:</strong>{' '}
                      {post.location}
                    </p>
                    <p>
                      <strong className='text-green-600'>Game Type:</strong>{' '}
                      {post.type}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className='text-gray-500'>No posts yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
