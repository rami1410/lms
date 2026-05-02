import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// אנחנו בודקים את כל האפשרויות לשמות המשתנה
const configStr = process.env.REACT_APP_FIREBASE_CONFIG || process.env.NEXT_PUBLIC_FIREBASE_CONFIG;
let firebaseConfig = null;

if (configStr) {
    try {
        firebaseConfig = JSON.parse(configStr);
    } catch (e) {
        console.error("Firebase Config Parse Error");
    }
}

let app, auth, db;

if (firebaseConfig && firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
} else {
    console.warn("DEBUG: Firebase Config is missing or invalid");
}

export { auth, db };
export const appId = 'edu-nextjs-v1';
