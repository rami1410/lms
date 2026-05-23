import React from 'react';
import { LOGO_URL } from '../App';

export default function LandingPage({ onLoginClick }) {
    
    // פונקציה להפקת PDF באמצעות מנגנון ההדפסה המובנה של הדפדפן
    const handlePrintPDF = () => {
        window.print();
    };

    // צבעי המותג מהלוגו
    const brandTeal = "#2bb2c4";
    const brandGreen = "#99ca3c";
    
    const catalogUrl = "https://heyzine.com/flip-book/426cdf50eb.html";

    return (
        <div className="min-h-screen bg-white font-assistant text-slate-800" dir="rtl">
            
            {/* סגנונות מיוחדים להדפסה - כדי שה-PDF ייראה כמו סיכום נקי ומקצועי */}
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    @page { size: A4; margin: 20mm; }
                    body { background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .no-print { display: none !important; }
                    .print-only { display: block !important; }
                    .print-break-inside-avoid { page-break-inside: avoid; }
                    .shadow-xl, .shadow-2xl { box-shadow: none !important; border: 1px solid #e2e8f0; }
                }
                .print-only { display: none; }
            `}} />

            {/* כותרת מיוחדת שמופיעה רק ב-PDF */}
            <div className="print-only text-center mb-10 pb-6 border-b-4" style={{ borderColor: brandTeal }}>
                <img src={LOGO_URL} alt="חותם חיים" className="h-24 mx-auto mb-4" />
                <h1 className="text-4xl font-black text-slate-900 mb-2">סיכום פעילות וקטלוג - חותם חיים</h1>
                <p className="text-xl text-slate-600">מערכת למידה חדשנית מבית רובוטיקס</p>
                <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: '#f0fdfa' }}>
                    <p className="font-bold text-lg">לצפייה בקטלוג המלא והאינטראקטיבי שלנו סרקו את הקוד או היכנסו לקישור:</p>
                    <a href={catalogUrl} className="text-blue-600 font-bold" dir="ltr">{catalogUrl}</a>
                </div>
            </div>

            {/* תפריט ניווט עליון - יוסתר בהדפסה */}
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
                        {/* כפתור PDF */}
                        <button 
                            onClick={handlePrintPDF}
                            className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            PDF
                        </button>
                        
                        {/* כפתור צפייה בקטלוג */}
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

                        {/* כפתור פגישת ייעוץ */}
                        <a 
                            href="mailto:contact@robotix.co.il"
                            className="hidden sm:block px-5 py-2 rounded-full font-black text-white shadow-md hover:shadow-lg transition-all"
                            style={{ backgroundColor: brandTeal }}
                        >
                            פגישת ייעוץ
                        </a>

                        {/* כפתור התחברות לחשבון */}
                        <button 
                            onClick={onLoginClick}
                            className="px-6 py-2 rounded-full font-black text-white shadow-md hover:shadow-lg hover:scale-105 transition-all"
                            style={{ backgroundColor: '#0f172a' }} // כחול כהה (כמו בתמונה) להתחברות
                        >
                            להתחבר
                        </button>
                    </div>
                </div>
            </header>

            {/* אזור ראשי (Hero) */}
            <section id="home" className="pt-40 pb-20 px-6 max-w-7xl mx-auto text-center print-break-inside-avoid">
                <div className="inline-block p-4 rounded-full bg-slate-50 mb-6">
                    <img src={LOGO_URL} alt="חותם חיים" className="h-32 object-contain" />
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 leading-tight">
                    למידה שעושה <span style={{ color: brandTeal }}>הבדל</span>, <br />
                    טכנולוגיה שיוצרת <span style={{ color: brandGreen }}>עתיד</span>.
                </h1>
                <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed">
                    מערכת ניהול הלמידה של חותם חיים מבית רובוטיקס. מקנים לתלמידים את כישורי המאה ה-21 דרך עשייה, חדשנות וטכנולוגיה מתקדמת.
                </p>
                <div className="flex flex-wrap justify-center gap-4 no-print">
                    <button 
                        onClick={onLoginClick}
                        className="px-8 py-4 rounded-full font-black text-xl text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
                        style={{ backgroundImage: `linear-gradient(to right, ${brandTeal}, ${brandGreen})` }}
                    >
                        כניסה למערכת הלמידה
                    </button>
                </div>
            </section>

            {/* הציוד שלנו + קטלוג */}
            <section id="equipment" className="py-20 bg-slate-50 border-t border-slate-100 print-break-inside-avoid">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-black text-slate-900 mb-4">הציוד שלנו</h2>
                        <div className="w-24 h-2 mx-auto rounded-full" style={{ backgroundColor: brandTeal }}></div>
                        <p className="mt-6 text-xl text-slate-600 max-w-2xl mx-auto">
                            אנו מספקים את הציוד הטכנולוגי והרובוטי המתקדם ביותר, המותאם פדגוגית לתכניות הלימוד ולפיתוח לומד עצמאי.
                        </p>
                    </div>

                    <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-slate-100 text-center max-w-4xl mx-auto">
                        <div className="w-24 h-24 mx-auto bg-slate-50 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-12 h-12" style={{ color: brandGreen }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                        </div>
                        <h3 className="text-2xl font-black mb-4">קטלוג המוצרים המלא</h3>
                        <p className="text-lg text-slate-600 mb-8">
                            מוזמנים לעיין בקטלוג הדיגיטלי המלא שלנו, הכולל את כל הערכות, חיישנים, מדפסות תלת-מימד, וציוד המייקרים שאנו מציעים למוסדות חינוך.
                        </p>
                        <a 
                            href={catalogUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-black text-xl text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all no-print"
                            style={{ backgroundColor: brandTeal }}
                        >
                            <span>פתח את הקטלוג עכשיו</span>
                            <span aria-hidden="true">&rarr;</span>
                        </a>
                        <p className="mt-4 text-slate-500 font-medium no-print">הקטלוג ייפתח בלשונית חדשה</p>
                    </div>
                </div>
            </section>

            {/* שותפים לדרך */}
            <section id="partners" className="py-20 print-break-inside-avoid">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-4xl font-black text-slate-900 text-center mb-16 italic">שותפים לדרך</h2>
                    
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* כאן אפשר להכניס את התמונות האמיתיות של הלוגואים, כרגע שמתי פלייסחולדרים מעוצבים */}
                        <div className="w-32 h-32 bg-white rounded-full shadow-lg border border-slate-100 flex items-center justify-center font-bold text-slate-400 p-4 text-center">משרד החינוך</div>
                        <div className="w-32 h-32 bg-white rounded-full shadow-lg border border-slate-100 flex items-center justify-center font-bold text-slate-400 p-4 text-center">משרד הביטחון</div>
                        <div className="w-32 h-32 bg-white rounded-full shadow-lg border border-slate-100 flex items-center justify-center font-bold text-slate-400 p-4 text-center">צה"ל</div>
                        <div className="w-32 h-32 bg-white rounded-full shadow-lg border border-slate-100 flex items-center justify-center font-bold text-slate-400 p-4 text-center">קק"ל</div>
                        <div className="w-32 h-32 bg-white rounded-full shadow-lg border border-slate-100 flex items-center justify-center font-bold text-slate-400 p-4 text-center">עיריית חיפה</div>
                        <div className="w-32 h-32 bg-white rounded-full shadow-lg border border-slate-100 flex items-center justify-center font-bold text-slate-400 p-4 text-center">רשת אורט</div>
                    </div>
                </div>
            </section>

            {/* האימפקט שלנו */}
            <section id="impact" className="py-20 bg-slate-900 text-white print-break-inside-avoid" style={{ backgroundColor: '#0f172a' }}>
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center gap-4 mb-16">
                        <div className="w-2 h-12 rounded-full" style={{ backgroundColor: brandTeal }}></div>
                        <h2 className="text-4xl font-black italic">האימפקט שלנו</h2>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8 text-center">
                        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <div className="text-5xl font-black mb-2" style={{ color: brandTeal }}>1,400+</div>
                            <div className="text-lg font-medium text-slate-300">בתי ספר ומוסדות</div>
                        </div>
                        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <div className="text-5xl font-black mb-2" style={{ color: brandGreen }}>50,000+</div>
                            <div className="text-lg font-medium text-slate-300">תלמידים פעילים</div>
                        </div>
                        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <div className="text-5xl font-black mb-2" style={{ color: brandTeal }}>2,600+</div>
                            <div className="text-lg font-medium text-slate-300">שיעורים מותאמים</div>
                        </div>
                        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <div className="text-5xl font-black mb-2" style={{ color: brandGreen }}>100%</div>
                            <div className="text-lg font-medium text-slate-300">התאמה לתקני משרד החינוך</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* פוטר קטן */}
            <footer className="py-8 text-center text-slate-500 text-sm border-t border-slate-100 no-print">
                <p>© {new Date().getFullYear()} חותם חיים מבית רובוטיקס. כל הזכויות שמורות.</p>
            </footer>
        </div>
    );
}
