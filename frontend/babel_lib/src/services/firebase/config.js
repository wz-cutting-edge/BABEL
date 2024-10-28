import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
  } else if (err.code === 'unimplemented') {
    console.warn('The current browser doesn\'t support persistence.');
  }
});

console.log("Storage bucket:", storage.app.options.storageBucket);

export { auth, db, storage };
