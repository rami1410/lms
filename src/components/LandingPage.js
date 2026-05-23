import React from 'react';
import { LOGO_URL } from '../App';
import LandingHeader from './LandingHeader';
import LandingContent from './LandingContent';

export default function LandingPage({ onLoginClick }) {
    
    // הגדרות עיצוב ראשיות לעמוד
    const brandTeal = "#2bb2c4";
    const brandGreen = "#99ca3c";
    const catalogUrl = "https://heyzine.com/flip-book/426cdf50eb.html";

    return (
        <div className="min-h-screen bg-white font-assistant text-slate-800" dir="rtl">
            
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

            {/* כותרת מיוחדת שמופיעה רק כשמדפיסים ל-PDF */}
            <div className="print-only text-center mb-10 pb-6 border-b-4" style={{ borderColor: brandTeal }}>
                <img src={LOGO_URL} alt="חותם חיים" className="h-24 mx-auto mb-4" />
                <h1 className="text-4xl font-black text-slate-900 mb-2">סיכום פעילות וקטלוג - חותם חיים</h1>
                <p className="text-xl text-slate-600">מערכת למידה חדשנית מבית רובוטיקס</p>
                <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: '#f0fdfa' }}>
                    <p className="font-bold text-lg">לצפייה בקטלוג המלא והאינטראקטיבי שלנו סרקו את הקוד או היכנסו לקישור:</p>
                    <a href={catalogUrl} className="text-blue-600 font-bold" dir="ltr">{catalogUrl}</a>
                </div>
            </div>

            {/* 1. רכיב ההדר (התפריט העליון) */}
            <LandingHeader 
                onLoginClick={onLoginClick} 
                brandTeal={brandTeal} 
                brandGreen={brandGreen} 
                catalogUrl={catalogUrl} 
            />

            {/* 2. רכיב ההירו (הבאנר הראשי) - נשאר כאן כי הוא חלק מהותי מהכניסה */}
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

            {/* 3. רכיב התוכן התחתון (ציוד, שותפים, אימפקט) */}
            <LandingContent 
                brandTeal={brandTeal} 
                brandGreen={brandGreen} 
                catalogUrl={catalogUrl} 
            />

        </div>
    );
}
