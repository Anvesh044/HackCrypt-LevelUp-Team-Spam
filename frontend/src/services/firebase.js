// Import Firebase core
import { initializeApp } from "firebase/app";

// Import Firebase Auth
import { getAuth } from "firebase/auth";

// 👉 Import Firestore
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAd0zhc08qQzpbGbdGiIq076qmeC5yWfmE",
  authDomain: "level-up-auth-b2523.firebaseapp.com",
  projectId: "level-up-auth-b2523",
  storageBucket: "level-up-auth-b2523.appspot.com",
  messagingSenderId: "335363392025",
  appId: "1:335363392025:web:80f0093c2357902891a088"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// ✅ Initialize Firestore
export const db = getFirestore(app);

// (optional) export app if needed later
export default app;
