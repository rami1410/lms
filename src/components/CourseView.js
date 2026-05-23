import React, { useState } from 'react';
import { db, appId } from '../firebase';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import LessonSidebar from './LessonSidebar';
import LessonEditor from './LessonEditor';

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
            case 'chapter': return <span className="ml-2 text-lg">📁</span>; // אייקון לפרק
            default: return <span className="ml-2 text-lg">📝</span>;
        }
    };

    // חישוב אחוזים רק על סמך שיעורים (ללא פרקים)
    const getPct = () => {
        const actualLessons = lessons.filter(l => l.type !== 'chapter');
        if (!actualLessons.length) return 0;
        const done = Object.values(userProgress).filter(v => v === true).length;
        return Math.round((done / actualLessons.length) * 100);
    };

    const addLesson = async (type) => {
        const newL = { id: "less-" + Date.now(), type, title: type === 'chapter' ? 'שם הפרק...' : 'תוכן חדש', content: '', embedUrl: '' };
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

    // שמירה אוטומטית שמופעלת לאחר פעולת גרירה
    const autoSaveLessons = async (reorderedLessons) => {
        setLessons(reorderedLessons);
        try {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'courses', course.id), { lessons: reorderedLessons });
            toast("הסדר נשמר בהצלחה!");
        } catch (e) { toast("שגיאה בשמירת הסדר"); }
    };

    const duplicateActiveLesson = async () => {
        if (!activeLesson) return;
        const duplicatedLesson = { ...activeLesson, id: "less-" + Date.now(), title: `${activeLesson.title} (עותק)` };
        const updated = [...lessons, duplicatedLesson];
        setLessons(updated);
        try {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'courses', course.id), { lessons: updated });
            toast("השיעור שוכפל בהצלחה!");
        } catch (e) { toast("שגיאה בשכפול"); }
    };

    const deleteActiveLesson = async () => {
        if (!activeLesson) return;
        if (!window.confirm("האם אתה בטוח שברצונך למחוק לחלוטין?")) return;
        
        const updated = lessons.filter(l => l.id !== activeLesson.id);
        setLessons(updated);
        setActiveLesson(null); 
        try {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'courses', course.id), { lessons: updated });
            toast("נמחק בהצלחה!");
        } catch (e) { toast("שגיאה במחיקה"); }
    };

    const toggleComplete = async (lessonId) => {
        const newProgress = { ...userProgress, [lessonId]: !userProgress[lessonId] };
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'progress', userId), { [course.id]: newProgress }, { merge: true });
        } catch (e) { toast("שגיאה"); }
    };

    return (
        <div dir="rtl" className="min-h-screen bg-white flex flex-col font-assistant overflow-hidden relative">
            <nav className="bg-white border-b px-8 py-4 flex justify-between items-center shadow-sm z-30">
                <button onClick={onBack} className="text-purple-600 font-black hover:bg-purple-50 px-4 py-2 rounded-xl transition-colors">← חזרה</button>
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-black">{course.name}</h1>
                    <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-black">{getPct()}%</span>
                </div>
                {isAdmin && (
                    <button onClick={() => setIsEditMode(!isEditMode)} className={`px-4 py-2 rounded-xl font-black text-sm transition-colors ${isEditMode ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg animate-pulse' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}>
                        {isEditMode ? 'סיום עריכה ושמירה' : '✏️ עריכת קורס'}
                    </button>
                )}
            </nav>

            <div className="flex flex-grow overflow-hidden h-[calc(100vh-80px)]">
                {/* התפריט הצדדי שהופרד */}
                <LessonSidebar 
                    lessons={lessons} 
                    activeLesson={activeLesson} 
                    setActiveLesson={setActiveLesson} 
                    isEditMode={isEditMode} 
                    addLesson={addLesson} 
                    userProgress={userProgress} 
                    getLessonIcon={getLessonIcon}
                    autoSaveLessons={autoSaveLessons}
                />

                <div className="flex-grow p-12 overflow-y-auto bg-white relative z-10">
                    {/* אזור התוכן והעריכה שהופרד */}
                    <LessonEditor 
                        activeLesson={activeLesson}
                        setActiveLesson={setActiveLesson}
                        isEditMode={isEditMode}
                        lessons={lessons}
                        setLessons={setLessons}
                        saveChanges={saveChanges}
                        duplicateActiveLesson={duplicateActiveLesson}
                        deleteActiveLesson={deleteActiveLesson}
                        toggleComplete={toggleComplete}
                        userProgress={userProgress}
                        getLessonIcon={getLessonIcon}
                    />
                </div>
            </div>

            <div className="h-2 bg-slate-100 w-full absolute bottom-0 left-0 z-40">
                <div className="h-full bg-gradient-to-l from-purple-600 via-emerald-500 to-blue-500 transition-all duration-1000" style={{ width: `${getPct()}%` }}></div>
            </div>
        </div>
    );
}
