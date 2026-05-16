import React, { useEffect, useRef, useState } from 'react';

export default function LandingPage({ onLoginClick }) {
    const canvasContainerRef = useRef(null);
    const chartRef = useRef(null);
    const [activeModal, setActiveModal] = useState(null);

    // --- מערכת הנגישות ---
    const [accOpen, setAccOpen] = useState(false);
    const [accSettings, setAccSettings] = useState({ contrast: false, largeText: false, highlightLinks: false });
    const toggleAcc = (key) => setAccSettings(prev => ({ ...prev, [key]: !prev[key] }));

    const modalData = {
        law: { title: "עו\"ד וקניין רוחני", body: "רמי חדאד הינו עו\"ד מוסמך (LL.B) עם התמחות עמוקה בקניין רוחני. ניסיון זה מאפשר לקבוצה להגן על פיתוחיה הטכנולוגיים והפדגוגיים הייחודיים, תוך יצירת שותפויות בינלאומיות בסטנדרטים המשפטיים והאתיים הגבוהים ביותר." },
        academic: { title: "מרצה בכיר באקדמיה", body: "בעל תואר שני (M.A) בחינוך ומרצה מבוקש במוסדות להשכלה גבוהה. רמי מחבר בין המחקר האקדמי העדכני לבין הפרקטיקה המעשית בשטח, תוך הדרכת דור העתיד של מנהיגי החינוך והחדשנות בישראל." },
        steering: { title: "חבר בוועדות היגוי", body: "כחבר פעיל בוועדת ההיגוי העליונה של משרד החינוך בתחום הרובוטיקה, רמי שותף לעיצוב המדיניות הלאומית וקידום החינוך המדעי-טכנולוגי (STEM) בישראל מזה שנים רבות." },
        missions: { title: "משלחות BETT לונדון", body: "מוביל מזה 7 שנים ברציפות משלחות יוקרתיות של מנהלים, קב\"טים ואנשי חינוך לכנס החדשנות הגדול בעולם (BETT) בלונדון ול-92nd בניו יורק, במטרה לייבא לישראל את הבשורות הטכנולוגיות המתקדמות ביותר." },
        experience: { title: "23 שנות ניסיון", body: "ניסיון עשיר של מעל לשני עשורים בהובלת פרויקטים טכנולוגיים-חינוכיים מורכבים, הקמת עשרות מרחבי חדשנות ברחבי הארץ, ניהול מערכי הדרכה ארציים וליווי אסטרטגי של רשתות חינוך ורשויות מקומיות." },
        vision: { title: "חזון הלומד העצמאי", body: "האמונה המנחה של רמי היא שהטכנולוגיה היא כלי להעצמת הילד. המטרה המרכזית היא פיתוח 'לומד אוטונומי' שמסוגל ללמוד כל דבר בכוחות עצמו, תוך שימוש מושכל בבינה מלאכותית ורובוטיקה ככלים לפיתוח חשיבה, יצירתיות ורגש." }
    };

    useEffect(() => {
        const loadScripts = async () => {
            const addScript = (src) => new Promise((resolve) => {
                if (document.querySelector(`script[src="${src}"]`)) return resolve();
                const s = document.createElement('script');
                s.src = src;
                s.onload = resolve;
                document.head.appendChild(s);
            });
            await addScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');
            await addScript('https://cdn.jsdelivr.net/npm/chart.js');
            initPageLogic();
        };

        loadScripts();

        let scene, camera, renderer, objects = [];
        let animationId;
        let observer;

        function initPageLogic() {
            const THREE = window.THREE;
            const Chart = window.Chart;

            if (THREE && canvasContainerRef.current && !renderer) {
                scene = new THREE.Scene();
                camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
                renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
                renderer.setSize(window.innerWidth, window.innerHeight);
                canvasContainerRef.current.appendChild(renderer.domElement);

                const light = new THREE.PointLight(0xffffff, 1.5, 100);
                light.position.set(5, 5, 5);
                scene.add(light);
                scene.add(new THREE.AmbientLight(0xffffff, 0.4));

                // 7 אובייקטים בסך הכל (1 הירו ראשי + 6 קטגוריות)
                const geometries = [
                    new THREE.TorusKnotGeometry(1.5, 0.4, 200, 32), // Hero (Index 0)
                    new THREE.TorusKnotGeometry(0.7, 0.25, 100, 16),// Strip 1
                    new THREE.IcosahedronGeometry(0.8),             // Strip 2
                    new THREE.BoxGeometry(1.2, 1.2, 1.2),           // Strip 3
                    new THREE.DodecahedronGeometry(0.9),            // Strip 4
                    new THREE.SphereGeometry(0.8, 32, 32),          // Strip 5
                    new THREE.OctahedronGeometry(0.9)               // Strip 6
                ];
                const colors = [0x46bad1, 0x46bad1, 0x8cc63f, 0xf7941d, 0x46bad1, 0xffcc00, 0xf15a24];

                geometries.forEach((geo, i) => {
                    const mat = new THREE.MeshPhongMaterial({ 
                        color: colors[i], 
                        shininess: 120, 
                        transparent: true, 
                        opacity: 0,
                        wireframe: true // הכל רשת עדינה ותלת מימדית
                    });
                    const mesh = new THREE.Mesh(geo, mat);
                    // מיקומים שונים - 0 הוא ההירו, השאר לפסקאות
                    mesh.position.y = i === 0 ? 0 : -i * 10;
                    mesh.position.x = i === 0 ? 0 : ((i % 2 === 1) ? 4 : -4);
                    scene.add(mesh);
                    objects.push(mesh);
                });

                camera.position.z = 6;

                const animate = () => {
                    animationId = requestAnimationFrame(animate);
                    objects.forEach((obj) => {
                        obj.rotation.x += 0.005;
                        obj.rotation.y += 0.008;
                    });
                    renderer.render(scene, camera);
                };
                animate();

                // סנכרון גלילה מתוקן - כך הצורות נשארות גלויות הרבה יותר זמן!
                const handleScroll = () => {
                    const scrollY = window.scrollY;
                    const vh = window.innerHeight;
                    
                    if(camera) camera.position.y = - (scrollY / vh) * 10;

                    objects.forEach((obj, i) => {
                        const targetId = i === 0 ? 'hero' : `strip-${i}`;
                        const element = document.getElementById(targetId);
                        if (!element) return;

                        const rect = element.getBoundingClientRect();
                        const centerOffset = (vh / 2 - rect.top) / (vh / 2); // -1 to 1

                        if (rect.top < vh && rect.bottom > 0) {
                            // שיניתי את הנוסחה: עכשיו האטימות חזקה ונשארת לזמן רב
                            obj.material.opacity = Math.max(0, 1 - (Math.abs(centerOffset) * 0.4));
                            const scaleFactor = 1 + (1 - Math.abs(centerOffset)) * 0.3;
                            obj.scale.set(scaleFactor, scaleFactor, scaleFactor);
                            obj.position.z = (1 - Math.abs(centerOffset)) * 2;
                        } else {
                            obj.material.opacity = 0;
                        }
                    });
                };
                window.addEventListener('scroll', handleScroll);
            }

            observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) entry.target.classList.add('visible');
                });
            }, { threshold: 0.2 });

            document.querySelectorAll('[data-observe="true"]').forEach(el => observer.observe(el));

            if (Chart && chartRef.current && !chartRef.current.chartInstance) {
                chartRef.current.chartInstance = new Chart(chartRef.current, {
                    type: 'bar',
                    data: {
                        labels: ['מוסדות', 'בתי ספר', 'תוכניות גפן', 'שימור'],
                        datasets: [{
                            data: [1400, 120, 50, 90],
                            backgroundColor: ['#46bad1', '#8cc63f', '#f7941d', '#f15a24'],
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

        return () => {
            if (animationId) cancelAnimationFrame(animationId);
            window.removeEventListener('scroll', () => {});
            if (observer) observer.disconnect();
            if (renderer && canvasContainerRef.current) {
                canvasContainerRef.current.removeChild(renderer.domElement);
                renderer.dispose();
            }
        };
    }, []);

    // שותפים - מערך תמונות (מונע תמונות שבורות)
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

    return (
        <div className={`antialiased font-sans ${accSettings.largeText ? 'text-lg' : ''}`} dir="rtl">
            <style>{`
                body { scroll-behavior: smooth; overflow-x: hidden; }
                #canvas-container { position: fixed; top: 0; left: 0; width: 100%; height: 100vh; z-index: 10; pointer-events: none; }
                .section-strip { position: relative; min-height: 100vh; display: flex; align-items: center; padding: 5rem 0; z-index: 20; }
                .category-content { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(10px); border-radius: 2rem; transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1); opacity: 0; transform: translateX(100px); }
                .category-content.visible { opacity: 1; transform: translateX(0); }
                .category-image-wrapper { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.2); border-radius: 2rem; overflow: hidden; opacity: 0; transform: scale(0.8); transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
                .category-image-wrapper.visible { opacity: 1; transform: scale(1); }
                
                .marquee-container { width: 100%; overflow: hidden; padding: 3rem 0; background: #fff; border-top: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0; }
                .marquee-track { display: flex; width: max-content; animation: scroll-left 40s linear infinite; }
                @keyframes scroll-left { 0% { transform: translateX(0); } 100% { transform: translateX(50%); } }
                .partner-logo { width: 140px; height: 140px; margin: 0 40px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(0,0,0,0.05); flex-shrink: 0; padding: 15px; border: 1px solid #eee; }
                .partner-logo img { max-width: 90%; max-height: 90%; object-fit: contain; }
                
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 5000; backdrop-filter: blur(15px); align-items: center; justify-content: center; }
                .modal-content { background: white; padding: 3rem; border-radius: 2.5rem; max-width: 600px; width: 90%; position: relative; animation: modalIn 0.4s ease-out; }
                @keyframes modalIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
                
                .scroll-indicator { position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); text-align: center; color: #1a1a1a; opacity: 0.6; animation: bounce 2s infinite; cursor: pointer; }
                @keyframes bounce { 0%, 20%, 50%, 80%, 100% {transform: translateY(0) translateX(-50%);} 40% {transform: translateY(-10px) translateX(-50%);} 60% {transform: translateY(-5px) translateX(-50%);} }
                
                .personal-box { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; border: 1px solid #f0f0f0; }
                .personal-box:hover { transform: translateY(-10px); border-color: #46bad1; box-shadow: 0 20px 40px rgba(70,186,209,0.2); }

                /* צבעים מרכזיים */
                .text-chotam-teal { color: #46bad1; } .bg-chotam-teal { background-color: #46bad1; } .border-chotam-teal { border-color: #46bad1; }
                .text-chotam-green { color: #8cc63f; } .bg-chotam-green { background-color: #8cc63f; } .border-chotam-green { border-color: #8cc63f; }
                .text-chotam-yellow { color: #ffcc00; } .bg-chotam-yellow { background-color: #ffcc00; } .border-chotam-yellow { border-color: #ffcc00; }
                .text-chotam-orange { color: #f7941d; } .bg-chotam-orange { background-color: #f7941d; } .border-chotam-orange { border-color: #f7941d; }
                .text-chotam-red { color: #f15a24; } .bg-chotam-red { background-color: #f15a24; } .border-chotam-red { border-color: #f15a24; }
                .text-chotam-black { color: #1a1a1a; } .bg-chotam-black { background-color: #1a1a1a; }

                /* CSS הנגשה */
                ${accSettings.contrast ? `
                    .bg-white, .bg-slate-50, .bg-gray-50 { background-color: #121212 !important; color: #fff !important; border-color: #333 !important; }
                    .text-slate-600, .text-gray-600, .text-gray-500, .text-slate-800, .text-chotam-black { color: #fff !important; }
                    p, h1, h2, h3, h4, span { color: #fff !important; text-shadow: none !important; }
                    .category-content, .personal-box { background: rgba(0,0,0,0.9) !important; }
                    .marquee-container { background: #000 !important; border-color: #333 !important; }
                    .partner-logo { background: #222 !important; border-color: #444 !important; }
                ` : ''}
                ${accSettings.highlightLinks ? `
                    a, button { text-decoration: underline !important; font-weight: 900 !important; }
                ` : ''}
                
                @media print { .no-print { display: none !important; } }
            `}</style>

            <div id="canvas-container" ref={canvasContainerRef}></div>

            <header className="fixed top-0 w-full bg-white/90 backdrop-blur-md shadow-sm z-[100] no-print">
                <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-24">
                    <div className="flex items-center gap-6">
                        <img src="https://i.postimg.cc/mrzcZWpL/lwgw-hwtm-mwnps.gif" alt="לוגו חותם חיים" className="h-16 md:h-20" />
                        <nav className="hidden lg:flex gap-8 text-sm font-bold text-chotam-black tracking-widest uppercase items-center">
                            <a href="#hero" className="hover:text-chotam-teal transition">התחלה</a>
                            
                            {/* תפריט נפתח לפעילות */}
                            <div className="relative group py-4">
                                <a href="#sectors" className="hover:text-chotam-teal transition flex items-center gap-1 cursor-pointer">
                                    פעילות <span className="text-[10px] opacity-50 relative top-px">▼</span>
                                </a>
                                <div className="absolute top-full right-0 w-56 bg-white border border-slate-100 shadow-2xl rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col py-3 overflow-hidden">
                                    <a href="#strip-1" className="px-5 py-3 hover:bg-slate-50 hover:text-chotam-teal text-sm transition font-semibold border-b border-slate-50">1. עולם הציוד והאספקה</a>
                                    <a href="#strip-2" className="px-5 py-3 hover:bg-slate-50 hover:text-chotam-green text-sm transition font-semibold border-b border-slate-50">2. הדרכה וליווי פדגוגי</a>
                                    <a href="#strip-3" className="px-5 py-3 hover:bg-slate-50 hover:text-chotam-orange text-sm transition font-semibold border-b border-slate-50">3. הקמת מרחבי למידה</a>
                                    <a href="#strip-4" className="px-5 py-3 hover:bg-slate-50 hover:text-chotam-teal text-sm transition font-semibold border-b border-slate-50">4. חלומציאות</a>
                                    <a href="#strip-5" className="px-5 py-3 hover:bg-slate-50 hover:text-chotam-yellow text-sm transition font-semibold border-b border-slate-50">5. משלחות למידה</a>
                                    <a href="#strip-6" className="px-5 py-3 hover:bg-slate-50 hover:text-chotam-red text-sm transition font-semibold">6. סדנאות וימי שיא</a>
                                </div>
                            </div>

                            <a href="#partners" className="hover:text-chotam-teal transition">שותפים לדרך</a>
                            <a href="#impact" className="hover:text-chotam-teal transition">אימפקט</a>
                            <a href="#rami" className="hover:text-chotam-teal transition">המייסד</a>
                        </nav>
                    </div>
                    <div className="flex gap-4 items-center">
                        <button onClick={() => window.print()} className="text-gray-300 text-xs font-bold hover:text-chotam-teal transition">PDF</button>
                        <a href="#contact" className="bg-chotam-teal text-white px-8 py-3 rounded-full font-bold text-sm shadow-xl hover:bg-chotam-black transition duration-300">פגישת ייעוץ</a>
                        <button onClick={onLoginClick} className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold text-sm shadow-xl hover:bg-chotam-teal transition duration-300">להתחבר</button>
                    </div>
                </div>
            </header>

            <section id="hero" className="relative h-screen flex flex-col items-center justify-center text-center px-4 bg-white">
                <div className="z-30">
                    <h1 className="text-6xl md:text-8xl font-extrabold text-chotam-black mb-6 leading-tight tracking-tighter">טכנולוגיה עם <span className="text-chotam-teal italic">נשמה</span></h1>
                    <p className="text-xl md:text-3xl text-gray-400 font-light max-w-3xl mx-auto leading-relaxed">
                        חותם חיים מבית רובוטיקס - החברה המובילה בישראל לחדשנות פדגוגית, הקמת מרחבי STEM ופיתוח הלומד האוטונומי.
                    </p>
                </div>
                
                <div className="scroll-indicator" onClick={() => window.scrollTo({top: window.innerHeight, behavior: 'smooth'})}>
                    <span className="text-xs font-bold uppercase tracking-[0.3em] mb-2 block">גלול מטה</span>
                    <svg className="mx-auto" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                    </svg>
                </div>
            </section>

            <section id="sectors">
                {/* 1. ציוד */}
                <div className="section-strip" id="strip-1">
                    <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
                        <div className="category-content p-8 md:p-12 order-2 md:order-1" data-observe="true">
                            <a href="#strip-1" className="group block">
                                <h2 className="text-4xl md:text-5xl font-extrabold text-chotam-teal mb-6 group-hover:underline">1. עולם הציוד והאספקה</h2>
                                <p className="text-xl text-gray-600 leading-relaxed">ספקית ציוד מהגדולות במשק עם מגוון עצום של מעל 50,000 מוצרים מקצועיים למעבדות, בתי ספר ומרכזי חדשנות. אנחנו מביאים את חזית הטכנולוגיה ישירות אליכם.</p>
                                <span className="inline-block mt-8 text-chotam-teal font-black text-lg border-b-2 border-chotam-teal pb-1">מידע נוסף ←</span>
                            </a>
                        </div>
                        <div className="category-image-wrapper order-1 md:order-2" data-observe="true">
                            <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800" alt="ציוד טכנולוגי" className="w-full h-[400px] object-cover" />
                        </div>
                    </div>
                </div>

                {/* 2. הדרכה */}
                <div className="section-strip bg-gray-50/50" id="strip-2">
                    <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
                        <div className="category-image-wrapper" data-observe="true">
                            <img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800" alt="הדרכה וחינוך" className="w-full h-[400px] object-cover" />
                        </div>
                        <div className="category-content p-8 md:p-12" data-observe="true">
                            <a href="#strip-2" className="group block">
                                <h2 className="text-4xl md:text-5xl font-extrabold text-chotam-green mb-6 group-hover:underline">2. הדרכה וליווי פדגוגי</h2>
                                <p className="text-xl text-gray-600 leading-relaxed">מספקים קורסים ב-75 רשויות מקומיות. אנו מכשירים מאות מורים מדי שנה ומלווים אותם בתוך הכיתה עם הצוותים המקצועיים שלנו, כדי להבטיח למידה משמעותית.</p>
                                <span className="inline-block mt-8 text-chotam-green font-black text-lg border-b-2 border-chotam-green pb-1">גלו את הקורסים שלנו ←</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* 3. מרחבים */}
                <div className="section-strip" id="strip-3">
                    <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
                        <div className="category-content p-8 md:p-12 order-2 md:order-1" data-observe="true">
                            <a href="#strip-3" className="group block">
                                <h2 className="text-4xl md:text-5xl font-extrabold text-chotam-orange mb-6 group-hover:underline">3. הקמת מרחבי למידה</h2>
                                <p className="text-xl text-gray-600 leading-relaxed">החברה הגדולה במשק להקמת מרחבי מייקרים, כיתות STEM, מרכזים טכנולוגיים ומרחבי "חלומציאות" מותאמים אישית. אנחנו הופכים כל חדר לחממת יצירה.</p>
                                <span className="inline-block mt-8 text-chotam-orange font-black text-lg border-b-2 border-chotam-orange pb-1">תכנון מרחב למידה ←</span>
                            </a>
                        </div>
                        <div className="category-image-wrapper order-1 md:order-2" data-observe="true">
                            <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800" alt="מרחבי למידה" className="w-full h-[400px] object-cover" />
                        </div>
                    </div>
                </div>

                {/* 4. חלומציאות */}
                <div className="section-strip bg-gray-50/50" id="strip-4">
                    <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
                        <div className="category-image-wrapper" data-observe="true">
                            <img src="https://images.unsplash.com/photo-1626379953822-baec19c3bbcd?auto=format&fit=crop&q=80&w=800" alt="חלומציאות" className="w-full h-[400px] object-cover" />
                        </div>
                        <div className="category-content p-8 md:p-12" data-observe="true">
                            <a href="#strip-4" className="group block">
                                <h2 className="text-4xl md:text-5xl font-extrabold text-chotam-teal mb-6 group-hover:underline">4. סיור ב"חלומציאות"</h2>
                                <p className="text-xl text-gray-600 leading-relaxed">מרכז החדשנות שלנו בפתח תקווה - 250 מ"ר של עשייה פדגוגית חווייתית: קארטינג הנדסי, VR, רחפנים וטכנולוגיות קצה. המקום שבו חלומות הופכים למציאות.</p>
                                <span className="inline-block mt-8 text-chotam-teal font-black text-lg border-b-2 border-chotam-teal pb-1">תאמו סיור השראה ←</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* 5. משלחות */}
                <div className="section-strip" id="strip-5">
                    <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
                        <div className="category-content p-8 md:p-12 order-2 md:order-1" data-observe="true">
                            <a href="#strip-5" className="group block">
                                <h2 className="text-4xl md:text-5xl font-extrabold text-chotam-yellow mb-6 group-hover:underline">5. משלחות למידה בחו"ל</h2>
                                <p className="text-xl text-gray-600 leading-relaxed">הולנד, אנגליה, גרמניה וארה"ב. אנו מוציאים משלחות לומדות עם גמול השתלמות למנהלים ואנשי חינוך. הזדמנות להיחשף לחינוך העתיד בעולם.</p>
                                <span className="inline-block mt-8 text-chotam-yellow font-black text-lg border-b-2 border-chotam-yellow pb-1">הצטרפו למשלחת הבאה ←</span>
                            </a>
                        </div>
                        <div className="category-image-wrapper order-1 md:order-2" data-observe="true">
                            <img src="https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&q=80&w=800" alt="משלחות לחו''ל" className="w-full h-[400px] object-cover" />
                        </div>
                    </div>
                </div>

                {/* 6. סדנאות */}
                <div className="section-strip bg-gray-50/50" id="strip-6">
                    <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
                        <div className="category-image-wrapper" data-observe="true">
                            <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800" alt="סדנאות וימי שיא" className="w-full h-[400px] object-cover" />
                        </div>
                        <div className="category-content p-8 md:p-12" data-observe="true">
                            <a href="#strip-6" className="group block">
                                <h2 className="text-4xl md:text-5xl font-extrabold text-chotam-red mb-6 group-hover:underline">6. סדנאות וימי שיא</h2>
                                <p className="text-xl text-gray-600 leading-relaxed">מביאים את ההייטק אליכם. סדנאות חווייתיות לבתי ספר, אקדמיה וחברות הייטק. עשרות חברות כבר חוו את העושר הטכנולוגי שלנו. הזמינו יום שיא בלתי נשכח.</p>
                                <span className="inline-block mt-8 text-chotam-red font-black text-lg border-b-2 border-chotam-red pb-1">הזמינו סדנא היום ←</span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* שותפים לדרך (עם תפיסת שגיאת תמונה להסתרתה) */}
            <section id="partners" className="py-16 bg-white overflow-hidden no-print">
                <div className="marquee-container flex flex-col items-center">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-chotam-black mb-10 italic">שותפים לדרך</h2>
                    <div className="marquee-track">
                        {partners.map((p, idx) => (
                            <div key={`p1-${idx}`} className="partner-logo">
                                <img src={p.src} alt={p.alt} onError={(e) => e.target.style.display='none'} />
                            </div>
                        ))}
                        {/* שיכפול כדי שהלולאה תרוץ ברצף */}
                        {partners.map((p, idx) => (
                            <div key={`p2-${idx}`} className="partner-logo">
                                <img src={p.src} alt={p.alt} onError={(e) => e.target.style.display='none'} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="impact" className="py-24 bg-white border-t border-gray-100">
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

            <section id="rami" className="py-24 bg-gray-50 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 text-center mb-16">
                    <h2 className="text-5xl font-extrabold text-chotam-black mb-6 tracking-tighter">רמי חדאד</h2>
                    <p className="text-2xl text-gray-500 font-light max-w-3xl mx-auto leading-relaxed italic">
                        מייסד ובעלים, מרצה באקדמיה, עו"ד ומומחה לקניין רוחני. <br />
                        מוביל את החיבור שבין טכנולוגיה, פדגוגיה ומשפט.
                    </p>
                </div>

                <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-3 gap-8">
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

            <footer id="contact" className="bg-chotam-black text-white py-24 text-center no-print">
                <div className="max-w-4xl mx-auto px-4">
                    <h2 className="text-6xl font-extrabold mb-14 italic tracking-tighter">להפוך חלום למציאות.</h2>
                    <div className="flex flex-col sm:flex-row justify-center gap-10 mb-20">
                        <button className="bg-chotam-teal text-white px-16 py-5 rounded-full font-bold text-2xl hover:scale-105 transition shadow-2xl">סיור ב"חלומציאות"</button>
                        <button className="bg-white/10 text-white px-16 py-5 rounded-full font-bold text-2xl hover:bg-white hover:text-chotam-black transition">צרו קשר עכשיו</button>
                    </div>
                    <p className="text-[10px] opacity-20 tracking-[0.5em] uppercase font-bold px-4 leading-relaxed">משרד הביטחון | משרד החינוך | רשת אמית | אפטר סקול | קק"ל | ברנקו וייס | רשת אורט | רשת עמל</p>
                    <p className="mt-12 text-[10px] opacity-10 font-bold">&copy; 2026 חותם חיים מבית רובוטיקס. רמי חדאד, עו"ד.</p>
                </div>
            </footer>

            {/* Modal Popup */}
            {activeModal && (
                <div className="modal-overlay" style={{display: 'flex'}} onClick={() => setActiveModal(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="absolute top-8 left-8 text-3xl text-gray-300 hover:text-chotam-red transition" onClick={() => setActiveModal(null)}>&#10005;</button>
                        <h3 className="text-4xl font-black text-chotam-teal mb-8">{modalData[activeModal].title}</h3>
                        <div className="text-gray-600 leading-relaxed text-xl font-light">{modalData[activeModal].body}</div>
                        <button className="mt-12 w-full bg-gray-50 py-5 rounded-2xl font-bold text-chotam-black hover:bg-chotam-teal hover:text-white transition shadow-sm text-lg" onClick={() => setActiveModal(null)}>סגור חלונית</button>
                    </div>
                </div>
            )}

            {/* --- כפתור וחלון נגישות --- */}
            <div className="fixed bottom-6 left-6 z-[6000] no-print">
                {accOpen && (
                    <div className="bg-white p-6 rounded-2xl shadow-2xl border border-slate-100 mb-4 w-64 text-right">
                        <h4 className="font-bold text-slate-800 border-b pb-2 mb-4">תפריט נגישות ♿</h4>
                        <div className="space-y-4">
                            <label className="flex items-center justify-between cursor-pointer group">
                                <span className="text-sm font-semibold text-slate-700 group-hover:text-chotam-teal">ניגודיות גבוהה</span>
                                <input type="checkbox" checked={accSettings.contrast} onChange={() => toggleAcc('contrast')} className="w-5 h-5 accent-chotam-teal" />
                            </label>
                            <label className="flex items-center justify-between cursor-pointer group">
                                <span className="text-sm font-semibold text-slate-700 group-hover:text-chotam-teal">טקסט מוגדל</span>
                                <input type="checkbox" checked={accSettings.largeText} onChange={() => toggleAcc('largeText')} className="w-5 h-5 accent-chotam-teal" />
                            </label>
                            <label className="flex items-center justify-between cursor-pointer group">
                                <span className="text-sm font-semibold text-slate-700 group-hover:text-chotam-teal">הדגשת קישורים</span>
                                <input type="checkbox" checked={accSettings.highlightLinks} onChange={() => toggleAcc('highlightLinks')} className="w-5 h-5 accent-chotam-teal" />
                            </label>
                        </div>
                    </div>
                )}
                <button 
                    onClick={() => setAccOpen(!accOpen)}
                    className="bg-[#1a1a1a] text-white w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-xl hover:scale-110 transition border-2 border-white"
                    title="אפשרויות נגישות">
                    ♿
                </button>
            </div>
        </div>
    );
}
