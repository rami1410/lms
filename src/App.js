import React, { useState, useEffect, useRef } from 'react';
import { db, auth, appId } from './firebase';
import { i18n } from './translations';
import Login from './components/Login';
import Register from './components/Register';
import AdminPanel from './components/AdminPanel';
import CourseModal from './components/CourseModal';
import { onSnapshot, collection } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

export const LOGO_URL = "https://i.postimg.cc/mrzcZWpL/lwgw-hwtm-mwnps.gif";
export const BACKGROUND_VIDEO_ID = "OHLMTgHl6cc";
export const APP_VERSION = "2.05";

export default function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [localUsers, setLocalUsers] = useState([]);
    const [localCourses, setLocalCourses] = useState([]);
    const [localInstitutions, setLocalInstitutions] = useState([]);
    const [lang, setLang] = useState('he');
    const [isRegistering, setIsRegistering] = useState(false);
    const [activeSection, setActiveSection] = useState('courses');
    const [activeModal, setActiveModal] = useState(null);
    const [toastMsg, setToastMsg] = useState('');

    const audioRef = useRef(null);

    useEffect(() => {
        audioRef.current = new Audio("https://actions.google.com/sounds/v1/science_fiction/low_fuzz_explosion.ogg");
        
        // הגנה: מפעילים רק אם Firebase התחבר בהצלחה
        if (auth) {
            signInAnonymously(auth).catch(() => {});
        }
        
        if (db) {
            onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'users'), s => setLocalUsers(s.docs.map(d => ({...d.data(), id: d.id}))));
            onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'courses'), s => setLocalCourses(s.docs.map(d => ({...d.data(), id: d.id}))));
            onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'institutions'), s => setLocalInstitutions(s.docs.map(d => ({...d.data(), id: d.id}))));
        }
    }, []);

    const t = (key) => i18n[lang][key] || key;
    const showToast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000); };
    const playBoom = () => { if(audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play().catch(()=>{}); } };

    const handleLogin = (u, p) => {
        if (u === 'rami' && p === '1234') setCurrentUser({ firstName: 'רמי', role: 'admin', username: 'rami' });
        else {
            const found = localUsers.find(x => x.username === u && x.password === p);
            if (found) {
                if (found.status !== 'approved') showToast("חשבון ממתין לאישור אדמין");
                else setCurrentUser(found);
            }
            else { playBoom(); showToast("פרטים שגויים"); }
        }
    };

    return (
        <div dir="rtl" className={`min-h-screen ${currentUser ? 'bg-white text-slate-900' : 'bg-slate-950 text-white'}`}>
            <div className="fixed bottom-4 left-4 text-white text-[12px] font-black z-[100] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">V {APP_VERSION}</div>
            
            {!currentUser ? (
                <div className="relative min-h-screen flex items-center justify-center p-4">
                    <div className="fixed inset-0 z-0 pointer-events-none">
                        <iframe className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[115vw] h-[115vh] opacity-50 scale-125" src={`https://www.youtube.com/embed/${BACKGROUND_VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${BACKGROUND_VIDEO_ID}&controls=0&start=30`} frameBorder="0" />
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
                    </div>

                    {!isRegistering ? (
                        <Login onLogin={handleLogin} onRegisterToggle={()=>setIsRegistering(true)} lang={lang} setLang={setLang} t={t} playBoom={playBoom} />
                    ) : (
                        <Register onBack={()=>setIsRegistering(false)} institutions={localInstitutions} users={localUsers} toast={showToast} playBoom={playBoom} />
                    )}
                </div>
            ) : (
                <div className="flex flex-col min-h-screen">
                    <nav className="bg-white border-b px-8 py-4 flex justify-between items-center shadow-sm">
                        <div className="flex items-center gap-4">
                            <img src={LOGO_URL} className="h-10 rounded-xl" />
                            <button onClick={() => setActiveSection('courses')} className={`font-black ${activeSection === 'courses' ? 'text-purple-600' : 'text-slate-400'}`}>הקורסים שלי</button>
                            {currentUser.role === 'admin' && <button onClick={() => setActiveSection('admin')} className={`font-black ${activeSection === 'admin' ? 'text-purple-600' : 'text-slate-400'}`}>ניהול</button>}
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="font-black bg-slate-100 px-4 py-2 rounded-full text-sm text-slate-900">
                                {currentUser.username === 'rami' && <span className="ml-1">👑</span>} {currentUser.firstName}
                            </div>
                            <button onClick={() => setCurrentUser(null)} className="text-red-500 font-black text-xs bg-red-50 p-2 rounded-lg">יציאה</button>
                        </div>
                    </nav>

                    <main className="p-8 max-w-7xl mx-auto w-full">
                        {activeSection === 'courses' && (
                            <div className="grid md:grid-cols-3 gap-8 text-right">
                                {localCourses.map(c => (
                                    <div key={c.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                                        <h3 className="font-black text-2xl mb-4">{c.name}</h3>
                                        <p className="text-slate-400 font-bold mb-8 text-sm line-clamp-3">{c.summary}</p>
                                        <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black">כניסה</button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {activeSection === 'admin' && (
                            <div className="space-y-6">
                                <button onClick={() => setActiveModal('add_course')} className="bg-purple-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg">+ קורס חדש</button>
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
