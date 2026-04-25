import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
    apiKey: "AIzaSyDZZnxzXpjmm1DS8CxvsNGJvBHjSj9BKo4",
    authDomain: "datalogger-manager.firebaseapp.com",
    projectId: "datalogger-manager",
    storageBucket: "datalogger-manager.firebasestorage.app",
    messagingSenderId: "61393828084",
    appId: "1:61393828084:web:e9405b7580257f57e046a1",
    measurementId: "G-6VP5GEJ742"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
