import React from 'react';

export default function LessonEditor({ activeLesson, setActiveLesson, isEditMode, lessons, setLessons, saveChanges, duplicateActiveLesson, deleteActiveLesson, toggleComplete, userProgress, getLessonIcon }) {
    
    if (!activeLesson) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
                <span className="text-6xl">👈</span>
                <span className="font-black text-3xl">בחר שיעור מהתפריט לעריכה או צפייה</span>
            </div>
        );
    }

    // אם זה פרק, אין לו תוכן ממשי, אז נציג הודעה פשוטה
    if (activeLesson.type === 'chapter') {
        return (
            <div className="max-w-3xl mx-auto mt-20 text-center animate-fade-in">
                {isEditMode ? (
                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-dashed border-purple-200 space-y-6">
                        <h2 className="text-xl font-black text-purple-600">עריכת שם פרק</h2>
                        <input className="w-full p-4 bg-white rounded-2xl border-2 font-bold outline-none focus:border-purple-500 text-center text-2xl" value={activeLesson.title} onChange={e => {
                            const updated = lessons.map(l => l.id === activeLesson.id ? {...l, title: e.target.value} : l);
                            setLessons(updated);
                            setActiveLesson({...activeLesson, title: e.target.value});
                        }} />
                        <div className="flex gap-4 pt-4 border-t border-purple-100">
                            <button onClick={deleteActiveLesson} className="flex-1 bg-red-100 text-red-600 hover:bg-red-200 py-4 rounded-2xl font-black transition-colors shadow-sm">🗑️ מחיקת פרק</button>
                            <button onClick={saveChanges} className="flex-[2] bg-purple-600 text-white hover:bg-purple-700 py-4 rounded-2xl font-black transition-colors shadow-lg">💾 שמור שינויים</button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-100 p-12 rounded-[3rem] border border-slate-200">
                        <span className="text-6xl block mb-4">📁</span>
                        <h2 className="text-4xl font-black text-slate-800">{activeLesson.title}</h2>
                        <p className="text-slate-500 mt-4 font-bold">בחר שיעור מתוך הפרק בתפריט הצדדי</p>
                    </div>
                )}
            </div>
        );
    }

    // עבור שיעורים רגילים:
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            {isEditMode ? (
                <div className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-dashed border-purple-200 space-y-6">
                    <h2 className="text-xl font-black text-purple-600">עריכת שיעור ({activeLesson.type})</h2>
                    <input className="w-full p-4 bg-white rounded-2xl border-2 font-bold outline-none focus:border-purple-500" value={activeLesson.title} onChange={e => {
                        const updated = lessons.map(l => l.id === activeLesson.id ? {...l, title: e.target.value} : l);
                        setLessons(updated);
                        setActiveLesson({...activeLesson, title: e.target.value});
                    }} />
                    <textarea className="w-full p-4 bg-white rounded-2xl border-2 font-medium h-40 outline-none focus:border-purple-500" placeholder={activeLesson.type === 'html' ? "הדבק כאן קוד HTML..." : "תוכן השיעור..."} value={activeLesson.content || ''} onChange={e => {
                        const updated = lessons.map(l => l.id === activeLesson.id ? {...l, content: e.target.value} : l);
                        setLessons(updated);
                        setActiveLesson({...activeLesson, content: e.target.value});
                    }} />
                    {activeLesson.type !== 'text' && activeLesson.type !== 'html' && (
                        <input dir="ltr" className="w-full p-4 bg-white rounded-2xl border-2 font-bold outline-none focus:border-purple-500" placeholder="URL קישור להטמעה" value={activeLesson.embedUrl || activeLesson.url || ''} onChange={e => {
                            const updated = lessons.map(l => l.id === activeLesson.id ? {...l, embedUrl: e.target.value, url: e.target.value} : l);
                            setLessons(updated);
                            setActiveLesson({...activeLesson, embedUrl: e.target.value, url: e.target.value});
                        }} />
                    )}
                    
                    <div className="flex gap-4 pt-4 border-t border-purple-100">
                        <button onClick={deleteActiveLesson} className="flex-1 bg-red-100 text-red-600 hover:bg-red-200 py-4 rounded-2xl font-black transition-colors shadow-sm">🗑️ מחיקת שיעור</button>
                        <button onClick={duplicateActiveLesson} className="flex-1 bg-slate-200 text-slate-700 hover:bg-slate-300 py-4 rounded-2xl font-black transition-colors shadow-sm">📑 שכפול שיעור</button>
                        <button onClick={saveChanges} className="flex-[2] bg-purple-600 text-white hover:bg-purple-700 py-4 rounded-2xl font-black transition-colors shadow-lg">💾 שמור שינויים</button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-center bg-slate-50 p-6 rounded-[2rem] border">
                        <div className="flex items-center gap-3">
                            {getLessonIcon(activeLesson.type)}
                            <h2 className="text-2xl font-black text-slate-800">{activeLesson.title}</h2>
                        </div>
                        <button onClick={() => toggleComplete(activeLesson.id)} className={`px-8 py-3 rounded-2xl font-black transition-all ${userProgress[activeLesson.id] ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-slate-900 text-white shadow-xl hover:scale-105 hover:bg-purple-600'}`}>
                            {userProgress[activeLesson.id] ? 'הושלם ✓' : 'סמן כהושלם'}
                        </button>
                    </div>
                    
                    <div className="min-h-[500px]">
                        {activeLesson.isSmartContent && activeLesson.description && (
                            <div className="bg-purple-50 p-6 rounded-3xl border-2 border-purple-200 mb-8 shadow-sm flex gap-4 items-start">
                                <div className="text-3xl">💡</div>
                                <div>
                                    <h3 className="font-black text-purple-800 mb-1">המלצה פדגוגית לשילוב התוכן (AI)</h3>
                                    <p className="text-slate-700 font-bold">{activeLesson.description}</p>
                                </div>
                            </div>
                        )}

                        {activeLesson.type === 'html' ? (
                            <div className="bg-white p-4 rounded-3xl border shadow-sm" dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
                        ) : activeLesson.type === 'video' && (activeLesson.embedUrl || activeLesson.url) ? (
                            <iframe title="v" className="w-full aspect-video rounded-3xl shadow-xl border" src={(activeLesson.embedUrl || activeLesson.url).replace('watch?v=', 'embed/')} allowFullScreen />
                        ) : activeLesson.type === 'link' ? (
                            <div className="bg-slate-50 p-12 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-center">
                                <span className="text-6xl mb-4">🔗</span>
                                <h3 className="text-2xl font-black text-slate-800 mb-6">קישור חיצוני / משאב עזר</h3>
                                <a href={activeLesson.url || activeLesson.embedUrl} target="_blank" rel="noreferrer" className="bg-purple-600 text-white px-8 py-4 rounded-full font-black text-lg hover:bg-purple-700 hover:scale-105 transition-all shadow-xl">לחץ כאן לפתיחת הקישור בחלון חדש</a>
                            </div>
                        ) : (activeLesson.embedUrl || activeLesson.url) && activeLesson.type !== 'text' ? (
                            <iframe title="c" className="w-full h-[600px] rounded-3xl border shadow-xl" src={activeLesson.embedUrl || activeLesson.url} allowFullScreen />
                        ) : (
                            <div className="prose prose-lg max-w-none text-right bg-white p-8 rounded-3xl border shadow-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: activeLesson.content || '' }} />
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
