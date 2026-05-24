import React from 'react';

export default function AboutView({ section, onBack }) {

    // פונקציית עזר לרינדור כותרת עליונה אחידה ומעוצבת לכל הדפים
    const renderHeader = (title, emoji, subtitle) => (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-900 text-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl text-center md:text-right">
                <h1 className="text-3xl md:text-4xl font-black tracking-tight">{title}</h1>
                <p className="text-purple-200 font-medium text-base md:text-lg">{subtitle}</p>
            </div>
            <span className="text-6xl shrink-0 select-none">{emoji}</span>
        </div>
    );

    // מנוע בחירת התוכן לפי הסטייט שהועבר מתוך התפריט
    const renderContent = () => {
        switch (section) {
            
            // ==================== קטגוריית אודותינו ====================
            
            case 'who_we_are':
                return (
                    <div className="space-y-8 animate-fade-in">
                        {renderHeader("אז מי אנחנו ?", "🤖", "סיפור המותג, החזון החינוכי והשילוב הבלעדי של טכנולוגיה ופדגוגיה.")}
                        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border shadow-sm space-y-6 text-slate-700 leading-relaxed text-lg font-medium text-right">
                            <p>חברת <strong className="text-purple-700 font-black">חותם חיים מבית רובוטיקס</strong> הוקמה מתוך חזון ברור: להנגיש את פסגת החינוך הטכנולוגי לכל ילד וילדה בישראל, תוך שמירה על עקרונות של "טכנולוגיה עם נשמה".</p>
                            <p>אנו לא מסתפקים בהוראת תכנות יבש, אלא מפתחים פלטפורמות ומערכי שיעור מבוססי פרויקטים (PBL) המעודדים סקרנות, חשיבה יזמית, עבודת צוות ובעיקר - הפיכת התלמיד ללומד עצמאי ואוטונומי המסוגל להוביל את עצמו בעולם דינמי.</p>
                        </div>
                    </div>
                );

            case 'our_work':
                return (
                    <div className="space-y-8 animate-fade-in">
                        {renderHeader("קצת מהעשייה שלנו", "📊", "נתוני אימפקט, פריסה ארצית ותחנות מרכזיות בפעילות החינוכית לאורך השנים.")}
                        <div className="grid sm:grid-cols-3 gap-6 text-center">
                            <div className="bg-white p-8 rounded-2xl border shadow-sm"><span className="text-4xl font-black text-purple-600 block mb-2">150+</span><span className="text-slate-500 font-bold text-sm">בתי ספר ומרחבי למידה פעילים</span></div>
                            <div className="bg-white p-8 rounded-2xl border shadow-sm"><span className="text-4xl font-black text-purple-600 block mb-2">15,000+</span><span className="text-slate-500 font-bold text-sm">תלמידים מוסמכים מדי שנה</span></div>
                            <div className="bg-white p-8 rounded-2xl border shadow-sm"><span className="text-4xl font-black text-purple-600 block mb-2">800+</span><span className="text-slate-500 font-bold text-sm">מורים ורכזים שעברו הכשרות</span></div>
                        </div>
                        <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-4">
                            <h3 className="font-black text-xl text-slate-800 border-r-4 border-purple-500 pr-2">אבני דרך מרכזיות</h3>
                            <ul className="space-y-3 text-slate-600 font-medium list-disc list-inside pr-2 text-right">
                                <li><strong>2021:</strong> השקת ערכות הרובוטיקה המודולריות הפיזיות הראשונות בשדה החינוך הציבורי בישראל.</li>
                                <li><strong>2023:</strong> אינטגרציה מלאה של כלי בינה מלאכותית (AI) מבוססי מחוללי תוכן חכמים במערכי הלמידה.</li>
                                <li><strong>2025:</strong> השקת מערכת ה-LMS הלומד העצמאי המאובטחת המשרתת עשרות רשויות מקומיות ברחבי הארץ.</li>
                            </ul>
                        </div>
                    </div>
                );

            case 'skills':
                return (
                    <div className="space-y-8 animate-fade-in">
                        {renderHeader("מיומנויות ותחומי דעת", "🎯", "הכשרת דור העתיד למקצועות המחר ופיתוח כישורי המאה ה-21.")}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-3">
                                <h4 className="font-black text-lg text-purple-700">תחומי דעת וטכנולוגיה 💻</h4>
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {['רובוטיקה מתקדמת', 'תכנות Python', 'בניית קוד Micro:bit', 'מידול בתלת מימד Tinkercad', 'בינה מלאכותית (AI)', 'אלקטרוניקה שימושית', 'חקר החלל ומדעים'].map((s, i) => (
                                        <span key={i} className="bg-purple-50 text-purple-700 font-bold text-xs px-3 py-1.5 rounded-full">{s}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-3">
                                <h4 className="font-black text-lg text-purple-700">מיומנויות המאה ה-21 🧠</h4>
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {['למידה אוטונומית ועצמאית', 'חשיבה אלגוריתמית וביקורתית', 'פתרון בעיות מורכבות בעולם האמיתי', 'עבודת צוות ושיתוף פעולה', 'חשיבה יזמית והמצאתית'].map((s, i) => (
                                        <span key={i} className="bg-slate-100 text-slate-700 font-bold text-xs px-3 py-1.5 rounded-full">{s}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'faq':
                return (
                    <div className="space-y-8 animate-fade-in">
                        {renderHeader("שאלות ותשובות", "❓", "כל מה שרציתם לדעת על הפעלת התוכניות, הרישיונות והתמיכה הפדגוגית של רובוטיקס.")}
                        <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border shadow-sm space-y-6 text-right">
                            {[
                                { q: "האם המערכת מאושרת על ידי משרד החינוך ?", a: "כן, כל תוכניות הלימוד, הקורסים הדיגיטליים וההכשרות הפדגוגיות של רובוטיקס מאושרים לחלוטין ומוכרים לשימוש בבתי ספר יסודיים וחטיבות ביניים בישראל." },
                                { q: "איך המורים יכולים לעקוב אחר התקדמות התלמידים ?", a: "דרך מערכת 'המצפן' הפנימית, המורים מקבלים לוח בקרה ואנליטיקות בזמן אמת, המציג בדיוק איזה שיעור כל תלמיד סיים, ציונים במבדקים וקצב ההתקדמות האישי." },
                                { q: "מה תפקידו של הבוט הצף (FloatingBot) במערכת ?", a: "הבוט מבוסס על מנוע ה-Gemini AI של גוגל ומתפקד כעוזר הוראה אישי צמוד, העונה לתלמידים על שאלות טכניות, מציג הסברים ועוזר להם לכתוב קוד תקין ללא עיכובים." }
                            ].map((item, i) => (
                                <div key={i} className="border-b border-slate-100 pb-5 last:border-0 last:pb-0">
                                    <h4 className="font-black text-purple-700 text-base mb-1">🔹 {item.q}</h4>
                                    <p className="text-slate-600 font-medium text-sm leading-relaxed">{item.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'sitemap':
                return (
                    <div className="space-y-8 animate-fade-in">
                        {renderHeader("מפת האתר והמערכת", "🗺️", "הצצה שקופה ומקצועית לארכיטקטורת הרכיבים והקוד של פלטפורמת LMS חותם חיים.")}
                        <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-6 text-right">
                            <h3 className="font-black text-xl text-slate-800 border-r-4 border-purple-500 pr-2">מפרט רכיבים הנדסי (Component Tree Spec)</h3>
                            <div className="grid sm:grid-cols-2 gap-4 text-xs font-mono">
                                <div className="bg-slate-50 p-4 rounded-xl border"><strong>App.js (core App logic)</strong><p className="text-slate-500 mt-1">מנוע הניתוב והסטייט הראשי המנהל את זרם הנתונים והאזנה ל-Firebase.</p></div>
                                <div className="bg-slate-50 p-4 rounded-xl border"><strong>CourseModal.js (smart course development)</strong><p className="text-slate-500 mt-1">חלונית פיתוח קורסים חכמה המשתמשת ב-AI לניסוח סילבוסים ותכנים פדגוגיים.</p></div>
                                <div className="bg-slate-50 p-4 rounded-xl border"><strong>CoursesDashboard.js (student course gallery)</strong><p className="text-slate-500 mt-1">לוח תצוגת הקורסים ללומד הכולל חיצי מיון דינמיים (▲▼) לטבלאות.</p></div>
                                <div className="bg-slate-50 p-4 rounded-xl border"><strong>CourseView.js (secure lesson player)</strong><p className="text-slate-500 mt-1">נגן שיעורים מאובטח הכולל מנגנון Crop ליוטיוב ונעילת Sandbox מפני יציאה חיצונית.</p></div>
                            </div>
                        </div>
                    </div>
                );

            // ==================== קטגוריית השירותים שלנו ====================
            
            case 'catalog_spec':
                return (
                    <div className="space-y-8 animate-fade-in">
                        {renderHeader("קטלוג מוצרים רשמי", "📦", "ערכות רובוטיקה פיזיות, רכיבי אלקטרוניקה, וחומרה ייעודית מבית רובוטיקס.")}
                        <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm text-center space-y-4">
                            <div className="text-4xl">📄</div>
                            <h3 className="text-xl font-black text-slate-800">הקטלוג הדיגיטלי המלא פתוח לעיון</h3>
                            <p className="text-slate-500 max-w-xl mx-auto font-medium text-sm">ערכות הציוד והאספקה שלנו מיוצרות ומותאמות במיוחד לפדגוגיה החדשנית בבתי הספר, ומאושרות לרכש על ידי רשויות ועיריות.</p>
                            <a href="https://heyzine.com/flip-book/426cdf50eb.html" target="_blank" rel="noreferrer" className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-black px-8 py-3 rounded-xl shadow-lg transition-transform hover:scale-105 text-sm">📖 פתח ספר קטלוג אינטראקטיבי בתרשימים</a>
                        </div>
                    </div>
                );

            case 'courses_track':
                return (
                    <div className="space-y-8 animate-fade-in">
                        {renderHeader("קורסים עם ובלי מדריכים", "🎓", "מסלולי למידה היברידיים מותאמים אישית (Self-Paced LMS vs Guided Tracks).")}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-2">
                                <h4 className="font-black text-base text-purple-700">👨‍🏫 קורסים בליווי מדריכים מקצועיים</h4>
                                <p className="text-slate-600 font-medium text-xs leading-relaxed">העברת מערכי שיעור פרונטליים, הפעלת סדנאות מייקרים בכיתות וליווי פדגוגי צמוד של צוות המדריכים המיומן של רובוטיקס לאורך כל השנה.</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-2">
                                <h4 className="font-black text-base text-purple-700">💻 קורסים דיגיטליים עצמאיים (LMS)</h4>
                                <p className="text-slate-600 font-medium text-xs leading-relaxed">למידה אוטונומית מוחלטת דרך פלטפורמת ה-LMS הלומד העצמאי. התלמידים מתקדמים באופן עצמאי בקצב שלהם ונתמכים על ידי בוט הבינה המלאכותית.</p>
                            </div>
                        </div>
                    </div>
                );

            case 'innovation_tour':
                return (
                    <div className="space-y-8 animate-fade-in">
                        {renderHeader("סיור במתחם החדשנות", "🏬", "הצצה וביקור חווייתי במרחב 'חלומציאות' ומתחמי המייקרים העתידניים של החברה.")}
                        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border shadow-sm flex flex-col items-center justify-center text-center space-y-4">
                            <div className="text-5xl">✨</div>
                            <h3 className="text-2xl font-black text-slate-800">מתחם 'חלומציאות' - הופכים דמיון למציאות</h3>
                            <p className="text-slate-600 max-w-2xl font-medium text-sm leading-relaxed">מתחם החדשנות של רובוטיקס מהווה אבן שואבת למנהלים, רכזים ותלמידים מכל רחבי הארץ. במתחם תוכלו לחוות סיורים לימודיים, התנסות מעשית במדפסות תלת-מימד, עמדות רובוטיקה מתקדמות, משקפי VR וסדנאות יצירה פדגוגיות ייחודיות.</p>
                            <a href="#contact" onClick={onBack} className="bg-slate-900 hover:bg-purple-600 text-white font-black px-6 py-3 rounded-xl transition-colors text-xs shadow-md">📅 תאם סיור פדגוגי למרכז שלך עכשיו</a>
                        </div>
                    </div>
                );

            case 'workshops_spec':
                return (
                    <div className="space-y-8 animate-fade-in">
                        {renderHeader("סדנאות וימי שיא פדגוגיים", "⚡", "האקתונים, ימי מדע מרוכזים, מרתוני תכנות ותחרויות רובוטיקה בית-ספריות.")}
                        <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-4 text-right">
                            <h3 className="font-black text-lg text-slate-800 border-r-4 border-purple-500 pr-2">אירועים חינוכיים מעוררי השראה</h3>
                            <p className="text-slate-600 text-sm font-medium leading-relaxed">ימי השיא והסדנאות המרוכזות של רובוטיקס שוברים את שגרת הלמידה המסורתית ומכניסים אנרגיה טכנולוגית עצומה לבתי הספר. התלמידים מתחרים בצוותים, פותרים אתגרי הנדסה מורכבים בזמן קצוב, ומציגים אבות-טיפוס של מוצרים חכמים בפני צוותי שיפוט מקצועיים.</p>
                        </div>
                    </div>
                );

            case 'stem_rooms':
                return (
                    <div className="space-y-8 animate-fade-in">
                        {renderHeader("עיצוב והקמת חדרי STEM", "📐", "תכנון ארכיטקטוני, מידול תלת-מימדי והקמה פיזית של מרחבי מייקרים עתידניים בבתי ספר.")}
                        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border shadow-sm space-y-6 text-right">
                            <p className="text-slate-700 leading-relaxed font-medium text-base">אנו ברובוטיקס מלווים את מוסדות החינוך והרשויות משלב רעיון הקמת מרחב ה-STEM ועד להרצה מלאה שלו. התהליך כולל תכנון פנים הנדסי-אדריכלי, התאמת ריהוט מודולרי, אספקת עמדות טכנולוגיות חכמות, התקנת הציוד והכשרת המורים להפעלת החדר בשגרה.</p>
                            <div className="grid sm:grid-cols-3 gap-4 pt-2">
                                <div className="bg-purple-50 p-4 rounded-xl border border-dashed border-purple-200 font-bold text-center text-xs text-purple-800">1. תכנון אדריכלי ומידול 3D</div>
                                <div className="bg-purple-50 p-4 rounded-xl border border-dashed border-purple-200 font-bold text-center text-xs text-purple-800">2. אספקת ריהוט וציוד קצה</div>
                                <div className="bg-purple-50 p-4 rounded-xl border border-dashed border-purple-200 font-bold text-center text-xs text-purple-800">3. הכשרת סגל המורים לחדר</div>
                            </div>
                        </div>
                    </div>
                );

            case 'london_bett':
                return (
                    <div className="space-y-8 animate-fade-in">
                        {renderHeader("משלחת BETT ללונדון", "🇬🇧", "חשיפה למגמות החינוך העולמיות המובילות, סיורי למידה וגילוי טכנולוגיות פורצות דרך בשותפות בינלאומית.")}
                        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 text-right">
                            <div className="space-y-4 max-w-2xl">
                                <h3 className="text-xl font-black text-slate-800">משלחות הלמידה הבינלאומיות של רובוטיקס</h3>
                                <p className="text-slate-600 font-medium text-sm leading-relaxed">חברת רובוטיקס גאה להוביל מנהלי אגפי חינוך, מנהלי בתי ספר ורכזים פדגוגיים למפגש פסגה בינלאומי בכנס הטכנולוגיה החינוכית הגדול בעולם - BETT בלונדון. המשלחת כוללת סיורים מודרכים, מפגשים עם אנשי חינוך מכל העולם, חשיפה לפיתוחי ה-AI החדשים ביותר ויצירת קשרים מקצועיים גלובליים.</p>
                            </div>
                            <span className="text-7xl shrink-0 select-none">✈️</span>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-assistant p-6 md:p-10 animate-fade-in" dir="rtl">
            <div className="max-w-5xl mx-auto space-y-10">
                {/* רינדור התוכן הדינמי שנבחר על ידי מנוע הדפים */}
                {renderContent()}
                
                {/* כפתור חזרה תחתון ומאובטח לנוחות הגלישה */}
                <div className="flex justify-center pt-4">
                    <button onClick={onBack} className="bg-slate-950 hover:bg-purple-600 text-white font-black px-10 py-3 rounded-full transition-colors text-sm shadow-xl hover:scale-105 duration-300">
                        ← חזרה לעמוד הקודם
                    </button>
                </div>
            </div>
        </div>
    );
}
