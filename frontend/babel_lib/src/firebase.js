import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY?.replace(/"/g, ''),
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN?.replace(/"/g, ''),
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID?.replace(/"/g, ''),
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET?.replace(/"/g, ''),
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID?.replace(/"/g, ''),
  appId: process.env.REACT_APP_FIREBASE_APP_ID?.replace(/"/g, '')
};



if (!firebaseConfig.apiKey) {
  throw new Error('Firebase configuration is missing. Check your .env file.');
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const database = getDatabase(app);
export const storage = getStorage(app);
