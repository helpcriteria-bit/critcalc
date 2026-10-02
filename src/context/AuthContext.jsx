import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase/config';
import {
  signInWithGoogle as authSignInWithGoogle,
  signInWithEmail as authSignInWithEmail,
  signUpWithEmail as authSignUpWithEmail,
  signOutStudent as authSignOutStudent
} from '../firebase/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState('');

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openAuthModal = useCallback((customMessage = '') => {
    setAuthModalMessage(customMessage);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthModalMessage('');
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const signedInUser = await authSignInWithGoogle();
    setUser(signedInUser);
    closeAuthModal();
    return signedInUser;
  }, [closeAuthModal]);

  const signInWithEmail = useCallback(async (email, password) => {
    const signedInUser = await authSignInWithEmail(email, password);
    setUser(signedInUser);
    closeAuthModal();
    return signedInUser;
  }, [closeAuthModal]);

  const signUpWithEmail = useCallback(async (email, password, displayName) => {
    const newUser = await authSignUpWithEmail(email, password, displayName);
    setUser(newUser);
    closeAuthModal();
    return newUser;
  }, [closeAuthModal]);

  const signOut = useCallback(async () => {
    await authSignOutStudent();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isConfigured: isFirebaseConfigured,
        isAuthModalOpen,
        authModalMessage,
        openAuthModal,
        closeAuthModal,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
