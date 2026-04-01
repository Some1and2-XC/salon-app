import { initializeApp } from "firebase/app";
// @ts-ignore
import { getReactNativePersistence } from '@firebase/auth/dist/rn/index.js';
import { initializeAuth } from 'firebase/auth';
// import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";

import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// API key for firebase.
const FIREBASE_API_KEY: string = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;

const firebaseConfig = {
    apiKey: FIREBASE_API_KEY,
    authDomain: "csci4176groupproject.firebaseapp.com",
    projectId: "csci4176groupproject",
    storageBucket: "csci4176groupproject.firebasestorage.app",
    messagingSenderId: "763370449450",
    appId: "1:763370449450:web:b10053e60f6fca0632b153",
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// export const auth = getAuth(app);
export const db = getFirestore(app);

