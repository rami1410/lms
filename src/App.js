import React, { useState, useEffect } from 'react';
import { db, auth, appId } from './firebase';
import Login from './components/Login';
import CourseModal from './components/CourseModal';
import CourseView from './components/CourseView';
import StudentModal from './components/StudentModal'; 
import MapModal from './components/MapModal'; 
import AdminPanel from './components/AdminPanel';
import { onSnapshot, collection } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

// הגדרת גרסה כדי לוודא עדכון
export const APP_VERSION = "2.11"; 

export default function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [localCourses, setLocalCourses] = useState([]);
    const [localUsers, setLocalUsers] = useState([]);
    const [localInstitutions, setLocalInstitutions] = useState([]);
    const [activeSection, setActiveSection] = useState('courses');
    const [activeModal, setActiveModal] = useState(null);
    const [viewingCourse, setViewingCourse] = useState(null);
    const [toast, setToast] = useState('');

    useEffect(() => {
        if (auth) signInAnonymously(auth).catch(()=>{});
        if (db) {
            onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'courses'), s => setLocalCourses(s.docs.map(d => ({...d.data(), id: d.id}))));
            onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'users'), s => setLocalUsers(s.docs.map(d => ({...d.data(), id: d.id}))));
            onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'institutions'), s => setLocalInstitutions(s.docs.map(d => ({...d.data(), id: d.id}))));
        }
    }, []);

    const showToast = (m) => { setToast(m); setTimeout(()=>setToast(''), 3000); };

    if (!currentUser) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Login onLogin={(u, p) => u === 'rami' && p === '1234' ? setCurrentUser({firstName:'רמי', role:'admin'}) : showToast('פרטים שגויים')} /></div>;

    if (viewingCourse) return <CourseView course={viewingCourse} onBack={() => setViewingCourse(null)} toast={showToast} isAdmin={currentUser.role === 'admin'} />;

    return (
        <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-900 font-assistant">
            {/* מספר גרסה בפינה */}
            <div className="fixed bottom-2 left-2 text-[10px] text-slate-300 font-bold z-[1000]">V {APP_VERSION}</div>

            <nav className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
                <div className="flex items-center gap-6">
                    <span className="text-2xl font-black">LMS<span className="text-purple-600">Pro</span></span>
                    <button onClick={() => setActiveSection('courses')} className={`font-black transition-all pb-1 ${activeSection === 'courses' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-slate-400 hover:text-slate-600'}`}>הקורסים שלי</button>
                    {currentUser.role === 'admin' && (
                        <button onClick={() => setActiveSection('admin')} className={`font-black transition-all pb-1 ${activeSection === 'admin' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-slate-400 hover:text-slate-600'}`}>ניהול מערכת</button>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <span className="font-bold text-slate-500">שלום, {currentUser.firstName}</span>
                    <button onClick={() => setCurrentUser(null)} className="text-red-500 font-black bg-red-50 px-4 py-2 rounded-xl text-xs">יציאה</button>
                </div>
            </nav>

            <main className="p-8 max-w-7xl mx-auto">
                {activeSection === 'courses' && (
                    <>
                        <h1 className="text-4xl font-black mb-12">הקורסים שלי</h1>
                        <div className="grid md:grid-cols-3 gap-8 text-right">
                            {localCourses.map(c => (
                                <div key={c.id} className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col">
                                    <h3 className="font-black text-2xl mb-4">{c.name}</h3>
                                    <p className="text-slate-400 text-sm mb-8 line-clamp-3">{c.summary}</p>
                                    <button onClick={() => setViewingCourse(c)} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-purple-600 transition-colors">כניסה לקורס</button>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {activeSection === 'admin' && (
                    <div className="space-y-8 text-right">
                        <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100">
                            <h2 className="text-3xl font-black mb-8">לוח בקרה למנהל</h2>
                            <div className="flex flex-wrap gap-4">
                                <button onClick={() => setActiveModal('add_course')} className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-5 rounded-3xl font-black shadow-lg transition-all text-lg">+ קורס חדש</button>
                                <button onClick={() => setActiveModal('add_student')} className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-5 rounded-3xl font-black shadow-lg transition-all text-lg">+ תלמיד חדש</button>
                                <button onClick={() => setActiveModal('add_map')} className="bg-blue-500 hover:bg-blue-600 text-white px-10 py-5 rounded-3xl font-black shadow-lg transition-all text-lg">+ מפת למידה</button>
                            </div>
                        </div>
                        
                        <AdminPanel users={localUsers} institutions={localInstitutions} toast={showToast} />
                    </div>
                )}
            </main>

            {activeModal === 'add_course' && <CourseModal onClose={() => setActiveModal(null)} toast={showToast} geminiKey={process.env.REACT_APP_GEMINI_API_KEY} />}
            {activeModal === 'add_student' && <StudentModal onClose={() => setActiveModal(null)} toast={showToast} />}
            {activeModal === 'add_map' && <MapModal onClose={() => setActiveModal(null)} toast={showToast} />}
            
            {toast && <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-full font-black z-[300] shadow-2xl">{toast}</div>}
        </div>
    );
}
