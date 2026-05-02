import React, { useState, useEffect } from 'react';
import { db, appId } from '../firebase';
import { doc, updateDoc, setDoc } from 'firebase/firestore';

export default function CourseView({ course, onBack, toast, isAdmin, isTeacher, userProgress, userId }) {
    const [lessons, setLessons] = useState(course.lessons || []);
    const [activeLesson, setActiveLesson] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const getPct = () => {
        if (!lessons.length) return 0;
        const done = Object.values(userProgress).filter(v => v === true).length;
        return Math.round((done / lessons.length) * 100);
    };

    const toggleComplete = async (lessonId) => {
        const newProgress = { ...userProgress, [lessonId]: !userProgress[lessonId] };
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'progress', userId), {
                [course.id]: newProgress
            }, { merge: true });
            toast(newProgress[lessonId] ? "מעולה! השיעור הושלם ✨" : "השיעור סומן כלא הושלם");
        } catch (e) { toast("שגיאה בשמירת התקדמות"); }
    };

    const addLesson = async (type) => {
        const newL = { id: Date.now().toString(), type, title: 'תוכן חדש', content: '', embedUrl: '' };
        const updated = [...lessons, newL];
        setLessons(updated);
        try {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'courses', course.id), { lessons: updated });
        } catch (e) { toast("שגיאה בעדכון"); }
    };

    const getIcon = (type) => {
        const base = "https://www.google.com/s2/favicons?sz=64&domain=";
        if (type === 'video') return <img src={base + "youtube.com"} className="w-5 h-5 ml-2" alt=""/>;
        if (type === 'padlet') return <img src={base + "padlet.com"} className="w-5 h-5 ml-2" alt=""/>;
        return <span className="ml-2">📝</span>;
    };

    return (
        <div dir="rtl" className="min-h-screen bg-white flex flex-col font-assistant overflow-hidden">
            <nav className="bg-white border-b px-8 py-4 flex justify-between items-center shadow-sm z-10">
                <button onClick={onBack} className="text-purple-600 font-black">← חזרה</button>
                <h1 className="text-xl font-black">{course.name}</h1>
                <div className="w-20 font-black text-purple-600">{getPct()}% הושלמו</div>
            </nav>

            <div className="flex flex-grow overflow-hidden">
                <div className="w-80 border-l p-6 overflow-y-auto bg-slate-50">
                    <h3 className="font-black mb-6">תכני הקורס</h3>
                    <div className="space-y-2">
                        {lessons.map((l, i) => (
                            <button key={l.id} onClick={() => setActiveLesson(l)} className={`w-full text-right p-4 rounded-2xl flex items-center transition-all ${activeLesson?.id === l.id ? 'bg-purple-600 text-white' : 'bg-white border'}`}>
                                <div className={`w-5 h-5 ml-3 rounded-full border-2 flex items-center justify-center ${userProgress[l.id] ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300'}`}>
                                    {userProgress[l.id] && '✓'}
                                </div>
                                {getIcon(l.type)}
                                <span className="text-sm font-bold flex-grow truncate">{l.title}</span>
                            </button>
                        ))}
                    </div>
                    {(isAdmin || isTeacher) && (
                        <div className="mt-8 pt-6 border-t grid grid-cols-2 gap-2">
                            <button onClick={()=>addLesson('video')} className="bg-white p-2 rounded-xl text-[10px] font-black border shadow-sm">+ יוטיוב</button>
                            <button onClick={()=>addLesson('text')} className="bg-white p-2 rounded-xl text-[10px] font-black border shadow-sm">+ טקסט</button>
                        </div>
                    )}
                </div>

                <div className="flex-grow p-12 overflow-y-auto bg-white relative">
                    {activeLesson ? (
                        <div className="max-w-4xl mx-auto space-y-8">
                            <div className="flex justify-between items-center">
                                <h2 className="text-3xl font-black">{activeLesson.title}</h2>
                                <div className="flex gap-4">
                                    <button onClick={() => toggleComplete(activeLesson.id)} className={`px-8 py-3 rounded-2xl font-black transition-all ${userProgress[activeLesson.id] ? 'bg-green-100 text-green-700' : 'bg-slate-900 text-white'}`}>
                                        {userProgress[activeLesson.id] ? 'הושלם ✓' : 'סמן כהושלם'}
                                    </button>
                                    {(isAdmin || isTeacher) && <button onClick={() => setIsEditing(!isEditing)} className="text-slate-400 font-bold underline">עריכה</button>}
                                </div>
                            </div>
                            {isEditing ? (
                                <div className="space-y-4 p-8 bg-slate-50 rounded-3xl border">
                                    <input className="w-full p-4 border rounded-xl font-bold" value={activeLesson.title} onChange={e => {
                                        const newList = lessons.map(l => l.id === activeLesson.id ? {...l, title: e.target.value} : l);
                                        setLessons(newList);
                                    }} />
                                    <textarea className="w-full p-4 border rounded-xl h-40" value={activeLesson.content} onChange={e => {
                                        const newList = lessons.map(l => l.id === activeLesson.id ? {...l, content: e.target.value} : l);
                                        setLessons(newList);
                                    }} />
                                    <button onClick={async () => {
                                        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'courses', course.id), { lessons: lessons });
                                        setIsEditing(false);
                                        toast("נשמר!");
                                    }} className="w-full bg-purple-600 text-white py-4 rounded-xl font-black">שמור שינויים</button>
                                </div>
                            ) : (
                                <div className="min-h-[500px]">
                                    {activeLesson.type === 'video' ? (
                                        <iframe title="video" className="w-full aspect-video rounded-3xl shadow-xl" src={activeLesson.embedUrl.replace('watch?v=', 'embed/')} allowFullScreen />
                                    ) : (
                                        <div className="prose prose-lg max-w-none text-right" dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-300 font-black text-2xl animate-pulse">בחר שיעור מהתפריט</div>
                    )}
                </div>
            </div>

            {/* פס התקדמות תחתון */}
            <div className="h-2 bg-slate-100 w-full relative">
                <div className="h-full bg-gradient-to-r from-purple-600 via-emerald-500 to-blue-500 transition-all duration-1000" style={{ width: `${getPct()}%` }}></div>
            </div>
        </div>
    );
}
