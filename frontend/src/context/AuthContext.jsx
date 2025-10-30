import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, onAuthStateChanged, getUserData, signOut, signIn, signUp as firebaseSignUp } from '../firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Admin email list - these emails will have admin privileges
  const ADMIN_EMAILS = [
    'admin@realestate.com',
    'superadmin@realestate.com'
  ];

  // Admin user IDs - these user IDs will have admin privileges
  const ADMIN_USER_IDS = [
    'GNEG4nmk7bYkY72qj2XDyACgpL73'
  ];

  useEffect(() => {
    // Handle Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Check if user is admin based on email or user ID
        const isAdmin = ADMIN_EMAILS.includes(firebaseUser.email) || ADMIN_USER_IDS.includes(firebaseUser.uid);
        setIsAdminMode(isAdmin);
        
        // Set user data based on role
        if (isAdmin) {
          setUserData({
            displayName: firebaseUser.displayName || 'Admin User',
            role: 'admin',
            email: firebaseUser.email,
            createdAt: new Date(),
            phone: '',
            avatar: firebaseUser.photoURL || ''
          });
        } else {
          setUserData({
            displayName: firebaseUser.displayName || 'User',
            role: 'buyer',
            email: firebaseUser.email,
            createdAt: new Date(),
            phone: '',
            avatar: firebaseUser.photoURL || ''
          });
        }
      } else {
        // No authenticated user
        setUser(null);
        setUserData(null);
        setIsAdminMode(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Universal login function (works for both users and admins)
  const login = async (email, password) => {
    try {
      const result = await signIn(email, password);
      if (result.error) {
        return { success: false, error: result.error };
      }
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Universal signup function (users only - admins created manually)
  const signUp = async (email, password, userData) => {
    try {
      // Prevent admin email signup through regular signup
      if (ADMIN_EMAILS.includes(email)) {
        return { success: false, error: 'Admin accounts cannot be created through signup' };
      }
      
      const result = await firebaseSignUp(email, password, {
        ...userData,
        role: 'buyer' // Force role to buyer for regular signups
      });
      if (result.error) {
        return { success: false, error: result.error };
      }
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Universal logout function
  const logout = async () => {
    try {
      const result = await signOut();
      if (result.error) {
        return { success: false, error: result.error };
      }
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  };

  const hasRole = (role) => {
    return userData?.role === role;
  };

  const isAdmin = () => hasRole('admin');
  const isSeller = () => hasRole('seller');
  const isBuyer = () => hasRole('buyer');

  const value = {
    user,
    userData,
    loading,
    isAdminMode,
    hasRole,
    isAdmin,
    isSeller,
    isBuyer,
    login,
    signUp,
    logout,
    ADMIN_EMAILS
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};