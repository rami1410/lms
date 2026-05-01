import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, onSnapshot, updateDoc, writeBatch } from 'firebase/firestore';

// --- הגדרות מערכת ---
const APP_VERSION = "1.27";
const firebaseConfigStr = process.env.NEXT_PUBLIC_FIREBASE_CONFIG;
const firebaseConfig = firebaseConfigStr ? JSON.parse(firebaseConfigStr) : {};
const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const appId = 'edu-nextjs-v1';
const LOGO_URL = "https://i.postimg.cc/mrzcZWpL/lwgw-hwtm-mwnps.gif";
const BACKGROUND_VIDEO_ID = "OHLMTgHl6cc";
const BOOM_SOUND = "https://actions.google.com/sounds/v1/science_fiction/low_fuzz_explosion.ogg";

let app, db, auth;
if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
}

const heToEnMap = { '/': 'q', '\'': 'w', 'ק': 'e', 'ר': 'r', 'א': 't', 'ט': 'y', 'ו': 'u', 'ן': 'i', 'ם': 'o', 'פ': 'p', 'ש': 'a', 'ד': 's', 'ג': 'd', 'כ': 'f', 'ע': 'g', 'י': 'h', 'ח': 'j', 'ל': 'k', 'ך': 'l', 'ז': 'z', 'ס': 'x', 'ב': 'c', 'ה': 'v', 'נ': 'b', 'מ': 'n', 'צ': 'm' };

