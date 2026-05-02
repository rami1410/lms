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
        if (lesson.type === 'video') return <iframe className="w-full aspect-video rounded-3xl" src={lesson.embedUrl.replace('watch?v=', 'embed/')} />;
        if (['genially', 'padlet', 'slides', 'html'].includes(lesson.type)) return <iframe className="w-full h-[600px] rounded-3xl border" src={lesson.embedUrl} />;
        return <div className="prose prose-lg max-w-none text-right" dangerouslySetInnerHTML={{ __html: lesson.content }} />;
    };

    return (
        <div dir="rtl" className="min-h-screen bg-slate-50 flex flex-col font-assistant">
            <nav className="bg-white border-b px-8 py-4 flex justify-between items-center">
                <button onClick={onBack} className="text-purple-600 font-black">← חזרה לקורסים</button>
                <h1 className="text-xl font-black">{course.name}</h1>
                <div className="w-20"></div>
            </nav>

            <div className="flex flex-grow overflow-hidden">
                {/* תפריט צד - רשימת שיעורים */}
                <div className="w-80 bg-white border-l p-6 overflow-y-auto flex flex-col">
                    <h3 className="font-black mb-6 border-b pb-2">תכני הקורס</h3>
                    <div className="space-y-3 flex-grow">
                        {lessons.map((l, i) => (
                            <button key={l.id} onClick={() => setActiveLesson(l)} className={`w-full text-right p-4 rounded-2xl font-bold transition-all ${activeLesson?.id === l.id ? 'bg-purple-600 text-white shadow-lg' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                                {i+1}. {l.title}
                            </button>
                        ))}
                    </div>
                    
                    {isAdmin && (
                        <div className="mt-8 pt-8 border-t space-y-2">
                            <p className="text-[10px] font-black text-slate-400 mb-2">הוספת תוכן (אדמין):</p>
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={()=>addLesson('text')} className="bg-slate-100 p-2 rounded-lg text-[10px] font-bold">טקסט</button>
                                <button onClick={()=>addLesson('video')} className="bg-slate-100 p-2 rounded-lg text-[10px] font-bold">יוטיוב</button>
                                <button onClick={()=>addLesson('padlet')} className="bg-slate-100 p-2 rounded-lg text-[10px] font-bold">פדלט</button>
                                <button onClick={()=>addLesson('genially')} className="bg-slate-100 p-2 rounded-lg text-[10px] font-bold">ג'יניאלי</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* תוכן השיעור */}
                <div className="flex-grow p-12 overflow-y-auto">
                    {activeLesson ? (
                        <div className="max-w-4xl mx-auto">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-3xl font-black">{activeLesson.title}</h2>
                                {isAdmin && <button onClick={() => setIsEditing(!isEditing)} className="text-slate-400 font-bold underline">ערוך תוכן</button>}
                            </div>

                            {isEditing ? (
                                <div className="space-y-4 bg-white p-8 rounded-[2.5rem] shadow-lg border">
                                    <input placeholder="כותרת השיעור" className="w-full p-4 border rounded-xl" value={activeLesson.title} onChange={e => {
                                        const newList = lessons.map(l => l.id === activeLesson.id ? {...l, title: e.target.value} : l);
                                        setLessons(newList);
                                    }} />
                                    <input placeholder="קישור להטמעה (Embed URL)" className="w-full p-4 border rounded-xl" value={activeLesson.embedUrl} onChange={e => {
                                        const newList = lessons.map(l => l.id === activeLesson.id ? {...l, embedUrl: e.target.value} : l);
                                        setLessons(newList);
                                    }} />
                                    <textarea placeholder="תוכן טקסטואלי / קוד HTML" className="w-full p-4 border rounded-xl h-40" value={activeLesson.content} onChange={e => {
                                        const newList = lessons.map(l => l.id === activeLesson.id ? {...l, content: e.target.value} : l);
                                        setLessons(newList);
                                    }} />
                                    <button onClick={async () => {
                                        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'courses', course.id), { lessons: lessons });
                                        setIsEditing(false);
                                        toast("נשמר בהצלחה!");
                                    }} className="w-full bg-purple-600 text-white py-4 rounded-xl font-black">שמור שינויים</button>
                                </div>
                            ) : (
                                <div className="bg-white p-8 rounded-[3rem] shadow-sm min-h-[400px]">
                                    {renderContent(activeLesson)}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-300 font-black text-2xl">בחר שיעור מהתפריט כדי להתחיל בלמידה</div>
                    )}
                </div>
            </div>
        </div>
    );
}
