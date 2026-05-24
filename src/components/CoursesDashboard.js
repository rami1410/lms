import React, { useState } from 'react';

export default function CoursesDashboard({ permittedCourses, userProgress, viewMode, setViewingCourse, setActiveModal, t }) {
    const [search, setSearch] = useState('');
    const [viewType, setViewType] = useState('table'); // 'table' | 'cards'

    const filtered = permittedCourses.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-6 w-full animate-fade-in">
            {/* 4. באנר מעוצב קולנועית עם טקסט עם קונטור שחור וגרדיאנט הייטק משתנה */}
            <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 text-white rounded-[2rem] p-6 md:p-10 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/5">
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
                <div className="space-y-2 text-center sm:text-right relative z-10">
                    <h1 
                        className="text-3xl md:text-4xl font-black tracking-tight"
                        style={{
                            color: '#ffffff',
                            textShadow: '3px 3px 0 #000, -3px 3px 0 #000, 3px -3px 0 #000, -3px -3px 0 #000, 4px 4px 8px rgba(0,0,0,0.6)'
                        }}
                    >
                        הקורסים שלי
                    </h1>
                    <p className="text-purple-200/90 font-bold text-xs md:text-sm">בחר את הקורס שברצונך ללמוד או לנהל</p>
                </div>
                {viewMode === 'admin' && (
                    <button onClick={() => setActiveModal({type:'course', data:null})} className="bg-purple-600 hover:bg-purple-500 text-white font-black px-6 py-3 rounded-2xl shadow-xl transition-all hover:scale-105 text-sm cursor-pointer z-10 flex items-center gap-2">
                        <span>+</span> יצירת קורס חדש
                    </button>
                )}
            </div>

            {/* כלי סינון וחיפוש */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border shadow-sm w-full">
                <input type="text" placeholder="חפש קורס..." value={search} onChange={e => setSearch(e.target.value)} className="w-full sm:w-80 p-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-sm text-right outline-none focus:border-purple-500" />
                <div className="flex gap-2 border bg-slate-100 p-1 rounded-xl shrink-0">
                    <button onClick={() => setViewType('table')} className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${viewType === 'table' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}>טבלה</button>
                    <button onClick={() => setViewType('cards')} className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${viewType === 'cards' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}>כרטיסיות</button>
                </div>
            </div>

            {/* רנדור רשימת הקורסים המאובטחת */}
            {viewType === 'table' ? (
                <div className="bg-white rounded-2xl border shadow-sm overflow-x-auto w-full">
                    <table className="w-full text-right text-sm border-collapse min-w-[700px]">
                        <thead>
                            <tr className="bg-slate-50 border-b text-slate-500 font-bold">
                                <th className="p-4">שם הקורס</th>
                                <th className="p-4 text-center">מספר שיעורים</th>
                                <th className="p-4 text-center">התקדמות</th>
                                <th className="p-4 text-center">גילאים</th>
                                <th className="p-4 text-center">תחומי דעת</th>
                                <th className="p-4 text-center">פעולות</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y font-bold text-slate-700">
                            {filtered.map(course => (
                                <tr key={course.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="p-4 text-base font-black text-slate-800">{course.name}</td>
                                    <td className="p-4 text-center">{course.lessons?.length || 0}</td>
                                    <td className="p-4 text-center">
                                        <span className="bg-purple-100 text-purple-700 text-xs px-2.5 py-1 rounded-full">0%</span>
                                    </td>
                                    <td className="p-4 text-center text-xs text-slate-500">כיתות {course.fromGrade} - {course.toGrade}</td>
                                    <td className="p-4 text-center">
                                        <div className="flex flex-wrap gap-1 justify-center max-w-[180px] mx-auto">
                                            {course.fields?.map((f, i) => <span key={i} className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-md">{f}</span>)}
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        {/* הלחצן המאובטח שמפעיל את הסטייט ב-App.js מיד בכניסה */}
                                        <button onClick={() => setViewingCourse(course)} className="bg-slate-900 hover:bg-purple-600 text-white px-5 py-2 rounded-xl text-xs font-black shadow-md transition-colors cursor-pointer">
                                            כניסה
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
                    {filtered.map(course => (
                        <div key={course.id} className="bg-white rounded-3xl border shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all group">
                            <div className="h-44 bg-slate-900 relative">
                                {course.image ? <img src={course.image} alt={course.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full bg-gradient-to-br from-purple-700 to-indigo-900 flex items-center justify-center text-white text-4xl">🤖</div>}
                            </div>
                            <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                                <div className="space-y-1">
                                    <h3 className="font-black text-lg text-slate-800 line-clamp-1">{course.name}</h3>
                                    <p className="text-slate-500 text-xs line-clamp-2">{course.description || 'אין תיאור זמין לקורס זה.'}</p>
                                </div>
                                <button onClick={() => setViewingCourse(course)} className="w-full bg-slate-900 hover:bg-purple-600 text-white py-3 rounded-xl font-black text-sm transition-colors cursor-pointer text-center block shadow-md">
                                    התחל ללמוד לקורס
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
