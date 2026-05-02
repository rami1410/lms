import React, { useState, useEffect } from 'react';
import { db, auth, appId } from './firebase';
import { i18n } from './translations';
import Navigation from './components/Navigation';
import Login from './components/Login';
import Register from './components/Register';
import CourseModal from './components/CourseModal';
import CourseView from './components/CourseView';
import StudentModal from './components/StudentModal'; 
import InstitutionModal from './components/InstitutionModal';
import MapView from './components/MapView'; // הייבוא הקריטי!
import AdminPanel from './components/AdminPanel';
import { onSnapshot, collection, doc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

export const LOGO_URL = "https://i.postimg.cc/mrzcZWpL/lwgw-hwtm-mwnps.gif";
export const DEFAULT_MAP_URL = "https://i.postimg.cc/Z5p6mR0H/Gemini-Generated-Image.jpg"; 
export const BACKGROUND_VIDEO_ID = "OHLMTgHl6cc"; 
export const APP_VERSION = "2.32"; 

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
            if (inst?.expiryDate && new Date(inst.expiryDate) < new Date()) return setToast(t('expiry_msg'));
            setCurrentUser(found);
            setViewMode(found.role || 'student');
        } else { setToast('פרטים שגויים'); }
    };

    const getVisibleCourses = () => {
        if (viewMode === 'admin' || viewMode === 'teacher') return localCourses;
        const inst = localInstitutions.find(i => i.id === currentUser.institutionId);
        if (!inst || inst.type === 'פנימי') return localCourses;
        return localCourses.filter(c => {
            if (c.assignedInstitutions?.includes(inst.id)) return true;
            if (!c.assignedInstitutions || c.assignedInstitutions.length === 0) {
                const matchGrade = inst.grades?.some(g => g >= c.fromGrade && g <= c.toGrade);
                const matchField = c.fields?.some(f => inst.fields?.includes(f));
                return matchGrade || matchField;
            }
            return false;
        });
    };

    if (!currentUser) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center" dir={direction}>
            {!isRegistering ? <Login onLogin={handleLogin} onRegisterToggle={()=>setIsRegistering(true)} lang={lang} setLang={setLang} t={t} /> 
            : <Register onBack={()=>setIsRegistering(false)} institutions={localInstitutions} users={localUsers} toast={setToast} />}
        </div>
    );

    return (
        <div dir={direction} className={`min-h-screen bg-slate-50 text-slate-900 font-assistant ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
            <Navigation 
                currentUser={currentUser} lang={lang} setLang={setLang} 
                viewMode={viewMode} setViewMode={setViewMode}
                activeSection={activeSection} setActiveSection={setActiveSection}
                setViewingCourse={setViewingCourse} setActiveModal={setActiveModal}
                t={t} direction={direction} onLogout={() => setCurrentUser(null)} LOGO_URL={LOGO_URL}
            />

            <main className="p-8 max-w-7xl mx-auto">
                {viewingCourse ? (
                    <CourseView course={viewingCourse} onBack={() => setViewingCourse(null)} toast={setToast} isAdmin={viewMode === 'admin'} userId={currentUser.id} userProgress={userProgress[viewingCourse.id] || {}} />
                ) : activeSection === 'admin' ? (
                    <AdminPanel 
                        users={viewMode === 'teacher' ? localUsers.filter(u => u.institutionId === currentUser.institutionId) : localUsers} 
                        institutions={localInstitutions} toast={setToast} isAdmin={viewMode === 'admin'} 
                        onEditUser={(u) => setActiveModal({type:'student', data: u})}
                        onEditInst={(i) => setActiveModal({type:'inst', data: i})}
                    />
                ) : (
                    <div className="space-y-8">
                        <h1 className="text-4xl font-black">{t('my_courses')}</h1>
                        <MapView 
                            courses={getVisibleCourses()} 
                            direction={direction} 
                            mapBackground={localInstitutions.find(i => i.id === currentUser.institutionId)?.mapBackground || DEFAULT_MAP_URL} 
                        />
                    </div>
                )}
            </main>

            {activeModal?.type === 'course' && <CourseModal onClose={() => setActiveModal(null)} toast={setToast} geminiKey={process.env.REACT_APP_GEMINI_API_KEY} existingCourses={localCourses} institutions={localInstitutions} />}
            {activeModal?.type === 'student' && <StudentModal onClose={() => setActiveModal(null)} toast={setToast} institutions={localInstitutions} allUsers={localUsers} initialData={activeModal.data} isAdmin={viewMode === 'admin'} />}
            {activeModal?.type === 'inst' && <InstitutionModal onClose={() => setActiveModal(null)} toast={setToast} initialData={activeModal.data} />}
            
            {toast && <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-full font-black z-[300] shadow-2xl animate-bounce">{toast}</div>}
            <div className={`fixed bottom-2 ${direction === 'rtl' ? 'left-2' : 'right-2'} text-[10px] text-slate-300 font-bold`}>V {APP_VERSION}</div>
        </div>
    );
}
