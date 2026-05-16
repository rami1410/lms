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
                
                .marquee-container { width: 100%; overflow: hidden; padding: 3rem 0; background: #fff; border-top: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0;
