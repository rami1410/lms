import React from 'react';

export default function LandingContent({ catalogUrl, brandTeal, brandGreen }) {
    return (
        <>
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
        </>
    );
}
