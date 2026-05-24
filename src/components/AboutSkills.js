import React from 'react';

export default function AboutSkills() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
            <div className="bg-white p-6 md:p-8 rounded-2xl border shadow-sm space-y-3 text-right">
                <h4 className="font-black text-base md:text-lg text-cyan-600 border-r-4 border-cyan-600 pr-2">תחומי דעת וטכנולוגיה 💻</h4>
                <div className="flex flex-wrap gap-2 pt-1">
                    {['רובוטיקה מתקדמת', 'תכנות Python', 'בניית קוד Micro:bit', 'מידול בתלת מימד Tinkercad', 'בינה מלאכותית (AI)', 'אלקטרוניקה שימושית'].map((s, i) => (
                        <span key={i} className="bg-cyan-50 text-cyan-700 font-bold text-xs px-2.5 py-1.5 rounded-full">{s}</span>
                    ))}
                </div>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-2xl border shadow-sm space-y-3 text-right">
                <h4 className="font-black text-base md:text-lg text-lime-600 border-r-4 border-lime-600 pr-2">מיומנויות המאה ה-21 🧠</h4>
                <div className="flex flex-wrap gap-2 pt-1">
                    {['למידה אוטונומית ועצמאית', 'חשיבה אלגוריתמית וביקורתית', 'פתרון בעיות מורכבות', 'עבודת צוות ושיתוף פעולה'].map((s, i) => (
                        <span key={i} className="bg-lime-50 text-lime-700 font-bold text-xs px-2.5 py-1.5 rounded-full">{s}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}
