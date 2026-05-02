import React, { useState, useEffect, useRef } from 'react';
import { db, auth, appId } from './firebase';
import { i18n } from './translations';
import Login from './components/Login';
import Register from './components/Register';
import CourseModal from './components/CourseModal';
import CourseView from './components/CourseView';
import StudentModal from './components/StudentModal'; 
import MapModal from './components/MapModal'; 
import InstitutionModal from './components/InstitutionModal';
import AdminPanel from './components/AdminPanel';
import { onSnapshot, collection, doc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

// הגדרות קבועות - החזרנו את ה-VIDEO_ID כדי שלא יקרוס!
export const LOGO_URL = "https://i.postimg.cc/mrzcZWpL/lwgw-hwtm-mwnps.gif";
export const BACKGROUND_VIDEO_ID = "OHLMTgHl6cc"; 
export const APP_VERSION = "2.17"; 

export default function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [viewMode, setViewMode] = useState('admin');
    const [localCourses, setLocalCourses] = useState([]);
    const [localUsers, setLocalUsers] = useState([]);
    const [localInstitutions, setLocalInstitutions] = useState([]);
    const [userProgress, setUserProgress] = useState({});
    const [activeSection, setActiveSection] = useState('courses');
    const [activeModal, setActiveModal] = useState(null);
    const [viewingCourse, setViewingCourse] = useState(null);
    const [isRegistering, setIsRegistering] = useState(false);
    const [toast, setToast] = useState('');
    const [lang, setLang] = useState('he');
    const audioRef = useRef(null);

    useEffect(() => {
        audioRef.current = new Audio("https://actions.google.com/sounds/v1/science_fiction/low_fuzz_explosion.ogg");
        if (auth) signInAnonymously(auth).catch(()=>{});
        if (db) {
            onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'courses'), s => setLocalCourses(s.docs.map(d => ({...d.data(), id: d.id}))));
            onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'users'), s => setLocalUsers(s.docs.map(d => ({...d.data(), id: d.id}))));
            onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'institutions'), s => setLocalInstitutions(s.docs.map(d => ({...d.data(), id: d.id}))));
        }
    }, []);

    useEffect(() => {
        if (db && currentUser?.id) {
            return onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'progress', currentUser.id), (doc) => {
                if (doc.exists()) setUserProgress(doc.data());
            });
        }
    }, [currentUser]);

    const t = (key) => (i18n && i18n[lang] && i18n[lang][key]) ? i18n[lang][key] : key;
    const showToast = (m) => { setToast(m); setTimeout(()=>setToast(''), 3000); };
    const playBoom = () => { if(audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play().catch(()=>{}); } };

    const handleLogin = (u, p) => {
        if (u === 'rami' && p === '1234') {
            setCurrentUser({id: 'admin-rami', firstName:'רמי', role:'admin'});
            setViewMode('admin');
        } else {
            const found = localUsers.find(x => x.username === u && x.password === p);
            if (found) {
                if (found.status !== 'approved') showToast("חשבון ממתין לאישור");
                else { setCurrentUser(found); setViewMode(found.role); }
            } else { playBoom(); showToast('פרטים שגויים'); }
        }
    };

    const getCourseProgress = (courseId, lessonsCount) => {
        if (!lessonsCount || !userProgress[courseId]) return 0;
        const completed = Object.values(userProgress[courseId]).filter(v => v === true).length;
        return Math.round((completed / lessonsCount) * 100);
    };

    if (!currentUser) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            {!isRegistering ? (
                <Login onLogin={handleLogin} onRegisterToggle={()=>setIsRegistering(true)} lang={lang} setLang={setLang} t={t} playBoom={playBoom} />
            ) : (
                <Register onBack={()=>setIsRegistering(false)} institutions={localInstitutions} users={localUsers} toast={showToast} playBoom={playBoom} />
            )}
        </div>
    );

    if (viewingCourse) return <CourseView course={viewingCourse} onBack={() => setViewingCourse(null)} toast={showToast} isAdmin={viewMode === 'admin'} userId={currentUser.id} userProgress={userProgress[viewingCourse.id] || {}} />;

    return (
        <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-900 font-assistant">
            <header className="bg-white border-b px-6 py-3 flex justify-between items-center sticky top-0 z-50 shadow-sm">
                <div className="flex items-center gap-6">
                    <img src={LOGO_URL} alt="Logo" className="h-10 w-auto" />
                    <nav className="flex gap-4">
                        <button onClick={() => setActiveSection('courses')} className={`font-black text-sm ${activeSection === 'courses' ? 'text-purple-600' : 'text-slate-400'}`}>הקורסים שלי</button>
                        {currentUser.role === 'admin' && <button onClick={() => setActiveSection('admin')} className={`font-black text-sm ${activeSection === 'admin' ? 'text-purple-600' : 'text-slate-400'}`}>ניהול מערכת</button>}
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                    {currentUser.role === 'admin' && (
                        <div className="flex gap-2 ml-4 border-l pl-4">
                            <button onClick={() => setActiveModal('add_course')} className="bg-purple-600 text-white px-3 py-2 rounded-xl text-xs font-black shadow-sm hover:bg-purple-700">+ קורס</button>
                            <button onClick={() => setActiveModal('add_student')} className="bg-emerald-500 text-white px-3 py-2 rounded-xl text-xs font-black shadow-sm hover:bg-emerald-600">+ תלמיד</button>
                            <button onClick={() => setActiveModal('add_inst')} className="bg-blue-500 text-white px-3 py-2 rounded-xl text-xs font-black shadow-sm hover:bg-blue-600">+ מוסד</button>
                            <button onClick={() => setActiveModal('add_map')} className="bg-orange-500 text-white px-3 py-2 rounded-xl text-xs font-black shadow-sm hover:bg-orange-600">+ מפה</button>
                        </div>
                    )}
                    <span className="font-bold text-slate-500 text-xs">שלום, {currentUser.firstName}</span>
                    <button onClick={() => setCurrentUser(null)} className="text-red-500 font-black bg-red-50 px-3 py-2 rounded-xl text-xs">יציאה</button>
                </div>
            </header>

            <main className="p-8 max-w-7xl mx-auto">
                {activeSection === 'courses' ? (
                    <div className="grid md:grid-cols-3 gap-8">
                        {localCourses.map(c => {
                            const pct = getCourseProgress(c.id, c.lessons?.length);
                            return (
                                <div key={c.id} className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col items-center">
                                    <div className="relative w-20 h-20 mb-4">
                                        <svg className="w-full h-full -rotate-90">
                                            <circle cx="40" cy="40" r="35" stroke="#f1f5f9" strokeWidth="6" fill="transparent" />
                                            <circle cx="40" cy="40" r="35" stroke="#9333ea" strokeWidth="6" fill="transparent" strokeDasharray="219.9" strokeDashoffset={219.9 - (219.9 * pct) / 100} strokeLinecap="round" />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center font-black text-sm text-purple-600">{pct}%</div>
                                    </div>
                                    <h3 className="font-black text-xl mb-4">{c.name}</h3>
                                    <button onClick={() => setViewingCourse(c)} className="w-full bg-slate-900 text-white py-3 rounded-2xl font-black hover:bg-purple-600 transition-colors">כניסה</button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <AdminPanel users={localUsers} institutions={localInstitutions} toast={showToast} />
                )}
            </main>

            {activeModal === 'add_course' && <CourseModal onClose={() => setActiveModal(null)} toast={showToast} geminiKey={process.env.REACT_APP_GEMINI_API_KEY} />}
            {activeModal === 'add_student' && <StudentModal onClose={() => setActiveModal(null)} toast={showToast} />}
            {activeModal === 'add_map' && <MapModal onClose={() => setActiveModal(null)} toast={showToast} />}
            {activeModal === 'add_inst' && <InstitutionModal onClose={() => setActiveModal(null)} toast={showToast} />}
            
            {toast && <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-full font-black z-[300] shadow-2xl">{toast}</div>}
            <div className="fixed bottom-2 left-2 text-[10px] text-slate-300 font-bold">V {APP_VERSION}</div>
        </div>
    );
}
