import React, { useState } from 'react';
import LandingHeader from './LandingHeader';
import ContactForm from './ContactForm'; // קריאה לטופס החיצוני המהיר
import AboutView from './AboutView'; // טעינת דפי המידע הפנימיים מתחת לתפריט
import ThreeBackground from './ThreeBackground'; // החזרת צורות התלת-מימד המקוריות ברקע

export default function LandingPage({ onLoginClick }) {
    // ניהול הניווט הפנימי של דף הנחיתה מבלי להעלים את ה-Header העליון
    const [activeTab, setActiveTab] = useState('hero'); 

    return (
        <div className="min-h-screen bg-white font-assistant flex flex-col relative overflow-x-hidden w-full" dir="rtl">
            {/* סרגל הניווט העליון נשאר יציב וקבוע למעלה תמיד */}
            <LandingHeader onLoginClick={onLoginClick} onNavClick={(sec) => setActiveTab(sec)} />
            
            {/* תוכן העמוד משתנה דינמית מתחת לסרגל הניווט */}
            <div className="flex-grow w-full">
                {activeTab === 'hero' ? (
                    /* 1. החזרת דף הבית המקורי: צורות תלת מימד וטקסט בלבד ללא סרטון */
                    <section className="pt-44 pb-20 px-4 max-w-7xl mx-auto flex flex-col items-center justify-center text-center space-y-12 relative min-h-[75vh]">
                        {/* שכבת צורות תלת המימד המסתובבות ברקע הטקסט */}
                        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
                            <ThreeBackground />
                        </div>

                        <div className="space-y-6 relative z-10 max-w-4xl mx-auto">
                            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-900 leading-tight">
                                טכנולוגיה עם <span className="text-cyan-600 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">נשמה</span>
                            </h1>
                            <p className="text-lg sm:text-xl md:text-2xl font-bold text-slate-500 max-w-3xl mx-auto leading-relaxed px-2">
                                חותם חיים מבית רובוטיקס - החברה המובילה בישראל לחדשנות פדגוגית, הקמת מרחבי STEM ופיתוח הלומד האוטונומי.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4 relative z-10 w-full sm:w-auto px-4">
                            <a href="#contact" className="bg-cyan-600 text-white px-10 py-4 rounded-full font-black text-lg shadow-xl hover:scale-105 transition text-center">סיור ב"חלומציאות"</a>
                            <button onClick={onLoginClick} className="bg-slate-900 hover:bg-purple-600 text-white px-10 py-4 rounded-full font-black text-lg shadow-xl hover:scale-105 transition text-center cursor-pointer">כניסה למערכת ה-LMS</button>
                        </div>
                    </section>
                ) : (
                    /* 2. רינדור 11 הדפים הפנימיים ישירות מתחת לתפריט הראשי */
                    <div className="pt-32 pb-12">
                        <AboutView section={activeTab} onBack={() => setActiveTab('hero')} />
                    </div>
                )}
            </div>

            {/* 3. קריאה דינמית לטופס צור קשר מתוך קובץ נפרד לשמירה על מהירות שיא */}
            <ContactForm />
        </div>
    );
}
