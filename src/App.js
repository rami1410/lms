import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, onSnapshot, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';

// --- הגדרות מערכת ---
const APP_VERSION = "1.24";
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
    const [adminTab, setAdminTab] = useState('approvals');
    const [activeModal, setActiveModal] = useState(null);
    const [toastMsg, setToastMsg] = useState('');
    const [shakeInput, setShakeInput] = useState(false);

    // טפסי התחברות
    const [loginUser, setLoginUser] = useState('');
    const [loginPass, setLoginPass] = useState('');

    // טופס קורס מורכב (לפי התמונה)
    const [courseData, setCourseData] = useState({
        name: '', field: '', fromGrade: 'א', toGrade: 'יב', equipment: '', type: 'מיומנויות',
        summary: '', goals: '', successGoals: '', skills: '', activeLearning: '', prerequisites: ''
    });
    
    // טופס מוסד
    const [instData, setInstData] = useState({ name: '', symbol: '', type: 'ציבורי', courses: [] });

    const [aiLoading, setAiLoading] = useState(null);
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

    const bulkCreateUsers = async () => {
        if (!db) return;
        const batch = writeBatch(db);
        for (let i = 1; i <= 100; i++) {
            const uId = `student${Date.now()}${i}`;
            const ref = doc(db, 'artifacts', appId, 'public', 'data', 'users', uId);
            batch.set(ref, {
                username: `user${i}`, password: `1234`, firstName: `תלמיד`, lastName: `${i}`,
                role: 'student', status: 'approved', institution: 'כללי'
            });
        }
        await batch.commit();
        setToastMsg("100 חשבונות נוצרו בהצלחה!");
        setTimeout(()=>setToastMsg(''), 3000);
    };

    const handleAIGen = async (field, promptLabel) => {
        if (!geminiApiKey || !courseData.name) return;
        setAiLoading(field);
        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: `כתוב ${promptLabel} בעברית עבור קורס בבית ספר בשם: ${courseData.name}. סוג הקורס הוא ${courseData.type}.` }] }] })
            });
            const data = await res.json();
            setCourseData(prev => ({...prev, [field]: data.candidates[0].content.parts[0].text.trim()}));
        } catch (e) {}
        setAiLoading(null);
    };

    return (
        <div dir="rtl" className={`min-h-screen font-sans ${currentUser ? 'bg-white' : 'bg-slate-950'} transition-colors duration-700`}>
            
            {/* רקע וידאו - רק במסך כניסה */}
            {!currentUser && (
                <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                    <iframe className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[115vw] h-[115vh] opacity-50 scale-125" src={`https://www.youtube.com/embed/${BACKGROUND_VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${BACKGROUND_VIDEO_ID}&controls=0&start=30`} frameBorder="0" />
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
                </div>
            )}

            <div className="fixed bottom-4 left-4 text-[10px] font-black opacity-30 z-50">V {APP_VERSION}</div>

            {!currentUser ? (
                /* --- מסך כניסה --- */
                <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                    <div className={`bg-white/90 backdrop-blur-xl p-12 rounded-[3.5rem] shadow-2xl w-full max-w-xl border border-white/20 transition-all ${shakeInput ? 'shake-anim' : ''}`}>
                        <img src={LOGO_URL} alt="Logo" className="h-28 mx-auto mb-6" />
                        <h1 className="text-4xl font-black text-center text-slate-900 mb-2">כניסה למערכת</h1>
                        <p className="text-slate-500 text-center font-bold mb-10 text-sm">למידה אקטיבית משנה חיים</p>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <input type="text" placeholder="שם משתמש" className="w-full p-5 bg-slate-50 rounded-2xl border-2 text-center text-xl font-black outline-none focus:border-purple-500" onChange={e=>setLoginUser(cleanInput(e.target.value))} />
                            <input type="password" placeholder="סיסמה" className="w-full p-5 bg-slate-50 rounded-2xl border-2 text-center text-xl font-black outline-none focus:border-purple-500" onChange={e=>setLoginPass(cleanInput(e.target.value))} />
                            <button className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl text-xl shadow-xl hover:bg-black transition-all">התחברות מאובטחת</button>
                        </form>
                    </div>
                </div>
            ) : (
                /* --- מערכת LMS (אחרי התחברות) --- */
                <div className="flex flex-col min-h-screen text-slate-800">
                    {/* Header */}
                    <nav className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
                        <div className="flex items-center gap-4">
                            <img src={LOGO_URL} alt="Logo" className="h-10" />
                            <div className="h-8 w-[1px] bg-slate-200"></div>
                            <button onClick={()=>setActiveSection('courses')} className={`font-black ${activeSection === 'courses' ? 'text-purple-600' : 'text-slate-400'}`}>הקורסים שלי</button>
                            {currentUser.role === 'admin' && (
                                <button onClick={()=>setActiveSection('admin')} className={`font-black ${activeSection === 'admin' ? 'text-purple-600' : 'text-slate-400'}`}>ניהול</button>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-sm font-black bg-slate-100 px-4 py-2 rounded-full">
                                {currentUser.username === 'rami' && <span className="ml-2">👑</span>}
                                {currentUser.firstName} {currentUser.lastName}
                            </div>
                            <button onClick={()=>setCurrentUser(null)} className="text-red-500 font-black text-xs uppercase bg-red-50 p-2 rounded-lg">יציאה</button>
                        </div>
                    </nav>

                    <main className="p-8 max-w-7xl mx-auto w-full">
                        {activeSection === 'courses' && (
                            <div className="grid md:grid-cols-3 gap-8">
                                {localCourses.map(c => (
                                    <div key={c.id} className="bg-white p-6 rounded-3xl shadow-lg border hover:shadow-xl transition-all">
                                        <div className="h-12 w-12 bg-purple-100 rounded-2xl mb-4 flex items-center justify-center text-purple-600 font-black">C</div>
                                        <h3 className="font-black text-xl mb-2">{c.name}</h3>
                                        <p className="text-slate-500 text-sm mb-6 line-clamp-3">{c.summary}</p>
                                        <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-black">צפייה בקורס</button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeSection === 'admin' && (
                            <div>
                                {/* Admin Sub-Nav */}
                                <div className="flex gap-2 mb-10 bg-slate-100 p-2 rounded-2xl w-fit">
                                    <button onClick={()=>setAdminTab('approvals')} className={`px-6 py-2 rounded-xl font-black text-sm ${adminTab === 'approvals' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>אישורי כניסה ({localUsers.filter(u=>u.status==='pending').length})</button>
                                    <button onClick={()=>setAdminTab('institutions')} className={`px-6 py-2 rounded-xl font-black text-sm ${adminTab === 'institutions' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>ניהול מוסדות</button>
                                    <button onClick={()=>setAdminTab('users')} className={`px-6 py-2 rounded-xl font-black text-sm ${adminTab === 'users' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>ניהול משתמשים</button>
                                    <button onClick={()=>setActiveModal('add_course')} className="px-6 py-2 rounded-xl font-black text-sm bg-purple-600 text-white shadow-lg">+ הוספת קורס</button>
                                </div>

                                {adminTab === 'approvals' && (
                                    <div className="grid gap-4">
                                        {localUsers.filter(u=>u.status==='pending').map(u=>(
                                            <div key={u.id} className="bg-white p-6 rounded-2xl border flex justify-between items-center shadow-sm">
                                                <span className="font-black">{u.firstName} {u.lastName} ({u.username})</span>
                                                <button onClick={()=>updateDoc(doc(db,'artifacts',appId,'public', 'data', 'users', u.id),{status:'approved'})} className="bg-emerald-500 text-white px-6 py-2 rounded-xl font-black text-xs">אשר כניסה</button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {adminTab === 'institutions' && (
                                    <div className="bg-white p-8 rounded-3xl border shadow-sm">
                                        <h2 className="text-2xl font-black mb-6">ניהול מוסדות וסמלים</h2>
                                        <div className="grid grid-cols-3 gap-4 mb-8">
                                            <input type="text" placeholder="שם המוסד" className="p-4 bg-slate-50 rounded-xl border" onChange={e=>setInstData({...instData, name:e.target.value})} />
                                            <input type="text" placeholder="סמל מוסד" className="p-4 bg-slate-50 rounded-xl border" onChange={e=>setInstData({...instData, symbol:e.target.value})} />
                                            <select className="p-4 bg-slate-50 rounded-xl border font-black" onChange={e=>setInstData({...instData, type:e.target.value})}>
                                                <option>ציבורי</option>
                                                <option>פרטי</option>
                                            </select>
                                        </div>
                                        <button onClick={async()=>{
                                            const id = "inst-"+Date.now();
                                            await setDoc(doc(db,'artifacts',appId,'public','data','institutions',id), {...instData, id});
                                            setToastMsg("מוסד נוצר!");
                                        }} className="bg-purple-600 text-white px-10 py-3 rounded-xl font-black shadow-lg">צור מוסד חדש</button>
                                    </div>
                                )}

                                {adminTab === 'users' && (
                                    <div className="bg-white p-8 rounded-3xl border shadow-sm">
                                        <div className="flex justify-between items-center mb-8">
                                            <h2 className="text-2xl font-black">משתמשים במערכת</h2>
                                            <button onClick={bulkCreateUsers} className="bg-black text-white px-6 py-3 rounded-xl font-black shadow-lg">יצירת 100 חשבונות מהירה ⚡</button>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-right">
                                                <thead><tr className="border-b text-slate-400 font-black text-xs"><th className="pb-4">שם</th><th className="pb-4">תפקיד</th><th className="pb-4">מוסד</th><th className="pb-4">סטטוס</th></tr></thead>
                                                <tbody>
                                                    {localUsers.map(u=>(
                                                        <tr key={u.id} className="border-b last:border-0"><td className="py-4 font-black">{u.firstName} {u.lastName}</td><td className="py-4 font-bold text-slate-500 text-sm">{u.role}</td><td className="py-4 font-bold text-slate-500 text-sm">{u.institution || 'לא משויך'}</td><td className="py-4"><span className={`px-3 py-1 rounded-full text-[10px] font-black ${u.status==='approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>{u.status}</span></td></tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </main>
                </div>
            )}

            {/* --- מודל הוספת קורס (לפי העיצוב המבוקש) --- */}
            {activeModal === 'add_course' && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[60]">
                    <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem] shadow-2xl relative">
                        <div className="p-8 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
                            <h2 className="text-2xl font-black text-slate-900">יצירת קורס חדש</h2>
                            <button onClick={()=>setActiveModal(null)} className="text-slate-400 text-2xl font-bold">&times;</button>
                        </div>
                        
                        <div className="p-10 space-y-8">
                            {/* שורה ראשונה */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500">שם הקורס</label>
                                    <input type="text" className="w-full p-4 bg-slate-50 rounded-xl border focus:border-purple-500 outline-none" onChange={e=>setCourseData({...courseData, name:e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500">תחום נלמד</label>
                                    <select className="w-full p-4 bg-slate-50 rounded-xl border outline-none font-bold" onChange={e=>setCourseData({...courseData, field:e.target.value})}>
                                        <option>בינה מלאכותית</option><option>תכנות</option><option>מדעים</option><option>מתמטיקה</option>
                                    </select>
                                </div>
                            </div>

                            {/* כיתות וציוד */}
                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500">מכיתה</label>
                                    <select className="w-full p-4 bg-slate-50 rounded-xl border outline-none font-bold" onChange={e=>setCourseData({...courseData, fromGrade:e.target.value})}><option>א</option><option>ב</option><option>ג</option><option>ד</option><option>ה</option><option>ו</option><option>ז</option><option>ח</option><option>ט</option><option>י</option><option>יא</option><option>יב</option></select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500">עד כיתה</label>
                                    <select className="w-full p-4 bg-slate-50 rounded-xl border outline-none font-bold" onChange={e=>setCourseData({...courseData, toGrade:e.target.value})}><option>יב</option><option>יא</option><option>י</option></select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500">ציוד נדרש</label>
                                    <select className="w-full p-4 bg-slate-50 rounded-xl border outline-none font-bold" onChange={e=>setCourseData({...courseData, equipment:e.target.value})}><option>מחשב</option><option>טאבלט</option><option>מעבדה</option></select>
                                </div>
                            </div>

                            {/* סוג קורס (מחוון) */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500">סוג הקורס (מחוון)</label>
                                <div className="flex bg-slate-100 p-1 rounded-xl">
                                    {['מיומנויות', 'חקר', 'פרויקטים'].map(t=>(
                                        <button key={t} onClick={()=>setCourseData({...courseData, type:t})} className={`flex-1 py-3 rounded-lg font-black text-xs transition-all ${courseData.type === t ? 'bg-white shadow-sm text-purple-600' : 'text-slate-400'}`}>1. {t}</button>
                                    ))}
                                </div>
                            </div>

                            {/* תיבות טקסט עם AI */}
                            {[
                                {id: 'summary', label: 'תמצית הקורס', prompt: 'תמצית קצרה'},
                                {id: 'goals', label: 'מטרות הקורס', prompt: '3 מטרות לימודיות'},
                                {id: 'successGoals', label: 'יעדי הצלחה מדידים', prompt: 'יעדים מדידים'},
                                {id: 'skills', label: 'מיומנויות נרכשות', prompt: 'מיומנויות המאה ה-21'},
                                {id: 'activeLearning', label: 'התבלין המיוחד: למידה אקטיבית', prompt: 'פעילות אקטיבית'}
                            ].map(f=>(
                                <div key={f.id} className="space-y-2 relative">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-black text-slate-900">{f.label}</label>
                                        <button onClick={()=>handleAIGen(f.id, f.prompt)} className="bg-purple-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md animate-pulse">ייצר עם AI ✨</button>
                                    </div>
                                    <textarea className="w-full p-4 bg-slate-50 rounded-xl border h-32 outline-none focus:border-purple-500" value={courseData[f.id]} onChange={e=>setCourseData({...courseData, [f.id]:e.target.value})} />
                                </div>
                            ))}

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500">קורסים שהם תנאי סף (Prerequisites)</label>
                                <input type="text" className="w-full p-4 bg-slate-50 rounded-xl border outline-none" onChange={e=>setCourseData({...courseData, prerequisites:e.target.value})} />
                            </div>

                            <button onClick={async()=>{
                                const id = "c-"+Date.now();
                                await setDoc(doc(db,'artifacts',appId,'public','data','courses',id), {...courseData, id});
                                setToastMsg("הקורס נשמר בהצלחה!");
                                setActiveModal(null);
                            }} className="w-full bg-purple-600 text-white py-6 rounded-3xl font-black text-xl shadow-xl hover:bg-purple-700 transition-all">אשר ושמור קורס</button>
                        </div>
                    </div>
                </div>
            )}

            {toastMsg && <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-10 py-4 rounded-full z-[100] shadow-2xl font-black animate-bounce">{toastMsg}</div>}
        </div>
    );
}
