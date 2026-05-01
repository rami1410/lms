import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore';

// --- הגדרות מערכת (נמשכות מ-Vercel) ---
const firebaseConfigStr = process.env.NEXT_PUBLIC_FIREBASE_CONFIG;
const firebaseConfig = firebaseConfigStr ? JSON.parse(firebaseConfigStr) : {};
const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const appId = 'edu-nextjs-v1';

let app, db, auth;
if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
}

// --- מילון שפות ---
const i18n = {
    he: { login_title: "כניסה למערכת", login_subtitle: "למידה אקטיבית משנה חיים", btn_login_secure: "התחברות מאובטחת", btn_register_new: "יצירת חשבון חדש", btn_submit_request: "שלח בקשת הצטרפות", btn_back_login: "חזרה לכניסה", nav_my_courses: "הקורסים שלי", nav_admin: "ניהול", welcome_prefix: "שלום, ", msg_pending_approval: "חשבונך ממתין לאישור אבטחה.", admin_title_full: "מרכז ניהול ואבטחה", admin_approvals: "אישורי כניסה", admin_add_course: "הוספת קורס +", msg_only_english: "רק אותיות באנגלית" },
    en: { login_title: "Secure Login", login_subtitle: "Active Learning Changes Lives", btn_login_secure: "Secure Login", btn_register_new: "Create New Account", btn_submit_request: "Submit Request", btn_back_login: "Back to Login", nav_my_courses: "My Courses", nav_admin: "Admin Panel", welcome_prefix: "Hello, ", msg_pending_approval: "Awaiting security approval.", admin_title_full: "Security & Management", admin_approvals: "Approvals", admin_add_course: "Add New Course +", msg_only_english: "Only English letters" }
};

const allGrades = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ז'", "ח'", "ט'", "י'", "יא'", "יב'", "כולם"];

