import React from 'react';
import { LOGO_URL } from '../App';

export default function LandingHeader({ onLoginClick, onAboutClick }) {
    const catalogUrl = "https://heyzine.com/flip-book/426cdf50eb.html";

    return (
        <header className="fixed top-0 w-full bg-white/90 backdrop-blur-md shadow-sm z-[100] no-print">
            <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-24">
                
                <div className="flex items-center gap-6">
                    {/* הלוגו הראשי - קישור רשמי לעמוד הבית של האפליקציה */}
                    <a href="https://robotixlms.vercel.app/" className="transition-transform hover:scale-105 shrink-0 block">
                        <img src={LOGO_URL} alt="לוגו חותם חיים" className="h-16 md:h-20" />
                    </a>
                    
                    <nav className="hidden lg:flex gap-8 text-sm font-bold text-chotam-black tracking-widest uppercase items-center" dir="rtl">
                        
                        {/* תפריט אודותינו עם רשימת הקישורים המלאה ומפת האתר */}
                        <div className="relative group py-4">
                            <span className="hover:text-chotam-teal transition flex items-center gap-1 cursor-pointer select-none">
                                אודותינו <span className="text-[10px] opacity-50 relative top-px">▼</span>
                            </span>
                            <div className="absolute top-full right-0 w-64 bg-white border border-slate-100 shadow-2xl rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col py-3 overflow-hidden z-50">
                                <button 
                                    onClick={onAboutClick} 
                                    className="text-right px-5 py-3 hover:bg-slate-50 hover:text-chotam-teal text-sm transition font-semibold border-b border-slate-50 w-full"
                                >
                                    1. אז מי אנחנו ? (ומפת האתר)
                                </button>
                                <a href="#impact" className="px-5 py-3 hover:bg-slate-50 hover:text-chotam-green text-sm transition font-semibold border-b border-slate-50">2. קצת מהעשייה שלנו</a>
                                <a href="#sectors" className="px-5 py-3 hover:bg-slate-50 hover:text-chotam-orange text-sm transition font-semibold border-b border-slate-50">3. מיומנויות ותחומי דעת</a>
                                <a href="#faq" className="px-5 py-3 hover:bg-slate-50 hover:text-chotam-teal text-sm transition font-semibold border-b border-slate-50">4. שאלות ותשובות</a>
                                <a href="#contact" className="px-5 py-3 hover:bg-slate-50 hover:text-chotam-yellow text-sm transition font-semibold border-b border-slate-50">5. צור קשר</a>
                                <a href="#courses" className="px-5 py-3 hover:bg-slate-50 hover:text-chotam-red text-sm transition font-semibold">6. הצגת הקורסים</a>
                            </div>
                        </div>

                        {/* תפריט השירותים שלנו המשקף את הפעילות העסקית העדכנית שלכם */}
                        <div className="relative group py-4">
                            <span className="hover:text-chotam-teal transition flex items-center gap-1 cursor-pointer select-none">
                                השירותים שלנו <span className="text-[10px] opacity-50 relative top-px">▼</span>
                            </span>
                            <div className="absolute top-full right-0 w-64 bg-white border border-slate-100 shadow-2xl rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col py-3 overflow-hidden z-50">
                                <a href={catalogUrl} target="_blank" rel="noopener noreferrer" className="px-5 py-3 hover:bg-slate-50 hover:text-chotam-teal text-sm transition font-semibold border-b border-slate-50">1. קטלוג מוצרים</a>
                                <a href="#strip-2" className="px-5 py-3 hover:bg-slate-50 hover:text-chotam-green text-sm transition font-semibold border-b border-slate-50">2. קורסים עם ובלי מדריכים</a>
                                <a href="#innovation-center" className="px-5 py-3 hover:bg-slate-50 hover:text-chotam-orange text-sm transition font-semibold border-b border-slate-50">3. סיור במתחם החדשנות</a>
                                <a href="#strip-6" className="px-5 py-3 hover:bg-slate-50 hover:text-chotam-teal text-sm transition font-semibold border-b border-slate-50">4. סדנאות וימי שיא</a>
                                <a href="#strip-3" className="px-5 py-3 hover:bg-slate-50 hover:text-chotam-yellow text-sm transition font-semibold border-b border-slate-50">5. עיצוב חדרי STEM</a>
                                <a href="#london-delegation" className="px-5 py-3 hover:bg-slate-50 hover:text-chotam-red text-sm transition font-semibold">6. משלחת BETT ללונדון</a>
                            </div>
                        </div>
                    </nav>
                </div>

                <div className="flex gap-4 items-center">
                    {/* כפתור קטלוג בסגנון המותג (ירוק-צהבהב) */}
                    <a href={catalogUrl} target="_blank" rel="noopener noreferrer" className="hidden xl:block bg-chotam-green text-white px-6 py-3 rounded-full font-bold text-sm shadow-xl hover:scale-105 transition duration-300">
                        לקטלוג המוצרים
                    </a>

                    <a href="#contact" className="hidden md:block bg-chotam-teal text-white px-8 py-3 rounded-full font-bold text-sm shadow-xl hover:scale-105 transition duration-300">פגישת ייעוץ</a>
                    <button onClick={onLoginClick} className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold text-sm shadow-xl hover:bg-chotam-teal transition duration-300">להתחבר</button>
                </div>

            </div>
        </header>
    );
}
