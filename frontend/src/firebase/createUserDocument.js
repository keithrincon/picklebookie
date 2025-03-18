import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

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

    try {
      await setDoc(userRef, {
        name: additionalData.name || displayName || email.split('@')[0],
        username: displayName || additionalData.username || email.split('@')[0],
        email,
        createdAt,
        ...additionalData,
      });
      console.log('User document created successfully for:', email);
      return userRef;
    } catch (error) {
      console.error('Error creating user document:', error);
      throw error; // Re-throw the error for handling in the calling function
    }
  }

  console.log('User document already exists for:', user.email);
  return userRef; // Return the reference even if the document already exists
};
