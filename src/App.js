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
export const APP_VERSION = "2.21"; 

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
        } else {
            const found = localUsers.find(x => x.username === u && x.password === p);
            if (found) {
                const inst = localInstitutions.find(i => i.id === found.institutionId);
                if (inst && inst.expiryDate && new Date(inst.expiryDate) < new Date()) {
                    return setToast(t('expiry_msg'));
                }
                setCurrentUser(found);
                setViewMode(found.role || 'student');
            } else { setToast('פרטים שגויים'); }
        }
    };

    if (!currentUser) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center" dir={direction}>
            {!isRegistering ? (
                <Login onLogin={handleLogin} onRegisterToggle={()=>setIsRegistering(true)} lang={lang} setLang={setLang} t={t} />
            ) : (
                <Register onBack={()=>setIsRegistering(false)} institutions={localInstitutions} users={localUsers} toast={setToast} />
            )}
        </div>
    );

    return (
        <div dir={direction} className={`min-h-screen bg-slate-50 text-slate-900 font-assistant ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
            <header className="bg-white border-b px-6 py-3 flex justify-between items-center sticky top-0 z-50 shadow-sm">
                <div className="flex items-center gap-6">
                    <img src={LOGO_URL} alt="Logo" className="h-10 w-auto" />
                    <nav className="flex gap-4">
                        <button onClick={() => {setActiveSection('courses'); setViewingCourse(null)}} className={`font-black text-sm ${activeSection === 'courses' ? 'text-purple-600' : 'text-slate-400'}`}>{t('my_courses')}</button>
                        {currentUser.role === 'admin' && viewMode === 'admin' && <button onClick={() => setActiveSection('admin')} className={`font-black text-sm ${activeSection === 'admin' ? 'text-purple-600' : 'text-slate-400'}`}>{t('admin_panel')}</button>}
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                    <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-slate-100 border-none rounded-xl px-3 py-2 text-xs font-black outline-none cursor-pointer">
                        {Object.entries(i18n).map(([code, config]) => (
                            <option key={code} value={code}>{config.label}</option>
                        ))}
                    </select>

                    {currentUser.role === 'admin' && (
                        <div className={`flex bg-slate-100 p-1 rounded-xl gap-1 ${direction === 'rtl' ? 'ml-4 border-l pl-4' : 'mr-4 border-r pr-4'}`}>
                            <button onClick={() => setViewMode(viewMode === 'student' ? 'admin' : 'student')} className={`px-3 py-1.5 rounded-lg font-bold text-[10px] transition-all ${viewMode === 'student' ? 'bg-emerald-500 text-white' : 'text-slate-500 hover:bg-white'}`}>{t('view_student')}</button>
                            <button onClick={() => setViewMode(viewMode === 'teacher' ? 'admin' : 'teacher')} className={`px-3 py-1.5 rounded-lg font-bold text-[10px] transition-all ${viewMode === 'teacher' ? 'bg-blue-500 text-white' : 'text-slate-500 hover:bg-white'}`}>{t('view_teacher')}</button>
                        </div>
                    )}

                    {viewMode === 'admin' && (
                        <div className="flex gap-2">
                            <button onClick={() => setActiveModal('add_course')} className="bg-purple-600 text-white px-3 py-2 rounded-xl text-xs font-black">{t('add_course')}</button>
                            <button onClick={() => setActiveModal('add_student')} className="bg-emerald-500 text-white px-3 py-2 rounded-xl text-xs font-black">{t('add_student')}</button>
                            <button onClick={() => setActiveModal('add_inst')} className="bg-blue-500 text-white px-3 py-2 rounded-xl text-xs font-black">{t('add_inst')}</button>
                            <button onClick={() => setActiveModal('add_map')} className="bg-orange-500 text-white px-3 py-2 rounded-xl text-xs font-black">{t('add_map')}</button>
                        </div>
                    )}
                    
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-500 text-xs">{t('welcome')}, {currentUser.firstName}</span>
                        <button onClick={() => setCurrentUser(null)} className="text-red-500 font-black bg-red-50 px-3 py-2 rounded-xl text-xs">{t('logout')}</button>
                    </div>
                </div>
            </header>

            <main className="p-8 max-w-7xl mx-auto">
                {viewingCourse ? (
                    <CourseView course={viewingCourse} onBack={() => setViewingCourse(null)} toast={setToast} isAdmin={viewMode === 'admin'} userId={currentUser.id} userProgress={userProgress[viewingCourse.id] || {}} />
                ) : activeSection === 'admin' && viewMode === 'admin' ? (
                    <AdminPanel users={localUsers} institutions={localInstitutions} toast={setToast} />
                ) : (
                    <div className="grid md:grid-cols-3 gap-8">
                        {localCourses.map(c => (
                            <div key={c.id} className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 text-center">
                                <h3 className="font-black text-xl mb-4">{c.name}</h3>
                                <button onClick={() => setViewingCourse(c)} className="w-full bg-slate-900 text-white py-3 rounded-2xl font-black transition-colors">כניסה</button>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {activeModal === 'add_course' && (
                <CourseModal 
                    onClose={() => setActiveModal(null)} 
                    toast={setToast} 
                    geminiKey={process.env.REACT_APP_GEMINI_API_KEY} 
                    existingCourses={localCourses} 
                />
            )}
            {activeModal === 'add_student' && <StudentModal onClose={() => setActiveModal(null)} toast={setToast} institutions={localInstitutions} allUsers={localUsers} />}
            {activeModal === 'add_inst' && <InstitutionModal onClose={() => setActiveModal(null)} toast={setToast} />}
            {activeModal === 'add_map' && <MapModal onClose={() => setActiveModal(null)} toast={setToast} />}

            {toast && <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-full font-black z-[300] shadow-2xl">{toast}</div>}
            <div className={`fixed bottom-2 ${direction === 'rtl' ? 'left-2' : 'right-2'} text-[10px] text-slate-300 font-bold`}>V {APP_VERSION}</div>
        </div>
    );
}
