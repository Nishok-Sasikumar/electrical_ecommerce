// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBHEifiVQdUG9Pddwd2A421qFdcK8x4w-4",
  authDomain: "sairam-69513.firebaseapp.com",
  projectId: "sairam-69513",
  storageBucket: "sairam-69513.firebasestorage.app",
  messagingSenderId: "138312958922",
  appId: "1:138312958922:web:ef764aef8d097211034533",
  measurementId: "G-5XQ09W9C4E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);

export { app, analytics, auth, storage, db };
