const { onCall, onRequest } = require('firebase-functions/v2/https'); // Added onRequest
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const {
  getFirestore,
  doc,
  getDoc,
  setDoc,
} = require('firebase-admin/firestore'); // Added doc, getDoc, setDoc
const { getMessaging } = require('firebase-admin/messaging');
const logger = require('firebase-functions/logger');
const { onSchedule } = require('firebase-functions/v2/scheduler');

// Initialize Firebase Admin SDK
initializeApp();

const db = getFirestore();

/**
 * HTTP-triggered function to search for users by username.
 * This function allows searching for users without requiring direct access to the users collection.
 */
exports.searchUsers = onCall(async (request) => {
  const { searchTerm } = request.data;

  // Validate input
  if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.length < 2) {
    throw new Error(
      'Invalid search term. Must be a string with at least 2 characters.'
    );
  }

  try {
    logger.info(`Searching for users with username containing: ${searchTerm}`);

    // Query users where username starts with the search term (case-insensitive)
    const usersQuery = db
      .collection('users')
      .where('username', '>=', searchTerm.toLowerCase())
      .where('username', '<=', searchTerm.toLowerCase() + '\uf8ff')
      .limit(10); // Limit results to 10 for performance

    const querySnapshot = await usersQuery.get();

    logger.info(`Found ${querySnapshot.size} users matching the search term`);

    // Map the results to include only public information
    const results = querySnapshot.docs.map((doc) => {
      const userData = doc.data();
      return {
        id: doc.id,
        name: userData.name,
        username: userData.username, // Include username in the results
        email: userData.email,
        photoURL: userData.photoURL,
      };
    });

    return { results };
  } catch (error) {
    logger.error('Error searching for users:', error);
    throw new Error('Failed to search for users');
  }
});

/**
 * Firestore-triggered function to send a notification when a new follower is added.
 */
exports.sendFollowNotification = onDocumentCreated(
  'followers/{followerId}',
  async (event) => {
    const followerData = event.data.data();

    // Validate data
    if (!followerData.followedUserId || !followerData.followerName) {
      logger.error('Invalid follower data:', followerData);
      return;
    }

    // Get the FCM token of the user being followed
    const userDoc = await db
      .collection('users')
      .doc(followerData.followedUserId)
      .get();
    if (!userDoc.exists) {
      logger.error('User not found:', followerData.followedUserId);
      return;
    }

    const fcmToken = userDoc.data().fcmToken;
    if (!fcmToken) {
      logger.error(
        'User has not enabled notifications:',
        followerData.followedUserId
      );
      return;
    }

    // Send the notification
    const message = {
      notification: {
        title: 'New Follower',
        body: `${followerData.followerName} started following you!`,
      },
      token: fcmToken,
    };

    try {
      await getMessaging().send(message);
      logger.info('Follow notification sent successfully');
    } catch (error) {
      logger.error('Error sending follow notification:', error);
    }
  }
);

/**
 * HTTP-triggered function to follow a user.
 */
exports.followUser = onCall(async (request) => {
  const { followerId, followingId } = request.data;

  // Validate input
  if (!followerId || !followingId) {
    throw new Error('followerId and followingId are required');
  }

  try {
    const followerRef = doc(db, 'followers', `${followerId}_${followingId}`);

    // Get the follower's name
    const userRef = doc(db, 'users', followerId);
    const userSnap = await getDoc(userRef);
    const followerName = userSnap.exists()
      ? userSnap.data().name || 'A user'
      : 'A user';

    await setDoc(followerRef, {
      followerId,
      followingId,
      followedUserId: followingId, // Add this field
      followerName, // Add this field
      createdAt: new Date(),
    });

    logger.info(`User ${followerId} is now following user ${followingId}`);
    return { success: true };
  } catch (error) {
    logger.error('Error following user:', error);
    throw new Error('Failed to follow user');
  }
});

/**
 * Scheduled function to clean up expired posts daily at midnight
 */
exports.cleanupExpiredPosts = onSchedule(
  {
    schedule: '0 0 * * *', // Daily at midnight
    timeZone: 'America/New_York', // Adjust to your timezone
  },
  async (event) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      .toISOString()
      .split('T')[0];

    try {
      // Get all posts from the past (before today)
      const expiredPostsQuery = db
        .collection('posts')
        .where('date', '<', today);

      const expiredPostsSnapshot = await expiredPostsQuery.get();

      // Check if there are any expired posts
      if (expiredPostsSnapshot.empty) {
        logger.info('No expired posts found');
        return null;
      }

      // Count how many posts will be deleted
      logger.info(`Found ${expiredPostsSnapshot.size} expired posts to delete`);

      // Batch delete to improve performance
      const batch = db.batch();
      expiredPostsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Commit the batch
      await batch.commit();
      logger.info(
        `Successfully deleted ${expiredPostsSnapshot.size} expired posts`
      );

      return null;
    } catch (error) {
      logger.error('Error cleaning up expired posts:', error);
      return null;
    }
  }
);

/**
 * HTTP-triggered function to initialize follow counts for all users.
 * This function can be called manually or scheduled to update followerCount and followingCount fields.
 */
exports.initializeFollowCounts = onRequest(async (req, res) => {
  try {
    // Get all users
    const usersSnapshot = await db.collection('users').get();

    // For each user
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;

      // Count followers
      const followersSnapshot = await db
        .collection('followers')
        .where('followingId', '==', userId)
        .get();
      const followerCount = followersSnapshot.size;

      // Count following
      const followingSnapshot = await db
        .collection('followers')
        .where('followerId', '==', userId)
        .get();
      const followingCount = followingSnapshot.size;

      // Update user document
      await db.collection('users').doc(userId).update({
        followerCount,
        followingCount,
      });

      logger.info(
        `Updated counts for user ${userId}: ${followerCount} followers, ${followingCount} following`
      );
    }

    res.status(200).send('Counts initialized for all users');
  } catch (error) {
    logger.error('Error initializing follow counts:', error);
    res.status(500).send('Error initializing follow counts: ' + error.message);
  }
});
