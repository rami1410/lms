import React, { useEffect, useRef, useState } from 'react';

export default function LandingContent() {
    const chartRef = useRef(null);
    const [activeModal, setActiveModal] = useState(null);
    const catalogUrl = "https://heyzine.com/flip-book/426cdf50eb.html";

    const modalData = {
        law: { title: "עו\"ד וקניין רוחני", body: "רמי חדאד הינו עו\"ד מוסמך (LL.B) עם התמחות עמוקה בקניין רוחני. ניסיון זה מאפשר לקבוצה להגן על פיתוחיה הטכנולוגיים והפדגוגיים הייחודיים, תוך יצירת שותפויות בינלאומיות בסטנדרטים המשפטיים והאתיים הגבוהים ביותר." },
        academic: { title: "מרצה בכיר באקדמיה", body: "בעל תואר שני (M.A) בחינוך ומרצה מבוקש במוסדות להשכלה גבוהה. רמי מחבר בין המחקר האקדמי העדכני לבין הפרקטיקה המעשית בשטח, תוך הדרכת דור העתיד של מנהיגי החינוך והחדשנות בישראל." },
        steering: { title: "חבר בוועדות היגוי", body: "כחבר פעיל בוועדת ההיגוי העליונה של משרד החינוך בתחום הרובוטיקה, רמי שותף לעיצוב המדיניות הלאומית וקידום החינוך המדעי-טכנולוגי (STEM) בישראל מזה שנים רבות." },
        missions: { title: "משלחות BETT לונדון", body: "מוביל מזה 7 שנים ברציפות משלחות יוקרתיות של מנהלים, קב\"טים ואנשי חינוך לכנס החדשנות הגדול בעולם (BETT) בלונדון ול-92nd בניו יורק, במטרה לייבא לישראל את הבשורות הטכנולוגיות המתקדמות ביותר." },
        experience: { title: "23 שנות ניסיון", body: "ניסיון עשיר של מעל לשני עשורים בהובלת פרויקטים טכנולוגיים-חינוכיים מורכבים, הקמת עשרות מרחבי חדשנות ברחבי הארץ, ניהול מערכי הדרכה ארציים וליווי אסטרטגי של רשתות חינוך ורשויות מקומיות." },
        vision: { title: "חזון הלומד העצמאי", body: "האמונה המנחה של רמי היא שהטכנולוגיה היא כלי להעצמת הילד. המטרה המרכזית היא פיתוח 'לומד אוטונומי' שמסוגל ללמוד כל דבר בכוחות עצמו, תוך שימוש מושכל בבינה מלאכותית ורובוטיקה ככלים לפיתוח חשיבה, יצירתיות ורגש." }
    };

    const partners = [
        { src: "https://i.postimg.cc/7Ytd16kw/images-(2).png", alt: "משרד החינוך" },
        { src: "https://i.postimg.cc/90hChfMH/images-(1).png", alt: "משרד הביטחון" },
        { src: "https://i.postimg.cc/WzgLYcw2/Badge-of-the-Israeli-Defense-Forces-2022-version-svg.png", alt: "צהל" },
        { src: "https://i.postimg.cc/kMyVjsTr/images-(5).png", alt: "קק'ל" },
        { src: "https://i.postimg.cc/GmdZwJ8M/ort-israel-technology-science-educational-network-logo.jpg", alt: "רשת אורט" },
        { src: "https://i.postimg.cc/6pKN6xSv/images-(4).png", alt: "רשת עמל" },
        { src: "https://i.postimg.cc/cHc5v1h4/images-(3).png", alt: "עיריית חיפה" },
        { src: "https://i.postimg.cc/TwrvCXck/images.jpg", alt: "אפטר סקול" }
    ];

    useEffect(() => {
        const loadChartJS = async () => {
            if (!document.querySelector(`script[src="https://cdn.jsdelivr.net/npm/chart.js"]`)) {
                const s = document.createElement('script');
                s.src = 'https://cdn.jsdelivr.net/npm/chart.js';
                document.head.appendChild(s);
                s.onload = initChart;
            } else {
                initChart();
            }
        };

        function initChart() {
            const Chart = window.Chart;
            if (Chart && chartRef.current && !chartRef.current.chartInstance) {
                chartRef.current.chartInstance = new Chart(chartRef.current, {
                    type: 'bar',
                    data: {
                        labels: ['מוסדות', 'בתי ספר', 'תוכניות גפן', 'שימור'],
                        datasets: [{
                            data: [1400, 120, 50, 90],
                            backgroundColor: ['#2bb2c4', '#99ca3c', '#f7941d', '#f15a24'], // עודכנו לצבעי המותג המדויקים
                            borderRadius: 20,
                            barThickness: 50
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: { 
                            y: { beginAtZero: true, grid: { color: '#f8f8f8' } },
                            x: { grid: { display: false } }
                        }
                    }
                });
            }
        }

        loadChartJS();

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('visible');
            });
        }, { threshold: 0.2 });

        document.querySelectorAll('[data-observe="true"]').forEach(el => observer.observe(el));

        return () => {
            if (observer) observer.disconnect();
        };
    }, []);

    return (
        <>
            <section id="hero" className="relative h-screen flex flex-col items-center justify-center text-center px-4 bg-transparent">
                <div className="z-30">
                    <h1 className="text-6xl md:text-8xl font-extrabold text-chotam-black mb-6 leading-tight tracking-tighter">טכנולוגיה עם <span className="text-chotam-teal italic">נשמה</span></h1>
                    <p className="text-xl md:text-3xl text-gray-500 font-light max-w-3xl mx-auto leading-relaxed">
                        חותם חיים מבית רובוטיקס - החברה המובילה בישראל לחדשנות פדגוגית, הקמת מרחבי STEM ופיתוח הלומד האוטונומי.
                    </p>
                </div>
                
                <div className="scroll-indicator" onClick={() => window.scrollTo({top: window.innerHeight, behavior: 'smooth'})}>
                    <span className="text-xs font-bold uppercase tracking-[0.3em] mb-2 block cursor-pointer">גלול מטה</span>
                    <svg className="mx-auto" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                    </svg>
                </div>
            </section>

            <section id="sectors" className="bg-white/80 backdrop-blur-md">
                <div className="section-strip" id="strip-1">
                    <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
                        <div className="category-content p-8 md:p-12 order-2 md:order-1" data-observe="true">
                            <h2 className="text-4xl md:text-5xl font-extrabold text-chotam-teal mb-6">1. עולם הציוד והאספקה</h2>
                            <p className="text-xl text-gray-600 leading-relaxed mb-8">ספקית ציוד מהגדולות במשק עם מגוון עצום של מעל 50,000 מוצרים מקצועיים למעבדות, בתי ספר ומרכזי חדשנות. אנחנו מביאים את חזית הטכנולוגיה ישירות אליכם.</p>
                            
                            {/* הנה כפתור הקטלוג החדש שביקשת שיופיע בציוד! */}
                            <a href={catalogUrl} target="_blank" rel="noopener noreferrer" className="inline-block bg-chotam-teal text-white px-8 py-4 rounded-full font-bold shadow-xl hover:scale-105 transition no-print">
                                לקטלוג המוצרים המלא ←
                            </a>
                        </div>
                        <div className="category-image-wrapper order-1 md:order-2" data-observe="true">
                            <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800" alt="ציוד טכנולוגי" className="w-full h-[400px] object-cover" />
                        </div>
                    </div>
                </div>

                <div className="section-strip bg-gray-50/50" id="strip-2">
                    <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
                        <div className="category-image-wrapper" data-observe="true">
                            <img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800" alt="הדרכה וחינוך" className="w-full h-[400px] object-cover" />
                        </div>
                        <div className="category-content p-8 md:p-12" data-observe="true">
                            <h2 className="text-4xl md:text-5xl font-extrabold text-chotam-green mb-6">2. הדרכה וליווי פדגוגי</h2>
                            <p className="text-xl text-gray-600 leading-relaxed">מספקים קורסים ב-75 רשויות מקומיות. אנו מכשירים מאות מורים מדי שנה ומלווים אותם בתוך הכיתה עם הצוותים המקצועיים שלנו, כדי להבטיח למידה משמעותית.</p>
                        </div>
                    </div>
                </div>

                <div className="section-strip" id="strip-3">
                    <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
                        <div className="category-content p-8 md:p-12 order-2 md:order-1" data-observe="true">
                            <h2 className="text-4xl md:text-5xl font-extrabold text-chotam-orange mb-6">3. הקמת מרחבי למידה</h2>
                            <p className="text-xl text-gray-600 leading-relaxed">החברה הגדולה במשק להקמת מרחבי מייקרים, כיתות STEM, מרכזים טכנולוגיים ומרחבי "חלומציאות" מותאמים אישית. אנחנו הופכים כל חדר לחממת יצירה.</p>
                        </div>
                        <div className="category-image-wrapper order-1 md:order-2" data-observe="true">
                            <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800" alt="מרחבי למידה" className="w-full h-[400px] object-cover" />
                        </div>
                    </div>
                </div>

                <div className="section-strip bg-gray-50/50" id="strip-4">
                    <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
                        <div className="category-image-wrapper" data-observe="true">
                            <img src="https://images.unsplash.com/photo-1626379953822-baec19c3bbcd?auto=format&fit=crop&q=80&w=800" alt="חלומציאות" className="w-full h-[400px] object-cover" />
                        </div>
                        <div className="category-content p-8 md:p-12" data-observe="true">
                            <h2 className="text-4xl md:text-5xl font-extrabold text-chotam-teal mb-6">4. סיור ב"חלומציאות"</h2>
                            <p className="text-xl text-gray-600 leading-relaxed">מרכז החדשנות שלנו בפתח תקווה - 250 מ"ר של עשייה פדגוגית חווייתית: קארטינג הנדסי, VR, רחפנים וטכנולוגיות קצה. המקום שבו חלומות הופכים למציאות.</p>
                        </div>
                    </div>
                </div>

                <div className="section-strip" id="strip-5">
                    <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
                        <div className="category-content p-8 md:p-12 order-2 md:order-1" data-observe="true">
                            <h2 className="text-4xl md:text-5xl font-extrabold text-chotam-yellow mb-6">5. משלחות למידה בחו"ל</h2>
                            <p className="text-xl text-gray-600 leading-relaxed">הולנד, אנגליה, גרמניה וארה"ב. אנו מוציאים משלחות לומדות עם גמול השתלמות למנהלים ואנשי חינוך. הזדמנות להיחשף לחינוך העתיד בעולם.</p>
                        </div>
                        <div className="category-image-wrapper order-1 md:order-2" data-observe="true">
                            <img src="https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&q=80&w=800" alt="משלחות לחו''ל" className="w-full h-[400px] object-cover" />
                        </div>
                    </div>
                </div>

                <div className="section-strip bg-gray-50/50" id="strip-6">
                    <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
                        <div className="category-image-wrapper" data-observe="true">
                            <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800" alt="סדנאות וימי שיא" className="w-full h-[400px] object-cover" />
                        </div>
                        <div className="category-content p-8 md:p-12" data-observe="true">
                            <h2 className="text-4xl md:text-5xl font-extrabold text-chotam-red mb-6">6. סדנאות וימי שיא</h2>
                            <p className="text-xl text-gray-600 leading-relaxed">מביאים את ההייטק אליכם. סדנאות חווייתיות לבתי ספר, אקדמיה וחברות הייטק. עשרות חברות כבר חוו את העושר הטכנולוגי שלנו. הזמינו יום שיא בלתי נשכח.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section id="partners" className="py-16 bg-white overflow-hidden no-print z-20 relative">
                <div className="marquee-container flex flex-col items-center">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-chotam-black mb-10 italic">שותפים לדרך</h2>
                    <div className="marquee-track">
                        {partners.map((p, idx) => (
                            <div key={`p1-${idx}`} className="partner-logo">
                                <img src={p.src} alt={p.alt} onError={(e) => e.target.style.display='none'} />
                            </div>
                        ))}
                        {partners.map((p, idx) => (
                            <div key={`p2-${idx}`} className="partner-logo">
                                <img src={p.src} alt={p.alt} onError={(e) => e.target.style.display='none'} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="impact" className="py-24 bg-white border-t border-gray-100 z-20 relative">
                <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-20">
                    <div className="lg:w-1/2">
                        <h2 className="text-5xl font-extrabold text-chotam-black mb-12 border-r-[12px] border-chotam-teal pr-8 italic">האימפקט שלנו</h2>
                        <div className="grid grid-cols-2 gap-8 text-center">
                            <div className="p-8 bg-chotam-teal/5 rounded-[2.5rem] shadow-sm"><span className="block text-5xl font-black text-chotam-teal tracking-tighter">35,000</span><span className="text-[10px] font-bold text-gray-400 uppercase mt-2 block">תלמידים בשנה</span></div>
                            <div className="p-8 bg-chotam-green/5 rounded-[2.5rem] shadow-sm"><span className="block text-5xl font-black text-chotam-green tracking-tighter">1,400+</span><span className="text-[10px] font-bold text-gray-400 uppercase mt-2 block">מוסדות חינוך</span></div>
                            <div className="p-8 bg-chotam-orange/5 rounded-[2.5rem] shadow-sm"><span className="block text-5xl font-black text-chotam-orange tracking-tighter">50</span><span className="text-[10px] font-bold text-gray-400 uppercase mt-2 block">תוכניות גפן</span></div>
                            <div className="p-8 bg-chotam-red/5 rounded-[2.5rem] shadow-sm"><span className="block text-4xl font-black text-chotam-red">90%</span><span className="text-[10px] font-bold text-gray-400 uppercase mt-2 block">שימור לקוחות</span></div>
                        </div>
                    </div>
                    <div className="lg:w-1/2 w-full h-[400px]">
                        <canvas id="impactChart" ref={chartRef}></canvas>
                    </div>
                </div>
            </section>

            <section id="rami" className="py-24 bg-gray-50 border-t border-gray-200 z-20 relative print-break-inside-avoid">
                <div className="max-w-7xl mx-auto px-4 text-center mb-16">
                    <h2 className="text-5xl font-extrabold text-chotam-black mb-6 tracking-tighter">רמי חדאד</h2>
                    <p className="text-2xl text-gray-500 font-light max-w-3xl mx-auto leading-relaxed italic">
                        מייסד ובעלים, מרצה באקדמיה, עו"ד ומומחה לקניין רוחני. <br />
                        מוביל את החיבור שבין טכנולוגיה, פדגוגיה ומשפט.
                    </p>
                </div>

                <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-3 gap-8 no-print">
                    <div onClick={() => setActiveModal('law')} className="personal-box p-10 bg-white rounded-[2.5rem] text-center shadow-sm">
                        <h4 className="font-black text-chotam-black text-xl">עו"ד וקניין רוחני</h4>
                    </div>
                    <div onClick={() => setActiveModal('academic')} className="personal-box p-10 bg-white rounded-[2.5rem] text-center shadow-sm">
                        <h4 className="font-black text-chotam-black text-xl">מרצה בכיר באקדמיה</h4>
                    </div>
                    <div onClick={() => setActiveModal('steering')} className="personal-box p-10 bg-white rounded-[2.5rem] text-center shadow-sm">
                        <h4 className="font-black text-chotam-black text-xl">חבר בוועדות היגוי</h4>
                    </div>
                    <div onClick={() => setActiveModal('missions')} className="personal-box p-10 bg-white rounded-[2.5rem] text-center shadow-sm">
                        <h4 className="font-black text-chotam-black text-xl">משלחות BETT</h4>
                    </div>
                    <div onClick={() => setActiveModal('experience')} className="personal-box p-10 bg-white rounded-[2.5rem] text-center shadow-sm">
                        <h4 className="font-black text-chotam-black text-xl">23 שנות ניסיון</h4>
                    </div>
                    <div onClick={() => setActiveModal('vision')} className="personal-box p-10 bg-white rounded-[2.5rem] text-center shadow-sm border-2 border-chotam-teal/30">
                        <h4 className="font-black text-chotam-teal text-xl italic tracking-tighter">חזון הלומד העצמאי</h4>
                    </div>
                </div>
            </section>

            <footer id="contact" className="bg-chotam-black text-white py-24 text-center no-print z-20 relative">
                <div className="max-w-4xl mx-auto px-4">
                    <h2 className="text-6xl font-extrabold mb-14 italic tracking-tighter">להפוך חלום למציאות.</h2>
                    <div className="flex flex-col sm:flex-row justify-center gap-10 mb-20">
                        <button className="bg-chotam-teal text-white px-16 py-5 rounded-full font-bold text-2xl hover:scale-105 transition shadow-2xl">סיור ב"חלומציאות"</button>
                        <button className="bg-white/10 text-white px-16 py-5 rounded-full font-bold text-2xl hover:bg-white hover:text-chotam-black transition">צרו קשר עכשיו</button>
                    </div>
                    <p className="text-[10px] opacity-20 tracking-[0.5em] uppercase font-bold px-4 leading-relaxed">משרד הביטחון | משרד החינוך | רשת אמית | אפטר סקול | קק"ל | ברנקו וייס | רשת אורט | רשת עמל</p>
                    <p className="mt-12 text-[10px] opacity-10 font-bold">&copy; {new Date().getFullYear()} חותם חיים מבית רובוטיקס. רמי חדאד, עו"ד.</p>
                </div>
            </footer>

            {activeModal && (
                <div className="modal-overlay z-[5000]" style={{display: 'flex'}} onClick={() => setActiveModal(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="absolute top-8 left-8 text-3xl text-gray-300 hover:text-chotam-red transition" onClick={() => setActiveModal(null)}>&#10005;</button>
                        <h3 className="text-4xl font-black text-chotam-teal mb-8">{modalData[activeModal].title}</h3>
                        <div className="text-gray-600 leading-relaxed text-xl font-light">{modalData[activeModal].body}</div>
                        <button className="mt-12 w-full bg-gray-50 py-5 rounded-2xl font-bold text-chotam-black hover:bg-chotam-teal hover:text-white transition shadow-sm text-lg" onClick={() => setActiveModal(null)}>סגור חלונית</button>
                    </div>
                </div>
            )}
        </>
    );
}
