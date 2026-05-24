import React from 'react';

// כתובת לוגו הפעמונים הסגול למיתוג הדף
const BELLS_LOGO = "https://i.postimg.cc/mrzcZWpL/lwgw-hwtm-mwnps.gif";

export default function AboutView({ onBack }) {
    return (
        <div className="min-h-screen bg-slate-50 font-assistant p-8 md:p-12 animate-fade-in" dir="rtl">
            <div className="max-w-6xl mx-auto space-y-16">
                
                {/* כפתור חזרה מעוצב */}
                <div className="flex justify-between items-center">
                    <button onClick={onBack} className="bg-white text-purple-600 border border-purple-200 px-6 py-2 rounded-xl font-black shadow-sm hover:bg-purple-50 transition-all flex items-center gap-2">
                        ← חזרה לדף הבית
                    </button>
                    <span className="text-sm font-bold text-slate-400">אודות חותם חיים מבית רובוטיקס</span>
                </div>

                {/* באנר כותרת ראשי */}
                <div className="bg-gradient-to-r from-purple-800 to-slate-900 text-white rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-4 max-w-2xl">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight">חותם חיים מבית רובוטיקס</h1>
                        <p className="text-lg text-purple-200 font-medium">מובילים את חזית החינוך הטכנולוגי והחדשנות בישראל. מכשירים את דור העתיד למיומנויות המאה ה-21 באמצעות למידה חווייתית.</p>
                    </div>
                    <img src={BELLS_LOGO} alt="לוגו חותם חיים" className="h-32 w-32 object-contain shrink-0" />
                </div>

                {/* --- אזור 1: אודות המקורי + מפת האתר --- */}
                <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-slate-100 space-y-10">
                    <div className="text-center max-w-xl mx-auto">
                        <div className="text-4xl mb-4">🏠</div>
                        <h2 className="text-3xl font-black text-slate-800">אז מי אנחנו?</h2>
                        <p className="text-slate-500 font-medium text-sm">סיפור המותג, החזון והביצוע הטכנולוגי-פדגוגי.</p>
                    </div>
                    
                    <div className="space-y-6 text-slate-700 leading-relaxed max-w-4xl mx-auto text-lg font-medium text-right">
                        <p>
                            אנחנו ב<strong className="font-bold text-purple-700">חותם חיים מבית רובוטיקס</strong> מאמינים ש"טכנולוגיה עם נשמה" היא לא רק סיסמה, אלא מציאות פדגוגית. החברה מובילה בישראל בחדשנות חינוכית, ומתמחה בהקמת מרחבי STEM ומרכזי מייקרים המפתחים לומד עצמאי.
                        </p>
                        <p>
                            הפלטפורמה הדיגיטלית שלנו מתוכננת לאפשר לתלמידים ללמוד בקצב שלהם, דרך פרויקטים מעשיים (PBL), תוך מתן כלים למורים למעקב פדגוגי מדויק ואבחוני.
                        </p>
                    </div>

                    {/* מפת האתר המבוססת על הקבצים שכבר כתבת */}
                    <div className="border-t border-slate-100 pt-10">
                        <h3 className="text-2xl font-black text-slate-800 mb-6 border-r-4 border-purple-400 pr-3">מפת האתר והארכיטקטורה</h3>
                        <div className="grid md:grid-cols-2 gap-6 text-sm">
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                <strong className="font-bold text-purple-700 block mb-1">core App logic (mainrouting logic)</strong>
                                <p className="text-slate-600">זהו מנהל המערכת הראשי, המחזיק את הסטייט המרכזי ומאזין בזמן אמת (onSnapshot) ל-Firebase.</p>
                            </div>
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                <strong className="font-bold text-purple-700 block mb-1">CourseModal.js (smart course development)</strong>
                                <p className="text-slate-600">חלונית פיתוח קורסים חכמים, המשתמשת ב-Gemini AI כדי לנסח עבורך סילבוסים ותיאורים פדגוגיים.</p>
                            </div>
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                <strong className="font-bold text-purple-700 block mb-1">CoursesDashboard.js (student course gallery)</strong>
                                <p className="text-slate-600">הדאשבורד הראשי של הלומד, המציג קורסים מורשים במבנה קולנועי (גריד) עם מנגנון חיצי מיון (▲▼) לעמודות.</p>
                            </div>
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                <strong className="font-bold text-purple-700 block mb-1">CourseView.js (secure lesson player)</strong>
                                <p className="text-slate-600">נגן שיעורים מאובטח לחלוטין. כולל את המנגנון הבלעדי שלנו שמבצע Crop ליוטיוב ונועל את הסרטון מפני בריחה מחוץ לפלטפורמה.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- אזור 2: התחומים שלנו --- */}
                <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-slate-100 space-y-8">
                    <div className="text-center max-w-xl mx-auto">
                        <div className="text-4xl mb-4">🏆</div>
                        <h2 className="text-3xl font-black text-slate-800">התחומים שלנו</h2>
                        <p className="text-slate-500 font-medium text-sm">מומחיות ברובוטיקה, תכנות, מייקרים, ובינה מלאכותית.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-purple-50 p-6 rounded-2xl border-2 border-dashed border-purple-200">
                            <h4 className="font-black text-lg text-purple-800 mb-2">רובוטיקה ובינה מלאכותית (AI)</h4>
                            <p className="text-slate-700 text-sm">פיתוח קורסים חכמים (כמו Tinkercad) המשלבים כלי AI מתקדמים (Gemini) ללמידה פרודוקטיבית.</p>
                        </div>
                        <div className="bg-purple-50 p-6 rounded-2xl border-2 border-dashed border-purple-200">
                            <h4 className="font-black text-lg text-purple-800 mb-2">תכנות ומייקרים (STEM)</h4>
                            <p className="text-slate-700 text-sm">הקמת מרחבי למידה אינטראקטיביים המפתחים לומד עצמאי ואוטונומי.</p>
                        </div>
                        <div className="bg-purple-50 p-6 rounded-2xl border-2 border-dashed border-purple-200">
                            <h4 className="font-black text-lg text-purple-800 mb-2">נגישות דיגיטלית חוקית</h4>
                            <p className="text-slate-700 text-sm">המערכת מותאמת לכל דרישות הנגישות, כולל רכיב AccessibilityWidget המאפשר התאמת גופנים וניגודיות.</p>
                        </div>
                    </div>
                </div>

                {/* --- אזור 3: הפעילות שלנו --- */}
                <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-slate-100 space-y-8">
                    <div className="text-center max-w-xl mx-auto">
                        <div className="text-4xl mb-4">🚀</div>
                        <h2 className="text-3xl font-black text-slate-800">הפעילות שלנו</h2>
                        <p className="text-slate-500 font-medium text-sm">חדר בקרה, ניתוח נתונים, ותקשורת חכמה.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-700 shadow-xl">
                            <strong className="font-black text-sm block mb-1">Admin Panel control room</strong>
                            <p className="text-slate-300 text-xs">ניהול מלא ומאובטח של כל רשימות המשתמשים, המוסדות והקורסים במערכת.</p>
                        </div>
                        <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-700 shadow-xl">
                            <strong className="font-black text-sm block mb-1">CompassView (Pedagogical tracking)</strong>
                            <p className="text-slate-300 text-xs">כלי עזר פדגוגי למורים ולמנהלים, המציג אנליטיקות, גרפים ומעקב התקדמות בזמן אמת על קצב הלמידה של הכיתות.</p>
                        </div>
                        <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-700 shadow-xl">
                            <strong className="font-black text-sm block mb-1">FloatingBot.js AI chat assistant</strong>
                            <p className="text-slate-300 text-xs">בוט צף (מבוסס Gemini) המלווה את התלמידים והמורים ומספק תמיכה טכנית ופדגוגית חכמה לאורך כל השהות באתר.</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
