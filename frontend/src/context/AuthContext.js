import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, googleProvider } from '../firebase/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  deleteUser,
  reauthenticateWithPopup,
  GoogleAuthProvider,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import { toast } from 'react-toastify';
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

  // Re-authenticate with Google
  const reauthenticateWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await reauthenticateWithPopup(user, provider);
  };

  // Re-authenticate with Email Link
  const reauthenticateWithEmailLink = async () => {
    const email = user.email;
    const actionCodeSettings = {
      url: window.location.origin, // Redirect URL after re-authentication
      handleCodeInApp: true,
    };
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);

    toast.info(
      'A re-authentication link has been sent to your email. Please check your inbox.'
    );

    // Wait for the user to click the link
    const isLinkValid = await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (isSignInWithEmailLink(auth, window.location.href)) {
          clearInterval(interval);
          resolve(true);
        }
      }, 1000);
    });

    if (isLinkValid) {
      await signInWithEmailLink(auth, email, window.location.href);
    }
  };

  // Delete account function
  const deleteAccount = async (reauthenticationMethod) => {
    if (!user) {
      toast.error('You must be logged in to delete your account');
      return;
    }

    try {
      // Re-authenticate the user
      if (reauthenticationMethod === 'google') {
        await reauthenticateWithGoogle();
      } else if (reauthenticationMethod === 'email') {
        await reauthenticateWithEmailLink();
      } else {
        throw new Error('Invalid re-authentication method');
      }

      // Delete user posts
      const postsQuery = query(
        collection(db, 'posts'),
        where('userId', '==', user.uid)
      );
      const postsSnapshot = await getDocs(postsQuery);
      postsSnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      // Delete user followers
      const followersQuery = query(
        collection(db, 'followers'),
        where('followerId', '==', user.uid)
      );
      const followersSnapshot = await getDocs(followersQuery);
      followersSnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      // Delete user following
      const followingQuery = query(
        collection(db, 'followers'),
        where('followedUserId', '==', user.uid)
      );
      const followingSnapshot = await getDocs(followingQuery);
      followingSnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      // Delete the user document
      const userRef = doc(db, 'users', user.uid);
      await deleteDoc(userRef);

      // Delete the user from Firebase Authentication
      await deleteUser(user);

      // Log the user out
      await logOut();

      toast.success('Account deleted successfully');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account. Please try again.');
    }
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
        deleteAccount,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);
