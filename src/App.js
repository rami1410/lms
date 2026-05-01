import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';

// --- הגדרות מערכת ---
const APP_VERSION = "1.22";
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

// מפת תרגום מקלדת מעברית לאנגלית
const heToEnMap = {
    '/': 'q', '\'': 'w', 'ק': 'e', 'ר': 'r', 'א': 't', 'ט': 'y', 'ו': 'u', 'ן': 'i', 'ם': 'o', 'פ': 'p',
    'ש': 'a', 'ד': 's', 'ג': 'd', 'כ': 'f', 'ע': 'g', 'י': 'h', 'ח': 'j', 'ל': 'k', 'ך': 'l',
    'ז': 'z', 'ס': 'x', 'ב': 'c', 'ה': 'v', 'נ': 'b', 'מ': 'n', 'צ': 'm'
};

// מילון שפות מלא ל-4 שפות
const i18n = {
    he: { login_title: "כניסה למערכת", login_subtitle: "למידה אקטיבית משנה חיים", user_placeholder: "שם משתמש", pass_placeholder: "סיסמה (ריק לאדמין)", btn_login: "התחברות מאובטחת", btn_reg: "יצירת חשבון חדש", back: "חזרה", nav_courses: "הקורסים שלי", nav_admin: "ניהול" },
    en: { login_title: "Secure Login", login_subtitle: "Active Learning Changes Lives", user_placeholder: "Username", pass_placeholder: "Password", btn_login: "Login Now", btn_reg: "Create Account", back: "Back", nav_courses: "My Courses", nav_admin: "Admin" },
    ar: { login_title: "تسجيل الدخول", login_subtitle: "التعلم النشط يغير الحياة", user_placeholder: "اسم المستخدم", pass_placeholder: "كلمة المرور", btn_login: "دخول آمن", btn_reg: "إنشاء حساب", back: "رجوع", nav_courses: "دوراتي", nav_admin: "إدارة" },
    ru: { login_title: "Вход ב систему", login_subtitle: "Активное обучение меняет жизнь", user_placeholder: "Имя пользователя", pass_placeholder: "Пароль", btn_login: "Войти", btn_reg: "Регистрация", back: "Назад", nav_courses: "Мои курсы", nav_admin: "Админ" }
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

    // פונקציית תיקון מקלדת אוטומטי
    const cleanInput = (val) => {
        let cleaned = "";
        let error = false;
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
        else { playBoom(); setToastMsg("Error: Unauthorized"); setTimeout(()=>setToastMsg(''), 2000); }
    };

    const t = (key) => i18n[lang][key] || key;

    return (
        <div dir={(lang === 'he' || lang === 'ar') ? 'rtl' : 'ltr'} className="min-h-screen bg-black font-sans text-slate-800">
            <style>{`
                @keyframes shake { 0%, 100% {transform: translateX(0);} 25% {transform: translateX(-8px);} 75% {transform: translateX(8px);} }
                .shake-anim { animation: shake 0.15s ease-in-out 0s 2; border: 2px solid #ef4444 !important; }
                .video-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; }
                .video-container iframe { width: 100vw; height: 56.25vw; min-height: 100vh; min-width: 177.77vh; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.6; }
            `}</style>

            {/* וידאו רקע כוכבים */}
            {!currentUser && videoPlaying && (
                <div className="video-container">
                    <iframe 
                        src={`https://www.youtube.com/embed/${BACKGROUND_VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${BACKGROUND_VIDEO_ID}&controls=0&showinfo=0&rel=0&start=30`} 
                        frameBorder="0" allow="autoplay; encrypted-media" 
                    />
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"></div>
                </div>
            )}

            {/* מספר גרסה - צד שמאל למטה */}
            <div className="fixed bottom-5 left-5 text-white/80 font-black text-[11px] tracking-widest z-[100] drop-shadow-md">
                V {APP_VERSION}
            </div>

            {!currentUser && (
                <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
                    <div className={`bg-white/95 p-10 rounded-[3.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] w-full max-w-xl border border-white/20 backdrop-blur-md transition-all duration-300 ${shakeInput ? 'shake-anim' : ''}`}>
                        
                        {/* כפתורי שפה מרובעים */}
                        <div className="flex justify-between mb-10">
                            <div className="flex gap-3">
                                <button onClick={() => setLang('he')} className={`w-11 h-11 rounded-2xl font-black text-xs border-2 transition-all ${lang === 'he' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-100 shadow-sm'}`}>עב</button>
                                <button onClick={() => setLang('ar')} className={`w-11 h-11 rounded-2xl font-black text-xs border-2 transition-all ${lang === 'ar' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-100 shadow-sm'}`}>AR</button>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setLang('en')} className={`w-11 h-11 rounded-2xl font-black text-xs border-2 transition-all ${lang === 'en' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-100 shadow-sm'}`}>EN</button>
                                <button onClick={() => setLang('ru')} className={`w-11 h-11 rounded-2xl font-black text-xs border-2 transition-all ${lang === 'ru' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-100 shadow-sm'}`}>RU</button>
                            </div>
                        </div>

                        <img src={LOGO_URL} alt="Logo" className="h-32 mx-auto mb-6 drop-shadow-xl" />
                        <h1 className="text-4xl font-black text-center mb-1 text-slate-900">{t('login_title')}</h1>
                        <p className="text-slate-500 text-center mb-10 font-bold">{t('login_subtitle')}</p>

                        <form onSubmit={handleLogin} className="space-y-5">
                            <input 
                                type="text" 
                                placeholder={t('user_placeholder')} 
                                value={loginUser} 
                                className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-slate-100 outline-none focus:border-blue-500 transition-all text-center text-xl font-black" 
                                onChange={(e) => setLoginUser(cleanInput(e.target.value))} 
                            />
                            <input 
                                type="password" 
                                placeholder={t('pass_placeholder')} 
                                value={loginPass} 
                                className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-slate-100 outline-none focus:border-blue-500 transition-all text-center text-xl font-black" 
                                onChange={(e) => setLoginPass(cleanInput(e.target.value))} 
                            />
                            <button className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-2xl text-xl shadow-2xl transition-all transform active:scale-95">
                                {t('btn_login')}
                            </button>
                            <button type="button" onClick={()=>setIsRegistering(true)} className="w-full text-blue-600 font-black text-sm mt-4 hover:underline">
                                {t('btn_reg')}
                            </button>
                        </form>
                    </div>

                    {/* כפתור עצירת וידאו - צד ימין למטה */}
                    <button 
                        onClick={() => setVideoPlaying(!videoPlaying)}
                        className="fixed bottom-6 right-6 bg-white/10 hover:bg-white/30 backdrop-blur-xl text-white px-5 py-2.5 rounded-2xl font-black border border-white/20 text-[10px] uppercase tracking-tighter shadow-2xl z-50 transition-all active:scale-90 flex items-center gap-2"
                    >
                        <span className={`w-2 h-2 rounded-full ${videoPlaying ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                        {videoPlaying ? "עצור וידאו" : "הפעל וידאו"}
                    </button>
                </div>
            )}

            {currentUser && (
                <div className="flex flex-col min-h-screen bg-slate-50 relative z-10">
                    <nav className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
                        <img src={LOGO_URL} alt="Logo" className="h-12" />
                        <div className="flex gap-8 items-center">
                            <button onClick={()=>setActiveSection('courses')} className={`font-black ${activeSection === 'courses' ? 'text-blue-600 underline decoration-4' : 'text-slate-400'}`}>{t('nav_courses')}</button>
                            {currentUser.role === 'admin' && <button onClick={()=>setActiveSection('admin')} className={`font-black ${activeSection === 'admin' ? 'text-purple-600 underline decoration-4' : 'text-slate-400'}`}>{t('nav_admin')}</button>}
                            <button onClick={()=>setCurrentUser(null)} className="bg-red-50 text-red-600 px-4 py-1 rounded-full font-black text-xs uppercase">Logout</button>
                        </div>
                    </nav>
                    <main className="p-10 max-w-7xl mx-auto w-full">
                        <h2 className="text-4xl font-black mb-12 text-slate-900 border-l-8 border-blue-600 pl-6 tracking-tight">Welcome, {currentUser.firstName}!</h2>
                        {localCourses.length === 0 ? (
                            <div className="bg-white p-20 rounded-[3rem] border-4 border-dashed border-slate-100 text-center text-slate-300 font-black text-2xl uppercase italic tracking-widest">
                                {t('no_courses')}
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-3 gap-10">
                                {localCourses.map(c => (
                                    <div key={c.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-50 hover:-translate-y-2 transition-all duration-300 group">
                                        <h3 className="font-black text-2xl mb-4 group-hover:text-blue-600 transition-colors">{c.name}</h3>
                                        <p className="text-slate-400 text-sm mb-8 leading-relaxed line-clamp-3">{c.summary}</p>
                                        <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black group-hover:bg-blue-600 transition-all">START LESSON</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            )}
            
            {toastMsg && <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-red-600 text-white px-12 py-5 rounded-full z-[100] shadow-2xl font-black animate-bounce tracking-widest text-sm uppercase">{toastMsg}</div>}
        </div>
    );
}
