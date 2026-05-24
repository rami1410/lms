import React from 'react';
import AboutWhoWeAre from './AboutWhoWeAre';
import AboutOurWork from './AboutOurWork';
import AboutSkills from './AboutSkills';
import AboutFAQ from './AboutFAQ';
import AboutSitemap from './AboutSitemap';
import AboutServices from './AboutServices';

export default function AboutView({ section, onBack }) {

    const getHeaderBgStyle = (sec) => {
        switch (sec) {
            case 'who_we_are': return "from-purple-950 via-slate-900 to-indigo-950 border-purple-500/20";
            case 'our_work': return "from-blue-950 via-slate-900 to-cyan-950 border-cyan-500/20";
            case 'skills': return "from-emerald-950 via-slate-900 to-teal-950 border-teal-500/20";
            case 'faq': return "from-amber-950 via-slate-900 to-orange-950 border-orange-500/20";
            case 'sitemap': return "from-zinc-950 via-slate-900 to-stone-900 border-slate-500/20";
            default: return "from-slate-900 via-slate-900 to-purple-950 border-purple-500/20";
        }
    };

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

    const renderPageContent = () => {
        switch (section) {
            case 'who_we_are':
                return <><AboutWhoWeAre />{renderHeader("אז מי אנחנו ?", "🤖", "סיפור המותג, החזון החינוכי והשילוב הבלעדי של טכנולוגיה ופדגוגיה.")}</>;
            case 'our_work':
                return <><AboutOurWork />{renderHeader("קצת מהעשייה שלנו", "📊", "נתוני אימפקט, פריסה ארצית ותחנות מרכזיות בפעילות החינוכית לאורך השנים.")}</>;
            case 'skills':
                return <><AboutSkills />{renderHeader("מיומנויות ותחומי דעת", "🎯", "הכשרת דור העתיד למקצועות המחר ופיתוח כישורי המאה ה-21.")}</>;
            case 'faq':
                return <><AboutFAQ />{renderHeader("שאלות ותשובות", "❓", "כל מה שרציתם לדעת על הפעלת התוכניות, הרישיונות והתמיכה הפדגוגית של רובוטיקס.")}</>;
            case 'sitemap':
                return <><AboutSitemap />{renderHeader("מפת האתר והמערכת", "🗺️", "הצצה שקופה ומקצועית לארכיטקטורת הרכיבים והקוד של פלטפורמת LMS חותם חיים.")}</>;
            default:
                return <AboutServices track={section} />;
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8 px-2 sm:px-4">
            {renderPageContent()}
            <div className="flex justify-center pt-2">
                <button onClick={onBack} className="bg-slate-950 hover:bg-cyan-600 text-white font-black px-10 py-3 rounded-full transition-all text-xs sm:text-sm shadow-xl hover:scale-105 duration-300 cursor-pointer">
                    ← חזרה לעמוד הראשי
                </button>
            </div>
        </div>
    );
}
