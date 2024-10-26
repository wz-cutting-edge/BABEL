import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  // Your Firebase configuration object goes here
  // You can find this in your Firebase project settings
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
