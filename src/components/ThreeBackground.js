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

            const light = new THREE.PointLight(0xffffff, 1.5, 100);
            light.position.set(5, 5, 5);
            scene.add(light);
            scene.add(new THREE.AmbientLight(0xffffff, 0.4));

            const geometries = [
                new THREE.TorusKnotGeometry(1.5, 0.4, 200, 32), // Hero
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
                    wireframe: true // עיצוב הרשת העדינה
                });
                const mesh = new THREE.Mesh(geo, mat);
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

            // נוסחת הגלילה והשקיפות המתוקנת
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
            
            // התאמה לשינוי גודל מסך
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
