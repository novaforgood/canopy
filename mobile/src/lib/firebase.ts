import { getApp, getApps, initializeApp } from "firebase/app";

import Constants from "expo-constants";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword as firebaseCreateUserWithEmailAndPassword,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  NextOrObserver,
  User,
  ErrorFn,
  CompleteFn,
  signInWithCredential as firebaseSignInWithCredential,
  AuthCredential,
} from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: Constants.manifest?.extra?.["FIREBASE_API_KEY"],
  authDomain: Constants.manifest?.extra?.["FIREBASE_AUTH_DOMAIN"],
  projectId: Constants.manifest?.extra?.["FIREBASE_PROJECT_ID"],
  appId: Constants.manifest?.extra?.["FIREBASE_APP_ID"],
};

console.log(firebaseConfig);

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

// Sign in with credential
export const signInWithCredential = (credential: AuthCredential) =>
  firebaseSignInWithCredential(auth, credential);

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
