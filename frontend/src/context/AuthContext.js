import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, googleProvider } from '../firebase/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { requestNotificationPermission } from '../firebase/firebase';

// Create a context for Auth
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to create/update user document
  const createUserDocument = async (user, additionalData = {}) => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);

    try {
      const userSnapshot = await getDoc(userRef);

      if (!userSnapshot.exists()) {
        const { email, displayName, photoURL } = user;
        const createdAt = new Date();

        await setDoc(userRef, {
          name: displayName || additionalData.name || email.split('@')[0],
          displayName:
            displayName || additionalData.name || email.split('@')[0],
          email,
          photoURL: photoURL || additionalData.photoURL || null,
          createdAt,
          fcmToken: additionalData.fcmToken || null,
          ...additionalData,
        });
        console.log('User document created successfully');
      } else if (additionalData.fcmToken) {
        await updateDoc(userRef, {
          fcmToken: additionalData.fcmToken,
        });
      }
    } catch (error) {
      console.error('Error creating user document', error);
    }

    return userRef;
  };

  // Sign-up function
  const signUp = async (email, password, username) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await updateProfile(user, { displayName: username });
      await createUserDocument(user, { name: username, displayName: username });

      // Request notification permission
      const fcmToken = await requestNotificationPermission();
      if (fcmToken) {
        await updateDoc(doc(db, 'users', user.uid), { fcmToken });
      }

      return user;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  // Log-in function
  const logIn = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    await createUserDocument(userCredential.user);

    // Request notification permission
    const fcmToken = await requestNotificationPermission();
    if (fcmToken) {
      await updateDoc(doc(db, 'users', userCredential.user.uid), { fcmToken });
    }

    return userCredential.user;
  };

  // Google Sign-In function
  const logInWithGoogle = async () => {
    const userCredential = await signInWithPopup(auth, googleProvider);
    const { displayName, photoURL } = userCredential.user;

    await createUserDocument(userCredential.user, { displayName, photoURL });

    // Request notification permission
    const fcmToken = await requestNotificationPermission();
    if (fcmToken) {
      await updateDoc(doc(db, 'users', userCredential.user.uid), { fcmToken });
    }

    return userCredential.user;
  };

  // Log-out function
  const logOut = () => {
    return signOut(auth);
  };

  // Effect to listen for changes in auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          await createUserDocument(user);
        }
        setUser(user);
      } catch (error) {
        console.error('Error in auth state change:', error);
      } finally {
        setLoading(false);
      }
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
