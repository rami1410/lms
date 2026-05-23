import React, { useState, useEffect } from 'react';

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

export default function CoursesDashboard({ permittedCourses, userProgress, viewMode, setViewingCourse, setActiveModal, t }) {
    const [heroBg, setHeroBg] = useState('');
    const [courseViewStyle, setCourseViewStyle] = useState('grid');
    const [courseSearch, setCourseSearch] = useState('');

    useEffect(() => {
        setHeroBg(HERO_IMAGES[Math.floor(Math.random() * HERO_IMAGES.length)]);
    }, []);

    // סינון חופשי לפי שורת החיפוש
    const getVisibleCourses = () => {
        let base = permittedCourses || [];
        if (courseSearch.trim() !== '') {
            base = base.filter(c => c.name?.toLowerCase().includes(courseSearch.toLowerCase()));
        }
        return base;
    };

    const visibleCourses = getVisibleCourses();

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
                                <th className="p-4 font-black text-slate-600">{t('course_name')}</th>
                                <th className="p-4 font-black text-slate-600 text-center">התקדמות</th>
                                <th className="p-4 font-black text-slate-600 text-center">{t('age_group')}</th>
                                <th className="p-4 font-black text-slate-600">{t('fields')}</th>
                                <th className="p-4 font-black text-slate-600 text-center">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleCourses.map(c => {
                                const completed = userProgress[c.id] ? Object.values(userProgress[c.id]).filter(v => v === true).length : 0;
                                const pct = c.lessons?.length ? Math.round((completed / c.lessons.length) * 100) : 0;
                                return (
                                    <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-bold text-slate-800">{c.name}</td>
                                        <td className="p-4 text-center"><span className="bg-purple-100 text-purple-700 font-bold px-3 py-1 rounded-full text-sm">{pct}%</span></td>
                                        <td className="p-4 text-center font-medium" dir="ltr">{c.fromGrade} - {c.toGrade}</td>
                                        <td className="p-4">
                                            <div className="flex gap-1">{c.fields?.slice(0,2).map(f => <span key={f} className="text-xs bg-slate-100 text-slate-500 font-bold px-2 py-1 rounded">{f}</span>)}</div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button onClick={() => setViewingCourse(c)} className="bg-slate-900 text-white px-4 py-1.5 rounded-lg font-bold text-sm hover:bg-purple-600 transition-colors">כניסה</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="grid md:grid-cols-3 gap-8">
                    {visibleCourses.map(c => {
                        const completed = userProgress[c.id] ? Object.values(userProgress[c.id]).filter(v => v === true).length : 0;
                        const pct = c.lessons?.length ? Math.round((completed / c.lessons.length) * 100) : 0;
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
                                {c.fields && c.fields.length > 0 && (
                                    <div className="flex flex-wrap justify-center gap-1 mb-6">
                                        {c.fields.slice(0,3).map(f => <span key={f} className="text-xs bg-slate-100 text-slate-500 font-bold px-2 py-1 rounded-md">{f}</span>)}
                                    </div>
                                )}
                                <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black group-hover:bg-purple-600 transition-colors shadow-lg mt-auto">כניסה לקורס</button>
                            </div>
                        );
                    })}
                    {visibleCourses.length === 0 && <div className="col-span-3 text-center text-slate-400 font-bold py-10">לא נמצאו קורסים מתאימים.</div>}
                </div>
            )}
        </>
    );
}
