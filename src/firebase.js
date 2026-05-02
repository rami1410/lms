import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const configStr = process.env.REACT_APP_FIREBASE_CONFIG || process.env.NEXT_PUBLIC_FIREBASE_CONFIG;
let firebaseConfig = null;

if (configStr) {
    try {
        firebaseConfig = typeof configStr === 'string' ? JSON.parse(configStr) : configStr;
    } catch (e) {
        console.error("Firebase Config JSON Parse Error.");
    }
}

let app, auth, db;

if (firebaseConfig && firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    // הנה תיקון הקסם: אנחנו מפנים אותו לשם המדויק של מסד הנתונים שלך!
    db = getFirestore(app, "ai-studio-37d2b621-79f2-4136-9bb1-86fa0640d787");
} else {
    console.error("CRITICAL: Firebase Config is missing.");
}

export { auth, db };
export const appId = 'edu-nextjs-v1';
