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
import AdminPanel from './components/AdminPanel';
import CompassView from './components/CompassView'; 
import FloatingBot from './components/FloatingBot';
import LandingPage from './components/LandingPage';
import AccessibilityWidget from './components/AccessibilityWidget'; 
import CoursesDashboard from './components/CoursesDashboard';
import AboutView from './components/AboutView'; // מנוע הדפים הדינמי החדש שלנו
import { onSnapshot, collection, doc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

export const LOGO_URL = "https://i.postimg.cc/mrzcZWpL/lwgw-hwtm-mwnps.gif";
export const BACKGROUND_VIDEO_ID = "OHLMTgHl6cc"; 
export const APP_VERSION = "2.85"; 

export default function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [showLanding, setShowLanding] = useState(true); 
    const [lang, setLang] = useState('he');
    const [viewMode, setViewMode] = useState('admin'); 
    
    const [localCourses, setLocalCourses] = useState([]); 
    const [localUsers, setLocalUsers] = useState([]);
    const [localInstitutions, setLocalInstitutions] = useState([]);
    
    const [userProgress, setUserProgress] = useState({});
    const [allProgress, setAllProgress] = useState({}); 
    
    const [activeSection, setActiveSection] = useState('courses');
    const [activeModal, setActiveModal] = useState(null);
    const [viewingCourse, setViewingCourse] = useState(null);
    const [isRegistering, setIsRegistering] = useState(false);
    const [toast, setToast] = useState('');
    
    // סטייט ניתוב חכם עבור 11 הדפים החדשים של אזור האודות והשירותים
    const [publicSection, setPublicSection] = useState(null);

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
            if (viewMode === 'admin' || viewMode === 'teacher') {
                return onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'progress'), (snap) => {
                    const progData = {};
                    snap.docs.forEach(doc => { progData[doc.id] = doc.data(); });
                    setAllProgress(progData);
                    setUserProgress(progData[currentUser.id] || {});
                });
            } else {
                return onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'progress', currentUser.id), (doc) => {
                    if (doc.exists()) {
                        const myProg = doc.data();
                        setUserProgress(myProg);
                        setAllProgress({ [currentUser.id]: myProg });
                    }
                });
            }
        }
    }, [currentUser, viewMode]);

    const t = (key) => i18n[lang]?.[key] || key;
    const direction = i18n[lang]?.dir || 'rtl';

    const getPermittedCourses = () => {
        if (viewMode === 'admin' || viewMode === 'teacher') return localCourses;
        const inst = localInstitutions.find(i => i.id === currentUser.institutionId);
        if (!inst || inst.type === 'פנימי') return localCourses;
        return localCourses.filter(c => {
            if (c.assignedInstitutions?.includes(inst.id)) return true;
            if (!c.assignedInstitutions || c.assignedInstitutions.length === 0) {
                return c.fields?.some(f => inst.fields?.includes(f)) || (inst.grades?.some(g => g >= c.fromGrade && g <= c.toGrade));
            }
            return false;
        });
    };

    const handleLogin = (u, p) => {
        const cleanU = (u || '').trim();
        const cleanP = (p || '').trim();

        if (cleanU === 'rami' && cleanP === '1234') { 
            setCurrentUser({id: 'admin-rami', firstName:'רמי', role:'admin'}); 
            setViewMode('admin'); 
            return; 
        }
        
        const found = localUsers.find(x => x.username === cleanU && x.password === cleanP);
        if (found) {
            if (found.status === 'pending') return setToast(t('pending_approval'));
            const inst = localInstitutions.find(i => i.id === found.institutionId);
            if (inst?.expiryDate && new Date(inst.expiryDate) < new Date()) return setToast(t('expiry_msg'));
            setCurrentUser(found); 
            setViewMode(found.role || 'student');
        } else { 
            setToast(t('wrong_details')); 
        }
    };

    // ניתוב לאורחים ומבקרים באתר החיצוני
    if (!currentUser && showLanding) {
        if (publicSection) {
            return (
                <>
                    <AboutView section={publicSection} onBack={() => setPublicSection(null)} />
                    <AccessibilityWidget />
                </>
            );
        }
        return (
            <>
                <LandingPage onLoginClick={() => setShowLanding(false)} onNavClick={(sec) => setPublicSection(sec)} />
                <AccessibilityWidget />
            </>
        );
    }

    if (!currentUser) return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative" dir={direction}>
            <button onClick={() => setShowLanding(true)} className={`absolute top-6 ${direction === 'rtl' ? 'right-6' : 'left-6'} bg-slate-900/60 hover:bg-slate-900/90 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 backdrop-blur-md transition-colors shadow-lg z-50 border border-slate-700/50`}>
                <span className={direction === 'rtl' ? 'rotate-0' : 'rotate-180'}>&rarr;</span> 
                {lang === 'en' ? 'Back to Home' : lang === 'ru' ? 'На главную' : lang === 'ar' ? 'العودة للرئيسية' : 'חזרה לעמוד הראשי'}
            </button>
            
            {!isRegistering ? <Login onLogin={handleLogin} onRegisterToggle={()=>setIsRegistering(true)} lang={lang} setLang={setLang} t={t} /> 
            : <Register onBack={()=>setIsRegistering(false)} institutions={localInstitutions} users={localUsers} toast={setToast} t={t} lang={lang} />}
            
            <AccessibilityWidget />
            {toast && <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-8 py-4 rounded-full font-black z-[5000] shadow-2xl animate-bounce">{toast}</div>}
        </div>
    );

    return (
        <div dir={direction} className={`min-h-screen bg-slate-50 text-slate-900 font-assistant ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
            <Navigation currentUser={currentUser} lang={lang} setLang={setLang} viewMode={viewMode} setViewMode={setViewMode} activeSection={activeSection} setActiveSection={setActiveSection} viewingCourse={viewingCourse} setViewingCourse={setViewingCourse} setActiveModal={setActiveModal} t={t} direction={direction} onLogout={() => { setCurrentUser(null); setShowLanding(true); }} LOGO_URL={LOGO_URL} />

            <main className="p-8 max-w-7xl mx-auto">
                {!viewingCourse && activeSection === 'courses' && (
                    <CoursesDashboard permittedCourses={getPermittedCourses()} userProgress={userProgress} viewMode={viewMode} setViewingCourse={setViewingCourse} setActiveModal={setActiveModal} t={t} />
                )}

                {viewingCourse ? (
                    <CourseView course={viewingCourse} onBack={() => setViewingCourse(null)} toast={setToast} isAdmin={viewMode === 'admin' || viewMode === 'teacher'} userId={currentUser.id} userProgress={userProgress[viewingCourse.id] || {}} />
                ) : activeSection === 'compass' ? (
                    <CompassView currentUser={currentUser} viewMode={viewMode} courses={getPermittedCourses()} users={localUsers} allProgress={allProgress} />
                ) : activeSection === 'admin' ? (
                    <AdminPanel users={viewMode === 'teacher' ? localUsers.filter(u => u.institutionId === currentUser.institutionId) : localUsers} institutions={localInstitutions} courses={localCourses} toast={setToast} isAdmin={viewMode === 'admin'} onEditUser={(u) => setActiveModal({type:'student', data: u})} onEditInst={(i) => setActiveModal({type:'inst', data: i})} onEditCourse={(c) => setActiveModal({type:'course', data: c})} />
                ) : activeSection === 'about' ? (
                    <AboutView section="who_we_are" onBack={() => setActiveSection('courses')} />
                ) : null}
            </main>

            {activeModal?.type === 'course' && <CourseModal onClose={() => setActiveModal(null)} toast={setToast} geminiKey={process.env.REACT_APP_GEMINI_API_KEY} existingCourses={localCourses} institutions={localInstitutions} initialData={activeModal.data} />}
            {activeModal?.type === 'student' && <StudentModal onClose={() => setActiveModal(null)} toast={setToast} institutions={localInstitutions} allUsers={localUsers} initialData={activeModal.data} isAdmin={viewMode === 'admin'} />}
            {activeModal?.type === 'inst' && <InstitutionModal onClose={() => setActiveModal(null)} toast={setToast} initialData={activeModal.data} existingCourses={localCourses} />}

            <AccessibilityWidget />
            <FloatingBot geminiKey={process.env.REACT_APP_GEMINI_API_KEY} />
            
            {toast && <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-full font-black z-[400] shadow-2xl animate-bounce">{toast}</div>}
        </div>
    );
}
