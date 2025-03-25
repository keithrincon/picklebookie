import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

export const createUserDocument = async (user, additionalData = {}) => {
  if (!user || !user.uid) {
    console.error('Invalid user object provided to createUserDocument');
    return null;
  }

  const userRef = doc(db, 'users', user.uid);
  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    const { email, displayName } = user;
    const createdAt = new Date();

    // Generate a username from additionalData, displayName, or email
    const rawUsername =
      additionalData.username || displayName || email.split('@')[0];
    // Convert username to lowercase for consistent searching
    const username = rawUsername.toLowerCase();

    try {
      await setDoc(userRef, {
        name: additionalData.name || displayName || email.split('@')[0],
        username: username, // Store lowercase username
        email,
        photoURL: additionalData.photoURL || null,
        createdAt,
        ...additionalData,
      });
      console.log('User document created successfully for:', email);
      return userRef;
    } catch (error) {
      console.error('Error creating user document:', error);
      throw error;
    }
  }

  console.log('User document already exists for:', user.email);
  return userRef;
};
