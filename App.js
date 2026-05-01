import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore';

// --- Firebase Configuration ---
// In your real Next.js app, replace this with your actual Firebase config object
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const appId = typeof __app_id !== 'undefined' ? __app_id : 'edu-nextjs-v1';
const apiKey = ""; // Gemini API Key (handled by Canvas environment)

let app, db, auth;
if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
}

// --- I18n Dictionary ---
const i18n = {
    he: { login_title: "כניסה למערכת", login_subtitle: "למידה אקטיבית משנה חיים", btn_login_secure: "התחברות מאובטחת", btn_register_new: "יצירת חשבון חדש", reg_cookies: "אישור עוגיות לצרכי אבטחה", reg_privacy: "הסכמה לאמנת פרטיות מחמירה", btn_submit_request: "שלח בקשת הצטרפות", btn_back_login: "חזרה לכניסה", nav_my_courses: "הקורסים שלי", nav_admin: "ניהול", welcome_prefix: "שלום, ", msg_pending_approval: "חשבונך ממתין לאישור אבטחה.", admin_title_full: "מרכז ניהול ואבטחה", admin_approvals: "אישורי כניסה", admin_add_course: "הוספת קורס +", msg_only_english: "רק אותיות באנגלית" },
    en: { login_title: "Secure Login", login_subtitle: "Active Learning Changes Lives", btn_login_secure: "Secure Login", btn_register_new: "Create New Account", reg_cookies: "Accept cookies for security", reg_privacy: "Agree to privacy policy", btn_submit_request: "Submit Request", btn_back_login: "Back to Login", nav_my_courses: "My Courses", nav_admin: "Admin Panel", welcome_prefix: "Hello, ", msg_pending_approval: "Awaiting security approval.", admin_title_full: "Security & Management", admin_approvals: "Approvals", admin_add_course: "Add New Course +", msg_only_english: "Only English letters" },
    ru: { login_title: "Безопасный вход", login_subtitle: "Активное обучение меняет жизнь", btn_login_secure: "Войти", btn_register_new: "Создать аккаунт", reg_cookies: "Принять cookies", reg_privacy: "Согласен с политикой", btn_submit_request: "Отправить запрос", btn_back_login: "Назад ко входу", nav_my_courses: "Мои курсы", nav_admin: "Управление", welcome_prefix: "Привет, ", msg_pending_approval: "Ожидание одобрения.", admin_title_full: "Управление и безопасность", admin_approvals: "Одобрения", admin_add_course: "Добавить курс +", msg_only_english: "Только английские буквы" },
    ar: { login_title: "تسجيل دخول آمن", login_subtitle: "التعلم النشط يغير الحياة", btn_login_secure: "دخول آمن", btn_register_new: "إنشاء حساب جديد", reg_cookies: "الموافقة على ملفات الارتباط", reg_privacy: "الموافقة على الخصوصية", btn_submit_request: "إرسال الطلب", btn_back_login: "العودة للدخول", nav_my_courses: "دوراتي", nav_admin: "الإدارة", welcome_prefix: "مرحباً، ", msg_pending_approval: "ينتظر الموافقة الأمنية.", admin_title_full: "مركز الإدارة", admin_approvals: "الموافقات", admin_add_course: "إضافة دورة +", msg_only_english: "أحرف إنجليزية فقط" }
};

const allGrades = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ז'", "ח'", "ט'", "י'", "יא'", "יב'", "BA", "MA", "כולם"];

