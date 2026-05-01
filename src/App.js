import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';

// --- הגדרות מערכת (נמשכות מ-Vercel) ---
const APP_VERSION = "1.23";
const firebaseConfigStr = process.env.NEXT_PUBLIC_FIREBASE_CONFIG;
const firebaseConfig = firebaseConfigStr ? JSON.parse(firebaseConfigStr) : {};
const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const appId = 'edu-nextjs-v1';
const LOGO_URL = "https://i.postimg.cc/mrzcZWpL/lwgw-hwtm-mwnps.gif";
const BACKGROUND_VIDEO_ID = "OHLMTgHl6cc";

// צליל בום לשגיאה
const BOOM_SOUND = "https://actions.google.com/sounds/v1/science_fiction/low_fuzz_explosion.ogg";

let app, db, auth;
if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
}

// מפת תרגום מקלדת מעברית לאנגלית (QWERTY)
const heToEnMap = {
    '/': 'q', '\'': 'w', 'ק': 'e', 'ר': 'r', 'א': 't', 'ט': 'y', 'ו': 'u', 'ן': 'i', 'ם': 'o', 'פ': 'p',
    'ש': 'a', 'ד': 's', 'ג': 'd', 'כ': 'f', 'ע': 'g', 'י': 'h', 'ח': 'j', 'ל': 'k', 'ך': 'l',
    'ז': 'z', 'ס': 'x', 'ב': 'c', 'ה': 'v', 'נ': 'b', 'מ': 'n', 'צ': 'm'
};

