import React, { useState, useEffect } from 'react';
import { db, auth, appId } from './firebase';
import Login from './components/Login';
import Register from './components/Register';
import CourseModal from './components/CourseModal';
import CourseView from './components/CourseView';
import StudentModal from './components/StudentModal';
import MapModal from './components/MapModal';
import AdminPanel from './components/AdminPanel';
import { onSnapshot, collection } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

// הגדרות לוגו ועיצוב
export const LOGO_URL = "https://i.postimg.cc/mrzcZWpL/lwgw-hwtm-mwnps.gif";
export const APP_VERSION = "2.16";

export default function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [localCourses, setLocalCourses] = useState([]);
    const [localUsers, setLocalUsers] = useState([]);
    const [localInstitutions, setLocalInstitutions] = useState([]);
    const [activeSection, setActiveSection] = useState('courses');
    const [activeModal, setActiveModal] = useState(null);
    const [viewingCourse, setViewingCourse] = useState(null);
    const [isRegistering, setIsRegistering] = useState(false);
    const [toast, setToast] = useState('');

    useEffect(() => {
        if (auth) signInAnonymously(auth).catch(() => {});
        if (db) {
            onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'courses'), s => {
                setLocalCourses(s.docs.map(d => ({...d.data(), id: d.id})));
            });
            onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'users'), s => {
                setLocalUsers(s.docs.map(d => ({...d.data(), id: d.id})));
            });
            onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'institutions'), s => {
                setLocalInstitutions(s.docs.map(d => ({...d.data(), id: d.id})));
            });
        }
    }, []);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    if (!currentUser) {
        return isRegistering ? 
            <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
                <Register onBack={() => setIsRegistering(false)} institutions={localInstitutions} users={localUsers} toast={showToast} />
            </div> :
            <Login onLogin={setCurrentUser} users={localUsers} onRegister={() => setIsRegistering(true)} />;
    }

    const isAdmin = currentUser.role === 'admin';

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-right" dir="rtl">
            {/* Header משודרג עם לוגו וכפתורים */}
            <header className="bg-white shadow-sm border-b sticky top-0 z-[100] px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    
                    {/* צד ימין: לוגו חותם חיים */}
                    <div className="flex items-center gap-4">
                        <img src={LOGO_URL} alt="חותם חיים" className="h-12 w-auto object-contain" />
                        <h1 className="text-xl font-black text-slate-800 hidden md:block">מערכת למידה</h1>
                    </div>

                    {/* מרכז: ניווט */}
                    <nav className="flex gap-6 font-bold text-slate-500">
                        <button onClick={() => {setActiveSection('courses'); setViewingCourse(null)}} 
                            className={`${activeSection === 'courses' ? 'text-purple-600 border-b-2 border-purple-600' : ''} pb-1`}>הקורסים שלי</button>
                        {isAdmin && <button onClick={() => setActiveSection('admin')} 
                            className={`${activeSection === 'admin' ? 'text-purple-600 border-b-2 border-purple-600' : ''} pb-1`}>ניהול מערכת</button>}
                    </nav>

                    {/* צד שמאל: כפתורי פעולה מהירים למנהל */}
                    <div className="flex gap-2">
                        {isAdmin && (
                            <>
                                <button onClick={() => setActiveModal('course')} className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-black shadow-sm">+ קורס</button>
                                <button onClick={() => setActiveModal('student')} className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-black shadow-sm">+ תלמיד</button>
                                <button onClick={() => showToast("תכונה זו בבניה: הוספת מוסד")} className="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-black shadow-sm">+ מוסד</button>
                                <button onClick={() => setActiveModal('map')} className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-black shadow-sm">+ מפה</button>
                            </>
                        )}
                        <button onClick={() => setCurrentUser(null)} className="text-slate-400 font-bold mr-4 text-sm">יציאה</button>
                    </div>
                </div>
            </header>

            <main className="p-6 max-w-7xl mx-auto">
                {viewingCourse ? (
                    <CourseView course={viewingCourse} onBack={() => setViewingCourse(null)} toast={showToast} isAdmin={isAdmin} />
                ) : activeSection === 'admin' ? (
                    <AdminPanel users={localUsers} institutions={localInstitutions} toast={showToast} />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {localCourses.map(course => (
                            <div key={course.id} onClick={() => setViewingCourse(course)} className="bg-white p-6 rounded-[2rem] shadow-lg cursor-pointer hover:scale-[1.02] transition-transform">
                                <div className="text-purple-600 font-black mb-2">כיתות {course.fromGrade}-{course.toGrade}</div>
                                <h3 className="text-2xl font-black mb-4">{course.name}</h3>
                                <p className="text-slate-500 line-clamp-2">{course.summary}</p>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* מודאלים */}
            {activeModal === 'course' && <CourseModal onClose={() => setActiveModal(null)} toast={showToast} />}
            {activeModal === 'student' && <StudentModal onClose={() => setActiveModal(null)} toast={showToast} />}
            {activeModal === 'map' && <MapModal onClose={() => setActiveModal(null)} toast={showToast} />}

            {/* התראות */}
            {toast && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold shadow-2xl z-[300] animate-bounce">
                    {toast}
                </div>
            )}
            
            <div className="fixed bottom-4 left-4 text-[10px] text-slate-300 font-mono">V {APP_VERSION}</div>
        </div>
    );
}
