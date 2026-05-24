import React from 'react';

export default function AboutServices({ track }) {
    const catalogUrl = "https://heyzine.com/flip-book/426cdf50eb.html";

    switch (track) {
        case 'catalog_spec':
            return (
                <div className="bg-white p-6 md:p-8 rounded-[2rem] border shadow-sm text-center space-y-4 animate-fade-in">
                    <div className="text-3xl">📄</div>
                    <h3 className="text-lg md:text-xl font-black text-lime-600">הקטלוג הדיגיטלי המלא פתוח לעיון</h3>
                    <p className="text-slate-500 max-w-xl mx-auto font-medium text-xs md:text-sm">ערכות הציוד והאספקה שלנו מיוצרות ומותאמות במיוחד לפדגוגיה החדשנית בבתי הספר, ומאושרות לרכש על ידי רשויות ועיריות.</p>
                    <a href={catalogUrl} target="_blank" rel="noreferrer" className="inline-block bg-cyan-600 hover:bg-cyan-700 text-white font-black px-6 py-2.5 rounded-xl shadow-lg text-xs md:text-sm">📖 פתח ספר קטלוג אינטראקטיבי בתרשימים</a>
                </div>
            );
        case 'courses_track':
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                    <div className="bg-white p-5 rounded-xl border shadow-sm space-y-2 text-right">
                        <h4 className="font-black text-sm md:text-base text-orange-500">👨‍🏫 קורסים בליווי מדריכים מקצועיים</h4>
                        <p className="text-slate-600 font-medium text-xs leading-relaxed">העברת מערכי שיעור פרונטליים, הפעלת סדנאות מייקרים בכיתות וליווי פדגוגי צמוד של צוות המדריכים המיומן של רובוטיקס לאורך כל השנה.</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl border shadow-sm space-y-2 text-right">
                        <h4 className="font-black text-sm md:text-base text-cyan-600">💻 קורסים דיגיטליים עצמאיים (LMS)</h4>
                        <p className="text-slate-600 font-medium text-xs leading-relaxed">למידה אוטונומית מוחלטת דרך פלטפורמת ה-LMS הלומד העצמאי. התלמידים מתקדמים באופן עצמאי בקצב שלהם ונתמכים על ידי בוט הבינה המלאכותית.</p>
                    </div>
                </div>
            );
        case 'innovation_tour':
            return (
                <div className="bg-white p-6 md:p-10 rounded-[2rem] border shadow-sm flex flex-col items-center justify-center text-center space-y-4 animate-fade-in">
                    <div className="text-4xl">✨</div>
                    <h3 className="text-xl md:text-2xl font-black text-amber-500">מתחם 'חלומציאות' - הופכים דמיון למציאות</h3>
                    <p className="text-slate-600 max-w-xl mx-auto font-medium text-xs md:text-sm leading-relaxed">מתחם החדשנות של רובוטיקס מהווה אבן שואבת למנהלים, רכזים ותלמידים מכל רחבי הארץ. במתחם תוכלו לחוות סיורים לימודיים, התנסות מעשית במדפסות תלת-מימד, עמדות רובוטיקה מתקדמות, משקפי VR וסדנאות יצירה פדגוגיות ייחודיות.</p>
                </div>
            );
        case 'workshops_spec':
            return (
                <div className="bg-white p-6 md:p-8 rounded-[2rem] border shadow-sm space-y-4 text-right animate-fade-in">
                    <h3 className="font-black text-base md:text-lg text-orange-500 border-r-4 border-orange-500 pr-2">אירועים חינוכיים מעוררי השראה</h3>
                    <p className="text-slate-600 text-xs md:text-sm font-medium leading-relaxed">ימי השיא והסדנאות המרוכזות של רובוטיקס שוברים את שגרת הלמידה המסורתית ומכניסים אנרגיה טכנולוגית עצומה לבתי הספר. התלמידים מתחרים בצוותים, פותרים אתגרי הנדסה מורכבים בזמן קצוב, ומציגים אבות-טיפוס של מוצרים חכמים בפני צוותי שיפוט מקצועיים.</p>
                </div>
            );
        case 'stem_rooms':
            return (
                <div className="bg-white p-6 md:p-8 rounded-[2rem] border shadow-sm space-y-4 text-right animate-fade-in">
                    <p className="text-slate-700 leading-relaxed font-medium text-sm md:text-base">אנו ברובוטיקס מלווים את מוסדות החינוך והרשויות משלב רעיון הקמת מרחב ה-STEM ועד להרצה מלאה שלו. התהליך כולל תכנון פנים הנדסי-אדריכלי, התאמת ריהוט מודולרי, אספקת עמדות טכנולוגיות חכמות, התקנת הציוד והכשרת המורים להפעלת החדר בשגרה.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                        <div className="bg-cyan-50 p-3 rounded-xl border border-dashed border-cyan-200 font-bold text-center text-xs text-cyan-800">1. תכנון אדריכלי ומידול 3D</div>
                        <div className="bg-lime-50 p-3 rounded-xl border border-dashed border-lime-200 font-bold text-center text-xs text-lime-800">2. אספקת ריהוט וציוד קצה</div>
                        <div className="bg-orange-50 p-3 rounded-xl border border-dashed border-orange-200 font-bold text-center text-xs text-orange-800">3. הכשרת סגל המורים לחדר</div>
                    </div>
                </div>
            );
        case 'london_bett':
            return (
                <div className="bg-white p-6 md:p-10 rounded-[2rem] border shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 text-right animate-fade-in">
                    <div className="space-y-3 max-w-2xl">
                        <h3 className="text-xl font-black text-cyan-600">משלחות הלמידה הבינלאומיות של רובוטיקס</h3>
                        <p className="text-slate-600 font-medium text-xs md:text-sm leading-relaxed">חברת רובוטיקס גאה להוביל מנהלי אגפי חינוך, מנהלי בתי ספר ורכזים פדגוגיים למפגש פסגה בינלאומי בכנס הטכנולוגיה החינוכית הגדול בעולם - BETT בלונדון. המשלחת כוללת סיורים מודרכים, מפגשים עם אנשי חינוך מכל העולם, חשיפה לפיתוחי ה-AI החדשים ביותר ויצירת קשרים מקצועיים גלובליים.</p>
                    </div>
                    <span className="text-6xl shrink-0 select-none hidden md:block">✈️</span>
                </div>
            );
        default:
            return null;
    }
}
