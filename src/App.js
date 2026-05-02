import React, { useState, useEffect } from 'react';
import { db, auth, appId } from './firebase';
import Login from './components/Login';
import CourseModal from './components/CourseModal';
import CourseView from './components/CourseView'; // נייצר אותו מיד
import { onSnapshot, collection } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

export default function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [localCourses, setLocalCourses] = useState([]);
    const [activeModal, setActiveModal] = useState(null);
    const [viewingCourse, setViewingCourse] = useState(null);
    const [toast, setToast] = useState('');

    useEffect(() => {
        if (auth) signInAnonymously(auth).catch(()=>{});
        if (db) {
            onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'courses'), s => 
                setLocalCourses(s.docs.map(d => ({...d.data(), id: d.id})))
            );
        }
    }, []);

    const showToast = (m) => { setToast(m); setTimeout(()=>setToast(''), 3000); };

    if (!currentUser) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Login onLogin={(u, p) => u === 'rami' && p === '1234' ? setCurrentUser({firstName:'רמי', role:'admin'}) : showToast('פרטים שגויים')} /></div>;

    // אם המשתמש בתוך קורס ספציפי
    if (viewingCourse) return <CourseView course={viewingCourse} onBack={() => setViewingCourse(null)} toast={showToast} isAdmin={currentUser.role === 'admin'} />;

    return (
        <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-900 font-assistant">
            <nav className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <span className="text-2xl font-black">LMS<span className="text-purple-600">Pro</span></span>
                    {currentUser.role === 'admin' && <button onClick={() => setActiveModal('add')} className="bg-purple-600 text-white px-4 py-2 rounded-xl font-bold text-sm">+ קורס חדש</button>}
                </div>
                <button onClick={() => setCurrentUser(null)} className="text-slate-400 font-bold">יציאה</button>
            </nav>

            <main className="p-8 max-w-7xl mx-auto">
                <h1 className="text-4xl font-black mb-12">הקורסים שלי</h1>
                <div className="grid md:grid-cols-3 gap-8">
                    {localCourses.map(c => (
                        <div key={c.id} className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col">
                            <h3 className="font-black text-2xl mb-4 text-right">{c.name}</h3>
                            <p className="text-slate-400 text-sm mb-8 text-right line-clamp-3">{c.summary}</p>
                            <button onClick={() => setViewingCourse(c)} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-purple-600 transition-colors">כניסה לקורס</button>
                        </div>
                    ))}
                </div>
            </main>

            {activeModal === 'add' && <CourseModal onClose={() => setActiveModal(null)} toast={showToast} geminiKey={process.env.REACT_APP_GEMINI_API_KEY} />}
            {toast && <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-full font-black z-[300]">{toast}</div>}
        </div>
    );
}
