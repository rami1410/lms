import React, { useState } from 'react';
import { db, appId } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function CourseView({ course, onBack, toast, isAdmin }) {
    const [lessons, setLessons] = useState(course.lessons || []);
    const [activeLesson, setActiveLesson] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const addLesson = async (type) => {
        const newLesson = {
            id: Date.now(),
            type: type,
            title: 'תוכן חדש',
            content: '',
            embedUrl: ''
        };
        const updated = [...lessons, newLesson];
        setLessons(updated);
        try {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'courses', course.id), { lessons: updated });
            toast("נוסף בהצלחה!");
        } catch (e) { toast("שגיאה בעדכון"); }
    };

    const renderContent = (lesson) => {
        // התיקון ש-Vercel רצה: הוספת title="video" ו-title="content" 
        if (lesson.type === 'video') return <iframe title="video" className="w-full aspect-video rounded-3xl shadow-md" src={lesson.embedUrl.replace('watch?v=', 'embed/')} allowFullScreen />;
        if (['genially', 'padlet', 'slides', 'html'].includes(lesson.type)) return <iframe title="content" className="w-full h-[600px] rounded-3xl border shadow-md" src={lesson.embedUrl} allowFullScreen />;
        return <div className="prose prose-lg max-w-none text-right bg-white p-8 rounded-3xl shadow-sm border border-slate-100" dangerouslySetInnerHTML={{ __html: lesson.content }} />;
    };

    return (
        <div dir="rtl" className="min-h-screen bg-slate-50 flex flex-col font-assistant">
            <nav className="bg-white border-b px-8 py-4 flex justify-between items-center shadow-sm">
                <button onClick={onBack} className="text-purple-600 font-black hover:bg-purple-50 px-4 py-2 rounded-xl transition-all">← חזרה לקורסים</button>
                <h1 className="text-2xl font-black text-slate-800">{course.name}</h1>
                <div className="w-20"></div>
            </nav>

            <div className="flex flex-grow overflow-hidden max-w-7xl mx-auto w-full p-6 gap-6">
                {/* תפריט צד - רשימת שיעורים */}
                <div className="w-80 bg-white border rounded-[2rem] shadow-sm p-6 overflow-y-auto flex flex-col h-full">
                    <h3 className="font-black text-xl mb-6 border-b pb-4 text-slate-800">תכני הקורס</h3>
                    <div className="space-y-3 flex-grow">
                        {lessons.length === 0 && <div className="text-slate-400 text-sm font-bold text-center mt-10">אין עדיין תכנים בקורס זה</div>}
                        {lessons.map((l, i) => (
                            <button key={l.id} onClick={() => setActiveLesson(l)} className={`w-full text-right p-4 rounded-2xl font-bold transition-all ${activeLesson?.id === l.id ? 'bg-purple-600 text-white shadow-lg scale-105' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                                {i+1}. {l.title}
                            </button>
                        ))}
                    </div>
                    
                    {isAdmin && (
                        <div className="mt-8 pt-6 border-t space-y-3 bg-slate-50 -mx-6 -mb-6 p-6 rounded-b-[2rem]">
                            <p className="text-xs font-black text-slate-500 mb-2">הוספת תוכן (מנהל):</p>
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={()=>addLesson('text')} className="bg-white border shadow-sm p-2 rounded-xl text-xs font-bold hover:bg-purple-50 hover:text-purple-600 transition-all">טקסט/HTML</button>
                                <button onClick={()=>addLesson('video')} className="bg-white border shadow-sm p-2 rounded-xl text-xs font-bold hover:bg-purple-50 hover:text-purple-600 transition-all">יוטיוב</button>
                                <button onClick={()=>addLesson('padlet')} className="bg-white border shadow-sm p-2 rounded-xl text-xs font-bold hover:bg-purple-50 hover:text-purple-600 transition-all">פדלט</button>
                                <button onClick={()=>addLesson('genially')} className="bg-white border shadow-sm p-2 rounded-xl text-xs font-bold hover:bg-purple-50 hover:text-purple-600 transition-all">ג'יניאלי</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* אזור התוכן המרכזי */}
                <div className="flex-grow overflow-y-auto h-full">
                    {activeLesson ? (
                        <div className="max-w-4xl mx-auto pb-20">
                            <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                                <h2 className="text-3xl font-black text-slate-800">{activeLesson.title}</h2>
                                {isAdmin && <button onClick={() => setIsEditing(!isEditing)} className="bg-purple-100 text-purple-700 px-6 py-2 rounded-xl font-black hover:bg-purple-200 transition-colors">{isEditing ? 'סגור עריכה' : '✏️ ערוך שיעור'}</button>}
                            </div>

                            {isEditing ? (
                                <div className="space-y-6 bg-white p-10 rounded-[3rem] shadow-xl border border-purple-100">
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-slate-500">כותרת השיעור</label>
                                        <input className="w-full p-4 border bg-slate-50 rounded-2xl outline-none focus:border-purple-500 font-bold" value={activeLesson.title} onChange={e => {
                                            const newList = lessons.map(l => l.id === activeLesson.id ? {...l, title: e.target.value} : l);
                                            setLessons(newList);
                                        }} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-slate-500">קישור להטמעה (יוטיוב, פדלט, וכו')</label>
                                        <input dir="ltr" placeholder="https://..." className="w-full p-4 border bg-slate-50 rounded-2xl outline-none focus:border-purple-500 text-left font-medium" value={activeLesson.embedUrl} onChange={e => {
                                            const newList = lessons.map(l => l.id === activeLesson.id ? {...l, embedUrl: e.target.value} : l);
                                            setLessons(newList);
                                        }} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-slate-500">תוכן טקסטואלי חופשי / קוד HTML</label>
                                        <textarea className="w-full p-4 border bg-slate-50 rounded-2xl h-48 outline-none focus:border-purple-500 font-medium leading-relaxed" value={activeLesson.content} onChange={e => {
                                            const newList = lessons.map(l => l.id === activeLesson.id ? {...l, content: e.target.value} : l);
                                            setLessons(newList);
                                        }} />
                                    </div>
                                    <button onClick={async () => {
                                        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'courses', course.id), { lessons: lessons });
                                        setIsEditing(false);
                                        toast("השיעור נשמר בהצלחה!");
                                    }} className="w-full bg-purple-600 text-white py-5 rounded-2xl font-black text-lg shadow-lg hover:bg-purple-700 transition-all">שמור שינויים</button>
                                </div>
                            ) : (
                                <div className="animate-fade-in">
                                    {renderContent(activeLesson)}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4">
                            <div className="text-6xl">📚</div>
                            <div className="font-black text-2xl">בחר שיעור מהתפריט כדי להתחיל בלמידה</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
