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
 * HTTP-triggered function to send a notification to a specific user.
 */
exports.sendNotification = onCall(async (request) => {
  const { userId, title, body } = request.data;

  // Validate input
  if (!userId || !title || !body) {
    throw new Error('Missing required fields: userId, title, or body');
  }

  // Get the user's FCM token from Firestore
  const userDoc = await getFirestore().collection('users').doc(userId).get();
  if (!userDoc.exists) {
    throw new Error('User not found');
  }

  const fcmToken = userDoc.data().fcmToken;
  if (!fcmToken) {
    throw new Error('User has not enabled notifications');
  }

  // Send the notification
  const message = {
    notification: { title, body },
    token: fcmToken,
  };

  try {
    const response = await getMessaging().send(message);
    logger.info('Notification sent successfully', { messageId: response });
    return { success: true, messageId: response };
  } catch (error) {
    logger.error('Error sending notification:', error);
    throw new Error('Failed to send notification');
  }
});

/**
 * HTTP-triggered function to search for users by displayName.
 * This function allows searching for users without requiring direct access to the users collection.
 */
exports.searchUsers = onCall(async (request) => {
  // Temporarily allow unauthenticated requests for testing
  if (!request.auth) {
    logger.warn('Warning: Unauthenticated request');
    // You can choose to proceed or throw an error
    // throw new Error('Authentication required');
  }

  const { searchTerm } = request.data;

  // Validate input
  if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.length < 2) {
    throw new Error(
      'Invalid search term. Must be a string with at least 2 characters.'
    );
  }

  const db = getFirestore();

  try {
    logger.info(
      `Searching for users with displayName containing: ${searchTerm}`
    );

    // Query users where displayName starts with the search term
    const usersQuery = db
      .collection('users')
      .where('displayName', '>=', searchTerm)
      .where('displayName', '<=', searchTerm + '\uf8ff')
      .limit(10);

    const querySnapshot = await usersQuery.get();

    logger.info(`Found ${querySnapshot.size} users matching the search term`);

    // Map the results to include only public information
    const results = querySnapshot.docs.map((doc) => {
      const userData = doc.data();
      return {
        id: doc.id,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        // Do not include sensitive information like email, fcmToken, etc.
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

/**
 * Scheduled function to clean up expired posts by end time, running hourly
 */
exports.cleanupExpiredPostsByEndTime = onSchedule(
  {
    schedule: '0 * * * *', // Run every hour
    timeZone: 'America/New_York', // Adjust to your timezone
  },
  async (event) => {
    const db = getFirestore();
    const now = new Date();

    try {
      // Get all posts from today
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        .toISOString()
        .split('T')[0];

      const todayPostsQuery = db.collection('posts').where('date', '==', today);

      const todayPostsSnapshot = await todayPostsQuery.get();

      if (todayPostsSnapshot.empty) {
        logger.info('No posts found for today');
        return null;
      }

      // Format current time as HH:MM for comparison
      const currentTime = now.toTimeString().substring(0, 5);

      // Find posts where endTime has passed
      const expiredPosts = todayPostsSnapshot.docs.filter((doc) => {
        const data = doc.data();
        return data.endTime < currentTime;
      });

      if (expiredPosts.length === 0) {
        logger.info('No expired posts found for today');
        return null;
      }

      logger.info(`Found ${expiredPosts.length} expired posts for today`);

      // Batch delete
      const batch = db.batch();
      expiredPosts.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      logger.info(
        `Successfully deleted ${expiredPosts.length} expired posts for today`
      );

      return null;
    } catch (error) {
      logger.error('Error cleaning up expired posts by end time:', error);
      return null;
    }
  }
);
