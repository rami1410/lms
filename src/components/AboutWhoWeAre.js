import React from 'react';

export default function AboutWhoWeAre() {
    return (
        <div className="bg-white p-6 md:p-10 rounded-[2rem] shadow-sm border space-y-6 text-slate-700 leading-relaxed text-sm md:text-lg font-medium text-right animate-fade-in">
            <h3 className="text-xl md:text-2xl font-black text-cyan-600 border-r-4 border-cyan-600 pr-3">הסיפור מאחורי הטכנולוגיה</h3>
            <p>חברת <strong className="text-cyan-600 font-black">חותם חיים מבית רובוטיקס</strong> הוקמה מתוך חזון ברור: להנגיש את פסגת החינוך הטכנולוגי לכל ילד וילדה בישראל, תוך שמירה על עקרונות של "טכנולוגיה עם נשמה".</p>
            <p>אנו לא מסתפקים בהוראת תכנות יבש, אלא מפתחים פלטפורמות ומערכי שיעור מבוססי פרויקטים (PBL) המעודדים סקרנות, חשיבה יזמית, עבודת צוות ובעיקר - הפיכת התלמיד ללומד עצמאי ואוטונומי המסוגל להוביל את עצמו בעולם דינמי.</p>
        </div>
    );
}
