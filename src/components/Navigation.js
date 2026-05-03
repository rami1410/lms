import React from 'react';
import { i18n } from '../translations';

export default function Navigation({ 
    currentUser, lang, setLang, viewMode, setViewMode, 
    activeSection, setActiveSection, setViewingCourse, 
    setActiveModal, t, direction, onLogout, LOGO_URL 
}) {
    return (
        <header className="bg-white border-b px-6 py-3 flex justify-between items-center sticky top-0 z-50 shadow-sm">
            <div className="flex items-center gap-6">
                <img src={LOGO_URL} alt="Logo" className="h-10 w-auto cursor-pointer" onClick={() => {setActiveSection('courses'); setViewingCourse(null)}} />
                <nav className="flex gap-4">
                    <button onClick={() => {setActiveSection('courses'); setViewingCourse(null)}} className={`font-black text-sm ${activeSection === 'courses' ? 'text-purple-600' : 'text-slate-400'}`}>{t('my_courses')}</button>
                    {(currentUser.role === 'admin' || currentUser.role === 'teacher') && viewMode !== 'student' && (
                        <button onClick={() => setActiveSection('admin')} className={`font-black text-sm ${activeSection === 'admin' ? 'text-purple-600' : 'text-slate-400'}`}>
                            {currentUser.role === 'admin' ? t('admin_panel') : 'ניהול כיתה'}
                        </button>
                    )}
                </nav>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center bg-slate-100 rounded-xl px-2 ml-2">
                    <span className="text-[10px] mr-1">🌐</span>
                    <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-transparent border-none py-2 text-xs font-black outline-none cursor-pointer">
                        {Object.entries(i18n).map(([code, config]) => (
                            <option key={code} value={code}>{config.label}</option>
                        ))}
                    </select>
                </div>

                {currentUser.role === 'admin' && (
                    <div className={`flex bg-slate-100 p-1 rounded-xl gap-1 ${direction === 'rtl' ? 'ml-4 border-l pl-4' : 'mr-4 border-r pr-4'}`}>
                        <button onClick={() => setViewMode(viewMode === 'student' ? 'admin' : 'student')} className={`px-3 py-1.5 rounded-lg font-bold text-[10px] transition-all ${viewMode === 'student' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500 hover:bg-white'}`}>👨‍🎓 {t('view_student')}</button>
                        <button onClick={() => setViewMode(viewMode === 'teacher' ? 'admin' : 'teacher')} className={`px-3 py-1.5 rounded-lg font-bold text-[10px] transition-all ${viewMode === 'teacher' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-500 hover:bg-white'}`}>👨‍🏫 {t('view_teacher')}</button>
                    </div>
                )}

                {viewMode === 'admin' && (
                    <div className="flex gap-2">
                        <button onClick={() => setActiveModal({type:'course'})} className="bg-purple-600 text-white px-3 py-2 rounded-xl text-xs font-black shadow-sm hover:scale-105 transition-transform">+ קורס</button>
                        <button onClick={() => setActiveModal({type:'student'})} className="bg-emerald-500 text-white px-3 py-2 rounded-xl text-xs font-black shadow-sm hover:scale-105 transition-transform">+ תלמיד</button>
                        <button onClick={() => setActiveModal({type:'inst'})} className="bg-blue-500 text-white px-3 py-2 rounded-xl text-xs font-black shadow-sm hover:scale-105 transition-transform">+ מוסד</button>
                        <button onClick={() => setActiveModal({type:'map_admin'})} className="bg-orange-500 text-white px-3 py-2 rounded-xl text-xs font-black shadow-sm hover:scale-105 transition-transform">🗺️ מפות</button>
                    </div>
                )}
                
                <div className="flex items-center gap-3 mr-2">
                    <span className="font-bold text-slate-500 text-xs">{t('welcome')}, {currentUser.firstName}</span>
                    <button onClick={onLogout} className="text-red-500 font-black bg-red-50 px-3 py-2 rounded-xl text-xs hover:bg-red-500 hover:text-white transition-all">{t('logout')}</button>
                </div>
            </div>
        </header>
    );
}
