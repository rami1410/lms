import React, { useState } from 'react';

export default function LessonSidebar({ lessons, activeLesson, setActiveLesson, isEditMode, addLesson, userProgress, getLessonIcon, autoSaveLessons }) {
    
    // מצבי גרירה ומשיכה (Drag & Drop)
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

    const handleDragStart = (e, index) => {
        if (!isEditMode) return;
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
        // הוספת מראה שקוף לאלמנט הנגרר
        setTimeout(() => e.target.classList.add('opacity-50'), 0);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (!isEditMode) return;
        setDragOverIndex(index);
    };

    const handleDrop = (e, targetIndex) => {
        e.preventDefault();
        if (!isEditMode || draggedIndex === null) return;
        
        const newLessons = [...lessons];
        const draggedItem = newLessons[draggedIndex];
        
        // הסרה מהמקום הישן והכנסה במיקום החדש
        newLessons.splice(draggedIndex, 1);
        newLessons.splice(targetIndex, 0, draggedItem);
        
        setDraggedIndex(null);
        setDragOverIndex(null);
        
        // מעדכן את מצב ה-UI ושומר לשרת מיד
        autoSaveLessons(newLessons);
    };

    const handleDragEnd = (e) => {
        e.target.classList.remove('opacity-50');
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    return (
        <div className="w-80 border-l p-6 overflow-y-auto bg-slate-50 flex flex-col relative z-20">
            <h3 className="font-black mb-6 text-slate-400 text-[10px] uppercase tracking-widest">תכני הקורס</h3>
            
            <div className="space-y-2 flex-grow pb-10">
                {lessons.map((l, index) => {
                    const isChapter = l.type === 'chapter';
                    
                    return (
                        <div 
                            key={l.id}
                            draggable={isEditMode}
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDrop={(e) => handleDrop(e, index)}
                            onDragEnd={handleDragEnd}
                            className={`
                                relative transition-all
                                ${isEditMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
                                ${dragOverIndex === index ? 'border-t-4 border-purple-500 pt-1' : ''}
                            `}
                        >
                            <button 
                                onClick={() => setActiveLesson(l)} 
                                className={`w-full text-right flex items-center transition-all ${
                                    isChapter 
                                        ? `p-3 mt-4 mb-2 rounded-xl border-b-2 font-black text-lg ${activeLesson?.id === l.id ? 'bg-slate-800 text-white border-slate-900' : 'bg-slate-200 text-slate-800 border-slate-300 hover:bg-slate-300'}` 
                                        : `p-4 rounded-2xl border ${activeLesson?.id === l.id ? 'bg-purple-600 text-white shadow-lg border-purple-600' : 'bg-white text-slate-600 border-slate-200 hover:border-purple-300 hover:shadow-sm'}`
                                }`}
                            >
                                {/* אייקון משיכה מצב עריכה */}
                                {isEditMode && <span className="mr-2 text-slate-400 cursor-grab opacity-50 text-xs">↕</span>}
                                
                                {!isChapter && (
                                    <div className={`w-4 h-4 ml-3 rounded-full border-2 flex items-center justify-center shrink-0 ${userProgress[l.id] ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300'}`}>
                                        {userProgress[l.id] && '✓'}
                                    </div>
                                )}
                                
                                {getLessonIcon(l.type)}
                                <span className={`text-sm flex-grow truncate ${isChapter ? 'font-black' : 'font-bold'}`}>{l.title}</span>
                                {l.isSmartContent && <span className="text-[10px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full mr-2 font-black">AI</span>}
                            </button>
                        </div>
                    );
                })}
                {lessons.length === 0 && <p className="text-slate-400 text-center font-bold mt-10">אין תכנים בקורס זה.</p>}
            </div>

            {/* כפתורי הוספת תוכן למנהלים */}
            {isEditMode && (
                <div className="sticky bottom-0 bg-slate-50 pt-4 border-t">
                    <button onClick={() => addLesson('chapter')} className="w-full mb-2 bg-slate-800 text-white p-3 rounded-xl font-bold hover:bg-slate-900 transition-colors shadow-lg">
                        📁 הוסף פרק חדש
                    </button>
                    <div className="grid grid-cols-5 gap-1">
                        {['video', 'text', 'padlet', 'genially', 'quiz'].map(type => (
                            <button key={type} onClick={() => addLesson(type)} className="p-2 bg-white border rounded-xl hover:bg-purple-50 text-center text-lg transition-colors shadow-sm" title={`הוסף ${type}`}>
                                {getLessonIcon(type)}
                            </button>
                        ))}
                    </div>
                    <div className="grid grid-cols-4 gap-1 mt-1">
                        {['game', 'file', 'link', 'html'].map(type => (
                            <button key={type} onClick={() => addLesson(type)} className="p-2 bg-white border rounded-xl hover:bg-purple-50 text-center text-lg transition-colors shadow-sm" title={`הוסף ${type}`}>
                                {getLessonIcon(type)}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
