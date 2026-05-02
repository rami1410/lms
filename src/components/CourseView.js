import React, { useState } from 'react';
import { db, appId } from '../firebase';
import { doc, updateDoc, setDoc } from 'firebase/firestore';

export default function CourseView({ course, onBack, toast, isAdmin, userProgress, userId }) {
    const [lessons, setLessons] = useState(course.lessons || []);
    const [activeLesson, setActiveLesson] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    const getLessonIcon = (type) => {
        const base = "https://www.google.com/s2/favicons?sz=64&domain=";
        switch(type) {
            case 'video': return <img src={base + "youtube.com"} className="w-5 h-5 ml-2" alt="" />;
            case 'padlet': return <img src={base + "padlet.com"} className="w-5 h-5 ml-2" alt="" />;
            case 'genially': return <img src={base + "genial.ly"} className="w-5 h-5 ml-2" alt="" />;
            case 'quiz': return <img src={base + "docs.google.com"} className="w-5 h-5 ml-2" alt="" />;
            case 'game': return <img src={base + "wordwall.net"} className="w-5 h-5 ml-2" alt="" />;
            case 'file': return <span className="ml-2 text-lg">📄</span>;
            case 'link': return <span className="ml-2 text-lg">🔗</span>;
            case 'html': return <span className="ml-2 text-lg">🌐</span>;
            default: return <span className="ml-2 text-lg">📝</span>;
        }
    };

    const getPct = () => {
        if (!lessons.length) return 0;
        const done = Object.values(userProgress).filter(v => v === true).length;
        return Math.round((done / lessons.length) * 100);
    };

    const addLesson = async (type) => {
        const newL = { id: "less-" + Date.now(), type, title: 'תוכן חדש', content: '', embedUrl: '' };
        const updated = [...lessons, newL];
        setLessons(updated);
        try {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'courses', course.id), { lessons: updated });
            toast("נוסף בהצלחה!");
        } catch (e) { toast("שגיאה בעדכון"); }
    };

    const saveChanges = async () => {
        try {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'courses', course.id), { lessons: lessons });
            toast("השינויים נשמרו!");
        } catch (e) { toast("שגיאה בשמירה"); }
    };

    const toggleComplete = async (lessonId) => {
        const newProgress = { ...userProgress, [lessonId]: !userProgress[lessonId] };
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'progress', userId), { [course.id]: newProgress }, { merge: true });
        } catch (e) { toast("שגיאה"); }
    };

    return (
        <div dir="rtl" className="min-h-screen bg-white flex flex-col font-assistant overflow-hidden">
            <nav className="bg-white border-b px-8 py-4 flex justify-between items-center shadow-sm z-10">
                <button onClick={onBack} className="text-purple-600 font-black">← חזרה</button>
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-black">{course.name}</h1>
                    <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-black">{getPct()}%</span>
                </div>
                {isAdmin && (
                    <button onClick={() => setIsEditMode(!isEditMode)} className={`px-4 py-2 rounded-xl font-black text-sm ${isEditMode ? 'bg-red-500 text-white' : 'bg-slate-900 text-white'}`}>
                        {isEditMode ? 'סיום עריכה' : '✏️ עריכת קורס'}
                    </button>
                )}
            </nav>

            <div className="flex flex-grow overflow-hidden">
                <div className="w-80 border-l p-6 overflow-y-auto bg-slate-50 flex flex-col">
                    <h3 className="font-black mb-6 text-slate-400 text-[10px] uppercase tracking-widest">תכני הקורס</h3>
                    <div className="space-y-2 flex-grow">
                        {lessons.map((l, i) => (
                            <button key={l.id} onClick={() => setActiveLesson(l)} className={`w-full text-right p-4 rounded-2xl flex items-center transition-all ${activeLesson?.id === l.id ? 'bg-purple-600 text-white shadow-lg' : 'bg-white border text-slate-600'}`}>
                                <div className={`w-4 h-4 ml-3 rounded-full border-2 flex items-center justify-center ${userProgress[l.id] ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300'}`}>
                                    {userProgress[l.id] && '✓'}
                                </div>
                                {getLessonIcon(l.type)}
                                <span className="text-sm font-bold flex-grow truncate">{i+1}. {l.title}</span>
                            </button>
                        ))}
                    </div>

                    {isEditMode && (
                        <div className="mt-8 pt-6 border-t grid grid-cols-3 gap-2">
                            {['video', 'text', 'padlet', 'genially', 'quiz', 'game', 'file', 'link', 'html'].map(type => (
                                <button key={type} onClick={() => addLesson(type)} className="p-2 bg-white border rounded-xl hover:bg-purple-50 text-center text-lg" title={type}>
                                    {getLessonIcon(type)}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex-grow p-12 overflow-y-auto bg-white">
                    {activeLesson ? (
                        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                            {isEditMode ? (
                                <div className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-dashed border-purple-200 space-y-6">
                                    <h2 className="text-xl font-black text-purple-600">עריכת שיעור ({activeLesson.type})</h2>
                                    <input className="w-full p-4 bg-white rounded-2xl border-2 font-bold outline-none focus:border-purple-500" value={activeLesson.title} onChange={e => {
                                        const updated = lessons.map(l => l.id === activeLesson.id ? {...l, title: e.target.value} : l);
                                        setLessons(updated);
                                        setActiveLesson({...activeLesson, title: e.target.value});
                                    }} />
                                    <textarea className="w-full p-4 bg-white rounded-2xl border-2 font-medium h-40 outline-none focus:border-purple-500" placeholder={activeLesson.type === 'html' ? "הדבק כאן קוד HTML..." : "תוכן השיעור..."} value={activeLesson.content} onChange={e => {
                                        const updated = lessons.map(l => l.id === activeLesson.id ? {...l, content: e.target.value} : l);
                                        setLessons(updated);
                                        setActiveLesson({...activeLesson, content: e.target.value});
                                    }} />
                                    {activeLesson.type !== 'text' && activeLesson.type !== 'html' && (
                                        <input dir="ltr" className="w-full p-4 bg-white rounded-2xl border-2 font-bold outline-none focus:border-purple-500" placeholder="URL קישור להטמעה" value={activeLesson.embedUrl} onChange={e => {
                                            const updated = lessons.map(l => l.id === activeLesson.id ? {...l, embedUrl: e.target.value} : l);
                                            setLessons(updated);
                                            setActiveLesson({...activeLesson, embedUrl: e.target.value});
                                        }} />
                                    )}
                                    <button onClick={saveChanges} className="w-full bg-purple-600 text-white py-4 rounded-2xl font-black shadow-lg">שמור שינויים</button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-center bg-slate-50 p-6 rounded-[2rem] border">
                                        <div className="flex items-center gap-3">
                                            {getLessonIcon(activeLesson.type)}
                                            <h2 className="text-2xl font-black text-slate-800">{activeLesson.title}</h2>
                                        </div>
                                        <button onClick={() => toggleComplete(activeLesson.id)} className={`px-8 py-3 rounded-2xl font-black ${userProgress[activeLesson.id] ? 'bg-green-100 text-green-700' : 'bg-slate-900 text-white shadow-xl hover:scale-105'}`}>
                                            {userProgress[activeLesson.id] ? 'הושלם ✓' : 'סמן כהושלם'}
                                        </button>
                                    </div>
                                    <div className="min-h-[500px]">
                                        {activeLesson.type === 'html' ? (
                                            <div className="bg-white p-4 rounded-3xl border shadow-sm" dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
                                        ) : activeLesson.type === 'video' && activeLesson.embedUrl ? (
                                            <iframe title="v" className="w-full aspect-video rounded-3xl shadow-xl" src={activeLesson.embedUrl.replace('watch?v=', 'embed/')} allowFullScreen />
                                        ) : activeLesson.embedUrl ? (
                                            <iframe title="c" className="w-full h-[600px] rounded-3xl border shadow-xl" src={activeLesson.embedUrl} allowFullScreen />
                                        ) : (
                                            <div className="prose prose-lg max-w-none text-right bg-white p-8 rounded-3xl border" dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-200 font-black text-4xl">בחר שיעור מהתפריט</div>
                    )}
                </div>
            </div>

            <div className="h-2 bg-slate-100 w-full relative">
                <div className="h-full bg-gradient-to-l from-purple-600 via-emerald-500 to-blue-500 transition-all duration-1000" style={{ width: `${getPct()}%` }}></div>
            </div>
        </div>
    );
}
