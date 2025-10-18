// src/services/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getDatabase } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyAUKJ2CP9n9V2mFJ3R4jPkp1Gq3a0Ka60Q",
  authDomain: "my-resume-9f418.firebaseapp.com",
  databaseURL: "https://my-resume-9f418-default-rtdb.firebaseio.com",
  projectId: "my-resume-9f418",
  storageBucket: "my-resume-9f418.firebasestorage.app",
  messagingSenderId: "7198509083",
  appId: "1:7198509083:web:f0de8418c8b456b6df50be",
  measurementId: "G-J8LMF140ZV",
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// ✅ Use initializeAuth with AsyncStorage persistence (React Native requirement)
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// ✅ Initialize Realtime Database
export const db = getDatabase(app);
