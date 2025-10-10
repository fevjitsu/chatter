// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  RecaptchaVerifier,
  signInWithPhoneNumber 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
// Firebase configuration - Replace with your actual config
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDdbqDAGWLMehUYu-EB4XAxmHK5PNJr2qw",
  authDomain: "chatter-app-95fab.firebaseapp.com",
  projectId: "chatter-app-95fab",
  storageBucket: "chatter-app-95fab.firebasestorage.app",
  messagingSenderId: "343684121981",
  appId: "1:343684121981:web:40c3fab77f8afe473af814",
  measurementId: "G-50NB5JSX6K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Google Auth Provider with additional scopes
export const googleProvider = new GoogleAuthProvider();

// Add custom parameters and scopes
googleProvider.setCustomParameters({
  prompt: 'select_account',
  login_hint: 'user@example.com'
});

// Add additional scopes if needed
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');

// Authentication functions
export const signInWithGoogle = async (method = 'popup') => {
  try {
    let result;
    
    if (method === 'popup') {
      // Sign in with popup (desktop)
      result = await signInWithPopup(auth, googleProvider);
    } else {
      // Sign in with redirect (mobile)
      await signInWithRedirect(auth, googleProvider);
      return null; // User will be redirected
    }
    
    // This gives you a Google Access Token for accessing Google APIs
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
    
    // The signed-in user info
    const user = result.user;
    
    console.log('Google Sign-In Successful:', user);
    return user;
    
  } catch (error) {
    console.error('Error signing in with Google:', error);
    
    // Handle specific Google auth errors
    const errorCode = error.code;
    const errorMessage = error.message;
    const email = error.customData?.email;
    const credential = GoogleAuthProvider.credentialFromError(error);
    
    const authError = {
      code: errorCode,
      message: errorMessage,
      email,
      credential
    };
    
    throw authError;
  }
};

// Handle redirect result (for mobile devices)
export const handleGoogleRedirect = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      const user = result.user;
      return user;
    }
    return null;
  } catch (error) {
    console.error('Error handling Google redirect:', error);
    throw error;
  }
};

// Check if user is currently in redirect flow
export const isGoogleRedirectFlow = () => {
  return sessionStorage.getItem('google_redirect') === 'true';
};

// Set redirect flow flag
export const setGoogleRedirectFlow = (value) => {
  if (value) {
    sessionStorage.setItem('google_redirect', 'true');
  } else {
    sessionStorage.removeItem('google_redirect');
  }
};

// Phone Authentication functions (existing)
export const initializeRecaptcha = (elementId) => {
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
  }

  window.recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
    'size': 'invisible',
    'callback': (response) => {
      console.log('reCAPTCHA solved:', response);
    },
    'expired-callback': () => {
      console.log('reCAPTCHA expired');
      window.recaptchaVerifier.render().then((widgetId) => {
        window.recaptchaWidgetId = widgetId;
      });
    }
  });

  return window.recaptchaVerifier;
};

export const signInWithPhone = async (phoneNumber, recaptchaVerifier) => {
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    return confirmationResult;
  } catch (error) {
    console.error('Error sending verification code:', error);
    throw error;
  }
};

export const verifyPhoneCode = async (confirmationResult, code) => {
  try {
    const result = await confirmationResult.confirm(code);
    return result.user;
  } catch (error) {
    console.error('Error verifying code:', error);
    throw error;
  }
};

export default app;