import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, googleProvider } from '../firebase/firebase'; // Import googleProvider
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile, // Import updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Create a context for Auth
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to create/update user document
  const createUserDocument = async (user, additionalData = {}) => {
    if (!user) return;

    // Reference to user document using auth UID as document ID
    const userRef = doc(db, 'users', user.uid);

    // Check if the document already exists
    const userSnapshot = await getDoc(userRef);

    // If no document exists, create one
    if (!userSnapshot.exists()) {
      const { email, displayName } = user;
      const createdAt = new Date();

      try {
        await setDoc(userRef, {
          name: displayName || additionalData.name || email.split('@')[0],
          email,
          createdAt,
          ...additionalData,
        });
        console.log('User document created successfully');
      } catch (error) {
        console.error('Error creating user document', error);
      }
    }

    return userRef;
  };

  // Updated Sign-up function
  const signUp = async (email, password, username) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Set the username in Firebase Authentication profile
      await updateProfile(user, { displayName: username });

      // Store user details in Firestore
      await createUserDocument(user, { username });

      return user;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  // Log-in function - checks for user document too
  const logIn = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    // Check for user document after login
    await createUserDocument(userCredential.user);
    return userCredential.user;
  };

  // Google Sign-In function
  const logInWithGoogle = async () => {
    const userCredential = await signInWithPopup(auth, googleProvider);
    // Create user document after successful Google Sign-In
    await createUserDocument(userCredential.user);
    return userCredential.user;
  };

  // Log-out function (unchanged)
  const logOut = () => {
    return signOut(auth);
  };

  // Effect to listen for changes in auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // For existing users, make sure they have a document
        await createUserDocument(user);
      }
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        signUp,
        logIn,
        logInWithGoogle,
        logOut,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);
