import React, { useState } from 'react';
import { LOGO_URL } from '../App';

export default function Login({ onLogin, onRegisterToggle, lang, setLang, t }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onLogin(username, password);
    };

    return (
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-md flex flex-col items-center relative z-10">
            
            {/* כפתורי החלפת שפה - נעולים במקום עם dir="ltr" וצבע שחור לפעיל */}
            <div className="flex gap-2 mb-8 bg-slate-100 p-1 rounded-full" dir="ltr">
                <button
                    onClick={() => setLang('en')}
                    className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${lang === 'en' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-white hover:text-slate-900'}`}
                >
                    English
                </button>
                <button
                    onClick={() => setLang('he')}
                    className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${lang === 'he' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-white hover:text-slate-900'}`}
                >
                    עברית
                </button>
                <button
                    onClick={() => setLang('ar')}
                    className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${lang === 'ar' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-white hover:text-slate-900'}`}
                >
                    العربية
                </button>
            </div>

            <img src={LOGO_URL} alt="Logo" className="h-20 mb-6" />
            
            <h2 className="text-3xl font-black text-slate-800 mb-8">{t('login')}</h2>

            <form onSubmit={handleSubmit} className="w-full space-y-4">
                <div>
                    <input
                        type="text"
                        placeholder={t('username')}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-slate-200 p-4 rounded-2xl outline-none focus:border-purple-500 font-bold transition-colors text-slate-700"
                        dir="ltr"
                    />
                </div>
                <div>
                    <input
                        type="password"
                        placeholder={t('password')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-slate-200 p-4 rounded-2xl outline-none focus:border-purple-500 font-bold transition-colors text-slate-700"
                        dir="ltr"
                    />
                </div>
                
                <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-lg hover:bg-purple-600 transition-colors shadow-xl mt-4">
                    {t('login_button')}
                </button>
            </form>

            <button onClick={onRegisterToggle} className="mt-8 text-slate-500 font-bold hover:text-purple-600 transition-colors">
                {t('register')}
            </button>
        </div>
    );
}
