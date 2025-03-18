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
import {
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
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
  const [activeTab, setActiveTab] = useState('posts');
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Fetch user data
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUser({ id: userSnap.id, ...userSnap.data() });
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
        const followersQuery = query(
          collection(db, 'followers'),
          where('followingId', '==', userId)
        );
        const followersSnapshot = await getDocs(followersQuery);

        // Filter out documents with empty followerId or followingId
        const validFollowers = followersSnapshot.docs.filter(
          (doc) => doc.data().followerId && doc.data().followingId
        );
        setFollowers(
          validFollowers.map((doc) => ({ id: doc.id, ...doc.data() }))
        );

        // Fetch following
        const followingQuery = query(
          collection(db, 'followers'),
          where('followerId', '==', userId)
        );
        const followingSnapshot = await getDocs(followingQuery);

        // Filter out documents with empty followerId or followingId
        const validFollowing = followingSnapshot.docs.filter(
          (doc) => doc.data().followerId && doc.data().followingId
        );
        setFollowing(
          validFollowing.map((doc) => ({ id: doc.id, ...doc.data() }))
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
        // Reauthenticate the user
        const credential = EmailAuthProvider.credential(
          auth.currentUser.email,
          prompt('Please enter your password to confirm account deletion:')
        );
        await reauthenticateWithCredential(auth.currentUser, credential);

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

  const renderFollowers = () => {
    return (
      <div className='space-y-4'>
        {followers.length > 0 ? (
          followers.map((follower) => (
            <div
              key={follower.id}
              className='bg-white p-4 rounded-lg shadow flex items-center justify-between'
            >
              <div className='flex items-center space-x-3'>
                <div className='bg-green-100 text-green-800 p-3 rounded-full'>
                  {follower.followerName?.charAt(0) || '?'}
                </div>
                <div>
                  <p className='font-medium'>
                    {follower.followerName || 'Unknown User'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/profile/${follower.followerId}`)}
                className='text-green-600 hover:text-green-800 underline'
              >
                View Profile
              </button>
            </div>
          ))
        ) : (
          <div className='text-center py-8'>
            <p className='text-gray-500'>No followers yet</p>
          </div>
        )}
      </div>
    );
  };

  const renderFollowing = () => {
    return (
      <div className='space-y-4'>
        {following.length > 0 ? (
          following.map((follow) => (
            <div
              key={follow.id}
              className='bg-white p-4 rounded-lg shadow flex items-center justify-between'
            >
              <div className='flex items-center space-x-3'>
                <div className='bg-green-100 text-green-800 p-3 rounded-full'>
                  {follow.followingName?.charAt(0) || '?'}
                </div>
                <div>
                  <p className='font-medium'>
                    {follow.followingName || 'Unknown User'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/profile/${follow.followingId}`)}
                className='text-green-600 hover:text-green-800 underline'
              >
                View Profile
              </button>
            </div>
          ))
        ) : (
          <div className='text-center py-8'>
            <p className='text-gray-500'>Not following anyone yet</p>
          </div>
        )}
      </div>
    );
  };

  const renderPosts = () => {
    return (
      <div className='space-y-4'>
        {posts.length > 0 ? (
          posts.map((post) => (
            <div
              key={post.id}
              className='bg-white p-5 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow'
            >
              <div className='flex justify-between items-center mb-4'>
                <span className='text-green-600 font-medium text-lg'>
                  {post.userName || 'Unknown User'}
                </span>
                <span className='text-sm text-gray-500'>
                  {formatDateTime(post.createdAt)}
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
    );
  };

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
                {user?.createdAt && (
                  <p className='text-sm text-gray-500 mt-1'>
                    Member since {formatDateTime(user.createdAt)}
                  </p>
                )}
              </div>
            </div>
            <div className='flex gap-3 w-full md:w-auto'>
              {currentUser && currentUser.uid === userId ? (
                <button
                  onClick={handleDeleteAccount}
                  className='w-full bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded transition'
                >
                  Delete Account
                </button>
              ) : (
                currentUser && (
                  <div className='w-full'>
                    <FollowButton userId={userId} />
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
              <p className='text-2xl font-bold'>{followers.length}</p>
              <p className='text-gray-600'>Followers</p>
            </div>
            <div className='text-center md:text-left'>
              <p className='text-2xl font-bold'>{following.length}</p>
              <p className='text-gray-600'>Following</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className='max-w-5xl mx-auto px-4 py-6'>
        <div className='bg-white rounded-t-lg border-b border-gray-200'>
          <div className='flex'>
            <button
              className={`flex-1 py-4 text-center font-medium ${
                activeTab === 'posts'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('posts')}
            >
              Posts
            </button>
            <button
              className={`flex-1 py-4 text-center font-medium ${
                activeTab === 'followers'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('followers')}
            >
              Followers
            </button>
            <button
              className={`flex-1 py-4 text-center font-medium ${
                activeTab === 'following'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('following')}
            >
              Following
            </button>
          </div>
        </div>

        <div className='bg-white rounded-b-lg p-6 shadow-sm mb-6'>
          {activeTab === 'posts' && renderPosts()}
          {activeTab === 'followers' && renderFollowers()}
          {activeTab === 'following' && renderFollowing()}
        </div>
      </div>
    </div>
  );
};

export default Profile;
