import React, { useEffect, useRef } from 'react';

export default function ThreeBackground() {
    const canvasContainerRef = useRef(null);

    useEffect(() => {
        // 1. חסימה לניידים: אם המסך קטן מ-768 פיקסלים (סלולר), אל תטען תלת-מימד בכלל!
        // זה חוסך סוללה ומשאיר את העיצוב נקי וקריא במסכים קטנים.
        if (window.innerWidth < 768) return;

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

            const light = new THREE.PointLight(0xffffff, 1.8, 100);
            light.position.set(5, 5, 5);
            scene.add(light);
            scene.add(new THREE.AmbientLight(0xffffff, 0.6));

            const geometries = [
                new THREE.TorusKnotGeometry(1.6, 0.45, 200, 32), // Hero (ללא שינוי)
                new THREE.TorusKnotGeometry(0.8, 0.28, 100, 16), // קטגוריה 1
                new THREE.IcosahedronGeometry(0.9),              // קטגוריה 2
                new THREE.BoxGeometry(1.3, 1.3, 1.3),            // קטגוריה 3
                new THREE.DodecahedronGeometry(0.95),            // קטגוריה 4
                new THREE.SphereGeometry(0.9, 32, 32),           // קטגוריה 5
                new THREE.OctahedronGeometry(1.0)                // קטגוריה 6
            ];

            const colors = [
                0x46bad1, // Hero
                0x00acc1, 
                0x689f38, 
                0xe65100, 
                0x00acc1, 
                0xcf9c00, 
                0xd32f2f  
            ];

            geometries.forEach((geo, i) => {
                let matProps;
                if (i === 0) {
                    // ההירו נשאר תקין - שקוף כמעט לגמרי כדי לא להפריע לטקסט העליון
                    matProps = { 
                        color: colors[i], 
                        shininess: 300, 
                        transparent: true, 
                        opacity: 0.05, 
                        wireframe: true 
                    };
                } else {
                    // 6 הקטגוריות הפנימיות
                    matProps = { 
                        color: colors[i], 
                        shininess: 150, 
                        transparent: true, 
                        opacity: 0.9, 
                        wireframe: false 
                    };
                }

                const mat = new THREE.MeshPhongMaterial(matProps);
                const mesh = new THREE.Mesh(geo, mat);
                
                mesh.position.y = i === 0 ? 0 : -i * 10;
                
                // התיקון הגדול: כולם ב-x=0 (אמצע המסך במדויק). 
                // ככה הם ירחפו ברווח הענק שבין בלוק הטקסט לבלוק התמונה, ולא יבלעו מאחורי הלבן!
                mesh.position.x = 0; 
                
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
                        obj.rotation.x += 0.001;
                        obj.rotation.y += 0.002;
                    }
                });
                renderer.render(scene, camera);
            };
            animate();

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
                        obj.material.opacity = i === 0 ? 0.05 : Math.max(0, 0.9 - (Math.abs(centerOffset) * 0.2));
                        
                        // הגדלנו מעט את הצורות בקטגוריות כדי שהן באמת ימלאו את הרווח שבאמצע
                        const scaleFactor = i === 0 
                            ? (1 + (1 - Math.abs(centerOffset)) * 0.3) 
                            : (1.5 + (1 - Math.abs(centerOffset)) * 0.5); // בולט יותר!
                            
                        obj.scale.set(scaleFactor, scaleFactor, scaleFactor);
                        obj.position.z = (1 - Math.abs(centerOffset)) * 2;
                    } else {
                        obj.material.opacity = 0;
                    }
                });
            };
            window.addEventListener('scroll', handleScroll);
            
            window.addEventListener('resize', () => {
                // אם פתאום הקטינו את החלון לנייד, לא נרנדר כדי לא להכביד
                if (window.innerWidth < 768 && canvasContainerRef.current) {
                    canvasContainerRef.current.style.display = 'none';
                } else if (canvasContainerRef.current) {
                    canvasContainerRef.current.style.display = 'block';
                    if (camera && renderer) {
                        camera.aspect = window.innerWidth / window.innerHeight;
                        camera.updateProjectionMatrix();
                        renderer.setSize(window.innerWidth, window.innerHeight);
                    }
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
                if(canvasContainerRef.current.contains(renderer.domElement)) {
                    canvasContainerRef.current.removeChild(renderer.domElement);
                }
                renderer.dispose();
            }
        };
    }, []);

    return <div id="canvas-container" ref={canvasContainerRef} className="fixed top-0 left-0 w-full h-screen z-10 pointer-events-none hidden md:block"></div>;
}
