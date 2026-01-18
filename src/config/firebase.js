import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

/**
 * Firebase configuration and initialization
 * Uses environment variables for security
 */

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
let app;
let auth;
let db;
let storage;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);

    // Enable offline persistence
    // Enable offline persistence - DISABLED due to locking issues
    // enableIndexedDbPersistence(db).catch((err) => {
    //     if (err.code === 'failed-precondition') {
    //         console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    //     } else if (err.code === 'unimplemented') {
    //         console.warn('The current browser does not support offline persistence');
    //     }
    // });
} catch (error) {
    console.error('Firebase initialization error:', error);
}

export { app, auth, db, storage };
