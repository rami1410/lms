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

export const LOGO_URL = "https://i.postimg.cc/mrzcZWpL/lwgw-hwtm-mwnps.gif";
export const BACKGROUND_VIDEO_ID = "OHLMTgHl6cc"; 
export const APP_VERSION = "2.24"; 

export default function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [lang, setLang] = useState('he');
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

    useEffect(() => {
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

    const t = (key) => i18n[lang]?.[key] || key;
    const direction = i18n[lang]?.dir || 'rtl';

    const handleLogin = (u, p) => {
        if (u === 'rami' && p === '1234') {
            setCurrentUser({id: 'admin-rami', firstName:'רמי', role:'admin'});
            setViewMode('admin');
            return;
        }
        const found = localUsers.find(x => x.username === u && x.password === p);
        if (found) {
            const inst = localInstitutions.find(i => i.id === found.institutionId);
            if (inst?.expiryDate && new Date(inst.expiryDate) < new Date()) return setToast("תוקף מוסד פג");
            setCurrentUser(found);
            setViewMode(found.role || 'student');
        } else { setToast('פרטים שגויים'); }
    };

    const getCourseProgress = (courseId, lessonsCount) => {
        if (!lessonsCount || !userProgress[courseId]) return 0;
        const completed = Object.values(userProgress[courseId]).filter(v => v === true).length;
        return Math.round((completed / lessonsCount) * 100);
    };

    if (!currentUser) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center" dir={direction}>
            {!isRegistering ? <Login onLogin={handleLogin} onRegisterToggle={()=>setIsRegistering(true)} lang={lang} setLang={setLang} t={t} /> 
            : <Register onBack={()=>setIsRegistering(false)} institutions={localInstitutions} users={localUsers} toast={setToast} />}
        </div>
    );

    return (
        <div dir={direction} className={`min-h-screen bg-slate-50 text-slate-900 font-assistant ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
            <header className="bg-white border-b px-6 py-3 flex justify-between items-center sticky top-0 z-50 shadow-sm">
                <div className="flex items-center gap-6">
                    <img src={LOGO_URL} alt="Logo" className="h-10 w-auto" />
                    <nav className="flex gap-4">
                        <button onClick={() => {setActiveSection('courses'); setViewingCourse(null)}} className={`font-black text-sm ${activeSection === 'courses' ? 'text-purple-600' : 'text-slate-400'}`}>{t('my_courses')}</button>
                        {(viewMode === 'admin' || viewMode === 'teacher') && <button onClick={() => setActiveSection('admin')} className={`font-black text-sm ${activeSection === 'admin' ? 'text-purple-600' : 'text-slate-400'}`}>{viewMode === 'admin' ? t('admin_panel') : 'ניהול כיתה'}</button>}
                    </nav>
                </div>
                <div className="flex items-center gap-3">
                    {currentUser.role === 'admin' && (
                        <div className="flex bg-slate-100 p-1 rounded-xl gap-1 ml-4 border-l pl-4">
                            <button onClick={() => setViewMode(viewMode === 'student' ? 'admin' : 'student')} className={`px-3 py-1.5 rounded-lg font-bold text-[10px] ${viewMode === 'student' ? 'bg-emerald-500 text-white' : 'text-slate-500'}`}>👨‍🎓 תלמיד</button>
                            <button onClick={() => setViewMode(viewMode === 'teacher' ? 'admin' : 'teacher')} className={`px-3 py-1.5 rounded-lg font-bold text-[10px] ${viewMode === 'teacher' ? 'bg-blue-500 text-white' : 'text-slate-500'}`}>👨‍🏫 מורה</button>
                        </div>
                    )}
                    {viewMode === 'admin' && (
                        <div className="flex gap-2">
                            <button onClick={() => setActiveModal({type:'course'})} className="bg-purple-600 text-white px-3 py-2 rounded-xl text-xs font-black">+ קורס</button>
                            <button onClick={() => setActiveModal({type:'student'})} className="bg-emerald-500 text-white px-3 py-2 rounded-xl text-xs font-black">+ תלמיד</button>
                            <button onClick={() => setActiveModal({type:'inst'})} className="bg-blue-500 text-white px-3 py-2 rounded-xl text-xs font-black">+ מוסד</button>
                        </div>
                    )}
                    <span className="font-bold text-slate-500 text-xs">שלום, {currentUser.firstName}</span>
                    <button onClick={() => setCurrentUser(null)} className="text-red-500 font-black bg-red-50 px-3 py-2 rounded-xl text-xs">{t('logout')}</button>
                </div>
            </header>

            <main className="p-8 max-w-7xl mx-auto">
                {viewingCourse ? (
                    <CourseView course={viewingCourse} onBack={() => setViewingCourse(null)} toast={setToast} isAdmin={viewMode === 'admin'} userId={currentUser.id} userProgress={userProgress[viewingCourse.id] || {}} />
                ) : activeSection === 'admin' ? (
                    <AdminPanel 
                        users={viewMode === 'teacher' ? localUsers.filter(u => u.institutionId === currentUser.institutionId) : localUsers} 
                        institutions={localInstitutions} 
                        toast={setToast} 
                        isAdmin={viewMode === 'admin'} 
                        onEditUser={(u) => setActiveModal({type:'student', data: u})}
                        onEditInst={(i) => setActiveModal({type:'inst', data: i})}
                    />
                ) : (
                    <div className="grid md:grid-cols-3 gap-8 text-center">
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
                                    <button onClick={() => setViewingCourse(c)} className="w-full bg-slate-900 text-white py-3 rounded-2xl font-black">כניסה</button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {activeModal?.type === 'course' && <CourseModal onClose={() => setActiveModal(null)} toast={setToast} geminiKey={process.env.REACT_APP_GEMINI_API_KEY} existingCourses={localCourses} />}
            {activeModal?.type === 'student' && <StudentModal onClose={() => setActiveModal(null)} toast={setToast} institutions={localInstitutions} allUsers={localUsers} initialData={activeModal.data} />}
            {activeModal?.type === 'inst' && <InstitutionModal onClose={() => setActiveModal(null)} toast={setToast} initialData={activeModal.data} />}
            
            {toast && <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-full font-black z-[300] shadow-2xl">{toast}</div>}
            <div className="fixed bottom-2 left-2 text-[10px] text-slate-300 font-bold">V {APP_VERSION}</div>
        </div>
    );
}
