// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBfMtlsaA913C8M0UyR1MhwWXdDIYNE6Hc",
  authDomain: "pasta-ai.firebaseapp.com",
  projectId: "pasta-ai",
  storageBucket: "pasta-ai.firebasestorage.app",
  messagingSenderId: "503761265112",
  appId: "1:503761265112:web:043b10ea769df0d2e512ad",
  measurementId: "G-BT2NB7TZYR"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIREBASE_DB = getFirestore(FIREBASE_APP);