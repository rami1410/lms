import React from 'react';
import { LOGO_URL } from '../App';

export default function LandingHeader({ onLoginClick }) {
    const catalogUrl = "https://heyzine.com/flip-book/426cdf50eb.html";

    return (
        <header className="fixed top-0 w-full bg-white/90 backdrop-blur-md shadow-sm z-[100] no-print">
            <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-24">
                <div className="flex items-center gap-6">
                    <img src={LOGO_URL} alt="לוגו חותם חיים" className="h-16 md:h-20" />
                    <nav className="hidden lg:flex gap-8 text-sm font-bold text-chotam-black tracking-widest uppercase items-center">
                        <a href="#hero" className="hover:text-chotam-teal transition">התחלה</a>
                        
                        <div className="relative group py-4">
                            <a href="#sectors" className="hover:text-chotam-teal transition flex items-center gap-1 cursor-pointer">
                                פעילות <span className="text-[10px] opacity-50 relative top-px">▼</span>
                            </a>
                            <div className="absolute top-full right-0 w-56 bg-white border border-slate-100 shadow-2xl rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col py-3 overflow-hidden">
                                <a href="#strip-1" className="px-5 py-3 hover:bg-slate-50 hover:text-chotam-teal text-sm transition font-semibold border-b border-slate-50">1. עולם הציוד והאספקה</a>
                                <a href="#strip-2" className="px-5 py-3 hover:bg-slate-50 hover:text-chotam-green text-sm transition font-semibold border-b border-slate-50">2. הדרכה וליווי פדגוגי</a>
                                <a href="#strip-3" className="px-5 py-3 hover:bg-slate-50 hover:text-chotam-orange text-sm transition font-semibold border-b border-slate-50">3. הקמת מרחבי למידה</a>
                                <a href="#strip-4" className="px-5 py-3 hover:bg-slate-50 hover:text-chotam-teal text-sm transition font-semibold border-b border-slate-50">4. חלומציאות</a>
                                <a href="#strip-5" className="px-5 py-3 hover:bg-slate-50 hover:text-chotam-yellow text-sm transition font-semibold border-b border-slate-50">5. משלחות למידה</a>
                                <a href="#strip-6" className="px-5 py-3 hover:bg-slate-50 hover:text-chotam-red text-sm transition font-semibold">6. סדנאות וימי שיא</a>
                            </div>
                        </div>

                        <a href="#partners" className="hover:text-chotam-teal transition">שותפים לדרך</a>
                        <a href="#impact" className="hover:text-chotam-teal transition">אימפקט</a>
                        <a href="#rami" className="hover:text-chotam-teal transition">המייסד</a>
                    </nav>
                </div>
                <div className="flex gap-4 items-center">
                    {/* כפתור PDF מותאם */}
                    <button onClick={() => window.print()} className="flex items-center gap-1 text-slate-400 font-bold hover:text-chotam-teal transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        PDF
                    </button>
                    
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
