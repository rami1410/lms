import React, { useEffect, useRef, useState } from 'react';

export default function LandingPage({ onLoginClick }) {
    const canvasContainerRef = useRef(null);
    const chartRef = useRef(null);
    const [activeModal, setActiveModal] = useState(null);

    const modalData = {
        law: { title: "עורך דין וקניין רוחני", body: "רמי חדאד הינו עו\"ד מוסמך (LL.B) עם התמחות עמוקה בקניין רוחני. ניסיון זה מאפשר לקבוצה להגן על פיתוחיה הטכנולוגיים והפדגוגיים הייחודיים." },
        academic: { title: "מרצה בכיר באקדמיה", body: "בעל תואר שני (M.A) בחינוך ומרצה מבוקש במוסדות להשכלה גבוהה, המחבר בין מחקר עדכני לפרקטיקה בשטח." },
        steering: { title: "חבר בוועדות היגוי", body: "כחבר פעיל בוועדת ההיגוי העליונה של משרד החינוך בתחום הרובוטיקה, רמי שותף לעיצוב המדיניות הלאומית וקידום ה-STEM." },
        missions: { title: "משלחות BETT לונדון", body: "מוביל מזה 7 שנים ברציפות משלחות יוקרתיות של מנהלים ואנשי חינוך לכנסי החדשנות הגדולים בעולם בלונדון ובניו יורק." },
        experience: { title: "23 שנות ניסיון", body: "ניסיון עשיר בהובלת פרויקטים טכנולוגיים-חינוכיים מורכבים והקמת עשרות מרחבי חדשנות ברחבי הארץ." },
        vision: { title: "חזון הלומד העצמאי", body: "האמונה המנחה היא שהטכנולוגיה היא כלי להעצמת הילד, לפיתוח 'לומד אוטונומי' שמסוגל ללמוד כל דבר בכוחות עצמו." }
    };

    useEffect(() => {
        // פונקציה לטעינת הספריות החיצוניות (Three.js ו-Chart.js) בצורה בטוחה ל-React
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
            // --- THREE.JS ---
            const THREE = window.THREE;
            const Chart = window.Chart;

            if (THREE && canvasContainerRef.current && !renderer) {
                scene = new THREE.Scene();
                camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
                renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
                renderer.setSize(window.innerWidth, window.innerHeight);
                canvasContainerRef.current.appendChild(renderer.domElement);

                const light = new THREE.PointLight(0xffffff, 1.5, 100);
                light.position.set(10, 10, 10);
                scene.add(light);
                scene.add(new THREE.AmbientLight(0xffffff, 0.4));

                const heroGeo = new THREE.TorusKnotGeometry(1.5, 0.4, 200, 32);
                const heroMat = new THREE.MeshPhongMaterial({ color: 0x46bad1, wireframe: true, opacity: 0.15, transparent: true });
                const heroMesh = new THREE.Mesh(heroGeo, heroMat);
                scene.add(heroMesh);
                objects.push(heroMesh);

                const stripGeos = [
                    new THREE.TorusGeometry(1, 0.4, 16, 100),
                    new THREE.IcosahedronGeometry(1.2, 0),
                    new THREE.BoxGeometry(1.5, 1.5, 1.5),
                    new THREE.DodecahedronGeometry(1.2),
                    new THREE.SphereGeometry(1.1, 32, 32),
                    new THREE.OctahedronGeometry(1.3)
                ];
                const colors = [0x46bad1, 0x8cc63f, 0xf7941d, 0x46bad1, 0xffcc00, 0xf15a24];

                stripGeos.forEach((geo, i) => {
                    const mat = new THREE.MeshPhongMaterial({ color: colors[i], transparent: true, opacity: 0, shininess: 100 });
                    const mesh = new THREE.Mesh(geo, mat);
                    mesh.position.y = -(i + 1) * 12;
                    mesh.position.x = (i % 2 === 0) ? 6 : -6;
                    scene.add(mesh);
                    objects.push(mesh);
                });

                camera.position.z = 8;

                const animate = () => {
                    animationId = requestAnimationFrame(animate);
                    objects.forEach(obj => {
                        obj.rotation.x += 0.005;
                        obj.rotation.y += 0.008;
                    });
                    renderer.render(scene, camera);
                };
                animate();

                // --- SCROLL EFFECTS ---
                const handleScroll = () => {
                    const vh = window.innerHeight;
                    if(camera) camera.position.y = - (window.scrollY / vh) * 12;

                    objects.forEach((obj, i) => {
                        const stripId = i === 0 ? 'hero' : `strip-${i}`;
                        const strip = document.getElementById(stripId);
                        if (!strip) return;
                        const rect = strip.getBoundingClientRect();
                        const centerRel = (vh/2 - rect.top) / (vh/2); 
                        if (rect.top < vh && rect.bottom > 0) {
                            obj.material.opacity = Math.min(0.8, 1.2 - Math.abs(centerRel));
                            const zoom = 1 + (1 - Math.abs(centerRel)) * 1.5;
                            obj.scale.set(zoom, zoom, zoom);
                            obj.position.z = (1 - Math.abs(centerRel)) * 3;
                        } else if (i > 0) {
                            obj.material.opacity = 0;
                        }
                    });
                };
                window.addEventListener('scroll', handleScroll);
            }

            // --- OBSERVER ---
            observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
            }, { threshold: 0.15 });
            document.querySelectorAll('[data-observe]').forEach(el => observer.observe(el));

            // --- CHART.JS ---
            if (Chart && chartRef.current && !chartRef.current.chartInstance) {
                chartRef.current.chartInstance = new Chart(chartRef.current, { 
                    type: 'bar', 
                    data: { 
                        labels: ['מוסדות', 'בתי ספר', 'גפן', 'שימור'], 
                        datasets: [{ data: [1400, 120, 50, 90], backgroundColor: ['#46bad1', '#8cc63f', '#f7941d', '#f15a24'], borderRadius: 15 }] 
                    }, 
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } 
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

    return (
        <div className="antialiased bg-white text-[#1a1a1a] font-sans" dir="rtl">
            <style>{`
                body { scroll-behavior: smooth; overflow-x: hidden; }
                #canvas-container { position: fixed; top: 0; left: 0; width: 100%; height: 100vh; z-index: 5; pointer-events: none; }
                .section-strip { position: relative; min-height: 100vh; display: flex; align-items: center; padding: 6rem 0; z-index: 10; }
                .category-content { background: rgba(255, 255, 255, 0.75); backdrop-filter: blur(15px); border-radius: 2.5rem; transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1); opacity: 0; transform: translateX(80px); border: 1px solid rgba(255,255,255,0.4); }
                .category-content.visible { opacity: 1; transform: translateX(0); }
                .category-image-wrapper { box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.2); border-radius: 2.5rem; overflow: hidden; opacity: 0; transform: scale(0.9); transition: all 0.9s ease; }
                .category-image-wrapper.visible { opacity: 1; transform: scale(1); }
                .marquee-container { width: 100%; overflow: hidden; padding: 4rem 0; background: #fff; z-index: 20; position: relative; border-top: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0; }
                .marquee-track { display: flex; width: max-content; animation: scroll-left 40s linear infinite; }
                @keyframes scroll-left { 0% { transform: translateX(0); } 100% { transform: translateX(50%); } }
                .partner-logo { width: 140px; height: 140px; margin: 0 35px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(0,0,0,0.06); flex-shrink: 0; padding: 15px; border: 1px solid #f0f0f0; transition: transform 0.3s; }
                .partner-logo:hover { transform: scale(1.1); }
                .partner-logo img { max-width: 85%; max-height: 85%; object-fit: contain; }
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 5000; backdrop-filter: blur(20px); align-items: center; justify-content: center; }
                .modal-content { background: white; padding: 3.5rem; border-radius: 3rem; max-width: 650px; width: 90%; position: relative; animation: modalIn 0.5s ease-out; }
                @keyframes modalIn { from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: scale(1); } }
                .scroll-down { position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%); text-align: center; color: #1a1a1a; opacity: 0.7; animation: bounce 2s infinite; cursor: pointer; z-index: 50; }
                @keyframes bounce { 0%, 20%, 50%, 80%, 100% {transform: translateY(0) translateX(-50%);} 40% {transform: translateY(-12px) translateX(-50%);} 60% {transform: translateY(-6px) translateX(-50%);} }
                .personal-info-box { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; border: 1px solid #f0f0f0; }
                .personal-info-box:hover { transform: translateY(-10px); border-color: #46bad1; box-shadow: 0 20px 40px rgba(70,186,209,0.2); }
                /* Custom Colors mapped from HTML */
                .text-chotam-teal { color: #46bad1; } .bg-chotam-teal { background-color: #46bad1; } .border-chotam-teal { border-color: #46bad1; }
                .text-chotam-green { color: #8cc63f; } .bg-chotam-green { background-color: #8cc63f; } .border-chotam-green { border-color: #8cc63f; }
                .text-chotam-yellow { color: #ffcc00; } .bg-chotam-yellow { background-color: #ffcc00; } .border-chotam-yellow { border-color: #ffcc00; }
                .text-chotam-orange { color: #f7941d; } .bg-chotam-orange { background-color: #f7941d; } .border-chotam-orange { border-color: #f7941d; }
                .text-chotam-red { color: #f15a24; } .bg-chotam-red { background-color: #f15a24; } .border-chotam-red { border-color: #f15a24; }
                .text-chotam-black { color: #1a1a1a; } .bg-chotam-black { background-color: #1a1a1a; }
            `}</style>

            {/* 3D Canvas Background */}
            <div id="canvas-container" ref={canvasContainerRef}></div>

            {/* Header */}
            <header className="fixed top-0 w-full bg-white/90 backdrop-blur-xl shadow-sm z-[100]">
                <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-24">
                    <div className="flex items-center gap-8">
                        <img src="https://i.postimg.cc/mrzcZWpL/lwgw-hwtm-mwnps.gif" alt="לוגו חותם חיים" className="h-16 md:h-20" />
                        <nav className="hidden lg:flex gap-8 text-sm font-bold text-chotam-black tracking-widest uppercase">
                            <a href="#sectors" className="hover:text-chotam-teal transition">פעילות</a>
                            <a href="#partners" className="hover:text-chotam-teal transition">שותפים</a>
                            <a href="#impact" className="hover:text-chotam-teal transition">אימפקט</a>
                            <a href="#rami" className="hover:text-chotam-teal transition">רמי חדאד</a>
                        </nav>
                    </div>
                    {/* הפעלת מנגנון המעבר למסך התחברות כאן! */}
                    <button onClick={onLoginClick} className="bg-chotam-teal text-white px-10 py-3 rounded-full font-bold text-sm shadow-xl hover:bg-chotam-black transition duration-500">
                        להתחבר למערכת
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <section id="hero" className="relative h-screen flex flex-col items-center justify-center text-center px-4 bg-white z-20">
                <h1 className="text-6xl md:text-8xl font-extrabold text-chotam-black mb-8 leading-tight tracking-tighter">טכנולוגיה עם <span className="text-chotam-teal italic">נשמה</span></h1>
                <p className="text-xl md:text-3xl text-gray-400 font-light max-w-4xl mx-auto leading-relaxed italic">
                    חותם חיים מבית רובוטיקס - החברה המובילה בישראל לחדשנות פדגוגית, <br className="hidden md:block" />הקמת מרחבי STEM ופיתוח הלומד האוטונומי.
                </p>
                <div className="scroll-down" onClick={() => window.scrollTo({top: window.innerHeight, behavior: 'smooth'})}>
                    <span className="text-xs font-bold uppercase tracking-[0.4em] mb-3 block">גלול מטה</span>
                    <svg className="mx-auto" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                    </svg>
                </div>
            </section>

            {/* 6 Interactive Sectors */}
            <section id="sectors">
                {/* 1. ציוד */}
                <div className="section-strip" id="strip-1">
                    <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-20 items-center">
                        <div className="category-content p-10 md:p-14 order-2 md:order-1" data-observe="true">
                            <a href="#strip-1" className="group block">
                                <h2 className="text-4xl md:text-5xl font-extrabold text-chotam-teal mb-6">1. עולם הציוד והאספקה</h2>
                                <p className="text-xl text-gray-600 leading-relaxed">ספקית ציוד מהגדולות במשק עם מגוון עצום של מעל 50,000 מוצרים מקצועיים למעבדות ומרכזי חדשנות.</p>
                                <span className="inline-block mt-8 text-chotam-teal font-black text-lg border-b-2 border-chotam-teal pb-1">לקטלוג המלא ←</span>
                            </a>
                        </div>
                        <div className="category-image-wrapper order-1 md:order-2" data-observe="true">
                            <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800" alt="ציוד" className="w-full h-[450px] object-cover" />
                        </div>
                    </div>
                </div>

                {/* 2. הדרכה */}
                <div className="section-strip bg-gray-50/20" id="strip-2">
                    <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-20 items-center">
                        <div className="category-image-wrapper" data-observe="true">
                            <img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800" alt="הדרכה" className="w-full h-[450px] object-cover" />
                        </div>
                        <div className="category-content p-10 md:p-14" data-observe="true">
                            <a href="#strip-2" className="group block">
                                <h2 className="text-4xl md:text-5xl font-extrabold text-chotam-green mb-6">2. הדרכה וליווי פדגוגי</h2>
                                <p className="text-xl text-gray-600 leading-relaxed">מספקים קורסים ב-75 רשויות. אנו מכשירים מאות מורים מדי שנה ומלווים אותם בתוך הכיתה עם הצוותים שלנו.</p>
                                <span className="inline-block mt-8 text-chotam-green font-black text-lg border-b-2 border-chotam-green pb-1">מידע נוסף ←</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* 3. מרחבי למידה */}
                <div className="section-strip" id="strip-3">
                    <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-20 items-center">
                        <div className="category-content p-10 md:p-14 order-2 md:order-1" data-observe="true">
                            <a href="#strip-3" className="group block">
                                <h2 className="text-4xl md:text-5xl font-extrabold text-chotam-orange mb-6">3. הקמת מרחבי למידה</h2>
                                <p className="text-xl text-gray-600 leading-relaxed">החברה הגדולה במשק להקמת מרחבי מייקרים, כיתות STEM, מרכזים טכנולוגיים ומרחבי "חלומציאות".</p>
                                <span className="inline-block mt-8 text-chotam-orange font-black text-lg border-b-2 border-chotam-orange pb-1">תכנון מרחב ←</span>
                            </a>
                        </div>
                        <div className="category-image-wrapper order-1 md:order-2" data-observe="true">
                            <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800" alt="מרחבי למידה" className="w-full h-[450px] object-cover" />
                        </div>
                    </div>
                </div>

                {/* 4. חלומציאות */}
                <div className="section-strip bg-gray-50/20" id="strip-4">
                    <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-20 items-center">
                        <div className="category-image-wrapper" data-observe="true">
                            <img src="https://images.unsplash.com/photo-1626379953822-baec19c3bbcd?auto=format&fit=crop&q=80&w=800" alt="חלומציאות" className="w-full h-[450px] object-cover" />
                        </div>
                        <div className="category-content p-10 md:p-14" data-observe="true">
                            <a href="#strip-4" className="group block">
                                <h2 className="text-4xl md:text-5xl font-extrabold text-chotam-teal mb-6">4. סיור ב"חלומציאות"</h2>
                                <p className="text-xl text-gray-600 leading-relaxed">מרכז החדשנות בפתח תקווה - 250 מ"ר של עשייה פדגוגית: קארטינג, VR, מייקרים, רחפנים ועוד.</p>
                                <span className="inline-block mt-8 text-chotam-teal font-black text-lg border-b-2 border-chotam-teal pb-1">תיאום סיור ←</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* 5. משלחות */}
                <div className="section-strip" id="strip-5">
                    <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-20 items-center">
                        <div className="category-content p-10 md:p-14 order-2 md:order-1" data-observe="true">
                            <a href="#strip-5" className="group block">
                                <h2 className="text-4xl md:text-5xl font-extrabold text-chotam-yellow mb-6">5. משלחות למידה בחו"ל</h2>
                                <p className="text-xl text-gray-600 leading-relaxed">הולנד, אנגליה, גרמניה וארה"ב. משלחות לומדות עם גמול השתלמות למנהלים ואנשי חינוך. הצטרפו אלינו!</p>
                                <span className="inline-block mt-8 text-chotam-yellow font-black text-lg border-b-2 border-chotam-yellow pb-1">הרשמה למסע ←</span>
                            </a>
                        </div>
                        <div className="category-image-wrapper order-1 md:order-2" data-observe="true">
                            <img src="https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&q=80&w=800" alt="משלחות" className="w-full h-[450px] object-cover" />
                        </div>
                    </div>
                </div>

                {/* 6. סדנאות */}
                <div className="section-strip bg-gray-50/20" id="strip-6">
                    <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-20 items-center">
                        <div className="category-image-wrapper" data-observe="true">
                            <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800" alt="סדנאות" className="w-full h-[450px] object-cover" />
                        </div>
                        <div className="category-content p-10 md:p-14" data-observe="true">
                            <a href="#strip-6" className="group block">
                                <h2 className="text-4xl md:text-5xl font-extrabold text-chotam-red mb-6">6. סדנאות וימי שיא</h2>
                                <p className="text-xl text-gray-600 leading-relaxed">מביאים את ההייטק אליכם. סדנאות חווייתיות לבתי ספר ואקדמיה. עשרות חברות הייטק כבר הזמינו.</p>
                                <span className="inline-block mt-8 text-chotam-red font-black text-lg border-b-2 border-chotam-red pb-1">הזמינו יום שיא ←</span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Partners Infinite Seamless Marquee */}
            <section id="partners" className="marquee-container">
                <div className="marquee-track">
                    <div className="partner-logo"><img src="https://i.postimg.cc/7Ytd16kw/images-(2).png" alt="משרד החינוך" /></div>
                    <div className="partner-logo"><img src="https://i.postimg.cc/90hChfMH/images-(1).png" alt="משרד הביטחון" /></div>
                    <div className="partner-logo"><img src="https://i.postimg.cc/WzgLYcw2/Badge-of-the-Israeli-Defense-Forces-2022-version-svg.png" alt="צהל" /></div>
                    <div className="partner-logo"><img src="https://i.postimg.cc/kMyVjsTr/images-(5).png" alt="קק'ל" /></div>
                    <div className="partner-logo"><img src="https://i.postimg.cc/GmdZwJ8M/ort-israel-technology-science-educational-network-logo.jpg" alt="רשת אורט" /></div>
                    <div className="partner-logo"><img src="https://i.postimg.cc/6pKN6xSv/images-(4).png" alt="רשת עמל" /></div>
                    <div className="partner-logo"><img src="https://i.postimg.cc/cHc5v1h4/images-(3).png" alt="עיריית חיפה" /></div>
                    <div className="partner-logo"><img src="https://i.postimg.cc/TwrvCXck/images.jpg" alt="אפטר סקול" /></div>
                    {/* Duplicate for loop */}
                    <div className="partner-logo"><img src="https://i.postimg.cc/7Ytd16kw/images-(2).png" alt="משרד החינוך" /></div>
                    <div className="partner-logo"><img src="https://i.postimg.cc/90hChfMH/images-(1).png" alt="משרד הביטחון" /></div>
                    <div className="partner-logo"><img src="https://i.postimg.cc/WzgLYcw2/Badge-of-the-Israeli-Defense-Forces-2022-version-svg.png" alt="צהל" /></div>
                </div>
            </section>

            {/* Impact Stats */}
            <section id="impact" className="py-24 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-20">
                    <div className="lg:w-1/2">
                        <h2 className="text-5xl font-extrabold text-chotam-black mb-12 border-r-[15px] border-chotam-teal pr-8 italic">האימפקט שלנו</h2>
                        <div className="grid grid-cols-2 gap-8 text-center">
                            <div className="p-8 bg-chotam-teal/5 rounded-[2.5rem]"><span className="block text-4xl font-black text-chotam-teal tracking-tighter">35,000</span><span className="text-[10px] font-bold text-gray-400 uppercase mt-2 block">תלמידים בשנה</span></div>
                            <div className="p-8 bg-chotam-green/5 rounded-[2.5rem]"><span className="block text-4xl font-black text-chotam-green tracking-tighter">1,400+</span><span className="text-[10px] font-bold text-gray-400 uppercase mt-2 block">מוסדות חינוך</span></div>
                            <div className="p-8 bg-chotam-orange/5 rounded-[2.5rem]"><span className="block text-4xl font-black text-chotam-orange tracking-tighter">50</span><span className="text-[10px] font-bold text-gray-400 uppercase mt-2 block text-center">תוכניות גפן</span></div>
                            <div className="p-8 bg-chotam-red/5 rounded-[2.5rem]"><span className="block text-4xl font-black text-chotam-red">90%</span><span className="text-[10px] font-bold text-gray-400 uppercase mt-2 block text-center">שימור לקוחות</span></div>
                        </div>
                    </div>
                    <div className="lg:w-1/2 w-full h-[400px]"><canvas id="impactChart" ref={chartRef}></canvas></div>
                </div>
            </section>

            {/* Rami Haddad Section */}
            <section id="rami" className="py-24 bg-gray-50 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 text-center mb-16">
                    <h2 className="text-5xl font-extrabold text-chotam-black mb-6">רמי חדאד</h2>
                    <p className="text-2xl text-gray-500 font-light max-w-3xl mx-auto leading-relaxed italic">
                        מייסד ובעלים, מרצה באקדמיה, עו"ד ומומחה לקניין רוחני. <br />
                        הכוח הפדגוגי והמשפטי שמוביל את חזון הקבוצה.
                    </p>
                </div>

                <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-3 gap-8">
                    <div onClick={() => setActiveModal('law')} className="personal-info-box p-10 bg-white rounded-[2.5rem] text-center shadow-sm font-black text-lg">עו"ד וקניין רוחני</div>
                    <div onClick={() => setActiveModal('academic')} className="personal-info-box p-10 bg-white rounded-[2.5rem] text-center shadow-sm font-black text-lg text-chotam-green">מרצה בכיר באקדמיה</div>
                    <div onClick={() => setActiveModal('steering')} className="personal-info-box p-10 bg-white rounded-[2.5rem] text-center shadow-sm font-black text-lg text-chotam-orange">חבר בוועדות היגוי</div>
                    <div onClick={() => setActiveModal('missions')} className="personal-info-box p-10 bg-white rounded-[2.5rem] text-center shadow-sm font-black text-lg text-chotam-yellow">משלחות BETT לונדון</div>
                    <div onClick={() => setActiveModal('experience')} className="personal-info-box p-10 bg-white rounded-[2.5rem] text-center shadow-sm font-black text-lg text-chotam-red">23 שנות ניסיון</div>
                    <div onClick={() => setActiveModal('vision')} className="personal-info-box p-10 bg-white rounded-[2.5rem] text-center shadow-sm border-2 border-chotam-teal/20 font-black text-xl italic text-chotam-teal">חזון הלומד העצמאי</div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-chotam-black text-white py-24 text-center">
                <div className="max-w-4xl mx-auto px-4">
                    <h2 className="text-6xl font-extrabold mb-12 italic tracking-tighter">להפוך חלום למציאות.</h2>
                    <div className="flex flex-col sm:flex-row justify-center gap-8 mb-20">
                        <button className="bg-chotam-teal text-white px-14 py-5 rounded-full font-bold text-2xl hover:scale-105 transition shadow-2xl">סיור ב"חלומציאות"</button>
                        <button className="bg-white/10 text-white px-14 py-5 rounded-full font-bold text-2xl hover:bg-white hover:text-chotam-black transition">צרו קשר עכשיו</button>
                    </div>
                    <p className="text-[10px] opacity-10 tracking-[0.5em] uppercase font-bold">&copy; 2026 חותם חיים מבית רובוטיקס. רמי חדאד, עו"ד. כל הזכויות שמורות.</p>
                </div>
            </footer>

            {/* Modal Overlay */}
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
        </div>
    );
}
