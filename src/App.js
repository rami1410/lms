import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, onSnapshot, updateDoc, writeBatch } from 'firebase/firestore';

// --- הגדרות מערכת ---
const APP_VERSION = "1.25";
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

const i18n = {
    he: { login_title: "כניסה למערכת", login_subtitle: "למידה אקטיבית משנה חיים", btn_login: "התחברות מאובטחת", btn_reg: "יצירת חשבון חדש", nav_courses: "הקורסים שלי", nav_admin: "ניהול", welcome: "שלום, ", no_courses: "אין קורסים זמינים כרגע" },
    en: { login_title: "Secure Login", login_subtitle: "Active Learning Changes Lives", btn_login: "Secure Login", btn_reg: "Create Account", nav_courses: "My Courses", nav_admin: "Admin Panel", welcome: "Hello, ", no_courses: "No courses yet" },
    ar: { login_title: "تسجيل الدخول", login_subtitle: "التعلم النشط يغير الحياة", btn_login: "دخول آمن", btn_reg: "إنشاء حساب", nav_courses: "دوراتي", nav_admin: "إدارة", welcome: "مرحباً, ", no_courses: "لا توجد دورات" },
    ru: { login_title: "Вход ב систему", login_subtitle: "Активное обучение меняет жизнь", btn_login: "Войти", btn_reg: "Регистрация", nav_courses: "Мои курсы", nav_admin: "Админ", welcome: "Привет, ", no_courses: "Курсов нет" }
};

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
    const [videoPlaying, setVideoPlaying] = useState(true);

    const [loginUser, setLoginUser] = useState('');
    const [loginPass, setLoginPass] = useState('');
    const [instData, setInstData] = useState({ name: '', symbol: '', type: 'ציבורי', courses: [] });
    const [courseData, setCourseData] = useState({ name: '', field: '', fromGrade: 'א', toGrade: 'יב', equipment: '', type: 'מיומנויות', summary: '', goals: '', successGoals: '', skills: '', activeLearning: '', prerequisites: '' });
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
        const isAdmin = (loginUser === 'rami') && (loginPass === '1234');
        if (isAdmin) setCurrentUser({ username: 'rami', firstName: 'רמי', role: 'admin', status: 'approved' });
        else {
            const found = localUsers.find(x => x.username === loginUser && x.password === loginPass);
            if (found) setCurrentUser(found);
            else { playBoom(); setToastMsg("פרטים שגויים"); setTimeout(()=>setToastMsg(''), 2000); }
        }
    };

    const bulkCreateUsers = async () => {
        if (!db) return;
        const batch = writeBatch(db);
        for (let i = 1; i <= 100; i++) {
            const uId = `std-${Date.now()}-${i}`;
            batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'users', uId), {
                username: `student${i}`, password: `1234`, firstName: `תלמיד`, lastName: `${i}`,
                role: 'student', status: 'approved', id: uId
            });
        }
        await batch.commit();
        setToastMsg("100 חשבונות נוצרו!");
    };

    const handleAIGen = async (field, prompt) => {
        if (!geminiApiKey || !courseData.name) return;
        setAiLoading(field);
        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: `כתוב ${prompt} בעברית לקורס ${courseData.name}.` }] }] })
            });
            const data = await res.json();
            setCourseData(prev => ({...prev, [field]: data.candidates[0].content.parts[0].text.trim()}));
        } catch (e) {}
        setAiLoading(null);
    };

    const t = (key) => i18n[lang][key] || key;

    return (
        <div dir={(lang === 'he' || lang === 'ar') ? 'rtl' : 'ltr'} className={`min-h-screen font-sans transition-colors duration-500 ${currentUser ? 'bg-white text-slate-900' : 'bg-slate-950 text-white'}`}>
            <style>{`
                @keyframes shake { 0%, 100% {transform: translateX(0);} 25% {transform: translateX(-10px);} 75% {transform: translateX(10px);} }
                .shake-anim { animation: shake 0.15s ease-in-out 0s 2; border: 2px solid red !important; }
                .glass { background: rgba(255, 255, 255, 0.92); backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.2); }
                .version-label { position: fixed; bottom: 15px; left: 15px; font-size: 10px; font-weight: 900; color: white; z-index: 100; letter-spacing: 1px; }
            `}</style>

            <div className="version-label">V {APP_VERSION}</div>

            {!currentUser ? (
                <div className="relative min-h-screen flex items-center justify-center p-4">
                    {videoPlaying && (
                        <div className="fixed inset-0 z-0 pointer-events-none">
                            <iframe className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[115vw] h-[115vh] opacity-60 scale-125" src={`https://www.youtube.com/embed/${BACKGROUND_VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${BACKGROUND_VIDEO_ID}&controls=0&start=30`} frameBorder="0" />
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
                        </div>
                    )}
                    <div className={`glass p-12 rounded-[3.5rem] shadow-2xl w-full max-w-xl relative z-10 transition-all ${shakeInput ? 'shake-anim' : ''}`}>
                        <div className="flex justify-between mb-8">
                            <div className="flex gap-2">
                                <button onClick={() => setLang('he')} className={`w-11 h-11 rounded-2xl font-black text-xs border ${lang === 'he' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>עב</button>
                                <button onClick={() => setLang('ar')} className={`w-11 h-11 rounded-2xl font-black text-xs border ${lang === 'ar' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>AR</button>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setLang('en')} className={`w-11 h-11 rounded-2xl font-black text-xs border ${lang === 'en' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>EN</button>
                                <button onClick={() => setLang('ru')} className={`w-11 h-11 rounded-2xl font-black text-xs border ${lang === 'ru' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>RU</button>
                            </div>
                        </div>
                        <img src={LOGO_URL} alt="Logo" className="h-28 mx-auto mb-6 rounded-2xl shadow-md" />
                        <h1 className="text-4xl font-black text-center text-slate-900 mb-2">{t('login_title')}</h1>
                        <p className="text-slate-500 text-center font-bold mb-10">{t('login_subtitle')}</p>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <input type="text" placeholder="User" value={loginUser} className="w-full p-5 bg-slate-50 rounded-2xl border-2 text-slate-900 outline-none text-center text-xl font-black focus:border-purple-500" onChange={e=>setLoginUser(cleanInput(e.target.value))} />
                            <input type="password" placeholder="Pass" value={loginPass} className="w-full p-5 bg-slate-50 rounded-2xl border-2 text-slate-900 outline-none text-center text-xl font-black focus:border-purple-500" onChange={e=>setLoginPass(cleanInput(e.target.value))} />
                            <button className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl text-xl shadow-xl hover:bg-black transition-all">התחברות מאובטחת</button>
                        </form>
                    </div>
                    <button onClick={() => setVideoPlaying(!videoPlaying)} className="fixed bottom-6 right-6 bg-white/10 hover:bg-white/30 backdrop-blur-xl text-white px-5 py-2 rounded-2xl font-black border border-white/20 text-[10px] z-50">
                        {videoPlaying ? "עצור וידאו ⏹" : "הפעל וידאו ▶"}
                    </button>
                </div>
            ) : (
                <div className="flex flex-col min-h-screen">
                    <nav className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
                        <div className="flex items-center gap-4">
                            <img src={LOGO_URL} alt="Logo" className="h-10 rounded-xl" />
                            <button onClick={()=>setActiveSection('courses')} className={`font-black ${activeSection === 'courses' ? 'text-purple-600' : 'text-slate-400'}`}>הקורסים שלי</button>
                            {currentUser.role === 'admin' && <button onClick={()=>setActiveSection('admin')} className={`font-black ${activeSection === 'admin' ? 'text-purple-600' : 'text-slate-400'}`}>ניהול</button>}
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-sm font-black bg-slate-100 px-4 py-2 rounded-full text-slate-900">
                                {currentUser.username === 'rami' && <span className="ml-2">👑</span>}
                                {currentUser.firstName} {currentUser.lastName}
                            </div>
                            <button onClick={()=>setCurrentUser(null)} className="text-red-500 font-black text-xs uppercase bg-red-50 p-2 rounded-lg">יציאה</button>
                        </div>
                    </nav>
                    <main className="p-8 max-w-7xl mx-auto w-full">
                        {activeSection === 'courses' && (
                            <div className="grid md:grid-cols-3 gap-8">
                                {localCourses.length === 0 ? <div className="col-span-3 text-center py-20 font-black text-slate-300 text-2xl uppercase">אין קורסים זמינים</div> : 
                                localCourses.map(c => (
                                    <div key={c.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 hover:-translate-y-2 transition-transform">
                                        <h3 className="font-black text-2xl mb-4">{c.name}</h3>
                                        <p className="text-slate-400 font-bold mb-8 line-clamp-3 text-sm">{c.summary}</p>
                                        <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black">כניסה לשיעור</button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {activeSection === 'admin' && (
                            <div>
                                <div className="flex gap-2 mb-10 bg-slate-100 p-2 rounded-2xl w-fit">
                                    <button onClick={()=>setAdminTab('approvals')} className={`px-6 py-2 rounded-xl font-black text-sm ${adminTab === 'approvals' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>אישורים ({localUsers.filter(u=>u.status==='pending').length})</button>
                                    <button onClick={()=>setAdminTab('institutions')} className={`px-6 py-2 rounded-xl font-black text-sm ${adminTab === 'institutions' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>מוסדות</button>
                                    <button onClick={()=>setAdminTab('users')} className={`px-6 py-2 rounded-xl font-black text-sm ${adminTab === 'users' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>משתמשים</button>
                                    <button onClick={()=>setActiveModal('add_course')} className="px-6 py-2 rounded-xl font-black text-sm bg-purple-600 text-white shadow-lg">+ הוספת קורס</button>
                                </div>
                                {adminTab === 'users' && (
                                    <div className="bg-white p-8 rounded-3xl border shadow-sm flex flex-col items-center">
                                        <h2 className="text-2xl font-black mb-6">ניהול משתמשים</h2>
                                        <button onClick={bulkCreateUsers} className="bg-black text-white px-10 py-4 rounded-2xl font-black shadow-xl mb-10">יצירת 100 חשבונות מהירה ⚡</button>
                                        <div className="w-full overflow-x-auto">
                                            <table className="w-full text-right"><thead className="border-b text-slate-400 font-black text-xs"><tr><th className="pb-4">שם</th><th className="pb-4">סטטוס</th></tr></thead>
                                            <tbody>{localUsers.map(u=>(<tr key={u.id} className="border-b last:border-0"><td className="py-4 font-black">{u.firstName} {u.lastName}</td><td className="py-4"><span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black">{u.status}</span></td></tr>))}</tbody></table>
                                        </div>
                                    </div>
                                )}
                                {adminTab === 'institutions' && (
                                    <div className="bg-white p-8 rounded-3xl border shadow-sm">
                                        <h2 className="text-2xl font-black mb-6">מוסדות</h2>
                                        <div className="grid grid-cols-2 gap-4 mb-8">
                                            <input type="text" placeholder="שם המוסד" className="p-4 bg-slate-50 rounded-xl border" onChange={e=>setInstData({...instData, name:e.target.value})} />
                                            <input type="text" placeholder="סמל מוסד" className="p-4 bg-slate-50 rounded-xl border" onChange={e=>setInstData({...instData, symbol:e.target.value})} />
                                        </div>
                                        <button onClick={async()=>{const id="inst-"+Date.now(); await setDoc(doc(db,'artifacts',appId,'public','data','institutions',id),{...instData, id}); setToastMsg("מוסד נוצר");}} className="bg-purple-600 text-white px-8 py-3 rounded-xl font-black">צור מוסד</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </main>
                </div>
            )}

            {activeModal === 'add_course' && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[60]">
                    <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3rem] shadow-2xl relative text-right">
                        <div className="p-8 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
                            <h2 className="text-2xl font-black">יצירת קורס חדש</h2>
                            <button onClick={()=>setActiveModal(null)} className="text-slate-300 text-2xl font-bold hover:text-slate-600">&times;</button>
                        </div>
                        <div className="p-10 space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2"><label className="text-xs font-black text-slate-500">שם הקורס</label><input type="text" className="w-full p-4 bg-slate-50 rounded-xl border outline-none" onChange={e=>setCourseData({...courseData, name:e.target.value})} /></div>
                                <div className="space-y-2"><label className="text-xs font-black text-slate-500">תחום נלמד</label><input type="text" className="w-full p-4 bg-slate-50 rounded-xl border outline-none" onChange={e=>setCourseData({...courseData, field:e.target.value})} /></div>
                            </div>
                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-2"><label className="text-xs font-black text-slate-500">מכיתה</label><select className="w-full p-4 bg-slate-50 rounded-xl border outline-none font-bold" onChange={e=>setCourseData({...courseData, fromGrade:e.target.value})}><option>א</option><option>ב</option><option>ג</option><option>ד</option><option>ה</option><option>ו</option><option>ז</option><option>ח</option><option>ט</option><option>י</option><option>יא</option><option>יב</option></select></div>
                                <div className="space-y-2"><label className="text-xs font-black text-slate-500">עד כיתה</label><select className="w-full p-4 bg-slate-50 rounded-xl border outline-none font-bold" onChange={e=>setCourseData({...courseData, toGrade:e.target.value})}><option>יב</option><option>יא</option><option>י</option></select></div>
                                <div className="space-y-2"><label className="text-xs font-black text-slate-500">ציוד נדרש</label><input type="text" className="w-full p-4 bg-slate-50 rounded-xl border" onChange={e=>setCourseData({...courseData, equipment:e.target.value})} /></div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500">סוג הקורס (מחוון)</label>
                                <div className="flex bg-slate-100 p-1 rounded-xl">
                                    {['מיומנויות', 'חקר', 'פרויקטים'].map(t=>(<button key={t} onClick={()=>setCourseData({...courseData, type:t})} className={`flex-1 py-3 rounded-lg font-black text-xs transition-all ${courseData.type === t ? 'bg-white shadow-sm text-purple-600' : 'text-slate-400'}`}>1. {t}</button>))}
                                </div>
                            </div>
                            {[{id:'summary', l:'תמצית הקורס'}, {id:'goals', l:'מטרות הקורס'}, {id:'successGoals', l:'יעדי הצלחה מדידים'}, {id:'skills', l:'מיומנויות נרכשות'}, {id:'activeLearning', l:'התבלין המיוחד: למידה אקטיבית'}].map(f=>(
                                <div key={f.id} className="space-y-2">
                                    <div className="flex justify-between items-center"><label className="text-xs font-black text-slate-900">{f.l}</label>
                                    <button onClick={()=>handleAIGen(f.id, f.l)} className="bg-purple-600 text-white text-[10px] font-black px-3 py-1 rounded-full animate-pulse">ייצר עם AI ✨</button></div>
                                    <textarea className="w-full p-4 bg-slate-50 rounded-xl border h-32 outline-none focus:border-purple-500" value={courseData[f.id]} onChange={e=>setCourseData({...courseData, [f.id]:e.target.value})} />
                                </div>
                            ))}
                            <button onClick={async()=>{const id="c-"+Date.now(); await setDoc(doc(db,'artifacts',appId,'public','data','courses',id), {...courseData, id}); setActiveModal(null); setToastMsg("נשמר!");}} className="w-full bg-purple-600 text-white py-6 rounded-3xl font-black text-xl shadow-xl hover:bg-purple-700 transition-all">אשר ושמור קורס</button>
                        </div>
                    </div>
                </div>
            )}
            
            {toastMsg && <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-10 py-4 rounded-full z-[100] shadow-2xl font-black animate-bounce text-sm">{toastMsg}</div>}
        </div>
    );
}
