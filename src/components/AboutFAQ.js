import React from 'react';

export default function AboutFAQ() {
    const faqItems = [
        { q: "האם המערכת מאושרת על ידי משרד החינוך ?", a: "כן, כל תוכניות הלימוד, הקורסים הדיגיטליים וההכשרות הפדגוגיות של רובוטיקס מאושרים לחלוטין ומוכרים לשימוש בבתי ספר יסודיים וחטיבות ביניים בישראל." },
        { q: "איך המורים יכולים לעקוב אחר התקדמות התלמידים ?", a: "דרך מערכת 'המצפן' הפנימית, המורים מקבלים לוח בקרה ואנליטיקות בזמן אמת, המציג בדיוק איזה שיעור כל תלמיד סיים, ציונים במבדקים וקצב ההתקדמות האישי." },
        { q: "מה תפקידו של הבוט הצף (FloatingBot) במערכת ?", a: "הבוט מבוסס על מנוע ה-Gemini AI של גוגל ומתפקד כעוזר הוראה אישי צמוד, העונה לתלמידים על שאלות טכניות, מציג הסברים ועוזר להם לכתוב קוד תקין ללא עיכובים." }
    ];

    return (
        <div className="bg-white p-5 md:p-10 rounded-[2rem] border shadow-sm space-y-6 text-right animate-fade-in">
            {faqItems.map((item, i) => {
                const colors = ['text-cyan-600', 'text-lime-600', 'text-orange-500'];
                return (
                    <div key={i} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                        <h4 className={`font-black ${colors[i % colors.length]} text-sm md:text-base mb-1`}>🔹 {item.q}</h4>
                        <p className="text-slate-600 font-medium text-xs md:text-sm leading-relaxed">{item.a}</p>
                    </div>
                );
            })}
        </div>
    );
}
