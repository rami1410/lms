import React from 'react';

export default function AboutView({ onBack }) {
    // כאן תוכל להחליף את הקישורים הללו בעתיד בקישורים האמיתיים מתוך ה-Firebase Storage שלך
    const filesForDownload = [
        { id: 1, title: '📄 פרופיל חברה רשמי - חותם חיים', description: 'מידע עסקי, ח.פ, אישורים פדגוגיים ומידע כללי.', url: '#' },
        { id: 2, title: '📁 קטלוג תוכניות לימוד ומסלולים', description: 'סילבוס מלא ופירוט הקורסים (מיקרוביט, תלת-מימד, FLL ועוד).', url: '#' },
        { id: 3, title: '📜 מכתבי המלצה ותעודות הוקרה', description: 'ריכוז המלצות ממנהלי בתי ספר, עיריות ורשויות מקומיות.', url: '#' }
    ];

    const timelineEvents = [
        { year: '2021', title: 'הקמת "חותם חיים מבית רובוטיקס"', desc: 'השקת ערכות הרובוטיקה הפיזיות הראשונות וכניסה ל-10 בתי ספר חלוצים.' },
        { year: '2023', title: 'מהפכת ה-AI והפדגוגיה הדיגיטלית', desc: 'שילוב כלי בינה מלאכותית ומחוללי תוכן מתקדמים בתוכניות הלימוד השנתיות.' },
        { year: '2025', title: 'השקת פלטפורמת ה-LMS הלומד העצמאי', desc: 'מעבר למערכת למידה מתקדמת ומאובטחת המשרתת אלפי תלמידים ומורים ברחבי הארץ.' }
    ];

    return (
        <div dir="rtl" className="min-h-screen bg-slate-50 font-assistant p-8 md:p-12 animate-fade-in">
            <div className="max-w-5xl mx-auto space-y-12">
                
                {/* כפתור חזרה עליון */}
                <div className="flex justify-between items-center">
                    <button onClick={onBack} className="bg-white text-purple-600 border border-purple-200 px-6 py-2 rounded-xl font-black shadow-sm hover:bg-purple-50 transition-all flex items-center gap-2">
                        ← חזרה לדף הראשי
                    </button>
                    <span className="text-sm font-bold text-slate-400">אודות חותם חיים מבית רובוטיקס</span>
                </div>

                {/* באנר כותרת ראשי */}
                <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden text-center md:text-right flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-4 max-w-2xl">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight">חותם חיים מבית רובוטיקס</h1>
                        <p className="text-lg text-purple-200 font-medium">מובילים את חזית החינוך הטכנולוגי והפדגוגיה החדשנית בישראל. מכשירים את דור העתיד למיומנויות המאה ה-21 באמצעות למידה חווייתית ועצמאית.</p>
                    </div>
                    <div className="text-7xl shrink-0 select-none animate-bounce duration-1000">🚀</div>
                </div>

                {/* חזון וערכים בקצר */}
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-4">
                        <div className="text-3xl">🎯</div>
                        <h3 className="text-2xl font-black text-slate-800">החזון שלנו</h3>
                        <p className="text-slate-600 font-medium leading-relaxed">אנו מאמינים שכל ילד וילדה בישראל ראויים לגישה לכלים הטכנולוגיים המתקדמים ביותר. השילוב בין רובוטיקה, תכנות ובינה מלאכותית מאפשר לנו להפוך את הלמידה הפסיבית לחוויית יצירה אקטיבית, המפתחת חשיבה ביקורתית, פתרון בעיות מורכבות ויכולת הובלה עצמית.</p>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-4">
                        <div className="text-3xl">💎</div>
                        <h3 className="text-2xl font-black text-slate-800">הערך הפדגוגי</h3>
                        <p className="text-slate-600 font-medium leading-relaxed">התוכניות שלנו אינן רק טכנולוגיות – הן ממוקדות בלומד. דרך פלטפורמת הלמידה הדיגיטלית המאובטחת שפיתחנו, המורים מקבלים מעקב מקיף בזמן אמת, והתלמידים נהנים ממסלולי התקדמות מותאמים אישית (Gamification), למידה מבוססת פרויקטים (PBL) ותכנים מעוררי השראה.</p>
                    </div>
                </div>

                {/* ציר זמן ופעילות לאורך השנים */}
                <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-slate-100 space-y-8">
                    <div className="text-center max-w-md mx-auto">
                        <h2 className="text-3xl font-black text-slate-800">הפעילות החינוכית שלנו</h2>
                        <p className="text-slate-400 font-bold text-sm mt-1">צמיחה, חדשנות ואימפקט מתמשך לאורך השנים</p>
                    </div>
                    
                    <div className="relative border-r-2 border-purple-100 mr-4 md:mr-8 space-y-8 py-2">
                        {timelineEvents.map((event, index) => (
                            <div key={index} className="relative pr-8 group">
                                {/* נקודת ציר הזמן */}
                                <div className="absolute -right-[9px] top-1.5 w-4 h-4 bg-purple-600 rounded-full border-4 border-white shadow transition-transform group-hover:scale-125 z-10" />
                                <div className="space-y-1">
                                    <span className="text-purple-600 font-black text-xl font-mono">{event.year}</span>
                                    <h4 className="text-lg font-black text-slate-800">{event.title}</h4>
                                    <p className="text-slate-500 font-medium text-sm max-w-3xl leading-relaxed">{event.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* מרכז הורדות וקבצים רשמיים */}
                <div className="space-y-4">
                    <div className="text-right">
                        <h2 className="text-2xl font-black text-slate-800">📁 מרכז מידע וקבצים להורדה</h2>
                        <p className="text-slate-400 font-bold text-xs mt-0.5">חומרים רשמיים, קטלוגים ומסמכי חברה לעיון מוסדות ורשויות</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                        {filesForDownload.map(file => (
                            <div key={file.id} className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col shadow-sm hover:shadow-md transition-all hover:border-purple-300">
                                <h4 className="font-black text-slate-800 mb-1 text-base line-clamp-1">{file.title}</h4>
                                <p className="text-slate-500 text-xs font-medium mb-6 line-clamp-2 leading-relaxed">{file.description}</p>
                                <a 
                                    href={file.url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="mt-auto w-full bg-slate-900 text-white hover:bg-purple-600 py-2.5 rounded-xl font-black text-xs text-center transition-colors shadow-sm"
                                >
                                    📥 פתח / הורד מסמך
                                </a>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
