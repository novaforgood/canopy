import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword as firebaseCreateUserWithEmailAndPassword,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  applyActionCode as firebaseApplyActionCode,
  verifyPasswordResetCode as firebaseVerifyPasswordResetCode,
  confirmPasswordReset as firebaseConfirmPasswordReset,
  checkActionCode as firebaseCheckActionCode,
  verifyBeforeUpdateEmail as firebaseVerifyBeforeUpdateEmail,
  linkWithCredential as firebaseLinkWithCredential,
  linkWithPopup as firebaseLinkWithPopup,
  updateEmail as firebaseUpdateEmail,
  NextOrObserver,
  User,
  ErrorFn,
  CompleteFn,
  OAuthProvider,
  EmailAuthProvider,
  reauthenticateWithCredential as firebaseReauthenticateWithCredential,
  reauthenticateWithPopup as firebaseReauthenticateWithPopup,
  ActionCodeSettings,
  AuthCredential,
  AuthProvider,
} from "firebase/auth";

import { requireEnv } from "./env";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: requireEnv("NEXT_PUBLIC_FIREBASE_API_KEY"),
  authDomain: requireEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  projectId: requireEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
  appId: requireEnv("NEXT_PUBLIC_FIREBASE_APP_ID"),
};

// Initialize Firebase
if (getApps().length === 0) {
  initializeApp(firebaseConfig);
}

const auth = getAuth(getApp());

// Get current user
export const getCurrentUser = () => auth.currentUser;

// On auth state changed
export const onAuthStateChanged = (
  nextOrObserver: NextOrObserver<User>,
  error?: ErrorFn,
  completed?: CompleteFn
) => firebaseOnAuthStateChanged(auth, nextOrObserver, error, completed);

// Sign in with Google
const googleOauthProvider = new GoogleAuthProvider();
export const signInWithGoogle = () =>
  signInWithPopup(auth, googleOauthProvider);

// Sign in with Apple
const appleOauthProvider = new OAuthProvider("apple.com");
appleOauthProvider.addScope("email");
appleOauthProvider.addScope("name");
export const signInWithApple = () => signInWithPopup(auth, appleOauthProvider);

// Sign out
export const signOut = () => firebaseSignOut(auth);

// Create user with email and password
export const createUserWithEmailAndPassword = (
  email: string,
  password: string
) => firebaseCreateUserWithEmailAndPassword(auth, email, password);

// Sign in with email and password
export const signInWithEmailAndPassword = (email: string, password: string) =>
  firebaseSignInWithEmailAndPassword(auth, email, password);

export const sendPasswordResetEmail = (email: string) =>
  firebaseSendPasswordResetEmail(auth, email);

export const applyActionCode = (oobCode: string) =>
  firebaseApplyActionCode(auth, oobCode);

export const verifyPasswordResetCode = (oobCode: string) =>
  firebaseVerifyPasswordResetCode(auth, oobCode);

export const confirmPasswordReset = (oobCode: string, newPassword: string) =>
  firebaseConfirmPasswordReset(auth, oobCode, newPassword);

export const checkActionCode = (oobCode: string) =>
  firebaseCheckActionCode(auth, oobCode);

export const verifyBeforeUpdateEmail = (
  newEmail: string,
  settings?: ActionCodeSettings
) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not found");
  }
  return firebaseVerifyBeforeUpdateEmail(user, newEmail, settings);
};

// Reauthenticate with email and password
export const reauthenticateWithEmailPassword = (
  email: string,
  password: string
) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not found");
  }
  const credential = EmailAuthProvider.credential(email, password);
  return firebaseReauthenticateWithCredential(user, credential);
};

// Reauthenticate with Google
export const reauthenticateWithGoogle = () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not found");
  }
  const provider = new GoogleAuthProvider();
  return firebaseReauthenticateWithPopup(user, provider);
};

export const linkWithCredential = (credential: AuthCredential) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not found");
  }
  return firebaseLinkWithCredential(user, credential);
};

export const linkWithPopup = (provider: AuthProvider) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not found");
  }
  return firebaseLinkWithPopup(user, provider);
};

export const updateEmail = (newEmail: string) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not found");
  }
  return firebaseUpdateEmail(user, newEmail);
};
