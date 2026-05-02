import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfigStr = process.env.NEXT_PUBLIC_FIREBASE_CONFIG;
let firebaseConfig = {};

if (firebaseConfigStr) {
    try {
        firebaseConfig = JSON.parse(firebaseConfigStr);
    } catch (e) {
        console.error("שגיאה בקריאת ההגדרות");
    }
}

let app, auth, db;

// רשת הביטחון: מתחברים רק אם יש מפתח זמין
if (firebaseConfig && firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
} else {
    console.warn("האתר עובד ללא חיבור לפיירבייס - חסר מפתח (API Key)");
}

export { auth, db };
export const appId = 'edu-nextjs-v1';
