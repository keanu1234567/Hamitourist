// Import Firebase SDK
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyAKR1E9x9DKu-HxY-8vB92GzKbl8-6dZZU",
  authDomain: "hamitour-3e124.firebaseapp.com",
  projectId: "hamitour-3e124",
  storageBucket: "hamitour-3e124.firebasestorage.app",
  messagingSenderId: "702827236217",
  appId: "1:702827236217:web:5edbd57f09f3ba1855fda8",
  measurementId: "G-2YHB5SJWNH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore (Database)
const db = getFirestore(app);

// Initialize Analytics (Optional)
const analytics = getAnalytics(app);

export { db, analytics };
