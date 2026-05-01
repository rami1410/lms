import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';

// --- הגדרות מערכת ---
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
    ru: { login_title: "Вход в систему", login_subtitle: "Активное обучение меняет жизнь", btn_login_secure: "Безопасный вход", btn_register_new: "Создать аккаунт", btn_submit_request: "Отправить запрос", btn_back_login: "Назад", nav_my_courses: "Мои курсы", nav_admin: "Админ", welcome_prefix: "Привет, ", no_courses: "Курсов пока нет" }
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

    const [loginUser, setLoginUser] = useState('');
    const [loginPass, setLoginPass] = useState('');
    const [regData, setRegData] = useState({ fname: '', lname: '', user: '', pass1: '' });
    
    const [courseData, setCourseData] = useState({ name: '', field: 'מתמטיקה', summary: '', goals: '', activeLearning: '' });
    const [aiLoading, setAiLoading] = useState(null);

    const audioRef = useRef(new Audio(BOOM_SOUND));

    useEffect(() => {
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
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
        setShakeInput(true);
        setTimeout(() => setShakeInput(false), 500);
    };

    // פונקציית הקסם - ניקוי ותיקון קלט בזמן אמת
    const cleanInput = (val) => {
        let cleaned = "";
        let errorTriggered = false;

        for (let char of val) {
            let lowerChar = char.toLowerCase();
            // אם זו אות בעברית - המר לאנגלית
            if (heToEnMap[char]) {
                cleaned += heToEnMap[char];
            } 
            // אם זו אות אנגלית קטנה או מספר - הוסף כפי שהיא
            else if (/[a-z0-9]/.test(lowerChar)) {
                cleaned += lowerChar;
            } 
            // כל דבר אחר (רווחים, סימנים, עברית שלא במפה) - חסום והפעל בום
            else {
                errorTriggered = true;
            }
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

    const handleRegister = async (e) => {
        e.preventDefault();
        const newUser = { username: regData.user, password: regData.pass1, role: 'student', status: 'pending', firstName: regData.fname, lastName: regData.lname };
        if (db) await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', regData.user), newUser);
        setToastMsg("נרשמת! המתן לאישור.");
        setTimeout(()=>setToastMsg(''), 3000);
        setIsRegistering(false);
    };

    const handleAIGen = async (field) => {
        if (!geminiApiKey || !courseData.name) return;
        setAiLoading(field);
        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: `Write a short ${field} in Hebrew for a school course named: ${courseData.name}` }] }] })
            });
            const data = await res.json();
            setCourseData(prev => ({...prev, [field]: data.candidates[0].content.parts[0].text.trim()}));
        } catch (e) {}
        setAiLoading(null);
    };

    const t = (key) => i18n[lang][key] || key;

    return (
        <div dir={(lang === 'he' || lang === 'ar') ? 'rtl' : 'ltr'} className="min-h-screen bg-slate-50 font-sans text-slate-800">
            <style>{`
                @keyframes shake { 0%, 100% {transform: translateX(0);} 25% {transform: translateX(-10px);} 75% {transform: translateX(10px);} }
                .shake-anim { animation: shake 0.2s ease-in-out 0s 2; border: 2px solid red !important; }
            `}</style>

            {!currentUser && (
                <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
                    {/* רקע וידאו */}
                    <div className="fixed inset-0 z-[-1]">
                        <iframe className="absolute w-[300%] h-[300%] top-[-100%] left-[-100%]" src={`https://www.youtube.com/embed/${BACKGROUND_VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${BACKGROUND_VIDEO_ID}&controls=0&start=30`} frameBorder="0" allow="autoplay" />
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
                    </div>

                    {/* קופסת כניסה */}
                    <div className={`bg-white/95 p-10 rounded-[3rem] shadow-2xl w-full max-w-xl border border-white/20 backdrop-blur-md transition-all ${shakeInput ? 'shake-anim' : ''}`}>
                        
                        {/* כפתורי שפה בעיצוב המבוקש */}
                        <div className="flex justify-between mb-8">
                            <div className="flex gap-2">
                                <button onClick={() => setLang('he')} className={`w-10 h-10 rounded-full font-black text-xs border ${lang === 'he' ? 'bg-slate-900 text-white' : 'bg-slate-100'}`}>עב</button>
                                <button onClick={() => setLang('ar')} className={`w-10 h-10 rounded-full font-black text-xs border ${lang === 'ar' ? 'bg-slate-900 text-white' : 'bg-slate-100'}`}>AR</button>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setLang('en')} className={`w-10 h-10 rounded-full font-black text-xs border ${lang === 'en' ? 'bg-slate-900 text-white' : 'bg-slate-100'}`}>EN</button>
                                <button onClick={() => setLang('ru')} className={`w-10 h-10 rounded-full font-black text-xs border ${lang === 'ru' ? 'bg-slate-900 text-white' : 'bg-slate-100'}`}>RU</button>
                            </div>
                        </div>

                        <img src={LOGO_URL} alt="Logo" className="h-24 mx-auto mb-4" />
                        <h1 className="text-4xl font-black text-center mb-1">{t('login_title')}</h1>
                        <p className="text-slate-500 text-center mb-10">{t('login_subtitle')}</p>

                        {!isRegistering ? (
                            <form onSubmit={handleLogin} className="space-y-4">
                                <input type="text" placeholder="שם משתמש" value={loginUser} className="w-full p-5 bg-slate-50 rounded-2xl border-2 outline-none focus:border-blue-500 transition-all text-center text-xl font-bold" 
                                    onChange={(e) => setLoginUser(cleanInput(e.target.value))} />
                                <input type="password" placeholder="סיסמה" value={loginPass} className="w-full p-5 bg-slate-50 rounded-2xl border-2 outline-none focus:border-blue-500 transition-all text-center text-xl font-bold" 
                                    onChange={(e) => setLoginPass(cleanInput(e.target.value))} />
                                <button className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl text-xl shadow-xl hover:bg-black transition-all">התחברות מאובטחת</button>
                                <button type="button" onClick={()=>setIsRegistering(true)} className="w-full text-blue-600 font-bold mt-4">יצירת חשבון חדש</button>
                            </form>
                        ) : (
                            <form onSubmit={handleRegister} className="space-y-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="text" placeholder="פרטי" className="p-4 bg-slate-50 rounded-2xl border-2 outline-none" onChange={e=>setRegData({...regData, fname: e.target.value})} />
                                    <input type="text" placeholder="משפחה" className="p-4 bg-slate-50 rounded-2xl border-2 outline-none" onChange={e=>setRegData({...regData, lname: e.target.value})} />
                                </div>
                                <input type="text" placeholder="שם משתמש (אנגלית)" value={regData.user} className="w-full p-4 bg-slate-50 rounded-2xl border-2 outline-none text-center" onChange={e=>setRegData({...regData, user: cleanInput(e.target.value)})} />
                                <input type="password" placeholder="סיסמה" value={regData.pass1} className="w-full p-4 bg-slate-50 rounded-2xl border-2 outline-none text-center" onChange={e=>setRegData({...regData, pass1: cleanInput(e.target.value)})} />
                                <button className="w-full bg-emerald-600 text-white font-black py-5 rounded-2xl text-xl">שלח בקשת הצטרפות</button>
                                <button type="button" onClick={()=>setIsRegistering(false)} className="w-full text-slate-400 font-bold mt-2">חזרה לכניסה</button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {currentUser && (
                <div className="flex flex-col min-h-screen">
                    <nav className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
                        <img src={LOGO_URL} alt="Logo" className="h-10" />
                        <div className="flex gap-6 items-center">
                            <button onClick={()=>setActiveSection('courses')} className={`font-black ${activeSection === 'courses' ? 'text-blue-600 underline' : ''}`}>{t('nav_my_courses')}</button>
                            {currentUser.role === 'admin' && <button onClick={()=>setActiveSection('admin')} className={`font-black ${activeSection === 'admin' ? 'text-purple-600 underline' : ''}`}>{t('nav_admin')}</button>}
                            <button onClick={()=>setCurrentUser(null)} className="text-red-500 font-black">יציאה</button>
                        </div>
                    </nav>
                    <main className="p-8 max-w-6xl mx-auto w-full text-center">
                        <h2 className="text-4xl font-black mb-10">{t('welcome_prefix')}{currentUser.firstName}!</h2>
                        {activeSection === 'courses' && (
                            <div className="grid md:grid-cols-3 gap-8">
                                {localCourses.map(c => (
                                    <div key={c.id} className="bg-white p-8 rounded-3xl shadow-lg border hover:scale-105 transition-all">
                                        <h3 className="font-black text-2xl mb-4">{c.name}</h3>
                                        <p className="text-slate-500 mb-6">{c.summary}</p>
                                        <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-black">כניסה לשיעור</button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {activeSection === 'admin' && (
                            <div className="flex flex-col items-center">
                                <button onClick={()=>setActiveModal('add_course')} className="bg-purple-600 text-white px-10 py-4 rounded-2xl font-black text-xl shadow-lg">+ הוספת קורס חדש</button>
                            </div>
                        )}
                    </main>
                </div>
            )}

            {/* מודל הוספת קורס */}
            {activeModal === 'add_course' && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-10 rounded-[3rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <h2 className="text-3xl font-black mb-8 text-center">יצירת קורס חדש</h2>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const id = "c-" + Date.now();
                            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'courses', id), {...courseData, id});
                            setActiveModal(null);
                        }} className="space-y-6 text-right">
                            <input type="text" placeholder="שם הקורס" className="w-full p-4 bg-slate-100 rounded-2xl border-2 outline-none" onChange={e=>setCourseData({...courseData, name:e.target.value})} required />
                            {['summary', 'goals', 'activeLearning'].map(f => (
                                <div key={f} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <button type="button" onClick={()=>handleAIGen(f)} className="bg-blue-600 text-white text-xs font-black px-4 py-2 rounded-full">
                                            {aiLoading === f ? 'מייצר...' : 'ייצר ב-AI ✨'}
                                        </button>
                                        <label className="font-black text-slate-600 uppercase">{f}</label>
                                    </div>
                                    <textarea className="w-full p-4 bg-slate-100 rounded-2xl border-2 h-32 outline-none" value={courseData[f]} onChange={e=>setCourseData({...courseData, [f]:e.target.value})} />
                                </div>
                            ))}
                            <div className="flex gap-4 pt-4">
                                <button type="submit" className="flex-1 bg-blue-600 text-white font-black py-4 rounded-2xl text-xl">שמור קורס</button>
                                <button type="button" onClick={()=>setActiveModal(null)} className="flex-1 bg-slate-100 font-black py-4 rounded-2xl text-xl text-slate-400">ביטול</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {toastMsg && <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-red-600 text-white px-10 py-4 rounded-full z-[100] shadow-2xl font-black animate-bounce">{toastMsg}</div>}
        </div>
    );
}
