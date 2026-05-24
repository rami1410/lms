import React, { useState } from 'react';
import ThreeBackground from './ThreeBackground';
import Accessibility from './Accessibility';
import LandingHeader from './LandingHeader';

export default function LandingPage({ onLoginClick }) {
    const catalogUrl = "https://heyzine.com/flip-book/426cdf50eb.html";
    const MODIIN_LOGO = "https://i.postimg.cc/tRvK7zGH/lwgw-mw'zh-'zwryt-hbl-mwdy'yn.jpg";

    // מצב לניהול פתיחת חלוניות מידע (Modals) עבור 6 המחקרים/תיבות לחיצות
    const [activeModal, setActiveModal] = useState(null);

    const researches = [
        {
            id: 1,
            title: "1. SEL רגשי וחברתי",
            short: "הטמעת תוכניות ויסות רגשי וחברתי מותאמות לגיל הרך.",
            full: "מחלקת החינוך של חבל מודיעין שמה דגש נרחב על הלמידה הרגשית-חברתית (SEL) כבר מגני הילדים. התוכנית מקנה לילדים כלים לניהול רגשות, פיתוח אמפתיה, פתרון קונפליקטים ובניית חוסן נפשי מול אתגרים משתנים במרחב החינוכי והבישי."
        },
        {
            id: 2,
            title: "2. משחוק ולמידה חווייתית",
            short: "הפיכת תהליך הלמידה בגיל הרך לחוויה מניעה לפעולה.",
            full: "שילוב אלמנטים מעולם המשחק (Gamification) ככלי פדגוגי מוביל בגנים ובכיתות היסוד במועצה. המחקר והיישום בשטח מוכיחים כי למידה מבוססת משחק מעוררת סקרנות טבעית, מעלה את המוטיבציה הפנימית ומעמיקה את תפיסת החומר הנלמד."
        },
        {
            id: 3,
            title: "3. שיח מעודד תקשורת",
            short: "פיתוח שפה דבורה, ביטוי עצמי ודיאלוג מקרב בגנים.",
            full: "יצירת סביבה חינוכית עשירה בשפה המעודדת כל ילד וילדה לבטא את עולמם הפנימי. אנו מפתחים במועצה מודלים של שיח אינטראקטיבי בין אנשי הצוות לילדים, המקדמים הקשבה פעילה, הרחבת אוצר המילים וביטחון בתקשורת הבינאישית."
        },
        {
            id: 4,
            title: "4. לומד עצמאי מקטנות",
            short: "הקניית מיומנויות של בחירה, חקר וניהול עצמי.",
            full: "עידוד הילדים לחשיבה עצמאית וליוזמה אישית במרחבי הלמידה בחבל מודיעין. דרך סביבות מגרות בחירה, הילדים מתנסים בהצבת מטרות קטנות, פתרון בעיות וניסוי וטעייה, המפתחים אצלם תפיסת מסוגלות עצמית גבוהה."
        },
        {
            id: 5,
            title: "5. הבית, הגן ובית הספר",
            short: "בניית שותפות הדוקה ורצף חינוכי בין ההורים למועצה.",
            full: "יצירת גשר פדגוגי וקהילתי איתן בין המשפחה לבין מוסדות החינוך בגיל הרך. אנו מאמינים כי מעורבות הורים חיובית, שיתוף במידע וסנכרון מטרות בין הבית לגן מייצרים מעטפת תמיכה אופטימלית לצמיחת הילד."
        },
        {
            id: 6,
            title: "6. מוגנות וסביבה בטוחה",
            short: "הבטחת מרחב מוגן, מכיל ושומר פיזית ורגשית.",
            full: "יישום סטנדרטים גבוהים ביותר של מוגנות רגשית ופיזית בכלל מסגרות הגיל הרך במועצה אזורית חבל מודיעין. יצירת אקלים בטוח המונע פגיעות, מעודד דיווח ומעניק לילדים תחושת מוגנות מוחלטת המהווה תנאי סף חיוני לכל למידה."
        }
    ];

    return (
        <div className="antialiased font-sans relative bg-slate-50" dir="rtl">
            <ThreeBackground />
            <Accessibility />
            
            <style>{`
                body { scroll-behavior: smooth; overflow-x: hidden; }
                .section-strip { position: relative; min-height: 80vh; display: flex; align-items: center; padding: 5rem 0; z-index: 20; }
                
                .marquee-container { width: 100%; overflow: hidden; padding: 3rem 0; background: #fff; border-top: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0; }
                .marquee-track { display: flex; width: max-content; animation: scroll-left 40s linear infinite; }
                @keyframes scroll-left { 0% { transform: translateX(0); } 100% { transform: translateX(50%); } }
                
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 5000; backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; }
                .modal-content { background: white; padding: 3rem; border-radius: 2.5rem; max-width: 600px; width: 90%; position: relative; animation: modalIn 0.4s ease-out; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.2); }
                @keyframes modalIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
                
                .personal-box { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; border: 1px solid #e2e8f0; background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(5px); }
                .personal-box:hover { transform: translateY(-8px); border-color: #2bb2c4; box-shadow: 0 20px 40px rgba(43,178,196,0.15); }
                
                .text-chotam-teal { color: #2bb2c4; } .bg-chotam-teal { background-color: #2bb2c4; }
                .text-chotam-green { color: #99ca3c; } .bg-chotam-green { background-color: #99ca3c; }
                .text-chotam-yellow { color: #ffcc00; }
                .text-chotam-orange { color: #f7941d; }
                .text-chotam-red { color: #f15a24; }
                
                @media print {
                    @page { size: A4; margin: 20mm; }
                    body { background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .no-print { display: none !important; }
                    .print-only { display: block !important; }
                    .shadow-sm, .shadow-xl { box-shadow: none !important; border: 1px solid #e2e8f0; }
                    canvas { display: none !important; }
                }
                .print-only { display: none; }
            `}</style>

            {/* כותרת מיוחדת שמופיעה רק ב-PDF מודפס */}
            <div className="print-only text-center mb-10 pb-6 border-b-4 border-chotam-teal">
                <img src={MODIIN_LOGO} alt="מועצה אזורית חבל מודיעין" className="h-24 mx-auto mb-4 object-contain" />
                <h1 className="text-4xl font-black text-slate-900 mb-2">תשתית פדגוגית ומחקרית - חבל מודיעין</h1>
                <p className="text-xl text-slate-600">מחלקת חינוך והאגף לגיל הרך</p>
                <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="font-bold text-lg mb-2">למעבר למערכת הניהול הדיגיטלית:</p>
                    <a href={catalogUrl} className="text-chotam-teal font-bold" dir="ltr">{catalogUrl}</a>
                </div>
            </div>

            <LandingHeader onLoginClick={onLoginClick} />

            {/* אזור ה-HERO הראשי של דף הנחיתה */}
            <main id="hero" className="pt-32 pb-16 px-4 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[85vh]">
                <div className="space-y-6 text-right z-10">
                    <span className="bg-chotam-teal/10 text-chotam-teal px-4 py-1.5 rounded-full text-sm font-bold inline-block">
                        מועצה אזורית חבל מודיעין
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight">
                        מערכת ניהול פדגוגית <br />
                        <span className="text-chotam-teal">לגיל הרך ולבתי הספר</span>
                    </h1>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        ברוכים הבאים לפלטפורמה החינוכית המתקדמת של מחלקת החינוך. כאן אנו מיישמים תשתית מחקרית וייחודית המשלבת חדשנות דיגיטלית עם מענה רגשי וחברתי מקיף עבור תלמידי וילדי המועצה.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-4 no-print">
                        <a href="#sectors" className="bg-chotam-teal text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-opacity-90 transition">
                            לששת מחקרי הגיל הרך
                        </a>
                        <a href="#impact" className="bg-slate-900 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-slate-800 transition">
                            מדדי אימפקט
                        </a>
                    </div>
                </div>
                <div className="flex justify-center items-center z-10">
                    <img src={MODIIN_LOGO} alt="חינוך חבל מודיעין" className="max-w-[80%] h-auto object-contain bg-white p-8 rounded-3xl shadow-2xl border border-slate-100" />
                </div>
            </main>

            {/* אזור 6 התיבות הלחיצות - מחקרי מחלקת החינוך והגיל הרך */}
            <section id="sectors" className="section-strip bg-white border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-4 w-full">
                    <div className="text-center space-y-4 mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900">תשתית פדגוגית מבוססת 6 מחקרים</h2>
                        <p className="text-slate-500 text-lg max-w-3xl mx-auto">
                            מחלקת החינוך והאגף לגיל הרך בחבל מודיעין מובילים עשייה מקצועית המבוססת על עקרונות מחקריים יישומיים. לחצו על התיבות למידע מורחב:
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {researches.map((res) => (
                            <div 
                                key={res.id} 
                                onClick={() => setActiveModal(res)}
                                className="personal-box p-8 rounded-3xl shadow-sm space-y-4 relative overflow-hidden"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-xl font-bold text-chotam-teal">
                                    {res.id}
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">{res.title}</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">{res.short}</p>
                                <span className="text-chotam-teal text-xs font-bold block pt-2 group-hover:underline no-print">
                                    קרא עוד ➔
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* מקטע מחלקת החינוך חבל מודיעין - החליף את מקטע "המייסד" */}
            <section id="rami" className="section-strip bg-slate-50">
                <div className="max-w-5xl mx-auto px-4 w-full text-center space-y-8 z-10">
                    <div className="inline-block p-4 bg-white rounded-full shadow-md mb-2">
                        <img src={MODIIN_LOGO} alt="לוגו מועצה" className="h-20 w-auto object-contain" />
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900">מחלקת החינוך – מועצה אזורית חבל מודיעין</h2>
                    <h4 className="text-xl font-bold text-chotam-teal">חזון של חדשנות ומצוינות מהגיל הרך ועד התיכון</h4>
                    <p className="text-slate-600 text-lg leading-relaxed max-w-4xl mx-auto text-justify md:text-center">
                        מחלקת החינוך של חבל מודיעין חורטת על דגלה את פיתוחם האישי, הרגשי והאקדמי של כלל ילדי המועצה. מתוך ראייה הוליסטית של החינוך לגיל הרך, אנו פועלים ללא לאות לבניית תוכניות מתקדמות המשלבות כלים דיגיטליים, שיטות משחוק מתקדמות ודגש עמוק על מוגנות ו-SEL. השותפות הייחודית בין צוותי ההוראה, מנהלי המוסדות, קהילת ההורים והנהלת המועצה מייצרת סביבה תומכת המאפשרת לכל תלמיד לממש את הפוטנציאל המלא שלו בביטחון ובאהבה.
                    </p>
                </div>
            </section>

            {/* מקטע האימפקט המעודכן */}
            <section id="impact" className="section-strip bg-slate-900 text-white">
                <div className="max-w-7xl mx-auto px-4 w-full">
                    <div className="text-center space-y-4 mb-16">
                        <h2 className="text-3xl md:text-5xl font-black">האימפקט שלנו השנה</h2>
                        <p className="text-slate-400 text-lg">נתוני הפעילות והמעורבות של מערכת החינוך בחבל מודיעין</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        <div className="space-y-2">
                            <div className="text-6xl md:text-8xl font-black text-chotam-teal">350</div>
                            <div className="text-xl font-bold text-slate-300">ילדים וילדות פעילים</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-6xl md:text-8xl font-black text-chotam-green">6</div>
                            <div className="text-xl font-bold text-slate-300">כיתות וגני ילדים מובילים</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-6xl md:text-8xl font-black text-chotam-yellow">90%</div>
                            <div className="text-xl font-bold text-slate-300">שיעורי כניסה ומעורבות במערכת</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* חלונית מידע קופצת (Modal) עבור התיבות הלחיצות */}
            {activeModal && (
                <div className="modal-overlay no-print" onClick={() => setActiveModal(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button 
                            className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 text-2xl font-bold"
                            onClick={() => setActiveModal(null)}
                        >
                            ✕
                        </button>
                        <span className="text-sm font-bold text-chotam-teal block mb-2">מועצה אזורית חבל מודיעין</span>
                        <h3 className="text-2xl font-black text-slate-900 mb-4">{activeModal.title}</h3>
                        <p className="text-slate-600 leading-relaxed text-base">{activeModal.full}</p>
                        <button 
                            className="mt-8 bg-chotam-teal text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-md hover:bg-opacity-90 transition w-full"
                            onClick={() => setActiveModal(null)}
                        >
                            סגור חלונית
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
