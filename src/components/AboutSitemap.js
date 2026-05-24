import React from 'react';

export default function AboutSitemap() {
    return (
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border shadow-sm space-y-6 text-right animate-fade-in">
            <h3 className="font-black text-base md:text-xl text-cyan-600 border-r-4 border-cyan-600 pr-2">מפרט רכיבים הנדסי (Component Tree Spec)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-slate-50 p-4 rounded-xl border"><strong>App.js (core App logic)</strong><p className="text-slate-500 mt-1">מנוע הניתוב והסטייט הראשי המנהל את זרם הנתונים והאזנה ל-Firebase.</p></div>
                <div className="bg-slate-50 p-4 rounded-xl border"><strong>CourseModal.js (smart course development)</strong><p className="text-slate-500 mt-1">חלונית פיתוח קורסים חכמה המשתמשת ב-AI לניסוח סילבוסים ותכנים פדגוגיים.</p></div>
                <div className="bg-slate-50 p-4 rounded-xl border"><strong>CoursesDashboard.js (student course gallery)</strong><p className="text-slate-500 mt-1">לוח תצוגת הקורסים ללומד הכולל חיצי מיון דינמיים (▲▼) לטבלאות.</p></div>
                <div className="bg-slate-50 p-4 rounded-xl border"><strong>CourseView.js (secure lesson player)</strong><p className="text-slate-500 mt-1">נגן שיעורים מאובטח הכולל מנגנון Crop ליוטיוב ונעילת Sandbox מפני יציאה חיצונית.</p></div>
            </div>
        </div>
    );
}
