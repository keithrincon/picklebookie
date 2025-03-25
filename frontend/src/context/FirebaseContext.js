import React, { createContext, useContext } from 'react';
import { db, messaging, auth, storage, functions } from '../firebase/config'; // Import all Firebase services you need

// Create a context for Firebase
const FirebaseContext = createContext();

export const FirebaseProvider = ({ children }) => {
  // Provide all Firebase services you need
  const value = {
    db, // Firestore
    messaging, // Firebase Cloud Messaging
    auth, // Firebase Authentication
    storage, // Firebase Storage
    functions, // Firebase Cloud Functions
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};

// Custom hook to use Firebase context
export const useFirebase = () => useContext(FirebaseContext);
