import React, { useState, useEffect } from 'react';
import { db, appId } from '../firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';

const HERO_IMAGES = [
    "https://images.unsplash.com/photo-1445264618000-f1e069c5920f?q=80&w=1200", 
    "https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=1200", 
    "https://images.unsplash.com/photo-1504370805625-d32c54b16100?q=80&w=1200", 
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200", 
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200", 
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=1200", 
    "https://images.unsplash.com/photo-1426604908106-dd9fb4183863?q=80&w=1200", 
    "https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=1200"  
];

export default function CoursesDashboard({ permittedCourses, userProgress, viewMode, setViewingCourse, setActiveModal, t, toast }) {
    const [heroBg, setHeroBg] = useState('');
    const [courseViewStyle, setCourseViewStyle] = useState('table'); 
    const [courseSearch, setCourseSearch] = useState('');
    
    // סטייט חדש לניהול המיון (עמודה וכיוון)
    const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });

    useEffect(() => {
        setHeroBg(HERO_IMAGES[Math.floor(Math.random() * HERO_IMAGES.length)]);
    }, []);

    const handleDuplicateCourse = async (course) => {
        if (!window.confirm(`האם אתה בטוח שברצונך לשכפל את הקורס "${course.name}"?`)) return;
        try {
            const newId = `course-${Date.now()}`;
            const courseCopy = { 
                ...course, 
                name: `${course.name} - עותק`, 
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            delete courseCopy.id; 
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'courses', newId), courseCopy);
            if(toast) toast('הקורס שוכפל בהצלחה!');
        } catch (err) {
            console.error(err);
            if(toast) toast('שגיאה בשכפול הקורס.');
        }
    };

    const handleDeleteCourse = async (courseId, courseName) => {
        if (!window.confirm(`אזהרה! מחיקת הקורס "${courseName}" היא סופית. האם להמשיך?`)) return;
        try {
            await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'courses', courseId));
            if(toast) toast('הקורס נמחק בהצלחה.');
        } catch (err) {
            console.error(err);
            if(toast) toast('שגיאה במחיקת הקורס.');
        }
    };

    // חישוב אחוזי התקדמות בקורס כדי שנוכל למיין לפיו
    const getCourseProgress = (course) => {
        const completed = userProgress[course.id] ? Object.values(userProgress[course.id]).filter(v => v === true).length : 0;
        return course.lessons?.length ? Math.round((completed / course.lessons.length) * 100) : 0;
    };

    // הפעלת המיון בלחיצה על כותרת
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // סינון חופשי לפי שורת החיפוש
    const getVisibleCourses = () => {
        let base = permittedCourses || [];
        if (courseSearch.trim() !== '') {
            base = base.filter(c => c.name?.toLowerCase().includes(courseSearch.toLowerCase()));
        }
        return base;
    };

    const visibleCourses = getVisibleCourses();

    // ביצוע המיון (Sorting) על הרשימה המוצגת
    let sortedCourses = [...visibleCourses];
    if (sortConfig.key) {
        sortedCourses.sort((a, b) => {
            let aVal, bVal;
            
            if (sortConfig.key === 'name') {
                aVal = a.name?.toLowerCase() || '';
                bVal = b.name?.toLowerCase() || '';
            } else if (sortConfig.key === 'lessonsCount') {
                aVal = a.lessons?.length || 0;
                bVal = b.lessons?.length || 0;
            } else if (sortConfig.key === 'progress') {
                aVal = getCourseProgress(a);
                bVal = getCourseProgress(b);
            } else if (sortConfig.key === 'age') {
                aVal = a.fromGrade || 0;
                bVal = b.fromGrade || 0;
            }

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    // רכיב גרפי קטן למשולשי המיון בטבלה
    const SortIcon = ({ columnKey }) => {
        const isAsc = sortConfig.key === columnKey && sortConfig.direction === 'asc';
        const isDesc = sortConfig.key === columnKey && sortConfig.direction === 'desc';
        
        return (
            <div className="inline-flex flex-col ml-2 mr-1 align-middle justify-center gap-[2px]">
                <span className={`text-[9px] leading-none transition-colors ${isAsc ? 'text-purple-600 opacity-100' : 'text-slate-300 opacity-40'}`}>▲</span>
                <span className={`text-[9px] leading-none transition-colors ${isDesc ? 'text-purple-600 opacity-100' : 'text-slate-300 opacity-40'}`}>▼</span>
            </div>
        );
    };

    return (
        <>
            {/* הבאנר העליון */}
            <div className="relative w-full h-64 rounded-[3rem] overflow-hidden shadow-xl mb-8 flex items-center justify-between p-10">
                <div className="absolute inset-0 bg-cover bg-center z-0 transition-all duration-1000" style={{ backgroundImage: `url(${heroBg})` }}></div>
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-900/20 z-0"></div>
                
                <div className="relative z-10 text-white">
                    <h1 className="text-4xl font-black mb-2">{t('my_courses')}</h1>
                    <p className="text-white/80 font-bold text-lg">בחר את הקורס שברצונך ללמוד או לנהל</p>
                </div>

                {viewMode === 'admin' && (
                    <div className="relative z-10">
                        <button onClick={() => setActiveModal({type: 'course', data: null})} className="bg-purple-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:shadow-2xl hover:bg-purple-500 hover:scale-105 transition-all flex items-center gap-3">
                            <span className="text-2xl">➕</span> <span>יצירת קורס חדש</span>
                        </button>
                    </div>
                )}
            </div>

            {/* כפתורי תצוגה וחיפוש */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                    <button onClick={() => setCourseViewStyle('grid')} className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors ${courseViewStyle === 'grid' ? 'bg-purple-100 text-purple-700' : 'text-slate-500 hover:bg-slate-50'}`}>{t('grid_view')}</button>
                    <button onClick={() => setCourseViewStyle('table')} className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors ${courseViewStyle === 'table' ? 'bg-purple-100 text-purple-700' : 'text-slate-500 hover:bg-slate-50'}`}>{t('table_view')}</button>
                </div>
                <input type="text" placeholder={t('search_course')} value={courseSearch} onChange={(e) => setCourseSearch(e.target.value)} className="w-64 bg-white border border-slate-200 px-4 py-2 rounded-xl outline-none focus:border-purple-500 transition-colors shadow-sm" />
            </div>

            {/* תצוגת הקורסים (טבלה או כרטיסיות) */}
            {courseViewStyle === 'table' ? (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="p-4 font-black text-slate-600 cursor-pointer select-none hover:bg-slate-100 transition-colors" onClick={() => handleSort('name')}>
                                    {t('course_name')} <SortIcon columnKey="name" />
                                </th>
                                <th className="p-4 font-black text-slate-600 text-center cursor-pointer select-none hover:bg-slate-100 transition-colors" onClick={() => handleSort('lessonsCount')}>
                                    מספר שיעורים <SortIcon columnKey="lessonsCount" />
                                </th>
                                <th className="p-4 font-black text-slate-600 text-center cursor-pointer select-none hover:bg-slate-100 transition-colors" onClick={() => handleSort('progress')}>
                                    התקדמות <SortIcon columnKey="progress" />
                                </th>
                                <th className="p-4 font-black text-slate-600 text-center cursor-pointer select-none hover:bg-slate-100 transition-colors" onClick={() => handleSort('age')}>
                                    {t('age_group')} <SortIcon columnKey="age" />
                                </th>
                                <th className="p-4 font-black text-slate-600">{t('fields')}</th>
                                <th className="p-4 font-black text-slate-600 text-center">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedCourses.map(c => {
                                const pct = getCourseProgress(c);
                                return (
                                    <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-bold text-slate-800">{c.name}</td>
                                        <td className="p-4 text-center font-bold text-slate-600 bg-slate-50/50">{c.lessons?.length || 0}</td>
                                        <td className="p-4 text-center"><span className="bg-purple-100 text-purple-700 font-bold px-3 py-1 rounded-full text-sm">{pct}%</span></td>
                                        <td className="p-4 text-center font-medium" dir="ltr">{c.fromGrade} - {c.toGrade}</td>
                                        <td className="p-4">
                                            <div className="flex gap-1 flex-wrap max-w-[200px]">
                                                {c.fields?.slice(0,2).map(f => <span key={f} className="text-xs bg-slate-100 text-slate-500 font-bold px-2 py-1 rounded">{f}</span>)}
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => setViewingCourse(c)} className="bg-slate-900 text-white px-4 py-1.5 rounded-lg font-bold text-sm hover:bg-purple-600 transition-colors">כניסה</button>
                                                
                                                {viewMode === 'admin' && (
                                                    <>
                                                        <button onClick={() => handleDuplicateCourse(c)} className="bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-bold text-sm hover:bg-slate-300 transition-colors">שכפל</button>
                                                        <button onClick={() => handleDeleteCourse(c.id, c.name)} className="bg-red-100 text-red-600 px-3 py-1.5 rounded-lg font-bold text-sm hover:bg-red-200 transition-colors">מחק</button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {sortedCourses.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center p-8 text-slate-400 font-bold">לא נמצאו קורסים מתאימים.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="grid md:grid-cols-3 gap-8">
                    {sortedCourses.map(c => {
                        const pct = getCourseProgress(c);
                        return (
                            <div key={c.id} onClick={() => setViewingCourse(c)} className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col items-center group hover:scale-[1.02] hover:shadow-2xl transition-all cursor-pointer">
                                {c.image ? (
                                    <div className="w-full h-32 mb-6 rounded-2xl overflow-hidden relative">
                                        <img src={c.image} alt={c.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-purple-700 font-black px-3 py-1 rounded-full text-sm shadow-sm">{pct}% הושלם</div>
                                    </div>
                                ) : (
                                    <div className="relative w-24 h-24 mb-6">
                                        <svg className="w-full h-full -rotate-90"><circle cx="48" cy="48" r="40" stroke="#f1f5f9" strokeWidth="8" fill="transparent" /><circle cx="48" cy="48" r="40" stroke="#9333ea" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * pct) / 100} strokeLinecap="round" className="transition-all duration-1000" /></svg>
                                        <div className="absolute inset-0 flex items-center justify-center font-black text-lg text-purple-600">{pct}%</div>
                                    </div>
                                )}
                                <h3 className="font-black text-xl mb-4 text-slate-800 text-center line-clamp-2">{c.name}</h3>
                                <div className="text-sm font-bold text-slate-500 mb-4 bg-slate-50 px-3 py-1 rounded-full">{c.lessons?.length || 0} שיעורים</div>
                                {c.fields && c.fields.length > 0 && (
                                    <div className="flex flex-wrap justify-center gap-1 mb-6">
                                        {c.fields.slice(0,3).map(f => <span key={f} className="text-xs bg-slate-100 text-slate-500 font-bold px-2 py-1 rounded-md">{f}</span>)}
                                    </div>
                                )}
                                
                                <div className="mt-auto w-full flex flex-col gap-2">
                                    <button onClick={(e) => { e.stopPropagation(); setViewingCourse(c); }} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black group-hover:bg-purple-600 transition-colors shadow-lg">כניסה לקורס</button>
                                    
                                    {viewMode === 'admin' && (
                                        <div className="flex gap-2">
                                            <button onClick={(e) => { e.stopPropagation(); handleDuplicateCourse(c); }} className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-xl font-bold text-sm hover:bg-slate-300 transition-colors">שכפל</button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteCourse(c.id, c.name); }} className="flex-1 bg-red-100 text-red-600 py-2 rounded-xl font-bold text-sm hover:bg-red-200 transition-colors">מחק</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {sortedCourses.length === 0 && <div className="col-span-3 text-center text-slate-400 font-bold py-10">לא נמצאו קורסים מתאימים.</div>}
                </div>
            )}
        </>
    );
}
