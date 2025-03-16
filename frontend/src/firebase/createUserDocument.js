import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase'; // Adjust the import if needed

export const createUserDocument = async (user, additionalData = {}) => {
  if (!user) {
    console.error('No user provided to createUserDocument');
    return null;
  }

  const userRef = doc(db, 'users', user.uid);
  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    const { email, displayName } = user;
    const createdAt = new Date();

    try {
      await setDoc(userRef, {
        displayName:
          displayName || additionalData.username || email.split('@')[0], // Fallback to email if no displayName or username
        email,
        createdAt,
        ...additionalData, // Store any extra user data
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
