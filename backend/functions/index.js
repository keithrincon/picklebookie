const { onCall } = require('firebase-functions/v2/https');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');
const logger = require('firebase-functions/logger');

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
