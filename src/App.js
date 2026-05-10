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
import MapModal from './components/MapModal';
import MapView from './components/MapView';
import AdminPanel from './components/AdminPanel';
import SmartContentModal from './components/SmartContentModal';
import CompassView from './components/CompassView'; 
import SmartCalendarModal from './components/SmartCalendarModal'; 
import ImportModal from './components/ImportModal'; // הייבוא החדש שלנו
import { onSnapshot, collection, doc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

export const LOGO_URL = "https://i.postimg.cc/mrzcZWpL/lwgw-hwtm-mwnps.gif";
export const DEFAULT_MAP_URL = "https://i.postimg.cc/Z5p6mR0H/Gemini-Generated-Image.jpg"; 
export const BACKGROUND_VIDEO_ID = "OHLMTgHl6cc"; 
export const APP_VERSION = "2.40"; // גרסת הייבוא

export default function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [lang, setLang] = useState('he');
    const [viewMode, setViewMode] = useState('admin'); 
    
    const [courseViewType, setCourseViewType] = useState('map'); 

    const [localCourses, setLocalCourses] = useState([]); 
    const [localUsers, setLocalUsers] = useState([]);
    const [localInstitutions, setLocalInstitutions] = useState([]);
    const [localMaps, setLocalMaps] = useState([]);
    
    const [userProgress, setUserProgress] = useState({});
    const [allProgress, setAllProgress] = useState({}); 
    
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
            onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'maps'), s => setLocalMaps(s.docs.map(d => ({...d.data(), id: d.id}))));
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
        if (u === 'rami' && p === '1234') { setCurrentUser({id: 'admin-rami', firstName:'רמי', role:'admin'}); setViewMode('admin'); return; }
        const found = localUsers.find(x => x.username === u && x.password === p);
        if (found) {
            const inst = localInstitutions.find(i => i.id === found.institutionId);
            if (inst?.expiryDate && new Date(inst.expiryDate) < new Date()) return setToast(t('expiry_msg'));
            setCurrentUser(found); setViewMode(found.role || 'student');
        } else { setToast('פרטים שגויים'); }
    };

    const currentMapUrl = localInstitutions.find(i => i.id === currentUser?.institutionId)?.mapBackground 
        || localMaps.find(m => m.isDefault)?.url 
        || DEFAULT_MAP_URL;

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
                {viewMode === 'admin' && !viewingCourse && (
                    <div className="mb-6 flex flex-wrap justify-end gap-4">
                        {/* הכפתור החדש לייבוא קורסים! */}
                        <button 
                            onClick={() => setActiveModal({type: 'import'})}
                            className="bg-white border-2 border-green-500 text-green-600 px-6 py-3 rounded-2xl font-black shadow-sm hover:shadow-lg hover:bg-green-50 hover:scale-105 transition-all flex items-center gap-2">
                            <span>📥 ייבוא מוורדפרס</span>
                        </button>

                        <button 
                            onClick={() => setActiveModal({type: 'smart_calendar'})}
                            className="bg-white border-2 border-blue-500 text-blue-600 px-6 py-3 rounded-2xl font-black shadow-sm hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5z"/>
                            </svg>
                            <span>הוספת אירוע ביומן</span>
                        </button>

                        <button 
                            onClick={() => setActiveModal({type: 'smart_content'})}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2">
                            <span>✨ הוספת תוכן חכם (AI)</span>
                        </button>
                    </div>
                )}

                {viewingCourse ? (
                    <CourseView course={viewingCourse} onBack={() => setViewingCourse(null)} toast={setToast} isAdmin={viewMode === 'admin' || viewMode === 'teacher'} userId={currentUser.id} userProgress={userProgress[viewingCourse.id] || {}} />
                ) : activeSection === 'compass' ? (
                    <CompassView 
                        currentUser={currentUser} 
                        viewMode={viewMode} 
                        courses={getVisibleCourses()} 
                        users={localUsers} 
                        allProgress={allProgress} 
                    />
                ) : activeSection === 'admin' ? (
                    <AdminPanel 
                        users={viewMode === 'teacher' ? localUsers.filter(u => u.institutionId === currentUser.institutionId) : localUsers} 
                        institutions={localInstitutions} 
                        courses={localCourses}
                        toast={setToast} 
                        isAdmin={viewMode === 'admin'} 
                        onEditUser={(u) => setActiveModal({type:'student', data: u})}
                        onEditInst={(i) => setActiveModal({type:'inst', data: i})}
                        onEditCourse={(c) => setActiveModal({type:'course', data: c})}
                    />
                ) : (
                    <div className="space-y-6 text-right">
                        <div className="flex justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
                            <h1 className="text-3xl font-black text-slate-800">{t('my_courses')}</h1>
                            <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
                                <button onClick={() => setCourseViewType('map')} className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${courseViewType === 'map' ? 'bg-white shadow-md text-purple-600' : 'text-slate-500 hover:text-slate-700'}`}>🗺️ תצוגת מפה</button>
                                <button onClick={() => setCourseViewType('grid')} className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${courseViewType === 'grid' ? 'bg-white shadow-md text-purple-600' : 'text-slate-500 hover:text-slate-700'}`}>⏹️ תצוגה קלאסית</button>
                            </div>
                        </div>

                        {courseViewType === 'map' ? (
                            <MapView 
                                courses={getVisibleCourses()} 
                                direction={direction} 
                                mapBackground={currentMapUrl} 
                                userProgress={userProgress}
                                setViewingCourse={setViewingCourse}
                            />
                        ) : (
                            <div className="grid md:grid-cols-3 gap-8">
                                {getVisibleCourses().map(c => {
                                    const completed = userProgress[c.id] ? Object.values(userProgress[c.id]).filter(v => v === true).length : 0;
                                    const pct = c.lessons?.length ? Math.round((completed / c.lessons.length) * 100) : 0;
                                    return (
                                        <div key={c.id} onClick={() => setViewingCourse(c)} className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col items-center group hover:scale-[1.02] transition-all cursor-pointer">
                                            <div className="relative w-24 h-24 mb-4">
                                                <svg className="w-full h-full -rotate-90"><circle cx="48" cy="48" r="40" stroke="#f1f5f9" strokeWidth="8" fill="transparent" /><circle cx="48" cy="48" r="40" stroke="#9333ea" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * pct) / 100} strokeLinecap="round" className="transition-all duration-1000" /></svg>
                                                <div className="absolute inset-0 flex items-center justify-center font-black text-lg text-purple-600">{pct}%</div>
                                            </div>
                                            <h3 className="font-black text-xl mb-4 text-slate-800 text-center">{c.name}</h3>
                                            <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black group-hover:bg-purple-600 transition-colors shadow-lg">כניסה לקורס</button>
                                        </div>
                                    );
                                })}
                                {getVisibleCourses().length === 0 && <div className="col-span-3 text-center text-slate-400 font-bold py-10">לא נמצאו קורסים המותאמים למוסד זה.</div>}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {activeModal?.type === 'course' && <CourseModal onClose={() => setActiveModal(null)} toast={setToast} geminiKey={process.env.REACT_APP_GEMINI_API_KEY} existingCourses={localCourses} institutions={localInstitutions} initialData={activeModal.data} />}
            {activeModal?.type === 'student' && <StudentModal onClose={() => setActiveModal(null)} toast={setToast} institutions={localInstitutions} allUsers={localUsers} initialData={activeModal.data} isAdmin={viewMode === 'admin'} />}
            {activeModal?.type === 'inst' && <InstitutionModal onClose={() => setActiveModal(null)} toast={setToast} initialData={activeModal.data} localMaps={localMaps} existingCourses={localCourses} />}
            {activeModal?.type === 'map_admin' && <MapModal onClose={() => setActiveModal(null)} toast={setToast} localMaps={localMaps} initialData={activeModal.data} />}
            
            {activeModal?.type === 'smart_content' && (
                <SmartContentModal 
                    onClose={() => setActiveModal(null)} 
                    toast={setToast} 
                    existingCourses={localCourses} 
                    geminiKey={process.env.REACT_APP_GEMINI_API_KEY} 
                />
            )}

            {activeModal?.type === 'smart_calendar' && (
                <SmartCalendarModal 
                    onClose={() => setActiveModal(null)} 
                    toast={setToast} 
                    geminiKey={process.env.REACT_APP_GEMINI_API_KEY} 
                />
            )}

            {/* הפעלת מודאל הייבוא */}
            {activeModal?.type === 'import' && (
                <ImportModal 
                    onClose={() => setActiveModal(null)} 
                    toast={setToast} 
                />
            )}
            
            {toast && <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-full font-black z-[400] shadow-2xl animate-bounce" style={{ animationDuration: '0.5s' }} ref={(el) => { if(el) setTimeout(() => setToast(''), 5000); }}>{toast}</div>}
            <div className={`fixed bottom-2 ${direction === 'rtl' ? 'left-2' : 'right-2'} text-[10px] text-slate-300 font-bold`}>V {APP_VERSION}</div>
        </div>
    );
}
