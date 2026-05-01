import React, { useState, useEffect, useRef } from 'react';
import { db, auth, appId } from './firebase';
import { i18n } from './translations';
import SafeInput from './components/SafeInput';
import { onSnapshot, collection, doc, setDoc, signInAnonymously, onAuthStateChanged } from 'firebase/firestore';

const APP_VERSION = "1.28";
const LOGO_URL = "https://i.postimg.cc/mrzcZWpL/lwgw-hwtm-mwnps.gif";
const BACKGROUND_VIDEO_ID = "OHLMTgHl6cc";

export default function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [localUsers, setLocalUsers] = useState([]);
    const [localCourses, setLocalCourses] = useState([]);
    const [lang, setLang] = useState('he');
    const [videoPlaying, setVideoPlaying] = useState(true);
    const [loginUser, setLoginUser] = useState('');
    const [loginPass, setLoginPass] = useState('');

    useEffect(() => {
        signInAnonymously(auth);
        onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'users'), s => setLocalUsers(s.docs.map(d => ({...d.data(), id: d.id}))));
        onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'courses'), s => setLocalCourses(s.docs.map(d => ({...d.data(), id: d.id}))));
    }, []);

    const handleLogin = (e) => {
        e.preventDefault();
        if (loginUser === 'rami' && loginPass === '1234') {
            setCurrentUser({ firstName: 'רמי', role: 'admin' });
        } else {
            const found = localUsers.find(u => u.username === loginUser && u.password === loginPass);
            if (found) setCurrentUser(found);
            else alert("פרטים שגויים");
        }
    };

    return (
        <div dir="rtl" className={`min-h-screen ${currentUser ? 'bg-white' : 'bg-black'}`}>
            <div className="fixed bottom-4 left-4 text-white text-[10px] font-black z-50">V {APP_VERSION}</div>
            
            {!currentUser ? (
                /* כאן יבוא רכיב ה-Login המפואר שנבנה בשלב הבא */
                <div className="flex flex-col items-center justify-center min-h-screen">
                    <img src={LOGO_URL} className="h-24 rounded-2xl mb-8" />
                    <form onSubmit={handleLogin} className="bg-white p-10 rounded-[3rem] space-y-4 w-full max-w-md">
                        <SafeInput value={loginUser} onChange={setLoginUser} placeholder="User" className="w-full p-4 border rounded-xl" />
                        <SafeInput value={loginPass} onChange={setLoginPass} type="password" placeholder="Pass" className="w-full p-4 border rounded-xl" />
                        <button className="w-full bg-black text-white p-4 rounded-xl font-black">כניסה</button>
                    </form>
                </div>
            ) : (
                <div className="p-10">
                    <h1 className="text-4xl font-black">שלום {currentUser.firstName} 👑</h1>
                </div>
            )}
        </div>
    );
}
