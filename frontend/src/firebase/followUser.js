import {
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  updateDoc,
  increment,
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Follow a user by creating a document in the `followers` collection and updating user counts.
 * @param {string} currentUserId - The ID of the user who is following.
 * @param {string} targetUserId - The ID of the user being followed.
 */
export const followUser = async (currentUserId, targetUserId) => {
  if (!currentUserId || !targetUserId) {
    console.error('currentUserId and targetUserId are required');
    throw new Error('currentUserId and targetUserId are required');
  }

  const followerDocId = `${currentUserId}_${targetUserId}`;
  const followerRef = doc(db, 'followers', followerDocId);
  const currentUserRef = doc(db, 'users', currentUserId);
  const targetUserRef = doc(db, 'users', targetUserId);

  try {
    // Get the follower's name
    const userSnap = await getDoc(currentUserRef);
    const followerName = userSnap.exists()
      ? userSnap.data().name || 'A user'
      : 'A user';

    // Create the follow relationship
    await setDoc(followerRef, {
      followerId: currentUserId,
      followingId: targetUserId,
      followedUserId: targetUserId, // For cloud function
      followerName, // For notifications
      createdAt: new Date(),
    });

    // Update the following count for the current user
    await updateDoc(currentUserRef, {
      followingCount: increment(1),
    });

    // Update the follower count for the target user
    await updateDoc(targetUserRef, {
      followerCount: increment(1),
    });

    console.log(`User ${currentUserId} is now following user ${targetUserId}`);
    return true;
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
};

/**
 * Unfollow a user by deleting the follow document and updating user counts.
 * @param {string} currentUserId - The ID of the user who is unfollowing.
 * @param {string} targetUserId - The ID of the user being unfollowed.
 */
export const unfollowUser = async (currentUserId, targetUserId) => {
  if (!currentUserId || !targetUserId) {
    console.error('currentUserId and targetUserId are required');
    throw new Error('currentUserId and targetUserId are required');
  }

  const followerDocId = `${currentUserId}_${targetUserId}`;
  const followerRef = doc(db, 'followers', followerDocId);
  const currentUserRef = doc(db, 'users', currentUserId);
  const targetUserRef = doc(db, 'users', targetUserId);

  try {
    // First check if the follow relationship exists
    const followDoc = await getDoc(followerRef);

    if (!followDoc.exists()) {
      console.log('Follow relationship does not exist');
      return false;
    }

    // Delete the follow relationship
    await deleteDoc(followerRef);

    // Update the following count for the current user
    await updateDoc(currentUserRef, {
      followingCount: increment(-1),
    });

    // Update the follower count for the target user
    await updateDoc(targetUserRef, {
      followerCount: increment(-1),
    });

    console.log(`User ${currentUserId} has unfollowed user ${targetUserId}`);
    return true;
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
};

/**
 * Check if a user is following another user.
 * @param {string} currentUserId - The ID of the user who might be following.
 * @param {string} targetUserId - The ID of the user who might be followed.
 * @returns {boolean} - True if the user is following, false otherwise.
 */
export const isFollowing = async (currentUserId, targetUserId) => {
  if (!currentUserId || !targetUserId) {
    console.error('currentUserId and targetUserId are required');
    return false;
  }

  const followerDocId = `${currentUserId}_${targetUserId}`;
  const followerRef = doc(db, 'followers', followerDocId);

  try {
    const followerSnapshot = await getDoc(followerRef);
    return followerSnapshot.exists();
  } catch (error) {
    console.error('Error checking follow status:', error);
    throw error;
  }
};