export default function App() {
    // Global State
    const [authReady, setAuthReady] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [localUsers, setLocalUsers] = useState([]);
    const [localCourses, setLocalCourses] = useState([]);
    const [localInstitutions, setLocalInstitutions] = useState([]);
    const [localFields, setLocalFields] = useState(["מתמטיקה", "אנגלית", "מדעי המחשב", "פיזיקה", "רובוטיקה", "הנדסת תוכנה"]);
    const [localEquipment, setLocalEquipment] = useState(["מחשבים", "טאבלטים", "VEX Robotics", "Arduino", "מלחמים"]);
    
    // UI State
    const [lang, setLang] = useState('he');
    const [isRegistering, setIsRegistering] = useState(false);
    const [activeSection, setActiveSection] = useState('courses');
    const [activeModal, setActiveModal] = useState(null);
    const [toastMsg, setToastMsg] = useState('');
    const [hintError, setHintError] = useState(null);

    // Form States
    const [loginUser, setLoginUser] = useState('');
    const [loginPass, setLoginPass] = useState('');
    
    const [regData, setRegData] = useState({ fname: '', lname: '', user: '', school: '', grade: '', pass1: '', pass2: '' });
    const [courseData, setCourseData] = useState({ name: '', field: 'מתמטיקה', customField: '', gradeFrom: "א'", gradeTo: "יב'", equipment: 'מחשבים', customEquipment: '', type: 'skills', summary: '', goals: '', targets: '', skills: '', activeLearning: '', prereqs: [] });
    
    const [newInstName, setNewInstName] = useState('');
    const [newInstSymbol, setNewInstSymbol] = useState('');
    const [assignCourseId, setAssignCourseId] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);

    // --- Initialization & Sync ---
    useEffect(() => {
        const detectLang = () => {
            try {
                const bLang = navigator.language.split('-')[0];
                const saved = localStorage.getItem('lms_pref_lang');
                if (saved) return saved;
                if (['he', 'en', 'ru', 'ar'].includes(bLang)) return bLang;
            } catch(e) {}
            return 'he';
        };
        setLang(detectLang());

        if (!auth) {
            setAuthReady(true);
            return;
        }

        const initAuth = async () => {
            if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                await signInWithCustomToken(auth, __initial_auth_token);
            } else {
                await signInAnonymously(auth);
            }
        };
        initAuth();

        const unsubAuth = onAuthStateChanged(auth, (user) => {
            if (user) setAuthReady(true);
        });

        return () => unsubAuth();
    }, []);

    useEffect(() => {
        if (!authReady || !db) return;
        const unsubUsers = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'users'), snap => setLocalUsers(snap.docs.map(d => ({...d.data(), id: d.id}))));
        const unsubCourses = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'courses'), snap => setLocalCourses(snap.docs.map(d => ({...d.data(), id: d.id}))));
        const unsubInsts = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'institutions'), snap => setLocalInstitutions(snap.docs.map(d => ({...d.data(), id: d.id}))));
        const unsubFields = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'fields'), snap => {
            const fields = snap.docs.map(d => d.data().name);
            if(fields.length > 0) setLocalFields(fields);
        });
        const unsubEq = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'equipment'), snap => {
            const eq = snap.docs.map(d => d.data().name);
            if(eq.length > 0) setLocalEquipment(eq);
        });

        return () => { unsubUsers(); unsubCourses(); unsubInsts(); unsubFields(); unsubEq(); };
    }, [authReady]);

    // Check block status live
    useEffect(() => {
        if (currentUser) {
            const freshUser = localUsers.find(u => u.username === currentUser.username);
            if (freshUser?.status === 'blocked') handleLogout();
        }
    }, [localUsers]);

    // --- Helpers ---
    const showToast = (msg) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(''), 3000);
    };

    const t = (key) => i18n[lang][key] || key;

    const handleLangChange = (newLang) => {
        setLang(newLang);
        try { localStorage.setItem('lms_pref_lang', newLang); } catch(e){}
    };

    const triggerExplosion = (target) => {
        const rect = target.getBoundingClientRect();
        const spark = document.createElement('div');
        spark.className = 'explosion-spark';
        spark.style.left = `${rect.right - 40}px`;
        spark.style.top = `${rect.top + 20}px`;
        document.body.appendChild(spark);
        setTimeout(() => spark.remove(), 500);

        target.classList.add('shake', 'border-red-500');
        setTimeout(() => target.classList.remove('shake', 'border-red-500'), 400);
    };

    const validateInput = (e, setter, fieldName, maxLen) => {
        const raw = e.target.value.toLowerCase();
        if (/[^a-z0-9]/.test(raw)) {
            triggerExplosion(e.target);
            setHintError(fieldName);
            setTimeout(() => setHintError(null), 1500);
        }
        setter(raw.replace(/[^a-z0-9]/g, '').substring(0, maxLen));
    };

    // --- Actions ---
    const handleLogin = (e) => {
        e.preventDefault();
        const isAdmin = (loginUser === 'rami' || loginUser === 'רמי') && (!loginPass || loginPass.trim() === "");
        const found = localUsers.find(x => x.username === loginUser && (isAdmin || x.password === loginPass));
        
        if (!found && !isAdmin) return showToast("פרטים שגויים");
        if (found?.status === 'blocked') return showToast("נחסמת ע\"י המערכת");

        setCurrentUser(found || { username: 'rami', firstName: 'רמי', role: 'admin', status: 'approved', institution: 'ניהול', grade: 'ז' });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (localUsers.find(u => u.username === regData.user)) return showToast("שם משתמש תפוס");
        if (regData.pass1 !== regData.pass2) return showToast("הסיסמאות לא תואמות");

        const newUser = {
            username: regData.user, password: regData.pass1, role: (regData.user === 'rami' ? 'admin' : 'student'), 
            status: (regData.user === 'rami' ? 'approved' : 'pending'),
            firstName: regData.fname, lastName: regData.lname, institution: regData.school, grade: regData.grade
        };
        
        if (db) await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', regData.user), newUser);
        showToast(regData.user === 'rami' ? "חשבון אדמין נוצר!" : "נרשמת! המתן לאישור.");
        
        // Auto-login
        setCurrentUser(newUser);
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setLoginUser(''); setLoginPass('');
    };

    const handleAddCourse = async (e) => {
        e.preventDefault();
        let f = courseData.field === 'CUSTOM' ? courseData.customField : courseData.field;
        let eq = courseData.equipment === 'CUSTOM' ? courseData.customEquipment : courseData.equipment;
        
        if (db && courseData.field === 'CUSTOM' && f) await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'fields', f), {name: f});
        if (db && courseData.equipment === 'CUSTOM' && eq) await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'equipment', eq), {name: eq});

        const id = "c-" + Date.now();
        const payload = {
            id, name: courseData.name, field: f, equipment: eq,
            gradeFrom: courseData.gradeFrom, gradeTo: courseData.gradeTo,
            summary: courseData.summary, goals: courseData.goals,
            targets: courseData.targets, skills: courseData.skills,
            activeLearning: courseData.activeLearning, type: courseData.type, prerequisites: courseData.prereqs, institutions: []
        };
        if(db) await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'courses', id), payload);
        showToast("הקורס נשמר בהצלחה!");
        setActiveModal(null);
    };

    const handleAIGen = async (field) => {
        if(!courseData.name) return showToast("הזן קודם שם קורס");
        setAiLoading(field);
        
        let prompt = `כתוב תמצית בעברית לקורס: ${courseData.name}`;
        if(field === 'goals') prompt = `כתוב מטרות לימוד לקורס: ${courseData.name}`;
        if(field === 'targets') prompt = `כתוב 3 יעדי הצלחה מדידים לקורס: ${courseData.name}`;
        if(field === 'skills') prompt = `כתוב רשימת מיומנויות נרכשות לקורס: ${courseData.name}`;
        if(field === 'activeLearning') prompt = `תאר בעברית איך הלומד מבצע למידה אקטיבית בקורס "${courseData.name}" (עבודה עם הידיים, תכנון, ביצוע).`;

        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
            const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
            const data = await res.json();
            const result = data.candidates?.[0]?.content?.parts?.[0]?.text.trim() || "";
            setCourseData(prev => ({...prev, [field]: result}));
        } catch(e) { showToast("שגיאה ב-AI"); }
        setAiLoading(null);
    };

    const setStatus = async (id, status) => {
        if(db) await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', id), { status });
    };

    const deleteCourse = async (id) => {
        if(confirm("למחוק את הקורס?") && db) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'courses', id));
    };

    const addInst = async () => {
        if(!newInstName || !newInstSymbol) return showToast("מלא שם וסמל");
        if(db) await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'institutions', "inst-"+Date.now()), { name: newInstName, symbol: newInstSymbol });
        setNewInstName(''); setNewInstSymbol(''); showToast("מוסד נוסף!");
    };
    const deleteInst = async (id) => {
        if(confirm("להסיר מוסד?") && db) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'institutions', id));
    };

    const toggleAssignment = async (instName, isAssigned) => {
        const course = localCourses.find(c => c.id === assignCourseId);
        let assigned = course.institutions || [];
        if(isAssigned) { if(!assigned.includes(instName)) assigned.push(instName); }
        else { assigned = assigned.filter(x => x !== instName); }
        if(db) await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'courses', assignCourseId), { institutions: assigned });
    };

    // --- Computed Values ---
    const dir = (lang === 'he' || lang === 'ar') ? 'rtl' : 'ltr';
    const kidGrades = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'"];
    const isKidTheme = currentUser && kidGrades.includes(currentUser.grade);
    const pendingUsers = localUsers.filter(u => u.status === 'pending');
    
    const availableCourses = localCourses.filter(c => {
        if(!currentUser) return false;
        if(currentUser.role === 'admin') return true;
        const assigned = c.institutions || [];
        return assigned.includes('חותם חיים') || assigned.includes(currentUser.institution);
    });

    // --- Render ---
    if (!authReady) {
        return (
            <div className="fixed inset-0 z-[2000] bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-white font-bold tracking-widest text-sm">טוען סביבה מאובטחת...</p>
                </div>
            </div>
        );
    }

    return (
        <div dir={dir} className={`min-h-screen bg-slate-50 font-sans text-slate-800 ${isKidTheme ? 'kid-theme' : ''}`}>
            
            <style>{`
                .explosion-spark { position: absolute; width: 14px; height: 14px; background: #ef4444; border-radius: 50%; pointer-events: none; animation: explode 0.5s cubic-bezier(0, 0, 0.2, 1) forwards; box-shadow: 0 0 12px #ef4444; z-index: 2000; }
                @keyframes explode { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(6); opacity: 0; } }
                .shake { animation: shake 0.3s ease-in-out; }
                @keyframes shake { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-6px); } 40%, 80% { transform: translateX(6px); } }
                :focus-visible { outline: 3px solid #3b82f6 !important; outline-offset: 2px; }
                .kid-theme .bg-slate-900 { background-color: #8ec63f !important; }
                .kid-theme .bg-blue-600, .kid-theme .bg-indigo-600, .kid-theme .bg-purple-600 { background-color: #4ec1e0 !important; }
                .kid-theme button { border-radius: 9999px !important; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
            `}</style>

            {/* Auth Screen */}
            {!currentUser && (
                <div className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden">
                    <div className="absolute inset-0 bg-slate-900 z-0"></div>
                    <div className="bg-white/95 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md z-10 relative">
                        
                        <div className="flex justify-between items-center mb-8 px-1">
                            <div className="flex gap-2">
                                <button type="button" onClick={() => handleLangChange('ru')} className={`px-2 py-1 rounded-lg font-bold text-xs border border-slate-200 ${lang === 'ru' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>RU</button>
                                <button type="button" onClick={() => handleLangChange('en')} className={`px-2 py-1 rounded-lg font-bold text-xs border border-slate-200 ${lang === 'en' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>EN</button>
                            </div>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => handleLangChange('ar')} className={`px-2 py-1 rounded-lg font-bold text-xs border border-slate-200 ${lang === 'ar' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>AR</button>
                                <button type="button" onClick={() => handleLangChange('he')} className={`px-2 py-1 rounded-lg font-bold text-xs border border-slate-200 ${lang === 'he' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>עב</button>
                            </div>
                        </div>

                        <div className="text-center mb-8">
                            <div className="inline-block p-1.5 bg-white rounded-3xl shadow-sm mb-4 border border-slate-100">
                                <img src="https://i.postimg.cc/mrzcZWpL/lwgw-hwtm-mwnps.gif" alt="Logo" className="w-24 h-auto rounded-2xl" />
                            </div>
                            <h1 className="text-3xl font-black text-slate-800 mb-1">{t('login_title')}</h1>
                            <p className="text-slate-500 text-sm">{t('login_subtitle')}</p>
                        </div>

                        {!isRegistering ? (
                            <form onSubmit={handleLogin} className="space-y-6">
                                <div className="relative">
                                    <input type="text" required value={loginUser} onChange={(e) => validateInput(e, setLoginUser, 'l-user', 10)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="שם משתמש" />
                                    {hintError === 'l-user' && <div className="absolute text-red-500 text-[10px] font-bold -bottom-4 right-2">{t('msg_only_english')}</div>}
                                </div>
                                <div className="relative">
                                    <input type="password" value={loginPass} onChange={(e) => validateInput(e, setLoginPass, 'l-pass', 15)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="סיסמה (ריק לאדמין)" />
                                    {hintError === 'l-pass' && <div className="absolute text-red-500 text-[10px] font-bold -bottom-4 right-2">{t('msg_only_english')}</div>}
                                </div>
                                <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-blue-600 transition-colors">{t('btn_login_secure')}</button>
                                <button type="button" onClick={() => setIsRegistering(true)} className="w-full text-blue-600 text-sm font-bold hover:underline mt-2">{t('btn_register_new')}</button>
                            </form>
                        ) : (
                            <form onSubmit={handleRegister} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="text" required value={regData.fname} onChange={e=>setRegData({...regData, fname: e.target.value})} className="p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:ring-2" placeholder="שם פרטי" />
                                    <input type="text" required value={regData.lname} onChange={e=>setRegData({...regData, lname: e.target.value})} className="p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:ring-2" placeholder="שם משפחה" />
                                </div>
                                <div className="relative">
                                    <input type="text" required value={regData.user} onChange={(e) => validateInput(e, v => setRegData({...regData, user: v}), 'r-user', 6)} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:ring-2" placeholder="Username (a-z0-9)" />
                                    {hintError === 'r-user' && <div className="absolute text-red-500 text-[10px] font-bold -bottom-4 right-2">{t('msg_only_english')}</div>}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <select required value={regData.school} onChange={e=>setRegData({...regData, school: e.target.value})} className="p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:ring-2">
                                        <option value="">מוסד לימוד</option>
                                        {localInstitutions.map(i => <option key={i.id} value={i.name}>{i.name}</option>)}
                                    </select>
                                    <select required value={regData.grade} onChange={e=>setRegData({...regData, grade: e.target.value})} className="p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:ring-2">
                                        <option value="">כיתה</option>
                                        {allGrades.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div className="relative">
                                    <input type="password" required value={regData.pass1} onChange={(e) => validateInput(e, v => setRegData({...regData, pass1: v}), 'r-pass', 8)} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:ring-2" placeholder="Password" />
                                    {hintError === 'r-pass' && <div className="absolute text-red-500 text-[10px] font-bold -bottom-4 right-2">{t('msg_only_english')}</div>}
                                </div>
                                <input type="password" required value={regData.pass2} onChange={e=>setRegData({...regData, pass2: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:ring-2" placeholder="אימות סיסמה" />
                                <button type="submit" className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-lg mt-2">{t('btn_submit_request')}</button>
                                <button type="button" onClick={() => setIsRegistering(false)} className="w-full text-slate-500 text-xs text-center hover:underline mt-2">{t('btn_back_login')}</button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Dashboard */}
            {currentUser && (
                <div className="flex flex-col min-h-screen">
                    <nav className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
                        <div className="flex items-center gap-4">
                            <img src="https://i.postimg.cc/mrzcZWpL/lwgw-hwtm-mwnps.gif" alt="Logo" className="w-10 h-10 rounded-lg" />
                            <div className="text-xl font-black text-slate-800">LMS<span className="text-blue-600">Pro</span></div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="hidden md:flex gap-8">
                                <button onClick={() => setActiveSection('courses')} className={`font-bold transition-colors ${activeSection==='courses' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}>{t('nav_my_courses')}</button>
                                {currentUser.role === 'admin' && (
                                    <button onClick={() => setActiveSection('admin')} className={`font-bold relative transition-colors ${activeSection==='admin' ? 'text-purple-700' : 'text-purple-600 hover:text-purple-700'}`}>
                                        {t('nav_admin')}
                                        {pendingUsers.length > 0 && <span className="absolute -top-1 -right-3 bg-red-500 text-white text-[9px] px-1.5 rounded-full">{pendingUsers.length}</span>}
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-4 border-r pr-6 border-slate-200">
                                <button onClick={() => handleLangChange(lang==='he' ? 'en' : 'he')} className="font-bold text-sm bg-slate-100 px-3 py-1 rounded-lg hover:bg-slate-200">{lang.toUpperCase()}</button>
                                <button onClick={handleLogout} className="text-red-500 font-bold text-sm hover:underline">יציאה</button>
                                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black border-2">{currentUser.username === 'rami' ? 'AD' : currentUser.firstName.substring(0,2)}</div>
                            </div>
                        </div>
                    </nav>

                    <main className="flex-grow p-6 md:p-10 max-w-7xl mx-auto w-full">
                        {/* Courses Section */}
                        {activeSection === 'courses' && (
                            <section>
                                <div className="mb-12">
                                    <h2 className="text-4xl font-black text-slate-900">{t('welcome_prefix')}{currentUser.firstName}!</h2>
                                    {currentUser.status === 'pending' && <p className="text-orange-600 mt-2 font-bold">{t('msg_pending_approval')}</p>}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {availableCourses.map(c => (
                                        <div key={c.id} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-3 py-1 rounded-full">{c.type === 'skills' ? 'מיומנויות' : c.type === 'research' ? 'חקר' : 'פרויקטים'}</span>
                                                <span className="text-xs font-bold text-slate-400">{c.field}</span>
                                            </div>
                                            <h3 className="font-black text-2xl mb-2">{c.name}</h3>
                                            <p className="text-sm text-slate-500 mb-6 flex-grow">{c.summary}</p>
                                            <button className="w-full bg-slate-900 text-white font-bold py-3 rounded-2xl group-hover:bg-blue-600 transition-colors">כניסה לקורס</button>
                                        </div>
                                    ))}
                                    {availableCourses.length === 0 && <div className="col-span-full text-center text-slate-400 font-bold py-10">אין קורסים זמינים כרגע</div>}
                                </div>
                            </section>
                        )}

                        {/* Admin Section */}
                        {activeSection === 'admin' && currentUser.role === 'admin' && (
                            <section>
                                <div className="flex justify-between items-center mb-10 flex-wrap gap-4">
                                    <h2 className="text-3xl font-black text-purple-900">{t('admin_title_full')}</h2>
                                    <div className="flex gap-3 flex-wrap">
                                        <button onClick={() => setActiveModal('approvals')} className="bg-blue-600 text-white px-5 py-2 rounded-2xl font-bold shadow-md">אישורי כניסה ({pendingUsers.length})</button>
                                        <button onClick={() => setActiveModal('institutions')} className="bg-indigo-600 text-white px-5 py-2 rounded-2xl font-bold shadow-md">ניהול מוסדות</button>
                                        <button onClick={() => setActiveModal('add_course')} className="bg-purple-600 text-white px-5 py-2 rounded-2xl font-bold shadow-md">{t('admin_add_course')}</button>
                                    </div>
                                </div>
                                <div className="grid gap-4">
                                    {localCourses.map(c => (
                                        <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
                                            <div>
                                                <div className="font-black text-lg text-slate-800">{c.name}</div>
                                                <div className="text-xs text-slate-400">{c.institutions?.length || 0} מוסדות משויכים</div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => { setAssignCourseId(c.id); setActiveModal('assignment'); }} className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-bold text-sm hover:bg-indigo-100">שיוך מוסדות</button>
                                                <button onClick={() => deleteCourse(c.id)} className="text-red-500 font-bold px-3 text-sm hover:underline">מחיקה</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </main>
                </div>
            )}

            {/* --- Modals --- */}
            {activeModal === 'add_course' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setActiveModal(null)}></div>
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl z-10 p-8 overflow-y-auto max-h-[90vh] no-scrollbar relative">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h3 className="text-3xl font-black text-slate-800">יצירת קורס חדש</h3>
                            <button onClick={() => setActiveModal(null)} className="text-2xl font-bold text-slate-400 hover:text-slate-800">&times;</button>
                        </div>
                        <form onSubmit={handleAddCourse} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="font-bold block">שם הקורס</label>
                                    <input type="text" required value={courseData.name} onChange={e=>setCourseData({...courseData, name: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-purple-500" />
                                </div>
                                <div className="space-y-2">
                                    <label className="font-bold block">תחום נלמד</label>
                                    <select value={courseData.field} onChange={e=>setCourseData({...courseData, field: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-purple-500">
                                        {localFields.map(f => <option key={f} value={f}>{f}</option>)}
                                        <option value="CUSTOM">-- חדש --</option>
                                    </select>
                                    {courseData.field === 'CUSTOM' && <input type="text" placeholder="שם המקצוע החדש" value={courseData.customField} onChange={e=>setCourseData({...courseData, customField: e.target.value})} className="w-full p-3 mt-2 bg-indigo-50 border border-indigo-200 rounded-xl outline-none focus:ring-2" />}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2"><label className="font-bold block">מכיתה</label><select value={courseData.gradeFrom} onChange={e=>setCourseData({...courseData, gradeFrom: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-purple-500">{allGrades.map(g=><option key={g} value={g}>{g}</option>)}</select></div>
                                <div class="space-y-2"><label className="font-bold block">עד כיתה</label><select value={courseData.gradeTo} onChange={e=>setCourseData({...courseData, gradeTo: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-purple-500">{allGrades.map(g=><option key={g} value={g}>{g}</option>)}</select></div>
                                <div className="space-y-2">
                                    <label className="font-bold block">ציוד נדרש</label>
                                    <select value={courseData.equipment} onChange={e=>setCourseData({...courseData, equipment: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-purple-500">
                                        {localEquipment.map(eq => <option key={eq} value={eq}>{eq}</option>)}
                                        <option value="CUSTOM">-- חדש --</option>
                                    </select>
                                    {courseData.equipment === 'CUSTOM' && <input type="text" placeholder="שם הציוד החדש" value={courseData.customEquipment} onChange={e=>setCourseData({...courseData, customEquipment: e.target.value})} className="w-full p-3 mt-2 bg-indigo-50 border border-indigo-200 rounded-xl outline-none focus:ring-2" />}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="font-bold block">סוג הקורס</label>
                                <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
                                    {['skills', 'research', 'projects'].map((t, idx) => (
                                        <button key={t} type="button" onClick={() => setCourseData({...courseData, type: t})} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${courseData.type === t ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}>
                                            {idx+1}. {t === 'skills' ? 'מיומנויות' : t === 'research' ? 'חקר' : 'פרויקטים'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {[
                                {id: 'summary', label: 'תמצית הקורס', rows: 2},
                                {id: 'goals', label: 'מטרות', rows: 2},
                                {id: 'targets', label: 'יעדי הצלחה', rows: 2},
                                {id: 'skills', label: 'מיומנויות נרכשות', rows: 2},
                                {id: 'activeLearning', label: 'התבלין המיוחד: למידה אקטיבית', rows: 3, bg: 'bg-purple-50 border-purple-200 text-purple-900'}
                            ].map(f => (
                                <div key={f.id} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className={`font-bold block ${f.bg ? 'text-purple-700' : ''}`}>{f.label}</label>
                                        <button type="button" onClick={() => handleAIGen(f.id)} disabled={aiLoading === f.id} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 text-[10px] font-bold rounded-full hover:scale-105 transition-transform disabled:opacity-50">
                                            {aiLoading === f.id ? 'מייצר...' : 'ייצר ✨'}
                                        </button>
                                    </div>
                                    <textarea value={courseData[f.id]} onChange={e=>setCourseData({...courseData, [f.id]: e.target.value})} rows={f.rows} className={`w-full p-4 border rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 ${f.bg || 'bg-slate-50'}`}></textarea>
                                </div>
                            ))}

                            <div className="space-y-2">
                                <label className="font-bold block text-slate-700">תנאי סף (Prerequisites)</label>
                                <div className="max-h-40 overflow-y-auto bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                                    {localCourses.map(c => (
                                        <label key={c.id} className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-50">
                                            <input type="checkbox" checked={courseData.prereqs.includes(c.id)} onChange={(e) => {
                                                const newPrereqs = e.target.checked ? [...courseData.prereqs, c.id] : courseData.prereqs.filter(id => id !== c.id);
                                                setCourseData({...courseData, prereqs: newPrereqs});
                                            }} className="w-5 h-5 rounded text-purple-600 focus:ring-2 focus:ring-purple-500 outline-none" />
                                            <span className="font-bold text-sm text-slate-700">{c.name}</span>
                                        </label>
                                    ))}
                                    {localCourses.length === 0 && <p className="text-xs text-slate-400">אין קורסים קיימים</p>}
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-purple-600 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-purple-700 transition-all text-lg">שמור קורס</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Institutions Modal */}
            {activeModal === 'institutions' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setActiveModal(null)}></div>
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg z-10 p-8 relative flex flex-col max-h-[90vh]">
                        <h3 className="text-2xl font-black mb-6">ניהול מוסדות לימוד</h3>
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-6 space-y-3">
                            <input type="text" value={newInstName} onChange={e=>setNewInstName(e.target.value)} placeholder="שם המוסד" className="w-full p-3 bg-white border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                            <input type="text" value={newInstSymbol} onChange={e=>setNewInstSymbol(e.target.value)} placeholder="סמל מוסד" className="w-full p-3 bg-white border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                            <button onClick={addInst} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700">הוסף מוסד</button>
                        </div>
                        <div className="overflow-y-auto no-scrollbar space-y-2">
                            {localInstitutions.map(inst => (
                                <div key={inst.id} className="flex justify-between items-center p-3 bg-white border rounded-xl shadow-sm">
                                    <div>
                                        <div className="font-bold text-sm text-slate-800">{inst.name}</div>
                                        <div className="text-[10px] font-bold text-slate-400">{inst.symbol}</div>
                                    </div>
                                    <button onClick={() => deleteInst(inst.id)} className="text-red-500 text-sm font-bold px-2 py-1 bg-red-50 rounded-lg">הסר</button>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setActiveModal(null)} className="mt-4 text-slate-400 font-bold py-2">סגור</button>
                    </div>
                </div>
            )}

            {/* Assignment Modal */}
            {activeModal === 'assignment' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setActiveModal(null)}></div>
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md z-10 p-8 relative">
                        <h3 className="text-2xl font-black mb-6">שיוך מוסדות לקורס</h3>
                        <div className="space-y-3 max-h-[60vh] overflow-y-auto no-scrollbar pr-2">
                            {[{name: 'חותם חיים', symbol: 'GLOBAL'}, ...localInstitutions].map(inst => {
                                const course = localCourses.find(c => c.id === assignCourseId);
                                const isAssigned = course?.institutions?.includes(inst.name);
                                return (
                                    <label key={inst.name} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                                        <input type="checkbox" checked={isAssigned || false} onChange={(e) => toggleAssignment(inst.name, e.target.checked)} className="w-5 h-5 rounded text-indigo-600 focus:ring-2 outline-none" />
                                        <div className="text-right">
                                            <div className="font-bold text-sm text-slate-800">{inst.name}</div>
                                            <div className="text-[10px] font-bold text-slate-400">{inst.symbol}</div>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                        <button onClick={() => setActiveModal(null)} className="w-full bg-slate-900 text-white font-bold py-3 rounded-2xl mt-6">סיום ושמירה</button>
                    </div>
                </div>
            )}

            {/* Approvals Modal */}
            {activeModal === 'approvals' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setActiveModal(null)}></div>
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl z-10 p-8 relative">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black">בקשות הממתינות לאישור</h3>
                            <button onClick={() => setActiveModal(null)} className="text-slate-400 font-bold hover:text-slate-800">&times;</button>
                        </div>
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar">
                            {pendingUsers.map(u => (
                                <div key={u.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex gap-2">
                                        <button onClick={() => setStatus(u.id, 'approved')} className="bg-emerald-500 text-white w-10 h-10 rounded-xl font-black shadow-sm">V</button>
                                        <button onClick={() => setStatus(u.id, 'blocked')} className="bg-red-500 text-white w-10 h-10 rounded-xl font-black shadow-sm">X</button>
                                    </div>
                                    <div>
                                        <div className="font-black text-lg text-slate-800">{u.firstName} {u.lastName}</div>
                                        <div className="text-xs font-bold text-slate-400">{u.institution} • תלמיד כיתה {u.grade}</div>
                                    </div>
                                </div>
                            ))}
                            {pendingUsers.length === 0 && <div className="text-center text-slate-400 py-10 font-bold">אין בקשות חדשות</div>}
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Message */}
            <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-3xl shadow-2xl font-bold text-sm transition-all duration-300 z-[9999] ${toastMsg ? 'opacity-100 transform-none' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                {toastMsg}
            </div>
        </div>
    );
}
