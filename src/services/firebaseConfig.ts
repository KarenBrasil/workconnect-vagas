import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB_3qNra19Q5klUYpQZYQSshrf3W6UCt1A",
  authDomain: "workconnect-5da4a.firebaseapp.com",
  projectId: "workconnect-5da4a",
  storageBucket: "workconnect-5da4a.firebasestorage.app",
  messagingSenderId: "428964843503",
  appId: "1:428964843503:web:e756a6764ecae355f1f01a"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
