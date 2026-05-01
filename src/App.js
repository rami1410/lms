import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';

// --- הגדרות מערכת ---
const APP_VERSION = "1.23";
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

// מפת תרגום מקלדת
const heToEnMap = {
    '/': 'q', '\'': 'w', 'ק': 'e', 'ר': 'r', 'א': 't', 'ט': 'y', 'ו': 'u', 'ן': 'i', 'ם': 'o', 'פ': 'p',
    'ש': 'a', 'ד': 's', 'ג': 'd', 'כ': 'f', 'ע': 'g', 'י': 'h', 'ח': 'j', 'ל': 'k', 'ך': 'l',
    'ז': 'z', 'ס': 'x', 'ב': 'c', 'ה': 'v', 'נ': 'b', 'מ': 'n', 'צ': 'm'
};

const i18n = {
    he: { login_title: "כניסה למערכת", login_subtitle: "למידה אקטיבית משנה חיים", btn_login: "התחברות מאובטחת", btn_reg: "יצירת חשבון חדש", nav_courses: "הקורסים שלי", nav_admin: "ניהול", welcome: "שלום, ", no_courses: "אין קורסים זמינים כרגע" },
    en: { login_title: "Secure Login", login_subtitle: "Active Learning Changes Lives", btn_login: "Secure Login", btn_reg: "Create Account", nav_courses: "My Courses", nav_admin: "Admin Panel", welcome: "Hello, ", no_courses: "No courses yet" },
    ar: { login_title: "تسجيل الدخول", login_subtitle: "التعلم النشط يغير الحياة", btn_login: "دخول آمن", btn_reg: "إنشاء حساب", nav_courses: "دوراتي", nav_admin: "إدارة", welcome: "مرحباً, ", no_courses: "لا توجد دورات" },
    ru: { login_title: "Вход в систему", login_subtitle: "Активное обучение меняет жизнь", btn_login: "Войти", btn_reg: "Регистрация", nav_courses: "Мои курсы", nav_admin: "Админ", welcome: "Привет, ", no_courses: "Курсов нет" }
};

