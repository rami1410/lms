import React, { useState } from 'react';

export default function Navigation({ currentUser, lang, setLang, viewMode, setViewMode, activeSection, setActiveSection, setViewingCourse, setActiveModal, t, direction, onLogout, LOGO_URL }) {
    const [langOpen, setLangOpen] = useState(false);

    const languages = [
        { code: 'he', label: 'עברית' },
        { code: 'en', label: 'English' },
        { code: 'ar', label: 'العربية' },
        { code: 'ru', label: 'Русский' }
    ];

    return (
        <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-[100]">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                
                <div className="flex items-center gap-6">
                    <img src={LOGO_URL} alt="Logo" className="h-12 cursor-pointer" onClick={() => {setViewingCourse(null); setActiveSection('courses');}} />
                    {currentUser && activeSection === 'courses' && !viewingCourse && (
                        <h1 className="text-2xl font-black text-slate-800 hidden sm:block">{t('my_courses')}</h1>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {/* תפריט בחירת שפה תקין וברור */}
                    <div className="relative">
                        <button onClick={() => setLangOpen(!langOpen)} className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-xl text-slate-600 transition-colors border border-slate-200">
                            <span className="text-xl">🌐</span>
                            <span className="font-bold text-sm uppercase">{lang}</span>
                            <span className="text-xs">▼</span>
                        </button>
                        {langOpen && (
                            <div className="absolute top-12 right-0 bg-white shadow-2xl rounded-xl z-[999] p-2 flex flex-col gap-1 min-w-[150px] border border-slate-200">
                                {languages.map(l => (
                                    <button 
                                        key={l.code} 
                                        onClick={() => { setLang(l.code); setLangOpen(false); }}
                                        className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors text-right ${lang === l.code ? 'bg-purple-50 text-purple-700' : 'text-slate-700 hover:bg-slate-50'}`}
                                    >
                                        {l.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {currentUser && (
                        <div className="flex items-center gap-3">
                            {currentUser.role === 'admin' && (
                                <div className="flex bg-slate-100 p-1 rounded-xl" dir="ltr">
                                    <button onClick={() => setViewMode('admin')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'admin' ? 'bg-white shadow-sm text-purple-700' : 'text-slate-500 hover:text-slate-700'}`}>{t('view_admin')}</button>
                                    <button onClick={() => setViewMode('teacher')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'teacher' ? 'bg-white shadow-sm text-green-700' : 'text-slate-500 hover:text-slate-700'}`}>👨‍🏫 {t('view_teacher')}</button>
                                    <button onClick={() => setViewMode('student')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'student' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}>👨‍🎓 {t('view_student')}</button>
                                </div>
                            )}
                            
                            {(viewMode === 'admin' || viewMode === 'teacher') && (
                                <div className="flex gap-2">
                                    <button onClick={() => {setViewingCourse(null); setActiveSection('courses');}} className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${activeSection === 'courses' && !viewingCourse ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>📚 {t('my_courses')}</button>
                                    <button onClick={() => {setViewingCourse(null); setActiveSection('compass');}} className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${activeSection === 'compass' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>🧭 מצפן</button>
                                    <button onClick={() => {setViewingCourse(null); setActiveSection('admin');}} className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${activeSection === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>⚙️ פאנל ניהול</button>
                                </div>
                            )}
                            
                            <div className="flex items-center gap-4 border-r border-slate-200 pr-4">
                                <span className="font-bold text-slate-700">{t('welcome')}, {currentUser.firstName}</span>
                                <button onClick={onLogout} className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-xl font-bold text-sm transition-colors">
                                    {t('logout')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
