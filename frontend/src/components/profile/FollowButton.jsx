import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import {
  followUser,
  unfollowUser,
  isFollowing as checkIsFollowing,
} from '../../firebase/followUser';

const FollowButton = ({ userId, onFollowStatusChange }) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check follow status on component mount or when user/userId changes
  const checkFollowStatus = useCallback(async () => {
    if (!user || !userId) return;

    try {
      setLoading(true);
      // Fixed parameter order - currentUserId, targetUserId
      const following = await checkIsFollowing(user.uid, userId);
      setIsFollowing(following);
    } catch (error) {
      console.error('Error checking follow status:', error);
      toast.error('Failed to check follow status');
    } finally {
      setLoading(false);
    }
  }, [user, userId]);

  useEffect(() => {
    checkFollowStatus();
  }, [checkFollowStatus]);

  // Handle follow action
  const handleFollow = async () => {
    if (!user) {
      toast.error('You must be logged in to follow users');
      return;
    }

    try {
      setLoading(true);
      // Fixed parameter order - currentUserId, targetUserId
      await followUser(user.uid, userId);
      setIsFollowing(true);
      toast.success('Followed successfully!');

      // Notify parent component about the follow status change
      if (onFollowStatusChange) {
        onFollowStatusChange(true);
      }
    } catch (error) {
      console.error('Error following user:', error);
      toast.error('Failed to follow user');
    } finally {
      setLoading(false);
    }
  };

  // Handle unfollow action
  const handleUnfollow = async () => {
    if (!user) return;

    try {
      setLoading(true);
      // Fixed parameter order - currentUserId, targetUserId
      await unfollowUser(user.uid, userId);
      setIsFollowing(false);
      toast.success('Unfollowed successfully!');

      // Notify parent component about the follow status change
      if (onFollowStatusChange) {
        onFollowStatusChange(false);
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
      toast.error('Failed to unfollow user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={isFollowing ? handleUnfollow : handleFollow}
      disabled={loading}
      className={`w-full px-4 py-2 rounded transition-colors ${
        isFollowing
          ? 'bg-red-600 hover:bg-red-700 text-white'
          : 'bg-green-600 hover:bg-green-700 text-white'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? 'Loading...' : isFollowing ? 'Unfollow' : 'Follow'}
    </button>
  );
};

export default FollowButton;
