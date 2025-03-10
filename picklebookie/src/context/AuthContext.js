// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from './firebase'; // Import auth from firebase.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

// Create a context for Auth
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Sign-up function
  const signUp = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // Log-in function
  const logIn = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Log-out function
  const logOut = () => {
    return signOut(auth);
  };

  // Effect to listen for changes in auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // Set user state based on auth state
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, signUp, logIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);
