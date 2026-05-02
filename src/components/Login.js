import React, { useState } from 'react';
import SafeInput from './SafeInput';
import { LOGO_URL, BACKGROUND_VIDEO_ID } from '../App';

export default function Login({ onLogin, onRegisterToggle, lang, setLang, t, playBoom }) {
    const [user, setUser] = useState('');
    const [pass, setPass] = useState('');
    const [videoPlaying, setVideoPlaying] = useState(true);

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4">
            {videoPlaying && (
                <div className="fixed inset-0 z-0 pointer-events-none">
                    <iframe className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[115vw] h-[115vh] opacity-50 scale-125" src={`https://www.youtube.com/embed/${BACKGROUND_VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${BACKGROUND_VIDEO_ID}&controls=0&start=30`} frameBorder="0" />
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
                </div>
            )}
            
            {/* התיקון כאן: הוספתי text-slate-900 כדי שהטקסט לא יהיה לבן */}
            <div className="bg-white/95 backdrop-blur-xl p-10 rounded-[3.5rem] shadow-2xl w-full max-w-xl relative z-10 text-slate-900">
                <div className="flex justify-between mb-8">
                    <div className="flex gap-2">
                        {['he', 'ar'].map(l => (
                            <button key={l} onClick={() => setLang(l)} className={`w-11 h-11 rounded-2xl font-black text-xs border transition-all ${lang === l ? 'bg-slate-900 text-white' : 'bg-white text-slate-900 shadow-sm hover:bg-slate-50'}`}>
                                {l.toUpperCase()}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        {['en', 'ru'].map(l => (
                            <button key={l} onClick={() => setLang(l)} className={`w-11 h-11 rounded-2xl font-black text-xs border transition-all ${lang === l ? 'bg-slate-900 text-white' : 'bg-white text-slate-900 shadow-sm hover:bg-slate-50'}`}>
                                {l.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
                
                <img src={LOGO_URL} alt="Logo" className="h-28 mx-auto mb-6 rounded-2xl shadow-sm" />
                <h1 className="text-4xl font-black text-center text-slate-900 mb-2">{t('login_title')}</h1>
                <p className="text-slate-500 text-center font-bold mb-10">{t('login_subtitle')}</p>
                
                <form onSubmit={(e) => { e.preventDefault(); onLogin(user, pass); }} className="space-y-4">
                    <SafeInput value={user} onChange={setUser} placeholder="שם משתמש" playBoom={playBoom} className="w-full p-5 bg-slate-50 rounded-2xl border-2 text-center text-xl font-black outline-none focus:border-purple-500 text-slate-900 placeholder:text-slate-400" />
                    <SafeInput value={pass} onChange={setPass} type="password" placeholder="סיסמה" playBoom={playBoom} className="w-full p-5 bg-slate-50 rounded-2xl border-2 text-center text-xl font-black outline-none focus:border-purple-500 text-slate-900 placeholder:text-slate-400" />
                    <button className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl text-xl shadow-xl hover:bg-black transition-all active:scale-95">התחברות מאובטחת</button>
                    <button type="button" onClick={onRegisterToggle} className="w-full text-purple-600 font-black text-sm mt-4 hover:underline">יצירת חשבון חדש</button>
                </form>
            </div>

            <button onClick={() => setVideoPlaying(!videoPlaying)} className="fixed bottom-6 right-6 bg-white/10 hover:bg-white/30 backdrop-blur-xl text-white px-5 py-2.5 rounded-2xl font-black border border-white/20 text-[10px] z-50 transition-all flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${videoPlaying ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                {videoPlaying ? "עצור וידאו ⏹" : "הפעל וידאו ▶"}
            </button>
        </div>
    );
}
