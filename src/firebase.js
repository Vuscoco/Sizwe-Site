import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCV6JLfbvNXKegm9iZ-8HgIG_tehQWw9hg",
  authDomain: "for-login-cbd30.firebaseapp.com",
  projectId: "for-login-cbd30",
  storageBucket: "for-login-cbd30.firebasestorage.app",
  messagingSenderId: "887661079693",
  appId: "1:887661079693:web:e417e81274aadc786706c4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export default app; 