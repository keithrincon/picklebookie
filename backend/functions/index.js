const { onCall } = require('firebase-functions/v2/https');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');
const logger = require('firebase-functions/logger');
const { onSchedule } = require('firebase-functions/v2/scheduler');

// Initialize Firebase Admin SDK
initializeApp();

/**
 * HTTP-triggered function to search for users by name.
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

  const db = getFirestore();

  try {
    logger.info(`Searching for users with name containing: ${searchTerm}`);

    // Query users where name starts with the search term (case-insensitive)
    const usersQuery = db
      .collection('users')
      .where('name', '>=', searchTerm.toLowerCase())
      .where('name', '<=', searchTerm.toLowerCase() + '\uf8ff')
      .limit(10); // Limit results to 10 for performance

    const querySnapshot = await usersQuery.get();

    logger.info(`Found ${querySnapshot.size} users matching the search term`);

    // Map the results to include only public information
    const results = querySnapshot.docs.map((doc) => {
      const userData = doc.data();
      return {
        id: doc.id,
        name: userData.name,
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
    const userDoc = await getFirestore()
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
 * Scheduled function to clean up expired posts daily at midnight
 */
exports.cleanupExpiredPosts = onSchedule(
  {
    schedule: '0 0 * * *', // Daily at midnight
    timeZone: 'America/New_York', // Adjust to your timezone
  },
  async (event) => {
    const db = getFirestore();
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
