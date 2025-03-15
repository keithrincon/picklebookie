import React, { createContext, useContext } from 'react';
import { db, messaging } from '../firebase/firebase'; // Import other Firebase services

const FirebaseContext = createContext();

export const FirebaseProvider = ({ children }) => {
  const value = { db, messaging }; // Add other Firebase services as needed
  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};

// Custom hook to use Firebase context
export const useFirebase = () => useContext(FirebaseContext);
