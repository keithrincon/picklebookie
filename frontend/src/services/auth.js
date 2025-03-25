import { auth, googleProvider, signInWithPopup } from '../firebase/config';

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign-In Error:', {
      code: error.code,
      message: error.message,
      email: error.customData?.email,
      fullError: error,
    });
    throw error;
  }
};

export const logout = () => auth.signOut();
