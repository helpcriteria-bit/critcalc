import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from './config';
import { clearStudentLocalData } from './canvasStorage';

/**
 * Maps Firebase Auth error codes to student-friendly messages.
 */
export function getFriendlyAuthErrorMessage(errorCode) {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This student account has been disabled. Please contact your instructor.';
    case 'auth/user-not-found':
      return 'No account found with this email. Please check spelling or create an account.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please verify and try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try signing in instead.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before completing.';
    case 'auth/popup-blocked':
      return 'The sign-in popup was blocked by your browser. Please allow popups for this site.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection and try again.';
    case 'auth/too-many-requests':
      return 'Too many failed login attempts. Please wait a few minutes or reset your password.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled in Firebase Console. Please enable Email/Password or Google Sign-In.';
    default:
      return 'Authentication failed. Please check your credentials and try again.';
  }
}

export async function signInWithGoogle() {
  if (!isFirebaseConfigured || !auth || !googleProvider) {
    throw new Error('Firebase is not configured. Please add your Firebase credentials to .env.');
  }
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signInWithEmail(email, password) {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase is not configured. Please add your Firebase credentials to .env.');
  }
  const result = await signInWithEmailAndPassword(auth, email.trim(), password);
  return result.user;
}

export async function signUpWithEmail(email, password, displayName) {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase is not configured. Please add your Firebase credentials to .env.');
  }
  const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
  if (displayName && displayName.trim()) {
    await updateProfile(result.user, {
      displayName: displayName.trim()
    });
  }
  return result.user;
}

export async function signOutStudent() {
  if (auth) {
    await firebaseSignOut(auth);
  }
  clearStudentLocalData();
}
