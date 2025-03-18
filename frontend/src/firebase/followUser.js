import { doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Follow a user by creating a document in the `followers` collection.
 * @param {string} followerId - The ID of the user who is following.
 * @param {string} followingId - The ID of the user being followed.
 */
export const followUser = async (followerId, followingId) => {
  if (!followerId || !followingId) {
    console.error('followerId and followingId are required');
    return;
  }

  const followerRef = doc(db, 'followers', `${followerId}_${followingId}`);

  try {
    await setDoc(followerRef, {
      followerId,
      followingId,
      createdAt: new Date(),
    });
    console.log(`User ${followerId} is now following user ${followingId}`);
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
};

/**
 * Unfollow a user by deleting the corresponding document from the `followers` collection.
 * @param {string} followerId - The ID of the user who is unfollowing.
 * @param {string} followingId - The ID of the user being unfollowed.
 */
export const unfollowUser = async (followerId, followingId) => {
  if (!followerId || !followingId) {
    console.error('followerId and followingId are required');
    return;
  }

  const followerRef = doc(db, 'followers', `${followerId}_${followingId}`);

  try {
    await deleteDoc(followerRef);
    console.log(`User ${followerId} has unfollowed user ${followingId}`);
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
};

/**
 * Check if a user is following another user.
 * @param {string} followerId - The ID of the user who is following.
 * @param {string} followingId - The ID of the user being followed.
 * @returns {boolean} - True if the user is following, false otherwise.
 */
export const isFollowing = async (followerId, followingId) => {
  if (!followerId || !followingId) {
    console.error('followerId and followingId are required');
    return false;
  }

  const followerRef = doc(db, 'followers', `${followerId}_${followingId}`);

  try {
    const followerSnapshot = await getDoc(followerRef);
    return followerSnapshot.exists();
  } catch (error) {
    console.error('Error checking follow status:', error);
    throw error;
  }
};
