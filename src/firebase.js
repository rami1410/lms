import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDA1QiipXZIFxGFq669qWJYbOhsdcsdUUo",
  authDomain: "ai-studio-applet-webapp-e86a9.firebaseapp.com",
  projectId: "ai-studio-applet-webapp-e86a9",
  storageBucket: "ai-studio-applet-webapp-e86a9.firebasestorage.app",
  messagingSenderId: "617367384988",
  appId: "1:617367384988:web:853260e80ca51028630e59"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// החיבור למסד הנתונים הספציפי שלך
const db = getFirestore(app, "ai-studio-37d2b621-79f2-4136-9bb1-86fa0640d787");

export { auth, db };
export const appId = 'edu-nextjs-v1';
