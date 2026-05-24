import React from 'react';
import { LOGO_URL } from '../App';

export default function LandingHeader({ onLoginClick, onNavClick }) {
    const catalogUrl = "https://heyzine.com/flip-book/426cdf50eb.html";

    return (
        <header className="fixed top-0 w-full bg-white/90 backdrop-blur-md shadow-sm z-[100] no-print">
            <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-24">
                
                <div className="flex items-center gap-6">
                    {/* לוגו החברה המשמש כקישור קבוע לאיפוס וחזרה לעמוד הבית החיצוני */}
                    <a href="https://robotixlms.vercel.app/" className="transition-transform hover:scale-105 shrink-0 block">
                        <img src={LOGO_URL} alt="לוגו חותם חיים" className="h-16 md:h-20" />
                    </a>
                    
                    <nav className="hidden lg:flex gap-8 text-sm font-bold text-slate-800 tracking-widest uppercase items-center" dir="rtl">
                        
                        {/* 1. תפריט אודותינו המדויק והחדש הכולל חלוקה ל-5 דפים פנימיים */}
                        <div className="relative group py-4">
                            <span className="hover:text-cyan-600 transition flex items-center gap-1 cursor-pointer select-none">
                                אודותינו <span className="text-[10px] opacity-50 relative top-px">▼</span>
                            </span>
                            <div className="absolute top-full right-0 w-64 bg-white border border-slate-100 shadow-2xl rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col py-2 overflow-hidden z-50">
                                <button onClick={() => onNavClick('who_we_are')} className="text-right px-5 py-3 hover:bg-slate-50 hover:text-cyan-600 text-sm transition font-semibold border-b border-slate-50 w-full">1. אז מי אנחנו ?</button>
                                <button onClick={() => onNavClick('our_work')} className="text-right px-5 py-3 hover:bg-slate-50 hover:text-cyan-600 text-sm transition font-semibold border-b border-slate-50 w-full">2. קצת מהעשייה שלנו</button>
                                <button onClick={() => onNavClick('skills')} className="text-right px-5 py-3 hover:bg-slate-50 hover:text-cyan-600 text-sm transition font-semibold border-b border-slate-50 w-full">3. מיומנויות ותחומי דעת</button>
                                <button onClick={() => onNavClick('faq')} className="text-right px-5 py-3 hover:bg-slate-50 hover:text-cyan-600 text-sm transition font-semibold border-b border-slate-50 w-full">4. שאלות ותשובות</button>
                                <button onClick={() => onNavClick('sitemap')} className="text-right px-5 py-3 hover:bg-slate-50 hover:text-cyan-600 text-sm transition font-semibold w-full">5. מפת האתר</button>
                            </div>
                        </div>

                        {/* 2. תפריט השירותים שלנו המקצועי המפנה ל-6 דפי שירות חדשים */}
                        <div className="relative group py-4">
                            <span className="hover:text-cyan-600 transition flex items-center gap-1 cursor-pointer select-none">
                                השירותים שלנו <span className="text-[10px] opacity-50 relative top-px">▼</span>
                            </span>
                            <div className="absolute top-full right-0 w-64 bg-white border border-slate-100 shadow-2xl rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col py-2 overflow-hidden z-50">
                                <button onClick={() => onNavClick('catalog_spec')} className="text-right px-5 py-3 hover:bg-slate-50 hover:text-cyan-600 text-sm transition font-semibold border-b border-slate-50 w-full">1. קטלוג מוצרים</button>
                                <button onClick={() => onNavClick('courses_track')} className="text-right px-5 py-3 hover:bg-slate-50 hover:text-cyan-600 text-sm transition font-semibold border-b border-slate-50 w-full">2. קורסים עם ובלי מדריכים</button>
                                <button onClick={() => onNavClick('innovation_tour')} className="text-right px-5 py-3 hover:bg-slate-50 hover:text-cyan-600 text-sm transition font-semibold border-b border-slate-50 w-full">3. סיור במתחם החדשנות</button>
                                <button onClick={() => onNavClick('workshops_spec')} className="text-right px-5 py-3 hover:bg-slate-50 hover:text-cyan-600 text-sm transition font-semibold border-b border-slate-50 w-full">4. סדנאות וימי שיא</button>
                                <button onClick={() => onNavClick('stem_rooms')} className="text-right px-5 py-3 hover:bg-slate-50 hover:text-cyan-600 text-sm transition font-semibold border-b border-slate-50 w-full">5. עיצוב חדרי STEM</button>
                                <button onClick={() => onNavClick('london_bett')} className="text-right px-5 py-3 hover:bg-slate-50 hover:text-cyan-600 text-sm transition font-semibold w-full">6. משלחת BETT ללונדון</button>
                            </div>
                        </div>
                    </nav>
                </div>

                <div className="flex gap-4 items-center">
                    <a href={catalogUrl} target="_blank" rel="noopener noreferrer" className="hidden xl:block bg-lime-600 text-white px-6 py-3 rounded-full font-bold text-sm shadow-xl hover:scale-105 transition duration-300">
                        לקטלוג המוצרים
                    </a>
                    <a href="#contact" className="hidden md:block bg-cyan-600 text-white px-8 py-3 rounded-full font-bold text-sm shadow-xl hover:scale-105 transition duration-300">פגישת ייעוץ</a>
                    <button onClick={onLoginClick} className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold text-sm shadow-xl hover:bg-cyan-600 transition duration-300">להתחבר</button>
                </div>

            </div>
        </header>
    );
}
