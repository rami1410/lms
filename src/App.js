import React, { useState, useEffect } from 'react';
import { db, auth, appId } from './firebase';
import { i18n } from './translations';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import CourseModal from './components/CourseModal';
import { onSnapshot, collection, signInAnonymously } from 'firebase/firestore';

export const LOGO_URL = "https://i.postimg.cc/mrzcZWpL/lwgw-hwtm-mwnps.gif";
export const BACKGROUND_VIDEO_ID = "OHLMTgHl6cc";
export const APP_VERSION = "1.29";

export default function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [localUsers, setLocalUsers] = useState([]);
    const [localCourses, setLocalCourses] = useState([]);
    const [lang, setLang] = useState('he');
    const [activeSection, setActiveSection] = useState('courses');
    const [activeModal, setActiveModal] = useState(null);
    const [toastMsg, setToastMsg] = useState('');

    useEffect(() => {
        signInAnonymously(auth);
        onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'users'), s => setLocalUsers(s.docs.map(d => ({...d.data(), id: d.id}))));
        onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'courses'), s => setLocalCourses(s.docs.map(d => ({...d.data(), id: d.id}))));
    }, []);

    const t = (key) => i18n[lang][key] || key;
    const showToast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000); };

    const handleLogin = (u, p) => {
        if (u === 'rami' && p === '1234') setCurrentUser({ firstName: 'רמי', role: 'admin' });
        else {
            const found = localUsers.find(x => x.username === u && x.password === p);
            if (found) setCurrentUser(found);
            else showToast("פרטים שגויים");
        }
    };

    return (
        <div dir="rtl" className={`min-h-screen ${currentUser ? 'bg-white text-slate-900' : 'bg-slate-950 text-white'}`}>
            <div className="fixed bottom-4 left-4 text-white text-[10px] font-black z-50 drop-shadow-md">V {APP_VERSION}</div>
            
            {!currentUser ? (
                <Login onLogin={handleLogin} lang={lang} setLang={setLang} t={t} />
            ) : (
                <div className="flex flex-col min-h-screen">
                    <nav className="bg-white border-b px-8 py-4 flex justify-between items-center shadow-sm">
                        <div className="flex items-center gap-4">
                            <img src={LOGO_URL} className="h-10 rounded-xl" />
                            <button onClick={() => setActiveSection('courses')} className={`font-black ${activeSection === 'courses' ? 'text-purple-600' : 'text-slate-400'}`}>הקורסים שלי</button>
                            {currentUser.role === 'admin' && <button onClick={() => setActiveSection('admin')} className={`font-black ${activeSection === 'admin' ? 'text-purple-600' : 'text-slate-400'}`}>ניהול</button>}
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="font-black bg-slate-100 px-4 py-2 rounded-full text-sm">
                                {currentUser.role === 'admin' && <span className="ml-1">👑</span>} {currentUser.firstName}
                            </div>
                            <button onClick={() => setCurrentUser(null)} className="text-red-500 font-black text-xs bg-red-50 p-2 rounded-lg">יציאה</button>
                        </div>
                    </nav>

                    <main className="p-8 max-w-7xl mx-auto w-full">
                        {activeSection === 'courses' && (
                            <div className="grid md:grid-cols-3 gap-8">
                                {localCourses.map(c => (
                                    <div key={c.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl border">
                                        <h3 className="font-black text-2xl mb-4">{c.name}</h3>
                                        <p className="text-slate-400 font-bold mb-8 text-sm line-clamp-3">{c.summary}</p>
                                        <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black">כניסה</button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {activeSection === 'admin' && (
                            <div className="space-y-6 text-right">
                                <button onClick={() => setActiveModal('add_course')} className="bg-purple-600 text-white px-8 py-4 rounded-2xl font-black">+ קורס חדש</button>
                                <AdminPanel users={localUsers} toast={showToast} />
                            </div>
                        )}
                    </main>
                </div>
            )}

            {activeModal === 'add_course' && (
                <CourseModal onClose={() => setActiveModal(null)} toast={showToast} geminiKey={process.env.NEXT_PUBLIC_GEMINI_API_KEY} />
            )}
            
            {toastMsg && <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-10 py-4 rounded-full z-[100] font-black animate-bounce text-sm">{toastMsg}</div>}
        </div>
    );
}