export default function App() {
    const [authReady, setAuthReady] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [localUsers, setLocalUsers] = useState([]);
    const [localCourses, setLocalCourses] = useState([]);
    const [lang, setLang] = useState('he');
    const [isRegistering, setIsRegistering] = useState(false);
    const [activeSection, setActiveSection] = useState('courses');
    const [activeModal, setActiveModal] = useState(null);
    const [toastMsg, setToastMsg] = useState('');
    const [shakeInput, setShakeInput] = useState(false);
    const [videoPlaying, setVideoPlaying] = useState(true);

    const [loginUser, setLoginUser] = useState('');
    const [loginPass, setLoginPass] = useState('');
    const [regData, setRegData] = useState({ fname: '', lname: '', user: '', pass1: '' });
    const [courseData, setCourseData] = useState({ name: '', field: 'מתמטיקה', summary: '', goals: '', activeLearning: '' });
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
        const found = localUsers.find(x => x.username === loginUser && x.password === loginPass);
        if (isAdmin) setCurrentUser({ username: 'rami', firstName: 'רמי', role: 'admin', status: 'approved' });
        else if (found) setCurrentUser(found);
        else { playBoom(); setToastMsg("Error"); setTimeout(()=>setToastMsg(''), 2000); }
    };

    const t = (key) => i18n[lang][key] || key;

    const BackgroundVideo = () => (
        videoPlaying && (
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <iframe 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110vw] h-[110vh] object-cover scale-125 opacity-60"
                    src={`https://www.youtube.com/embed/${BACKGROUND_VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${BACKGROUND_VIDEO_ID}&controls=0&start=30`} 
                    frameBorder="0" allow="autoplay" 
                />
                <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]"></div>
            </div>
        )
    );

    return (
        <div dir={(lang === 'he' || lang === 'ar') ? 'rtl' : 'ltr'} className="min-h-screen bg-slate-950 font-sans text-slate-100">
            <style>{`
                @keyframes shake { 0%, 100% {transform: translateX(0);} 25% {transform: translateX(-10px);} 75% {transform: translateX(10px);} }
                .shake-anim { animation: shake 0.15s ease-in-out 0s 2; border: 2px solid red !important; }
                .glass { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.2); }
                .version-label { position: fixed; bottom: 15px; left: 15px; font-size: 10px; font-weight: 900; color: white; opacity: 0.5; z-index: 100; letter-spacing: 1px; }
            `}</style>

            <BackgroundVideo />
            <div className="version-label">V {APP_VERSION}</div>

            {!currentUser ? (
                <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                    <div className={`glass p-12 rounded-[3.5rem] shadow-2xl w-full max-w-xl transition-all ${shakeInput ? 'shake-anim' : ''}`}>
                        <div className="flex justify-between mb-8">
                            <div className="flex gap-2">
                                <button onClick={() => setLang('he')} className={`w-11 h-11 rounded-2xl font-black text-xs border ${lang === 'he' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'}`}>עב</button>
                                <button onClick={() => setLang('ar')} className={`w-11 h-11 rounded-2xl font-black text-xs border ${lang === 'ar' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'}`}>AR</button>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setLang('en')} className={`w-11 h-11 rounded-2xl font-black text-xs border ${lang === 'en' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'}`}>EN</button>
                                <button onClick={() => setLang('ru')} className={`w-11 h-11 rounded-2xl font-black text-xs border ${lang === 'ru' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'}`}>RU</button>
                            </div>
                        </div>

                        <img src={LOGO_URL} alt="Logo" className="h-28 mx-auto mb-6" />
                        <h1 className="text-4xl font-black text-center text-slate-900 mb-2">{t('login_title')}</h1>
                        <p className="text-slate-500 text-center font-bold mb-10">{t('login_subtitle')}</p>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <input type="text" placeholder="User" value={loginUser} className="w-full p-5 bg-slate-50 rounded-2xl border-2 text-slate-900 outline-none text-center text-xl font-black focus:border-blue-500" onChange={e=>setLoginUser(cleanInput(e.target.value))} />
                            <input type="password" placeholder="Pass" value={loginPass} className="w-full p-5 bg-slate-50 rounded-2xl border-2 text-slate-900 outline-none text-center text-xl font-black focus:border-blue-500" onChange={e=>setLoginPass(cleanInput(e.target.value))} />
                            <button className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl text-xl shadow-xl active:scale-95 transition-transform">התחברות מאובטחת</button>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="relative z-10 min-h-screen flex flex-col">
                    <nav className="glass m-4 rounded-3xl p-4 flex justify-between items-center px-8 shadow-xl">
                        <img src={LOGO_URL} alt="Logo" className="h-10" />
                        <div className="flex gap-8 items-center">
                            <button onClick={()=>setActiveSection('courses')} className={`font-black ${activeSection === 'courses' ? 'text-blue-600' : 'text-slate-900'}`}>{t('nav_courses')}</button>
                            {currentUser.role === 'admin' && <button onClick={()=>setActiveSection('admin')} className={`font-black ${activeSection === 'admin' ? 'text-purple-600' : 'text-slate-900'}`}>{t('nav_admin')}</button>}
                            <button onClick={()=>setCurrentUser(null)} className="text-red-600 font-black text-xs uppercase bg-red-50 px-4 py-2 rounded-xl">יציאה</button>
                        </div>
                    </nav>

                    <main className="p-8 max-w-7xl mx-auto w-full">
                        <h2 className="text-5xl font-black mb-12 text-white drop-shadow-lg">{t('welcome')}{currentUser.firstName}</h2>
                        
                        {activeSection === 'courses' && (
                            <div className="grid md:grid-cols-3 gap-8">
                                {localCourses.length === 0 ? <div className="col-span-3 text-center py-20 font-black text-white/30 text-3xl italic">{t('no_courses')}</div> : 
                                localCourses.map(c => (
                                    <div key={c.id} className="glass p-8 rounded-[2.5rem] text-slate-900 hover:-translate-y-2 transition-transform shadow-2xl">
                                        <h3 className="font-black text-2xl mb-4">{c.name}</h3>
                                        <p className="text-slate-500 font-bold mb-8 line-clamp-3">{c.summary}</p>
                                        <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black">כניסה לשיעור</button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeSection === 'admin' && (
                            <div className="glass p-10 rounded-[3.5rem] text-slate-900">
                                <div className="flex justify-between items-center mb-10">
                                    <h2 className="text-3xl font-black">ניהול מערכת</h2>
                                    <button onClick={()=>setActiveModal('add_course')} className="bg-purple-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-purple-200">+ הוספת קורס</button>
                                </div>
                                <div className="space-y-4">
                                    {localUsers.filter(u=>u.status==='pending').map(u=>(
                                        <div key={u.id} className="flex justify-between items-center bg-slate-50 p-6 rounded-3xl border">
                                            <span className="font-black text-xl">{u.firstName} {u.lastName}</span>
                                            <button onClick={()=>updateDoc(doc(db,'artifacts',appId,'public','data','users',u.id),{status:'approved'})} className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-black">אשר כניסה</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            )}

            <button 
                onClick={() => setVideoPlaying(!videoPlaying)}
                className="fixed bottom-6 right-6 bg-white/10 hover:bg-white/30 backdrop-blur-xl text-white px-5 py-2 rounded-2xl font-black border border-white/20 text-[10px] z-50 transition-all"
            >
                {videoPlaying ? "עצור וידאו" : "הפעל וידאו"}
            </button>
        </div>
    );
}
