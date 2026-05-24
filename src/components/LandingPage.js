import React from 'react';
import LandingHeader from './LandingHeader';

export default function LandingPage({ onLoginClick, onNavClick }) {
    return (
        <div className="min-h-screen bg-white font-assistant flex flex-col relative select-none overflow-x-hidden" dir="rtl">
            {/* הזרקת סרגל הניווט החדש והעברת פונקציית הניתוב הדינמית אליו */}
            <LandingHeader onLoginClick={onLoginClick} onNavClick={onNavClick} />
            
            {/* אזור ה-Hero הראשי של דף הבית */}
            <section id="hero" className="pt-44 pb-24 px-4 max-w-7xl mx-auto flex flex-col items-center justify-center text-center space-y-8 animate-fade-in">
                <div className="space-y-4">
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-tight">
                        טכנולוגיה עם <span className="text-cyan-600 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">נשמה</span>
                    </h1>
                    <p className="text-xl md:text-2xl font-bold text-slate-500 max-w-3xl mx-auto leading-relaxed">
                        חותם חיים מבית רובוטיקס - החברה המובילה בישראל לחדשנות פדגוגית, הקמת מרחבי STEM ופיתוח הלומד האוטונומי.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <a href="#contact" className="bg-cyan-600 text-white px-10 py-4 rounded-full font-black text-lg shadow-xl hover:scale-105 transition duration-300">סיור ב"חלומציאות"</a>
                    <button onClick={onLoginClick} className="bg-slate-900 hover:bg-purple-600 text-white px-10 py-4 rounded-full font-black text-lg shadow-xl hover:scale-105 transition duration-300">כניסה למערכת ה-LMS</button>
                </div>
                
                {/* אלמנט עיצובי מרכזי */}
                <div className="w-full max-w-4xl pt-12 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white z-10 pointer-events-none" />
                    <div className="bg-slate-100 rounded-[3rem] p-4 shadow-2xl border border-slate-200/60 overflow-hidden aspectRatio-video relative group">
                        <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center text-white text-6xl font-black select-none opacity-100 group-hover:opacity-0 transition-opacity duration-500 z-20">▶ סרטון תדמית</div>
                        <iframe title="robotix-promo" className="w-full h-[450px] rounded-[2.2rem]" src="https://www.youtube.com/embed/OHLMTgHl6cc?modestbranding=1&rel=0" allowFullScreen />
                    </div>
                </div>
            </section>

            {/* אזור יצירת קשר מהיר בתחתית דף הבית */}
            <section id="contact" className="bg-slate-50 border-t border-slate-100 py-16 px-4">
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <h2 className="text-3xl font-black text-slate-900">הצטרפו למהפכת הלמידה האוטונומית</h2>
                    <p className="text-slate-500 font-bold max-w-lg mx-auto text-sm">השאירו פרטים ונציג פדגוגי מבית רובוטיקס יחזור אליכם עם הצעה מותאמת אישית לבית הספר או לרשות המקומית שלכם.</p>
                    <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-4">
                        <input type="email" placeholder="הקלד כתובת אימייל רשמית..." className="flex-grow p-4 rounded-2xl border-2 border-slate-200 outline-none focus:border-cyan-500 font-bold text-center transition-colors bg-white shadow-sm" />
                        <button onClick={() => alert('תודה! פרטיך התקבלו במערכת רובוטיקס.')} className="bg-slate-900 hover:bg-cyan-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg transition-colors">צרו קשר עכשיו</button>
                    </div>
                </div>
            </section>
        </div>
    );
}
