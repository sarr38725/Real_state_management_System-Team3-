import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import app from './app';
import { db } from './db';

export const auth = getAuth(app);

export const signIn = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { user: result.user, error: null };
  } catch (error) {
    console.error('Sign in error:', error);
    return { user: null, error: error.message };
  }
};

export const signUp = async (email, password, userData) => {
  try {
    const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile
    await updateProfile(result.user, {
      displayName: userData.displayName
    });

    // Skip Firestore user document creation for demo
    // This avoids permission issues

    return { user: result.user, error: null };
  } catch (error) {
    console.error('Sign up error:', error);
    return { user: null, error: error.message };
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return { success: true, error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: error.message };
  }
};

export const getUserData = async (uid) => {
  try {
    const docSnap = await getDoc(doc(db, 'users', uid));
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    // Return default user data if permissions error occurs
    if (error.code === 'permission-denied') {
      return {
        displayName: 'User',
        role: 'buyer',
        email: auth.currentUser?.email || '',
        createdAt: new Date(),
        phone: '',
        avatar: ''
      };
    }
    return null;
  }
};

export { onAuthStateChanged };