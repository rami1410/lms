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
import { onSnapshot, collection, doc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

export const LOGO_URL = "https://i.postimg.cc/mrzcZWpL/lwgw-hwtm-mwnps.gif";
export const BACKGROUND_VIDEO_ID = "OHLMTgHl6cc"; 
export const APP_VERSION = "2.81"; 

const HERO_IMAGES = [
    "https://images.unsplash.com/photo-1445264618000-f1e069c5920f?q=80&w=1200", 
    "https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=1200", 
    "https://images.unsplash.com/photo-1504370805625-d32c54b16100?q=80&w=1200", 
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200", 
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200", 
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=1200", 
    "https://images.unsplash.com/photo-1426604908106-dd9fb4183863?q=80&w=1200", 
    "https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=1200"  
];

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
    
    const [heroBg, setHeroBg] = useState('');
    const [courseViewStyle, setCourseViewStyle] = useState('grid');
    const [courseSearch, setCourseSearch] = useState('');

    useEffect(() => {
        setHeroBg(HERO_IMAGES[Math.floor(Math.random() * HERO_IMAGES.length)]);
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

    const getVisibleCourses = () => {
        let base = localCourses;
        if (viewMode !== 'admin' && viewMode !== 'teacher') {
            const inst = localInstitutions.find(i => i.id === currentUser.institutionId);
            if (inst && inst.type !== 'פנימי') {
                base = localCourses.filter(c => {
                    if (c.assignedInstitutions?.includes(inst.id)) return true;
                    if (!c.assignedInstitutions || c.assignedInstitutions.length === 0) {
                        return c.fields?.some(f => inst.fields?.includes(f)) || (inst.grades?.some(g => g >= c.fromGrade && g <= c.toGrade));
                    }
                    return false;
                });
            }
        }
        if (courseSearch.trim() !== '') {
            base = base.filter(c => c.name?.toLowerCase().includes(courseSearch.toLowerCase()));
        }
        return base;
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
            if (found.status === 'pending') {
                return setToast(t('pending_approval'));
            }
            const inst = localInstitutions.find(i => i.id === found.institutionId);
            if (inst?.expiryDate && new Date(inst.expiryDate) < new Date()) return setToast(t('expiry_msg'));
            setCurrentUser(found); 
            setViewMode(found.role || 'student');
        } else { 
            setToast(t('wrong_details')); 
        }
    };

    if (!currentUser && showLanding) {
        return (
            <>
                <LandingPage onLoginClick={() => setShowLanding(false)} />
                <AccessibilityWidget />
            </>
        );
    }

    if (!currentUser) return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative" dir={direction}>
            <button 
                onClick={() => setShowLanding(true)} 
                className={`absolute top-6 ${direction === 'rtl' ? 'right-6' : 'left-6'} bg-slate-900/60 hover:bg-slate-900/90 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 backdrop-blur-md transition-colors shadow-lg z-50 border border-slate-700/50`}
            >
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
                    <>
                        <div className="relative w-full h-64 rounded-[3rem] overflow-hidden shadow-xl mb-8 flex items-center justify-between p-10">
                            <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: `url(${heroBg})` }}></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-900/20 z-0"></div>
                            
                            <div className="relative z-10 text-white">
                                <h1 className="text-4xl font-black mb-2">{t('my_courses')}</h1>
                                <p className="text-white/80 font-bold text-lg">בחר את הקורס שברצונך ללמוד או לנהל</p>
                            </div>

                            {viewMode === 'admin' && (
                                <div className="relative z-10">
                                    <button onClick={() => setActiveModal({type: 'course', data: null})} className="bg-purple-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:shadow-2xl hover:bg-purple-500 hover:scale-105 transition-all flex items-center gap-3">
                                        <span className="text-2xl">➕</span> <span>יצירת קורס חדש</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center mb-6">
                            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                                <button onClick={() => setCourseViewStyle('grid')} className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors ${courseViewStyle === 'grid' ? 'bg-purple-100 text-purple-700' : 'text-slate-500 hover:bg-slate-50'}`}>{t('grid_view')}</button>
                                <button onClick={() => setCourseViewStyle('table')} className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors ${courseViewStyle === 'table' ? 'bg-purple-100 text-purple-700' : 'text-slate-500 hover:bg-slate-50'}`}>{t('table_view')}</button>
                            </div>
                            <input type="text" placeholder={t('search_course')} value={courseSearch} onChange={(e) => setCourseSearch(e.target.value)} className="w-64 bg-white border border-slate-200 px-4 py-2 rounded-xl outline-none focus:border-purple-500 transition-colors shadow-sm" />
                        </div>

                        {courseViewStyle === 'table' ? (
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                                <table className="w-full text-right border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className="p-4 font-black text-slate-600">{t('course_name')}</th>
                                            <th className="p-4 font-black text-slate-600 text-center">התקדמות</th>
                                            <th className="p-4 font-black text-slate-600 text-center">{t('age_group')}</th>
                                            <th className="p-4 font-black text-slate-600">{t('fields')}</th>
                                            <th className="p-4 font-black text-slate-600 text-center">{t('actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getVisibleCourses().map(c => {
                                            const completed = userProgress[c.id] ? Object.values(userProgress[c.id]).filter(v => v === true).length : 0;
                                            const pct = c.lessons?.length ? Math.round((completed / c.lessons.length) * 100) : 0;
                                            return (
                                                <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                                    <td className="p-4 font-bold text-slate-800">{c.name}</td>
                                                    <td className="p-4 text-center"><span className="bg-purple-100 text-purple-700 font-bold px-3 py-1 rounded-full text-sm">{pct}%</span></td>
                                                    <td className="p-4 text-center font-medium" dir="ltr">{c.fromGrade} - {c.toGrade}</td>
                                                    <td className="p-4">
                                                        <div className="flex gap-1">{c.fields?.slice(0,2).map(f => <span key={f} className="text-xs bg-slate-100 text-slate-500 font-bold px-2 py-1 rounded">{f}</span>)}</div>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <button onClick={() => setViewingCourse(c)} className="bg-slate-900 text-white px-4 py-1.5 rounded-lg font-bold text-sm hover:bg-purple-600 transition-colors">כניסה</button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-3 gap-8">
                                {getVisibleCourses().map(c => {
                                    const completed = userProgress[c.id] ? Object.values(userProgress[c.id]).filter(v => v === true).length : 0;
                                    const pct = c.lessons?.length ? Math.round((completed / c.lessons.length) * 100) : 0;
                                    return (
                                        <div key={c.id} onClick={() => setViewingCourse(c)} className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col items-center group hover:scale-[1.02] hover:shadow-2xl transition-all cursor-pointer">
                                            {c.image ? (
                                                <div className="w-full h-32 mb-6 rounded-2xl overflow-hidden relative">
                                                    <img src={c.image} alt={c.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-purple-700 font-black px-3 py-1 rounded-full text-sm shadow-sm">{pct}% הושלם</div>
                                                </div>
                                            ) : (
                                                <div className="relative w-24 h-24 mb-6">
                                                    <svg className="w-full h-full -rotate-90"><circle cx="48" cy="48" r="40" stroke="#f1f5f9" strokeWidth="8" fill="transparent" /><circle cx="48" cy="48" r="40" stroke="#9333ea" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * pct) / 100} strokeLinecap="round" className="transition-all duration-1000" /></svg>
                                                    <div className="absolute inset-0 flex items-center justify-center font-black text-lg text-purple-600">{pct}%</div>
                                                </div>
                                            )}
                                            <h3 className="font-black text-xl mb-4 text-slate-800 text-center line-clamp-2">{c.name}</h3>
                                            {c.fields && c.fields.length > 0 && (
                                                <div className="flex flex-wrap justify-center gap-1 mb-6">
                                                    {c.fields.slice(0,3).map(f => <span key={f} className="text-xs bg-slate-100 text-slate-500 font-bold px-2 py-1 rounded-md">{f}</span>)}
                                                </div>
                                            )}
                                            <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black group-hover:bg-purple-600 transition-colors shadow-lg mt-auto">כניסה לקורס</button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}

                {viewingCourse ? (
                    <CourseView course={viewingCourse} onBack={() => setViewingCourse(null)} toast={setToast} isAdmin={viewMode === 'admin' || viewMode === 'teacher'} userId={currentUser.id} userProgress={userProgress[viewingCourse.id] || {}} />
                ) : activeSection === 'compass' ? (
                    <CompassView currentUser={currentUser} viewMode={viewMode} courses={getVisibleCourses()} users={localUsers} allProgress={allProgress} />
                ) : activeSection === 'admin' && (
                    <AdminPanel users={viewMode === 'teacher' ? localUsers.filter(u => u.institutionId === currentUser.institutionId) : localUsers} institutions={localInstitutions} courses={localCourses} toast={setToast} isAdmin={viewMode === 'admin'} onEditUser={(u) => setActiveModal({type:'student', data: u})} onEditInst={(i) => setActiveModal({type:'inst', data: i})} onEditCourse={(c) => setActiveModal({type:'course', data: c})} />
                )}
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
