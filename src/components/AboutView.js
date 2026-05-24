import React from 'react';

const BELLS_LOGO = "https://i.postimg.cc/mrzcZWpL/lwgw-hwtm-mwnps.gif";

export default function AboutView({ section, onBack }) {

    // פונקציית עזר חכמה להתאמת רקע קולנועי לכל תחום בנפרד
    const getHeaderBgStyle = (sec) => {
        switch (sec) {
            case 'who_we_are': // רובוטיקה וחזון
                return "from-purple-950 via-slate-900 to-indigo-950 border-purple-500/20";
            case 'our_work': // אימפקט ונתונים
                return "from-blue-950 via-slate-900 to-cyan-950 border-cyan-500/20";
            case 'skills': // מיומנויות
                return "from-emerald-950 via-slate-900 to-teal-950 border-teal-500/20";
            case 'faq': // שאלות ותשובות
                return "from-amber-950 via-slate-900 to-orange-950 border-orange-500/20";
            case 'sitemap': // מפת קוד וטכנולוגיה
                return "from-zinc-950 via-slate-900 to-stone-900 border-slate-500/20";
            case 'catalog_spec': // ציוד ואספקה
                return "from-lime-950 via-slate-900 to-emerald-950 border-lime-500/20";
            case 'courses_track': // קורסים ולמידה
                return "from-violet-950 via-slate-900 to-fuchsia-950 border-fuchsia-500/20";
            case 'innovation_tour': // חלומציאות וסיורים
                return "from-cyan-950 via-slate-900 to-blue-950 border-blue-500/20";
            case 'workshops_spec': // האקתונים וימי שיא
                return "from-red-950 via-slate-900 to-rose-950 border-red-500/20";
            case 'stem_rooms': // עיצוב ארכיטקטוני
                return "from-sky-950 via-slate-900 to-indigo-950 border-sky-500/20";
            case 'london_bett': // משלחת בינלאומית
                return "from-teal-950 via-slate-900 to-indigo-950 border-indigo-500/20";
            default:
                return "from-purple-900 to-slate-900 border-purple-500/20";
        }
    };

    // רנדור פאנל עליון עם כיתוב לבן, מסגרת שחורה עבה ורקע נושאי מותאם
    const renderHeader = (title, emoji, subtitle) => {
        const bgClasses = getHeaderBgStyle(section);
        
        return (
            <div className={`bg-gradient-to-r ${bgClasses} text-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border border-white/5`}>
                
                {/* אלמנטים גרפיים מופשטים ברקע ליצירת עומק טכנולוגי */}
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
                <div className="absolute -left-10 -top-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="space-y-4 max-w-2xl text-center md:text-right relative z-10">
                    {/* כיתוב לבן עם מסגרת שחורה עבה במיוחד למניעת היבלעות ברקע */}
                    <h1 
                        className="text-4xl md:text-5xl font-black tracking-tight select-none"
                        style={{
                            color: '#ffffff',
                            textShadow: '3px 3px 0 #000, -3px 3px 0 #000, 3px -3px 0 #000, -3px -3px 0 #000, 4px 4px 10px rgba(0,0,0,0.8)'
                        }}
                    >
                        {title}
                    </h1>
                    <p className="text-purple-200/90 font-bold text-base md:text-lg">{subtitle}</p>
                </div>
                <span className="text-6xl shrink-0 select-none relative z-10 drop-shadow-lg animate-pulse">{emoji}</span>
            </div>
        );
    };

    const renderContent = () => {
        switch (section) {
            
            case 'who_we_are':
                return (
                    <div className="space-y-8 animate-fade-in">
                        {renderHeader("אז מי אנחנו ?", "🤖", "סיפור המותג, החזון החינוכי והשילוב הבלעדי של טכנולוגיה ופדגוגיה.")}
                        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border shadow-sm space-y-6 text-slate-700 leading-relaxed text-lg font-medium text-right">
                            <p>חברת <strong className="text-cyan-600 font-black">חותם חיים מבית רובוטיקס</strong> הוקמה מתוך חזון ברור: להנגיש את פסגת החינוך הטכנולוגי לכל ילד וילדה בישראל, תוך שמירה על עקרונות של "טכנולוגיה עם נשמה".</p>
                            <p>אנו לא מסתפקים בהוראת תכנות יבש, אלא מפתחים פלטפורמות ומערכי שיעור מבוססי פרויקטים (PBL) המעודדים סקרנות, חשיבה יזמית, עבודת צוות ובעיקר - הפיכת התלמיד ללומד עצמאי ואוטונומי המסוגל להוביל את עצמו בעולם דינמי.</p>
                        </div>
                    </div>
                );

            case 'our_work':
                return (
                    <div className="space-y-8 animate-fade-in">
                        {renderHeader("קצת מהעשייה שלנו", "📊", "נתוני אימפקט, פריסה ארצית ותחנות מרכזיות בפעילות החינוכית לאורך השנים.")}
                        <div className="grid sm:grid-cols-3 gap-6 text-center">
                            <div className="bg-white p-8 rounded-2xl border shadow-sm"><span className="text-4xl font-black text-cyan-600 block mb-2">150+</span><span className="text-slate-500 font-bold text-sm">בתי ספר ומרחבי למידה פעילים</span></div>
                            <div className="bg-white p-8 rounded-2xl border shadow-sm"><span className="text-4xl font-black text-lime-600 block mb-2">15,000+</span><span className="text-slate-500 font-bold text-sm">תלמידים מוסמכים מדי שנה</span></div>
                            <div className="bg-white p-8 rounded-2xl border shadow-sm"><span className="text-4xl font-black text-orange-500 block mb-2">800+</span><span className="text-slate-500 font-bold text-sm">מורים ורכזים שעברו הכשרות</span></div>
                        </div>
                        <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-4">
                            {/* תת כותרת בצבע כתום של הלוגו */}
                            <h3 className="font-black text-xl text-orange-500 border-r-4 border-orange-500 pr-2">אבני דרך מרכזיות</h3>
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
                                {/* תת כותרת בצבע טורקיז של הלוגו */}
                                <h4 className="font-black text-lg text-cyan-600">תחומי דעת וטכנולוגיה 💻</h4>
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {['רובוטיקה מתקדמת', 'תכנות Python', 'בניית קוד Micro:bit', 'מידול בתלת מימד Tinkercad', 'בינה מלאכותית (AI)', 'אלקטרוניקה שימושית', 'חקר החלל ומדעים'].map((s, i) => (
                                        <span key={i} className="bg-cyan-50 text-cyan-700 font-bold text-xs px-3 py-1.5 rounded-full">{s}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-3">
                                {/* תת כותרת בצבע ירוק של הלוגו */}
                                <h4 className="font-black text-lg text-lime-600">מיומנויות המאה ה-21 🧠</h4>
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {['למידה אוטונומית ועצמאית', 'חשיבה אלגוריתמית וביקורתית', 'פתרון בעיות מורכבות בעולם האמיתי', 'עבודת צוות ושיתוף פעולה', 'חשיבה יזמית והמצאתית'].map((s, i) => (
                                        <span key={i} className="bg-lime-50 text-lime-700 font-bold text-xs px-3 py-1.5 rounded-full">{s}</span>
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
                            ].map((item, i) => {
                                // מחזוריות צבעים דינמית לתתי הכותרות לפי צבעי המותג
                                const colors = ['text-cyan-600', 'text-lime-600', 'text-orange-500'];
                                return (
                                    <div key={i} className="border-b border-slate-100 pb-5 last:border-0 last:pb-0">
                                        <h4 className={`font-black ${colors[i % colors.length]} text-base mb-1`}>🔹 {item.q}</h4>
                                        <p className="text-slate-600 font-medium text-sm leading-relaxed">{item.a}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );

            case 'sitemap':
                return (
                    <div className="space-y-8 animate-fade-in">
                        {renderHeader("מפת האתר והמערכת", "🗺️", "הצצה שקופה ומקצועית לארכיטקטורת הרכיבים והקוד של פלטפורמת LMS חותם חיים.")}
                        <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-6 text-right">
                            {/* תת כותרת בצבע טורקיז של הלוגו */}
                            <h3 className="font-black text-xl text-cyan-600 border-r-4 border-cyan-600 pr-2">מפרט רכיבים הנדסי (Component Tree Spec)</h3>
                            <div className="grid sm:grid-cols-2 gap-4 text-xs font-mono">
                                <div className="bg-slate-50 p-4 rounded-xl border"><strong>App.js (core App logic)</strong><p className="text-slate-500 mt-1">מנוע הניתוב והסטייט הראשי המנהל את זרם הנתונים והאזנה ל-Firebase.</p></div>
                                <div className="bg-slate-50 p-4 rounded-xl border"><strong>CourseModal.js (smart course development)</strong><p className="text-slate-500 mt-1">חלונית פיתוח קורסים חכמה המשתמשת ב-AI לניסוח סילבוסים ותכנים פדגוגיים.</p></div>
                                <div className="bg-slate-50 p-4 rounded-xl border"><strong>CoursesDashboard.js (student course gallery)</strong><p className="text-slate-500 mt-1">לוח תצוגת הקורסים ללומד הכולל חיצי מיון דינמיים (▲▼) לטבלאות.</p></div>
                                <div className="bg-slate-50 p-4 rounded-xl border"><strong>CourseView.js (secure lesson player)</strong><p className="text-slate-500 mt-1">נגן שיעורים מאובטח הכולל מנגנון Crop ליוטיוב ונעילת Sandbox מפני יציאה חיצונית.</p></div>
                            </div>
                        </div>
                    </div>
                );

            case 'catalog_spec':
                return (
                    <div className="space-y-8 animate-fade-in">
                        {renderHeader("קטלוג מוצרים רשמי", "📦", "ערכות רובוטיקה פיזיות, רכיבי אלקטרוניקה, וחומרה ייעודית מבית רובוטיקס.")}
                        <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm text-center space-y-4">
                            <div className="text-4xl">📄</div>
                            {/* תת כותרת בצבע ירוק של הלוגו */}
                            <h3 className="text-xl font-black text-lime-600">הקטלוג הדיגיטלי המלא פתוח לעיון</h3>
                            <p className="text-slate-500 max-w-xl mx-auto font-medium text-sm">ערכות הציוד והאספקה שלנו מיוצרות ומותאמות במיוחד לפדגוגיה החדשנית בבתי הספר, ומאושרות לרכש על ידי רשויות ועיריות.</p>
                            <a href="https://heyzine.com/flip-book/426cdf50eb.html" target="_blank" rel="noreferrer" className="inline-block bg-cyan-600 hover:bg-cyan-700 text-white font-black px-8 py-3 rounded-xl shadow-lg transition-transform hover:scale-105 text-sm">📖 פתח ספר קטלוג אינטראקטיבי בתרשימים</a>
                        </div>
                    </div>
                );

            case 'courses_track':
                return (
                    <div className="space-y-8 animate-fade-in">
                        {renderHeader("קורסים עם ובלי מדריכים", "🎓", "מסלולי למידה היברידיים מותאמים אישית (Self-Paced LMS vs Guided Tracks).")}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-2">
                                {/* תת כותרת בצבע כתום של הלוגו */}
                                <h4 className="font-black text-base text-orange-500">👨‍🏫 קורסים בליווי מדריכים מקצועיים</h4>
                                <p className="text-slate-600 font-medium text-xs leading-relaxed">העברת מערכי שיעור פרונטליים, הפעלת סדנאות מייקרים בכיתות וליווי פדגוגי צמוד של צוות המדריכים המיומן של רובוטיקס לאורך כל השנה.</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-2">
                                {/* תת כותרת בצבע טורקיז של הלוגו */}
                                <h4 className="font-black text-base text-cyan-600">💻 קורסים דיגיטליים עצמאיים (LMS)</h4>
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
                            {/* תת כותרת בצבע צהוב של הלוגו */}
                            <h3 className="text-2xl font-black text-amber-500">מתחם 'חלומציאות' - הופכים דמיון למציאות</h3>
                            <p className="text-slate-600 max-w-2xl font-medium text-sm leading-relaxed">מתחם החדשנות של רובוטיקס מהווה אבן שואבת למנהלים, רכזים ותלמידים מכל רחבי הארץ. במתחם תוכלו לחוות סיורים לימודיים, התנסות מעשית במדפסות תלת-מימד, עמדות רובוטיקה מתקדמות, משקפי VR וסדנאות יצירה פדגוגיות ייחודיות.</p>
                            <a href="#contact" onClick={onBack} className="bg-slate-900 hover:bg-cyan-600 text-white font-black px-6 py-3 rounded-xl transition-colors text-xs shadow-md">📅 תאם סיור פדגוגי למרכז שלך עכשיו</a>
                        </div>
                    </div>
                );

            case 'workshops_spec':
                return (
                    <div className="space-y-8 animate-fade-in">
                        {renderHeader("סדנאות וימי שיא פדגוגיים", "⚡", "האקתונים, ימי מדע מרוכזים, מרתוני תכנות ותחרויות רובוטיקה בית-ספריות.")}
                        <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-4 text-right">
                            {/* תת כותרת בצבע כתום של הלוגו */}
                            <h3 className="font-black text-lg text-orange-500 border-r-4 border-orange-500 pr-2">אירועים חינוכיים מעוררי השראה</h3>
                            <p className="text-slate-600 text-sm font-medium leading-relaxed">ימי השיא והסדנאות המרוכזות של רובוטיקס שוברים את שגרת הלמידה המסורתית ומכניסים אנרגיה טכנולוגית עצומה לבתי הספר. התלמידים מתחרים בצוותים, פותרים אתגרי הנדסה מורכבים בזמן קצוב, ומציגים אבות-טיפוס של מוצרים חכמים בפני צוותי שיפוט מקצועיים.</p>
                        </div>
                    </div>
                );

            case 'stem_rooms':
                return (
                    <div className="space-y-8 animate-fade-in">
                        {renderHeader("עיצוב והקמת חדרי STEM", "📐", "תכנון ארכיטקטוני, מידול תלת-מימדי והקמה פיזית של מרחבי מייקרים עתידניים בבתי ספר.")}
                        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border shadow-sm space-y-6 text-right">
                            <p className="text-slate-700 leading-relaxed font-medium text-base">אנו ברובוטיקס מלווים את מוסדות החינוך והרשויות משלב רעיון הקמר מרחב ה-STEM ועד להרצה מלאה שלו. התהליך כולל תכנון פנים הנדסי-אדריכלי, התאמת ריהוט מודולרי, אספקת עמדות טכנולוגיות חכמות, התקנת הציוד והכשרת המורים להפעלת החדר בשגרה.</p>
                            <div className="grid sm:grid-cols-3 gap-4 pt-2">
                                <div className="bg-cyan-50 p-4 rounded-xl border border-dashed border-cyan-200 font-bold text-center text-xs text-cyan-800">1. תכנון אדריכלי ומידול 3D</div>
                                <div className="bg-lime-50 p-4 rounded-xl border border-dashed border-lime-200 font-bold text-center text-xs text-lime-800">2. אספקת ריהוט וציוד קצה</div>
                                <div className="bg-orange-50 p-4 rounded-xl border border-dashed border-orange-200 font-bold text-center text-xs text-orange-800">3. הכשרת סגל המורים לחדר</div>
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
                                {/* תת כותרת בצבע טורקיז של הלוגו */}
                                <h3 className="text-xl font-black text-cyan-600">משלחות הלמידה הבינלאומיות של רובוטיקס</h3>
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
                {renderContent()}
                
                <div className="flex justify-center pt-4">
                    <button onClick={onBack} className="bg-slate-950 hover:bg-cyan-600 text-white font-black px-10 py-3 rounded-full transition-colors text-sm shadow-xl hover:scale-105 duration-300">
                        ← חזרה לעמוד הקודם
                    </button>
                </div>
            </div>
        </div>
    );
}
