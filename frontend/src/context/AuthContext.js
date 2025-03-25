import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  db,
  googleProvider,
  initConnectionMonitor,
  requestNotificationPermission,
} from '../firebase/config';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  deleteUser,
  reauthenticateWithPopup,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore'; // Added deleteDoc here
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const createUserDocument = async (user, additionalData = {}) => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const userData = {
      name: user.displayName || additionalData.name || user.email.split('@')[0],
      displayName:
        user.displayName || additionalData.name || user.email.split('@')[0],
      email: user.email,
      photoURL: user.photoURL || additionalData.photoURL || null,
      createdAt: new Date(),
      ...additionalData,
    };

    try {
      const userSnapshot = await getDoc(userRef);

      if (!userSnapshot.exists()) {
        await setDoc(userRef, userData);
        console.log('User document created successfully');
      }

      if (additionalData.fcmToken) {
        await updateDoc(userRef, {
          fcmToken: additionalData.fcmToken,
          lastActive: new Date(),
        });
      }

      return userRef;
    } catch (error) {
      console.error('Error with user document:', error);
      if (error.code === 'unavailable') {
        await setDoc(doc(db, '_offline', `user-${Date.now()}`), {
          type: 'userUpdate',
          userId: user.uid,
          data: userData,
          timestamp: new Date(),
        });
      }
      return null;
    }
  };

  const signUp = async (email, password, username) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await updateProfile(user, { displayName: username });

      const fcmToken = await requestNotificationPermission();
      await createUserDocument(user, {
        name: username,
        fcmToken: fcmToken,
      });

      return user;
    } catch (error) {
      console.error('Sign-up error:', error);
      toast.error(error.message);
      throw error;
    }
  };

  const logIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const fcmToken = await requestNotificationPermission();
      await createUserDocument(user, { fcmToken });
      return user;
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message);
      throw error;
    }
  };

  const logInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const fcmToken = await requestNotificationPermission();
      await createUserDocument(user, { fcmToken });
      return user;
    } catch (error) {
      console.error('Google login error:', error);
      toast.error(error.message);
      throw error;
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error(error.message);
      throw error;
    }
  };

  const deleteAccount = async () => {
    try {
      if (!user) throw new Error('No user logged in');

      // Reauthenticate if needed (example with Google)
      const result = await signInWithPopup(auth, googleProvider);
      await reauthenticateWithPopup(result.user, googleProvider);

      // Delete user document first
      await deleteDoc(doc(db, 'users', user.uid));

      // Then delete auth account
      await deleteUser(user);

      toast.success('Account deleted successfully');
    } catch (error) {
      console.error('Account deletion error:', error);
      toast.error(error.message);
      throw error;
    }
  };

  useEffect(() => {
    let unsubscribeAuth;
    let unsubscribeConnection;

    const handleAuthStateChange = async (user) => {
      try {
        if (user) {
          const fcmToken = await requestNotificationPermission();
          await createUserDocument(user, { fcmToken });
        }
        setUser(user);
      } catch (error) {
        console.error('Auth state error:', error);
      } finally {
        setLoading(false);
      }
    };

    unsubscribeAuth = onAuthStateChanged(auth, handleAuthStateChange);
    unsubscribeConnection = initConnectionMonitor(setIsOnline);

    return () => {
      unsubscribeAuth();
      unsubscribeConnection();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isOnline,
        loading,
        signUp,
        logIn,
        logInWithGoogle,
        logOut,
        deleteAccount,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
