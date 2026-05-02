import React, { useState } from 'react';
import { db, appId } from '../firebase';
import { doc, updateDoc, setDoc } from 'firebase/firestore';

export default function CourseView({ course, onBack, toast, isAdmin, userProgress, userId }) {
    const [lessons, setLessons] = useState(course.lessons || []);
    const [activeLesson, setActiveLesson] = useState(null);

    const getPct = () => {
        if (!lessons.length) return 0;
        const done = Object.values(userProgress).filter(v => v === true).length;
        return Math.round((done / lessons.length) * 100);
    };

    const toggleComplete = async (lessonId) => {
        const newProgress = { ...userProgress, [lessonId]: !userProgress[lessonId] };
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'progress', userId), { [course.id]: newProgress }, { merge: true });
            toast(newProgress[lessonId] ? "מעולה! השיעור הושלם ✨" : "סומן כלא הושלם");
        } catch (e) { toast("שגיאה בשמירה"); }
    };

    return (
        <div dir="rtl" className="min-h-screen bg-white flex flex-col font-assistant overflow-hidden">
            <nav className="bg-white border-b px-8 py-4 flex justify-between items-center shadow-sm z-10">
                <button onClick={onBack} className="text-purple-600 font-black">← חזרה</button>
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-black">{course.name}</h1>
                    <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-xs font-black">{getPct()}%</span>
                </div>
                <div className="w-10"></div>
            </nav>

            <div className="flex flex-grow overflow-hidden">
                <div className="w-80 border-l p-6 overflow-y-auto bg-slate-50">
                    <h3 className="font-black mb-6">תכני הקורס</h3>
                    <div className="space-y-2">
                        {lessons.map((l, i) => (
                            <button key={l.id} onClick={() => setActiveLesson(l)} className={`w-full text-right p-4 rounded-2xl flex items-center transition-all ${activeLesson?.id === l.id ? 'bg-purple-600 text-white shadow-lg' : 'bg-white border text-slate-600'}`}>
                                <div className={`w-5 h-5 ml-3 rounded-full border-2 flex items-center justify-center ${userProgress[l.id] ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300'}`}>
                                    {userProgress[l.id] && '✓'}
                                </div>
                                <span className="text-sm font-bold flex-grow truncate">{i+1}. {l.title}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-grow p-12 overflow-y-auto bg-white">
                    {activeLesson ? (
                        <div className="max-w-4xl mx-auto space-y-8">
                            <div className="flex justify-between items-center bg-slate-50 p-6 rounded-[2rem] border">
                                <h2 className="text-2xl font-black">{activeLesson.title}</h2>
                                <button onClick={() => toggleComplete(activeLesson.id)} className={`px-8 py-3 rounded-2xl font-black transition-all ${userProgress[activeLesson.id] ? 'bg-green-100 text-green-700' : 'bg-slate-900 text-white shadow-xl hover:scale-105'}`}>
                                    {userProgress[activeLesson.id] ? 'הושלם ✓' : 'סמן כהושלם'}
                                </button>
                            </div>
                            <div className="min-h-[500px]">
                                {activeLesson.type === 'video' ? (
                                    <iframe title="video" className="w-full aspect-video rounded-3xl shadow-2xl" src={activeLesson.embedUrl?.replace('watch?v=', 'embed/')} allowFullScreen />
                                ) : (
                                    <div className="prose prose-lg max-w-none text-right" dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-200 font-black text-4xl">בחר שיעור להתחלה</div>
                    )}
                </div>
            </div>

            {/* פס התקדמות תחתון - בצבעי חותם חיים */}
            <div className="h-2 bg-slate-100 w-full relative">
                <div className="h-full bg-gradient-to-l from-purple-600 via-emerald-500 to-blue-500 transition-all duration-1000" style={{ width: `${getPct()}%` }}></div>
            </div>
        </div>
    );
}
