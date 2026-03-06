import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBS3GX1mTSMDqt_TAr0E0dymdXXGr5i_bc",
  authDomain: "csci4176groupproject.firebaseapp.com",
  projectId: "csci4176groupproject",
  storageBucket: "csci4176groupproject.firebasestorage.app",
  messagingSenderId: "763370449450",
  appId: "1:763370449450:web:b10053e60f6fca0632b153",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