export default function App() {
    // State הגדרות
    const [authReady, setAuthReady] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [localUsers, setLocalUsers] = useState([]);
    const [localCourses, setLocalCourses] = useState([]);
    const [localInstitutions, setLocalInstitutions] = useState([]);
    const [lang, setLang] = useState('he');
    const [isRegistering, setIsRegistering] = useState(false);
    const [activeSection, setActiveSection] = useState('courses');
    const [activeModal, setActiveModal] = useState(null);
    const [toastMsg, setToastMsg] = useState('');

    // טפסי התחברות/הרשמה
    const [loginUser, setLoginUser] = useState('');
    const [loginPass, setLoginPass] = useState('');
    const [regData, setRegData] = useState({ fname: '', lname: '', user: '', school: '', grade: '', pass1: '', pass2: '' });
    
    // טופס קורס
    const [courseData, setCourseData] = useState({ name: '', field: 'מתמטיקה', summary: '', goals: '', targets: '', skills: '', activeLearning: '', type: 'skills' });
    const [aiLoading, setAiLoading] = useState(null);

    // --- אתחול Firebase ---
    useEffect(() => {
        if (!auth) {
            setAuthReady(true);
            return;
        }
        signInAnonymously(auth).catch(console.error);
        const unsubAuth = onAuthStateChanged(auth, (user) => {
            if (user) setAuthReady(true);
        });
        return () => unsubAuth();
    }, []);

    // --- סנכרון נתונים בזמן אמת ---
    useEffect(() => {
        if (!authReady || !db) return;
        const u1 = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'users'), s => setLocalUsers(s.docs.map(d => ({...d.data(), id: d.id}))));
        const u2 = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'courses'), s => setLocalCourses(s.docs.map(d => ({...d.data(), id: d.id}))));
        const u3 = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'institutions'), s => setLocalInstitutions(s.docs.map(d => ({...d.data(), id: d.id}))));
        return () => { u1(); u2(); u3(); };
    }, [authReady]);

    // --- פונקציות עזר ---
    const showToast = (msg) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(''), 3000);
    };

    const t = (key) => i18n[lang][key] || key;

    const handleLogin = (e) => {
        e.preventDefault();
        const isAdmin = (loginUser === 'rami') && (loginPass === '1234'); // שנה סיסמה כאן
        const found = localUsers.find(x => x.username === loginUser && x.password === loginPass);
        
        if (isAdmin) {
            setCurrentUser({ username: 'rami', firstName: 'רמי', role: 'admin', status: 'approved' });
        } else if (found) {
            if (found.status === 'blocked') return showToast("החשבון חסום");
            setCurrentUser(found);
        } else {
            showToast("פרטים שגויים");
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (localUsers.find(u => u.username === regData.user)) return showToast("שם משתמש תפוס");
        const newUser = {
            username: regData.user, password: regData.pass1, role: 'student', 
            status: 'pending', firstName: regData.fname, lastName: regData.lname, 
            institution: regData.school, grade: regData.grade
        };
        if (db) await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', regData.user), newUser);
        showToast("נרשמת! המתן לאישור אדמין.");
        setIsRegistering(false);
    };

    const handleAIGen = async (field) => {
        if (!geminiApiKey) return showToast("חסר מפתח AI בשרת");
        if (!courseData.name) return showToast("הזן קודם שם קורס");
        
        setAiLoading(field);
        const prompt = `Write a short ${field} in Hebrew for a school course named: ${courseData.name}`;
        
        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const data = await res.json();
            const text = data.candidates[0].content.parts[0].text;
            setCourseData(prev => ({...prev, [field]: text.trim()}));
        } catch (e) {
            showToast("שגיאה בחיבור ל-AI");
        }
        setAiLoading(null);
    };

    const saveCourse = async (e) => {
        e.preventDefault();
        const id = "c-" + Date.now();
        if(db) await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'courses', id), {...courseData, id});
        showToast("הקורס נשמר!");
        setActiveModal(null);
    };

    if (!authReady) return <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">טוען מערכת מאובטחת...</div>;

    return (
        <div dir={lang === 'he' ? 'rtl' : 'ltr'} className="min-h-screen bg-slate-50 font-sans text-slate-800">
            
            {/* מסך התחברות */}
            {!currentUser && (
                <div className="flex items-center justify-center min-h-screen bg-slate-900 p-4">
                    <div className="bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-md">
                        <h1 className="text-3xl font-black text-center mb-2">{isRegistering ? t('btn_register_new') : t('login_title')}</h1>
                        <p className="text-slate-500 text-center mb-8">{t('login_subtitle')}</p>
                        
                        {!isRegistering ? (
                            <form onSubmit={handleLogin} className="space-y-4">
                                <input type="text" placeholder="שם משתמש" className="w-full p-4 bg-slate-100 rounded-xl outline-none" onChange={e=>setLoginUser(e.target.value)} />
                                <input type="password" placeholder="סיסמה" className="w-full p-4 bg-slate-100 rounded-xl outline-none" onChange={e=>setLoginPass(e.target.value)} />
                                <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg">{t('btn_login_secure')}</button>
                                <button type="button" onClick={()=>setIsRegistering(true)} className="w-full text-blue-600 text-sm mt-4 font-bold">{t('btn_register_new')}</button>
                            </form>
                        ) : (
                            <form onSubmit={handleRegister} className="space-y-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="text" placeholder="שם פרטי" className="p-3 bg-slate-100 rounded-xl" onChange={e=>setRegData({...regData, fname: e.target.value})} />
                                    <input type="text" placeholder="שם משפחה" className="p-3 bg-slate-100 rounded-xl" onChange={e=>setRegData({...regData, lname: e.target.value})} />
                                </div>
                                <input type="text" placeholder="שם משתמש באנגלית" className="w-full p-3 bg-slate-100 rounded-xl" onChange={e=>setRegData({...regData, user: e.target.value})} />
                                <input type="password" placeholder="סיסמה" className="w-full p-3 bg-slate-100 rounded-xl" onChange={e=>setRegData({...regData, pass1: e.target.value})} />
                                <button className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg">{t('btn_submit_request')}</button>
                                <button type="button" onClick={()=>setIsRegistering(false)} className="w-full text-slate-500 text-sm mt-2">{t('btn_back_login')}</button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* לוח בקרה (Dashboard) */}
            {currentUser && (
                <div className="flex flex-col min-h-screen">
                    <nav className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-40">
                        <div className="text-xl font-black text-blue-600">LMS Pro</div>
                        <div className="flex gap-4 items-center">
                            <button onClick={()=>setActiveSection('courses')} className="font-bold">הקורסים שלי</button>
                            {currentUser.role === 'admin' && <button onClick={()=>setActiveSection('admin')} className="font-bold text-purple-600">ניהול</button>}
                            <button onClick={()=>setCurrentUser(null)} className="text-red-500 text-sm font-bold">יציאה</button>
                        </div>
                    </nav>

                    <main className="p-6 max-w-6xl mx-auto w-full">
                        {activeSection === 'courses' && (
                            <div>
                                <h2 className="text-3xl font-black mb-8">שלום, {currentUser.firstName}!</h2>
                                <div className="grid md:grid-cols-3 gap-6">
                                    {localCourses.map(c => (
                                        <div key={c.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                            <h3 className="font-bold text-xl mb-2">{c.name}</h3>
                                            <p className="text-slate-500 text-sm mb-4 line-clamp-3">{c.summary}</p>
                                            <button className="w-full bg-slate-900 text-white py-2 rounded-lg">כניסה לשיעור</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeSection === 'admin' && (
                            <div>
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="text-3xl font-black">ניהול מערכת</h2>
                                    <button onClick={()=>setActiveModal('add_course')} className="bg-purple-600 text-white px-6 py-2 rounded-xl font-bold">+ הוספת קורס</button>
                                </div>
                                {/* רשימת משתמשים לאישור */}
                                <div className="bg-white rounded-2xl shadow-sm border p-6">
                                    <h3 className="font-bold mb-4">בקשות הצטרפות</h3>
                                    {localUsers.filter(u=>u.status==='pending').map(u=>(
                                        <div key={u.id} className="flex justify-between items-center border-b py-3">
                                            <span>{u.firstName} {u.lastName} ({u.grade})</span>
                                            <button onClick={()=>updateDoc(doc(db,'artifacts',appId,'public','data','users',u.id),{status:'approved'})} className="text-emerald-600 font-bold">אשר כניסה</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            )}

            {/* מודל הוספת קורס */}
            {activeModal === 'add_course' && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-8 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-black mb-6">יצירת קורס חדש</h2>
                        <form onSubmit={saveCourse} className="space-y-4">
                            <input type="text" placeholder="שם הקורס" className="w-full p-4 bg-slate-100 rounded-xl" onChange={e=>setCourseData({...courseData, name:e.target.value})} />
                            
                            {['summary', 'goals', 'activeLearning'].map(f => (
                                <div key={f}>
                                    <div className="flex justify-between mb-1">
                                        <label className="text-sm font-bold">{f}</label>
                                        <button type="button" onClick={()=>handleAIGen(f)} className="text-xs text-blue-600 font-bold">ייצר ב-AI ✨</button>
                                    </div>
                                    <textarea className="w-full p-3 bg-slate-100 rounded-xl h-24" value={courseData[f]} onChange={e=>setCourseData({...courseData, [f]:e.target.value})} />
                                </div>
                            ))}
                            
                            <div className="flex gap-2">
                                <button type="submit" className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl">שמור קורס</button>
                                <button type="button" onClick={()=>setActiveModal(null)} className="flex-1 bg-slate-200 py-3 rounded-xl">ביטול</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* התראות Toast */}
            {toastMsg && <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-black text-white px-8 py-3 rounded-full z-[100] shadow-2xl">{toastMsg}</div>}
        </div>
    );
}
