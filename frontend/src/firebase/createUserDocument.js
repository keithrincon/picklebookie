import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase'; // Adjust the import if needed

export const createUserDocument = async (user, additionalData = {}) => {
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);
  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    const { email, displayName } = user;
    const createdAt = new Date();

    try {
      await setDoc(userRef, {
        displayName: displayName || additionalData.username, // Store displayName or username
        email,
        createdAt,
        ...additionalData, // Store any extra user data
      });
    } catch (error) {
      console.error('Error creating user document:', error);
    }
  }
};