export default function App() {
    const [authReady, setAuthReady] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [localUsers, setLocalUsers] = useState([]);
    const [localCourses, setLocalCourses] = useState([]);
    const [localInstitutions, setLocalInstitutions] = useState([]);
    const [lang, setLang] = useState('he');
    const [activeSection, setActiveSection] = useState('courses');
    const [isRegistering, setIsRegistering] = useState(false);
    const [activeModal, setActiveModal] = useState(null);
    const [toastMsg, setToastMsg] = useState('');
    const [shakeInput, setShakeInput] = useState(false);
    const [videoPlaying, setVideoPlaying] = useState(true);

    const [loginUser, setLoginUser] = useState('');
    const [loginPass, setLoginPass] = useState('');
    const [regData, setRegData] = useState({ fname: '', lname: '', user: '', institution: '', grade: 'א', pass1: '', pass2: '' });

    const audioRef = useRef(null);

    useEffect(() => {
        audioRef.current = new Audio(BOOM_SOUND);
        if (!auth) { setAuthReady(true); return; }
        signInAnonymously(auth).catch(console.error);
        onAuthStateChanged(auth, (user) => { if (user) setAuthReady(true); });
    }, []);

    useEffect(() => {
        if (!authReady || !db) return;
        onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'users'), s => setLocalUsers(s.docs.map(d => ({...d.data(), id: d.id}))));
        onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'courses'), s => setLocalCourses(s.docs.map(d => ({...d.data(), id: d.id}))));
        onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'institutions'), s => setLocalInstitutions(s.docs.map(d => ({...d.data(), id: d.id}))));
    }, [authReady]);

    const playBoom = () => {
        if (audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play().catch(()=>{}); }
        setShakeInput(true); setTimeout(() => setShakeInput(false), 500);
    };

    const cleanInput = (val) => {
        let cleaned = ""; let error = false;
        for (let char of val) {
            let lowerChar = char.toLowerCase();
            if (heToEnMap[char]) { cleaned += heToEnMap[char]; }
            else if (/[a-z0-9]/.test(lowerChar)) { cleaned += lowerChar; }
            else { error = true; }
        }
        if (error) playBoom();
        return cleaned;
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (loginUser === 'rami' && loginPass === '1234') {
            setCurrentUser({ username: 'rami', firstName: 'רמי', role: 'admin', status: 'approved' });
        } else {
            const found = localUsers.find(x => x.username === loginUser && x.password === loginPass);
            if (found) setCurrentUser(found);
            else { playBoom(); setToastMsg("פרטים שגויים"); setTimeout(()=>setToastMsg(''), 2000); }
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (regData.pass1 !== regData.pass2) {
            playBoom(); setToastMsg("הסיסמאות לא תואמות"); return;
        }
        if (!regData.user || !regData.pass1) {
            playBoom(); setToastMsg("נא למלא את כל השדות"); return;
        }
        try {
            const uId = `user-${Date.now()}`;
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', uId), {
                ...regData, id: uId, role: 'student', status: 'pending', username: regData.user, password: regData.pass1
            });
            setToastMsg("נרשמת בהצלחה! המתן לאישור אדמין.");
            setIsRegistering(false);
        } catch (e) {
            setToastMsg("שגיאה ברישום");
        }
    };

    return (
        <div dir="rtl" className={`min-h-screen font-sans transition-colors duration-700 ${currentUser ? 'bg-white' : 'bg-slate-950'}`}>
            <style>{`
                @keyframes shake { 0%, 100% {transform: translateX(0);} 25% {transform: translateX(-10px);} 75% {transform: translateX(10px);} }
                .shake-anim { animation: shake 0.15s ease-in-out 0s 2; border: 2px solid red !important; }
                .glass { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.2); }
            `}</style>

            <div className="fixed bottom-4 left-4 text-[10px] font-black text-white/50 z-50">V {APP_VERSION}</div>

            {!currentUser ? (
                /* --- מסכי כניסה ורישום --- */
                <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 overflow-y-auto">
                    {videoPlaying && (
                        <div className="fixed inset-0 z-0 pointer-events-none">
                            <iframe className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[115vw] h-[115vh] opacity-50 scale-125" src={`https://www.youtube.com/embed/${BACKGROUND_VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${BACKGROUND_VIDEO_ID}&controls=0&start=30`} frameBorder="0" />
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
                        </div>
                    )}

                    <div className={`bg-white rounded-[3rem] shadow-2xl w-full max-w-xl relative z-10 transition-all ${shakeInput ? 'shake-anim' : ''} ${isRegistering ? 'my-10' : ''}`}>
                        
                        {/* טאבים למעלה (רק ברישום) */}
                        {isRegistering && (
                            <div className="flex bg-purple-500 text-white rounded-t-[3rem] overflow-hidden">
                                <button className="flex-1 py-4 font-black text-sm border-b-4 border-white">רישום תלמיד</button>
                                <button className="flex-1 py-4 font-black text-sm opacity-60">קורס לפי מוסד</button>
                            </div>
                        )}

                        <div className="p-10">
                            <img src={LOGO_URL} alt="Logo" className="h-24 mx-auto mb-6 rounded-2xl" />
                            
                            {!isRegistering ? (
                                /* טופס כניסה */
                                <form onSubmit={handleLogin} className="space-y-6">
                                    <h1 className="text-3xl font-black text-center text-slate-900">כניסה למערכת</h1>
                                    <input type="text" placeholder="שם משתמש" className="w-full p-5 bg-slate-50 rounded-2xl border-2 text-center text-xl font-black outline-none focus:border-purple-500" onChange={e=>setLoginUser(cleanInput(e.target.value))} />
                                    <input type="password" placeholder="סיסמה" className="w-full p-5 bg-slate-50 rounded-2xl border-2 text-center text-xl font-black outline-none focus:border-purple-500" onChange={e=>setLoginPass(cleanInput(e.target.value))} />
                                    <button className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl text-xl shadow-xl hover:bg-black">התחברות מאובטחת</button>
                                    <button type="button" onClick={()=>setIsRegistering(true)} className="w-full text-purple-600 font-black text-sm">יצירת חשבון חדש</button>
                                </form>
                            ) : (
                                /* טופס רישום מורחב (לפי התמונה) */
                                <form onSubmit={handleRegister} className="space-y-5 text-right">
                                    <div>
                                        <label className="block text-xs font-black mb-1 mr-2">שם פרטי</label>
                                        <input type="text" placeholder="שם פרטי" className="w-full p-4 bg-slate-50 rounded-xl border outline-none" onChange={e=>setRegData({...regData, fname: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black mb-1 mr-2">שם משפחה</label>
                                        <input type="text" placeholder="שם משפחה" className="w-full p-4 bg-slate-50 rounded-xl border outline-none" onChange={e=>setRegData({...regData, lname: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black mb-1 mr-2 text-purple-600">שם משתמש (אותיות קטנות באנגלית בלבד)</label>
                                        <input type="text" placeholder="username" value={regData.user} className="w-full p-4 bg-slate-50 rounded-xl border outline-none text-center font-bold" onChange={e=>setRegData({...regData, user: cleanInput(e.target.value)})} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-black mb-1 mr-2">מוסד לימוד</label>
                                            <select className="w-full p-4 bg-slate-50 rounded-xl border outline-none font-bold" onChange={e=>setRegData({...regData, institution: e.target.value})}>
                                                <option value="">בחר מוסד לימוד</option>
                                                {localInstitutions.map(inst => <option key={inst.id}>{inst.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black mb-1 mr-2">כיתה</label>
                                            <select className="w-full p-4 bg-slate-50 rounded-xl border outline-none font-bold" onChange={e=>setRegData({...regData, grade: e.target.value})}>
                                                {['א','ב','ג','ד','ה','ו','ז','ח','ט','י','יא','יב'].map(g => <option key={g}>{g}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black mb-1 mr-2">סיסמה</label>
                                        <input type="password" placeholder="סיסמה" value={regData.pass1} className="w-full p-4 bg-slate-50 rounded-xl border outline-none text-center" onChange={e=>setRegData({...regData, pass1: cleanInput(e.target.value)})} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black mb-1 mr-2">אימות סיסמה</label>
                                        <input type="password" placeholder="אימות סיסמה" value={regData.pass2} className="w-full p-4 bg-slate-50 rounded-xl border outline-none text-center" onChange={e=>setRegData({...regData, pass2: cleanInput(e.target.value)})} />
                                    </div>
                                    
                                    <p className="text-[10px] text-center text-slate-400">בהרשמתך, הינך מסכים עם מדיניות האתר ו- <span className="text-blue-500 underline cursor-pointer">Terms and Conditions</span></p>
                                    
                                    <button className="w-full bg-purple-500 text-white font-black py-4 rounded-xl shadow-lg text-lg">הרשמה</button>
                                    <button type="button" onClick={()=>setIsRegistering(false)} className="w-full text-slate-400 font-bold text-xs mt-2">כבר רשום? חזרה לכניסה</button>
                                </form>
                            )}
                        </div>
                    </div>
                    <button onClick={() => setVideoPlaying(!videoPlaying)} className="fixed bottom-6 right-6 bg-white/10 text-white px-5 py-2 rounded-2xl font-black border text-[10px] z-50">
                        {videoPlaying ? "עצור וידאו ⏹" : "הפעל וידאו ▶"}
                    </button>
                </div>
            ) : (
                /* --- המערכת הלבנה (אחרי התחברות) --- */
                <div className="flex flex-col min-h-screen">
                    <nav className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
                        <div className="flex items-center gap-4">
                            <img src={LOGO_URL} alt="Logo" className="h-10 rounded-xl" />
                            <button onClick={()=>setActiveSection('courses')} className={`font-black ${activeSection === 'courses' ? 'text-purple-600' : 'text-slate-400'}`}>הקורסים שלי</button>
                            {currentUser.role === 'admin' && <button onClick={()=>setActiveSection('admin')} className={`font-black ${activeSection === 'admin' ? 'text-purple-600' : 'text-slate-400'}`}>ניהול</button>}
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-sm font-black bg-slate-100 px-4 py-2 rounded-full">
                                {currentUser.username === 'rami' && <span className="ml-2">👑</span>}
                                {currentUser.firstName} {currentUser.lastName}
                            </div>
                            <button onClick={()=>setCurrentUser(null)} className="text-red-500 font-black text-xs bg-red-50 p-2 rounded-lg">יציאה</button>
                        </div>
                    </nav>
                    <main className="p-8 max-w-7xl mx-auto w-full text-center">
                        <h2 className="text-4xl font-black mb-10 text-slate-900">שלום, {currentUser.firstName}!</h2>
                        {activeSection === 'courses' && (
                             <div className="grid md:grid-cols-3 gap-8 text-right">
                                {localCourses.map(c => (
                                    <div key={c.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                                        <h3 className="font-black text-2xl mb-4">{c.name}</h3>
                                        <p className="text-slate-400 font-bold mb-8 line-clamp-3 text-sm">{c.summary}</p>
                                        <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black">כניסה לשיעור</button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {activeSection === 'admin' && (
                            <div className="bg-slate-100 p-10 rounded-[3rem]">
                                <h3 className="text-2xl font-black mb-6">מרכז ניהול - ממתינים לאישור</h3>
                                {localUsers.filter(u=>u.status==='pending').map(u=>(
                                    <div key={u.id} className="bg-white p-4 rounded-xl mb-4 flex justify-between items-center shadow-sm">
                                        <span className="font-black">{u.firstName} {u.lastName} ({u.institution}, כיתה {u.grade})</span>
                                        <button onClick={()=>updateDoc(doc(db,'artifacts',appId,'public','data','users',u.id),{status:'approved'})} className="bg-emerald-500 text-white px-6 py-2 rounded-lg font-black">אשר תלמיד</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            )}
            
            {toastMsg && <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-10 py-4 rounded-full z-[100] shadow-2xl font-black animate-bounce text-sm">{toastMsg}</div>}
        </div>
    );
}
