import React from 'react';

export default function AboutOurWork() {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="bg-white p-6 rounded-2xl border shadow-sm"><span className="text-3xl font-black text-cyan-600 block mb-1">150+</span><span className="text-slate-500 font-bold text-xs md:text-sm">מרחבי למידה פעילים</span></div>
                <div className="bg-white p-6 rounded-2xl border shadow-sm"><span className="text-3xl font-black text-lime-600 block mb-1">15,000+</span><span className="text-slate-500 font-bold text-xs md:text-sm">תלמידים מוסמכים בשנה</span></div>
                <div className="bg-white p-6 rounded-2xl border shadow-sm"><span className="text-3xl font-black text-orange-500 block mb-1">800+</span><span className="text-slate-500 font-bold text-xs md:text-sm">מורים שעברו הכשרות</span></div>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border shadow-sm space-y-4 text-right">
                <h3 className="font-black text-lg md:text-xl text-orange-500 border-r-4 border-orange-500 pr-2">אבני דרך במסע החינוכי</h3>
                <ul className="space-y-3 text-slate-600 font-medium list-disc list-inside pr-1 text-sm md:text-base">
                    <li><strong>2021:</strong> השקת ערכות הרובוטיקה המודולריות הפיזיות הראשונות בשדה החינוך הציבורי.</li>
                    <li><strong>2023:</strong> אינטגרציה מלאה של כלי בינה מלאכותית (AI) מבוססי מחוללי תוכן חכמים במערכי הלמידה.</li>
                    <li><strong>2025:</strong> השקת מערכת ה-LMS הלומד העצמאי המאובטחת המשרתע עשקות רשויות מקומיות.</li>
                </ul>
            </div>
        </div>
    );
}
