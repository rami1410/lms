import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// עוקפים את Vercel לחלוטין! ההגדרות המדויקות שלך מוטמעות כאן:
const firebaseConfig = {
  apiKey: "AIzaSyDA1QiipXZIFxGFq669qWJYbOhsdcsdUUo",
  authDomain: "ai-studio-applet-webapp-e86a9.firebaseapp.com",
  projectId: "ai-studio-applet-webapp-e86a9",
  storageBucket: "ai-studio-applet-webapp-e86a9.firebasestorage.app",
  messagingSenderId: "617367384988",
  appId: "1:617367384988:web:853260e80ca51028630e59"
};

let app, auth, db;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    // החיבור למסד הנתונים עם השם הארוך שלך:
    db = getFirestore(app, "ai-studio-37d2b621-79f2-4136-9bb1-86fa0640d787");
    console.log("Firebase Connected Successfully!");
} catch (error) {
    console.error("Firebase Initialization Error:", error);
}

export { auth, db };
export const appId = 'edu-nextjs-v1';
