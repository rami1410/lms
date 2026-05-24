import React from 'react';

export default function AboutView({ section, onBack }) {

    // התאמת צבעי רקע וגרדיאנטים עמוקים לכל דף בנפרד
    const getHeaderBgStyle = (sec) => {
        switch (sec) {
            case 'who_we_are': return "from-purple-950 via-slate-900 to-indigo-950 border-purple-500/20";
            case 'our_work': return "from-blue-950 via-slate-900 to-cyan-950 border-cyan-500/20";
            case 'skills': return "from-emerald-950 via-slate-900 to-teal-950 border-teal-500/20";
            case 'faq': return "from-amber-950 via-slate-900 to-orange-950 border-orange-500/20";
            case 'sitemap': return "from-zinc-950 via-slate-900 to-stone-900 border-slate-500/20";
            case 'catalog_spec': return "from-lime-950 via-slate-900 to-emerald-950 border-lime-500/20";
            case 'courses_track': return "from-violet-950 via-slate-900 to-fuchsia-950 border-fuchsia-500/20";
            case 'innovation_tour': return "from-cyan-950 via-slate-900 to-blue-950 border-blue-500/20";
            case 'workshops_spec': return "from-red-950 via-slate-900 to-rose-950 border-red-500/20";
            case 'stem_rooms': return "from-sky-950 via-slate-900 to-indigo-950 border-sky-500/20";
            case 'london_bett': return "from-teal-950 via-slate-900 to-indigo-950 border-indigo-500/20";
            default: return "from-purple-900 to-slate-900 border-purple-500/20";
        }
    };

    // רנדור הכותרת עם אפקט קווי מתאר שחורים בולטים (Text Stroke Effect)
    const renderHeader = (title, emoji, subtitle) => {
        const bgClasses = getHeaderBgStyle(section);
        return (
            <div className={`bg-gradient-to-r ${bgClasses} text-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border border-white/5`}>
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
                <div className="space-y-3 max-w-2xl text-center md:text-right relative z-10">
                    <h1 
                        className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight"
                        style={{
                            color: '#ffffff',
                            textShadow: '3px 3px 0 #000, -3px 3px 0 #000, 3px -3px 0 #000, -3px -3px 0 #000, 4px 4px 10px rgba(0,0,0,0.8)'
                        }}
                    >
                        {title}
                    </h1>
                    <p className="text-purple-200/90 font-bold text-sm md:text-lg">{subtitle}</p>
                </div>
                <span className="text-5xl md:text-6xl shrink-0 select-none relative z-10 drop-shadow-lg animate-pulse">{emoji}</span>
            </div>
        );
    };

    const renderContent = () => {
        switch (section) {
            case 'who_we_are':
                return (
                    <div className="space-y-6 animate-fade-in px-2 sm:px-0">
                        {renderHeader("אז מי אנחנו ?", "🤖", "סיפור המותג, החזון החינוכי והשילוב הבלעדי של טכנולוגיה ופדגוגיה.")}
                        <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border shadow-sm space-y-6 text-slate-700 leading-relaxed text-base md:text-lg font-medium text-right">
                            <p>חברת <strong className="text-cyan-600 font-black">חותם חיים מבית רובוטיקס</strong> הוקמה מתוך חזון ברור: להנגיש את פסגת החינוך הטכנולוגי לכל ילד וילדה בישראל, תוך שמירה על עקרונות של "טכנולוגיה עם נשמה".</p>
                            <p>אנו לא מסתפקים בהוראת תכנות יבש, אלא מפתחים פלטפורמות ומערכי שיעור מבוססי פרויקטים (PBL) המעודדים סקרנות, חשיבה יזמית, עבודת צוות ובעיקר - הפיכת התלמיד ללומד עצמאי ואוטונומי המסוגל להוביל את עצמו בעולם דינמי.</p>
                        </div>
                    </div>
                );

            case 'our_work':
                return (
                    <div className="space-y-6 animate-fade-in px-2 sm:px-0">
                        {renderHeader("קצת מהעשייה שלנו", "📊", "נתוני אימפקט, פריסה ארצית ותחנות מרכזיות בפעילות החינוכית לאורך השנים.")}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                            <div className="bg-white p-6 rounded-2xl border shadow-sm"><span className="text-3xl md:text-4xl font-black text-cyan-600 block mb-1">150+</span><span className="text-slate-500 font-bold text-xs md:text-sm">בתי ספר ומרחבי למידה פעילים</span></div>
                            <div className="bg-white p-6 rounded-2xl border shadow-sm"><span className="text-3xl md:text-4xl font-black text-lime-600 block mb-1">15,000+</span><span className="text-slate-500 font-bold text-xs md:text-sm">תלמידים מוסמכים מדי שנה</span></div>
                            <div className="bg-white p-6 rounded-2xl border shadow-sm"><span className="text-3xl md:text-4xl font-black text-orange-500 block mb-1">800+</span><span className="text-slate-500 font-bold text-xs md:text-sm">מורים ורכזים שעברו הכשרות</span></div>
                        </div>
                        <div className="bg-white p-6 md:p-8 rounded-[2rem] border shadow-sm space-y-4">
                            <h3 className="font-black text-lg md:text-xl text-orange-500 border-r-4 border-orange-500 pr-2">אבני דרך מרכזיות</h3>
                            <ul className="space-y-3 text-slate-600 font-medium list-disc list-inside pr-1 text-right text-sm md:text-base">
                                <li><strong>2021:</strong> השקת ערכות הרובוטיקה המודולריות הפיזיות הראשונות בשדה החינוך הציבורי.</li>
                                <li><strong>2023:</strong> אינטגרציה מלאה של כלי בינה מלאכותית (AI) מבוססי מחוללי תוכן חכמים במערכי הלמידה.</li>
                                <li><strong>2025:</strong> השקת מערכת ה-LMS הלומד העצמאי המאובטחת המשרתת עשרות רשויות מקומיות.</li>
                            </ul>
                        </div>
                    </div>
                );

            case 'skills':
                return (
                    <div className="space-y-6 animate-fade-in px-2 sm:px-0">
                        {renderHeader("מיומנויות ותחומי דעת", "🎯", "הכשרת דור העתיד למקצועות המחר ופיתוח כישורי המאה ה-21.")}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-6 md:p-8 rounded-2xl border shadow-sm space-y-3">
                                <h4 className="font-black text-base md:text-lg text-cyan-600">תחומי דעת וטכנולוגיה 💻</h4>
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {['רובוטיקה מתקדמת', 'תכנות Python', 'בניית קוד Micro:bit', 'מידול בתלת מימד Tinkercad', 'בינה מלאכותית (AI)', 'אלקטרוניקה שימושית'].map((s, i) => (
                                        <span key={i} className="bg-cyan-50 text-cyan-700 font-bold text-xs px-2.5 py-1.5 rounded-full">{s}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white p-6 md:p-8 rounded-2xl border shadow-sm space-y-3">
                                <h4 className="font-black text-base md:text-lg text-lime-600">מ
