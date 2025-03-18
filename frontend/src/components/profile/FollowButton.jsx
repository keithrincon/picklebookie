import React, { useState, useEffect } from 'react';
import { doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const FollowButton = ({ userId }) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Create a composite ID for the followers document
  const followDocId = user ? `${user.uid}_${userId}` : null;

  // Check follow status on component mount or when user/userId changes
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const followDocRef = doc(db, 'followers', followDocId);
        const followDocSnap = await getDoc(followDocRef);
        setIsFollowing(followDocSnap.exists());
      } catch (error) {
        console.error('Error checking follow status:', error);
        toast.error('Failed to check follow status. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    checkFollowStatus();
  }, [user, userId, followDocId]);

  // Handle follow action
  const handleFollow = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const followDocRef = doc(db, 'followers', followDocId);
      await setDoc(followDocRef, {
        followerId: user.uid,
        followingId: userId,
        createdAt: new Date(),
      });
      setIsFollowing(true);
      toast.success('Followed successfully!');
    } catch (error) {
      console.error('Error following user:', error);
      toast.error('Failed to follow user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle unfollow action
  const handleUnfollow = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const followDocRef = doc(db, 'followers', followDocId);
      await deleteDoc(followDocRef);
      setIsFollowing(false);
      toast.success('Unfollowed successfully!');
    } catch (error) {
      console.error('Error unfollowing user:', error);
      toast.error('Failed to unfollow user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={isFollowing ? handleUnfollow : handleFollow}
      disabled={loading}
      className={`px-4 py-2 rounded transition-colors ${
        isFollowing
          ? 'bg-red-600 hover:bg-red-700 text-white'
          : 'bg-blue-600 hover:bg-blue-700 text-white'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? 'Loading...' : isFollowing ? 'Unfollow' : 'Follow'}
    </button>
  );
};

export default FollowButton;
