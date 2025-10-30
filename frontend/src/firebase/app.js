import { initializeApp } from 'firebase/app';
import { getApp, getApps } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyA13OlLKK2CnM9hQA7_yxMMAtiEgoC-vfM",
  authDomain: "rohitexpense-20a45.firebaseapp.com",
  databaseURL: "https://rohitexpense-20a45-default-rtdb.firebaseio.com",
  projectId: "rohitexpense-20a45",
  storageBucket: "rohitexpense-20a45.firebasestorage.app",
  messagingSenderId: "9096378159",
  appId: "1:9096378159:web:56d64bce056650de0f53da",
  measurementId: "G-9PM1EPX1MC"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Analytics (optional)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { analytics };
export default app;