const i18n = {
    he: { login_title: "כניסה למערכת", login_subtitle: "למידה אקטיבית משנה חיים", btn_login_secure: "התחברות מאובטחת", btn_register_new: "יצירת חשבון חדש", btn_submit_request: "שלח בקשת הצטרפות", btn_back_login: "חזרה לכניסה", nav_my_courses: "הקורסים שלי", nav_admin: "ניהול", welcome_prefix: "שלום, ", no_courses: "אין קורסים זמינים כרגע" },
    en: { login_title: "Secure Login", login_subtitle: "Active Learning Changes Lives", btn_login_secure: "Secure Login", btn_register_new: "Create New Account", btn_submit_request: "Submit Request", btn_back_login: "Back to Login", nav_my_courses: "My Courses", nav_admin: "Admin Panel", welcome_prefix: "Hello, ", no_courses: "No courses available yet" },
    ar: { login_title: "تسجيل الدخول", login_subtitle: "التعلم النشط يغير الحياة", btn_login_secure: "دخول آمن", btn_register_new: "إنشاء حساب جديد", btn_submit_request: "إرسال طلب", btn_back_login: "العودة للدخول", nav_my_courses: "دوراتي", nav_admin: "إدارة", welcome_prefix: "مرحباً, ", no_courses: "لا توجد دورات حالياً" },
    ru: { login_title: "Вход ב систему", login_subtitle: "Активное обучение меняет жизнь", btn_login_secure: "Безопасный вход", btn_register_new: "Создать аккаунт", btn_submit_request: "Отправить запрос", btn_back_login: "Назад", nav_my_courses: "Мои курсы", nav_admin: "Админ", welcome_prefix: "Привет, ", no_courses: "Курсов пока нет" }
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
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
        }
        setShakeInput(true);
        setTimeout(() => setShakeInput(false), 500);
    };

    const cleanInput = (val) => {
        let cleaned = "";
        let errorTriggered = false;
        for (let char of val) {
            let lowerChar = char.toLowerCase();
            if (heToEnMap[char]) { cleaned += heToEnMap[char]; } 
            else if (/[a-z0-9]/.test(lowerChar)) { cleaned += lowerChar; } 
            else { errorTriggered = true; }
        }
        if (errorTriggered) playBoom();
        return cleaned;
    };

    const handleLogin = (e) => {
        e.preventDefault();
        const isAdmin = (loginUser === 'rami') && (loginPass === '1234');
        const found = localUsers.find(x => x.username === loginUser && x.password === loginPass);
        if (isAdmin) setCurrentUser({ username: 'rami', firstName: 'רמי', role: 'admin', status: 'approved' });
        else if (found) setCurrentUser(found);
        else { playBoom(); setToastMsg("פרטים שגויים"); setTimeout(()=>setToastMsg(''), 2000); }
    };

    const t = (key) => i18n[lang][key] || key;

    const BackgroundVideo = () => (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            <iframe 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[115vw] h-[115vh] object-cover scale-125 opacity-70"
                src={`https://www.youtube.com/embed/${BACKGROUND_VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${BACKGROUND_VIDEO_ID}&controls=0&start=30`} 
                frameBorder="0" 
                allow="autoplay" 
            />
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]"></div>
        </div>
    );

    return (
        <div dir={(lang === 'he' || lang === 'ar') ? 'rtl' : 'ltr'} className="min-h-screen bg-slate-950 font-sans text-slate-100">
            <style>{`
                @keyframes shake { 0%, 100% {transform: translateX(0);} 25% {transform: translateX(-10px);} 75% {transform: translateX(10px);} }
                .shake-anim { animation: shake 0.15s ease-in-out 0s 2; border: 2px solid red !important; }
                .glass { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.2); }
                .version-label { position: fixed; bottom: 15px; left: 15px; font-size: 10px; font-weight: 900; color: white; opacity: 1.0; z-index: 100; pointer-events: none; letter-spacing: 1px; }
            `}</style>

            {/* רקע וידאו - מותנה ב-state */}
            {videoPlaying && <BackgroundVideo />}
            
            {/* מספר גרסה - צד שמאל למטה, לבן בולט */}
            <div className="version-label">V {APP_VERSION}</div>

            {!currentUser && (
                <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                    
                    {/* קופסת כניסה - Glassmorphism */}
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

                        {/* לוגו עם פינות מעוגלות */}
                        <img src={LOGO_URL} alt="Logo" className="h-28 mx-auto mb-6 rounded-2xl" />
                        <h1 className="text-4xl font-black text-center text-slate-900 mb-2">{t('login_title')}</h1>
                        <p className="text-slate-500 text-center font-bold mb-10">{t('login_subtitle')}</p>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <input type="text" placeholder="שם משתמש" value={loginUser} className="w-full p-5 bg-slate-50 rounded-2xl border-2 text-slate-900 outline-none text-center text-xl font-black focus:border-purple-500" onChange={(e) => setLoginUser(cleanInput(e.target.value))} />
                            <input type="password" placeholder="סיסמה" value={loginPass} className="w-full p-5 bg-slate-50 rounded-2xl border-2 text-slate-900 outline-none text-center text-xl font-black focus:border-purple-500" onChange={(e) => setLoginPass(cleanInput(e.target.value))} />
                            <button className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl text-xl shadow-xl hover:bg-black transition-all">התחברות מאובטחת</button>
                        </form>
                    </div>

                    {/* כפתור עצירת וידאו - צד ימין למטה */}
                    <button 
                        onClick={() => setVideoPlaying(!videoPlaying)}
                        className="fixed bottom-6 right-6 bg-white/10 hover:bg-white/30 backdrop-blur-xl text-white px-5 py-2 rounded-2xl font-black border border-white/20 text-[10px] z-50 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <span className={`w-2 h-2 rounded-full ${videoPlaying ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                        {videoPlaying ? "עצור וידאו ⏹" : "הפעל וידאו ▶"}
                    </button>
                </div>
            )}

            {currentUser && (
                <div className="relative z-10 flex flex-col min-h-screen">
                    <nav className="glass m-4 rounded-3xl p-4 flex justify-between items-center px-8 shadow-xl">
                        <div className="flex gap-4 items-center">
                            {/* לוגו בניווט עם פינות מעוגלות */}
                            <img src={LOGO_URL} alt="Logo" className="h-10 rounded-2xl" />
                            <button onClick={()=>setActiveSection('courses')} className={`font-black ${activeSection === 'courses' ? 'text-blue-600' : 'text-slate-900'}`}>{t('nav_my_courses')}</button>
                            {currentUser.role === 'admin' && <button onClick={()=>setActiveSection('admin')} className={`font-black ${activeSection === 'admin' ? 'text-purple-600' : 'text-slate-900'}`}>{t('nav_admin')}</button>}
                        </div>
                        <button onClick={()=>setCurrentUser(null)} className="text-red-500 font-black text-xs uppercase bg-red-50 p-2 rounded-lg">יציאה</button>
                    </nav>
                    <main className="p-8 flex-grow">
                        <h2 className="text-4xl font-black mb-10 text-white">{t('welcome_prefix')}{currentUser.firstName}!</h2>
                        {localCourses.length === 0 ? <div className="text-center py-20 text-white/30 font-bold text-xl">{t('no_courses')}</div> : 
                        localCourses.map(c => (
                            <div key={c.id} className="bg-white/95 p-6 rounded-3xl text-slate-900 mb-6 shadow-xl">
                                <h3 className="font-black text-xl mb-2">{c.name}</h3>
                                <p className="text-slate-500 text-sm mb-4">{c.summary}</p>
                                <button className="bg-slate-900 text-white py-2 px-4 rounded-lg font-black text-sm">כניסה לשיעור</button>
                            </div>
                        ))}
                    </main>
                </div>
            )}
            
            {toastMsg && <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-red-600 text-white px-10 py-4 rounded-full z-[100] shadow-2xl font-black animate-bounce tracking-widest text-sm uppercase">{toastMsg}</div>}
        </div>
    );
}
