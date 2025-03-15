import React, { useState, useEffect } from 'react';
import { db } from '../context/firebase';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const FollowButton = ({ userId }) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followDocId, setFollowDocId] = useState(null);

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!user) return;

      try {
        const q = query(
          collection(db, 'followers'),
          where('followerId', '==', user.uid),
          where('followingId', '==', userId)
        );

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setIsFollowing(true);
          setFollowDocId(querySnapshot.docs[0].id);
        }
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
    };

    checkFollowStatus();
  }, [user, userId]);

  const handleFollow = async () => {
    if (!user) return;

    try {
      const docRef = await addDoc(collection(db, 'followers'), {
        followerId: user.uid,
        followingId: userId,
      });
      setFollowDocId(docRef.id);
      setIsFollowing(true);
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleUnfollow = async () => {
    if (!user || !followDocId) return;

    try {
      await deleteDoc(doc(db, 'followers', followDocId));
      setFollowDocId(null);
      setIsFollowing(false);
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  return (
    <button
      onClick={isFollowing ? handleUnfollow : handleFollow}
      className={`px-4 py-2 rounded ${
        isFollowing ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
      }`}
    >
      {isFollowing ? 'Unfollow' : 'Follow'}
    </button>
  );
};

export default FollowButton;
