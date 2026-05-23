import React from 'react';
import { LOGO_URL } from '../App';

export default function LandingHeader({ onLoginClick, catalogUrl, brandTeal, brandGreen }) {
    
    const handlePrintPDF = () => {
        window.print();
    };

    return (
        <header className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-slate-100 no-print transition-all">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                
                <div className="flex items-center gap-8">
                    <img src={LOGO_URL} alt="Logo" className="h-12 cursor-pointer hover:scale-105 transition-transform" />
                    
                    <nav className="hidden md:flex items-center gap-6 font-bold text-slate-600">
                        <a href="#home" className="hover:text-[#2bb2c4] transition-colors">התחלה</a>
                        <a href="#activities" className="hover:text-[#2bb2c4] transition-colors">פעילות</a>
                        <a href="#partners" className="hover:text-[#2bb2c4] transition-colors">שותפים לדרך</a>
                        <a href="#impact" className="hover:text-[#2bb2c4] transition-colors">אימפקט</a>
                        <a href="#equipment" className="hover:text-[#2bb2c4] transition-colors">הציוד שלנו</a>
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handlePrintPDF}
                        className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        PDF
                    </button>
                    
                    <a 
                        href={catalogUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden md:flex items-center gap-2 px-5 py-2 rounded-full font-black text-white shadow-md hover:shadow-lg hover:scale-105 transition-all"
                        style={{ backgroundImage: `linear-gradient(to right, ${brandTeal}, ${brandGreen})` }}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                        לצפייה בקטלוג
                    </a>

                    <a 
                        href="mailto:contact@robotix.co.il"
                        className="hidden sm:block px-5 py-2 rounded-full font-black text-white shadow-md hover:shadow-lg transition-all"
                        style={{ backgroundColor: brandTeal }}
                    >
                        פגישת ייעוץ
                    </a>

                    <button 
                        onClick={onLoginClick}
                        className="px-6 py-2 rounded-full font-black text-white shadow-md hover:shadow-lg hover:scale-105 transition-all"
                        style={{ backgroundColor: '#0f172a' }}
                    >
                        להתחבר
                    </button>
                </div>
            </div>
        </header>
    );
}
