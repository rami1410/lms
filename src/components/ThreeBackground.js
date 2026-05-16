import React, { useEffect, useRef } from 'react';

export default function ThreeBackground() {
    const canvasContainerRef = useRef(null);

    useEffect(() => {
        // טעינת ספריית התלת-מימד
        const loadThreeJS = async () => {
            if (!document.querySelector(`script[src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"]`)) {
                const s = document.createElement('script');
                s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
                document.head.appendChild(s);
                s.onload = init3D;
            } else {
                init3D();
            }
        };

        let scene, camera, renderer, objects = [];
        let animationId;

        function init3D() {
            const THREE = window.THREE;
            if (!THREE || !canvasContainerRef.current || renderer) return;

            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            canvasContainerRef.current.appendChild(renderer.domElement);

            const light = new THREE.PointLight(0xffffff, 1.8, 100); // הגברת תאורה
            light.position.set(5, 5, 5);
            scene.add(light);
            scene.add(new THREE.AmbientLight(0xffffff, 0.6)); // הגברת אור סביבתי

            // הצורות הגיאומטריות
            const geometries = [
                new THREE.TorusKnotGeometry(1.6, 0.45, 200, 32), // Hero Knot (0)
                new THREE.TorusKnotGeometry(0.8, 0.28, 100, 16),// Equipment (1)
                new THREE.IcosahedronGeometry(0.9),             // Training (2)
                new THREE.BoxGeometry(1.3, 1.3, 1.3),           // Spaces (3)
                new THREE.DodecahedronGeometry(0.95),           // VR (4)
                new THREE.SphereGeometry(0.9, 32, 32),          // Global (5)
                new THREE.OctahedronGeometry(1.0)               // Peak Days (6)
            ];

            // צבעים מודגשים יותר לקטגוריות
            const colors = [
                0x46bad1, // Hero (Teal)
                0x00acc1, // Equip (Teal כהה יותר)
                0x689f38, // Training (Green כהה יותר)
                0xe65100, // Spaces (Orange כהה)
                0x00acc1, // VR
                0xcf9c00, // Global (Gold - נראה על לבן)
                0xd32f2f  // Red
            ];

            geometries.forEach((geo, i) => {
                // הגדרות חומר שונות לצורה הראשית ולקטגוריות!
                let matProps;
                if (i === 0) {
                    // --- תיקון לצורה הראשית (הירו) ---
                    // הפכנו אותה לשקופה מאוד, עם "רשת" עדינה, כמעט בלתי נראית. 
                    // כדי שלא תתנגש עם הטקסט השחור כפי שקרה בתמונה שצירפת.
                    matProps = { 
                        color: colors[i], 
                        shininess: 300, 
                        transparent: true, 
                        opacity: 0.05, // שקופה לחלוטין!
                        wireframe: true // משאירים את הרשת העדינה
                    };
                } else {
                    // --- תיקון ל-6 הקטגוריות! ---
                    // אנחנו הופכים אותן לצורות מלאות (Mesh), תלת מימדיות, יפות, 
                    // בעלות צבע חזק ושקיפות חלקית כדי שייראו מעולה בזמן הסיבוב!
                    matProps = { 
                        color: colors[i], 
                        shininess: 150, 
                        transparent: true, 
                        opacity: 0.9, // נוכחות חזקה!
                        wireframe: false // צורה מלאה ותלת מימדית
                    };
                }

                const mat = new THREE.MeshPhongMaterial(matProps);
                const mesh = new THREE.Mesh(geo, mat);
                mesh.position.y = i === 0 ? 0 : -i * 10;
                mesh.position.x = i === 0 ? 0 : ((i % 2 === 1) ? 4.2 : -4.2); // הרחקה קלה מהטקסט
                scene.add(mesh);
                objects.push(mesh);
            });

            camera.position.z = 6;

            const animate = () => {
                animationId = requestAnimationFrame(animate);
                objects.forEach((obj, i) => {
                    if (i > 0) {
                        obj.rotation.x += 0.007;
                        obj.rotation.y += 0.012;
                    } else {
                        // צורה ראשית מסתובבת לאט יותר
                        obj.rotation.x += 0.001;
                        obj.rotation.y += 0.002;
                    }
                });
                renderer.render(scene, camera);
            };
            animate();

            // נוסחת גלילה מעודכנת - הצורות גלויות יותר זמן!
            const handleScroll = () => {
                const scrollY = window.scrollY;
                const vh = window.innerHeight;
                
                if(camera) camera.position.y = - (scrollY / vh) * 10;

                objects.forEach((obj, i) => {
                    const targetId = i === 0 ? 'hero' : `strip-${i}`;
                    const element = document.getElementById(targetId);
                    if (!element) return;

                    const rect = element.getBoundingClientRect();
                    const centerOffset = (vh / 2 - rect.top) / (vh / 2); 

                    if (rect.top < vh && rect.bottom > 0) {
                        // שיניתי את הנוסחה: הן נשארות גלויות לאורך זמן רב
                        // רק כשהן ממש יוצאות מהמסך (centerOffset > 1) הן נעלמות
                        obj.material.opacity = i === 0 ? 0.05 : Math.max(0, 0.9 - (Math.abs(centerOffset) * 0.2));
                        const scaleFactor = 1 + (1 - Math.abs(centerOffset)) * 0.3;
                        obj.scale.set(scaleFactor, scaleFactor, scaleFactor);
                        obj.position.z = (1 - Math.abs(centerOffset)) * 2;
                    } else {
                        obj.material.opacity = 0;
                    }
                });
            };
            window.addEventListener('scroll', handleScroll);
            
            window.addEventListener('resize', () => {
                if (camera && renderer) {
                    camera.aspect = window.innerWidth / window.innerHeight;
                    camera.updateProjectionMatrix();
                    renderer.setSize(window.innerWidth, window.innerHeight);
                }
            });
        }

        loadThreeJS();

        return () => {
            if (animationId) cancelAnimationFrame(animationId);
            window.removeEventListener('scroll', () => {});
            window.removeEventListener('resize', () => {});
            if (renderer && canvasContainerRef.current) {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                canvasContainerRef.current.removeChild(renderer.domElement);
                renderer.dispose();
            }
        };
    }, []);

    return <div id="canvas-container" ref={canvasContainerRef} className="fixed top-0 left-0 w-full h-screen z-10 pointer-events-none"></div>;
}
