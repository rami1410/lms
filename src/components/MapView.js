import React, { useMemo, useState } from 'react';

// כדי שהמפה תעבוד, App.js צריך להעביר לרכיב זה גם את userProgress וגם את setViewingCourse כברירת מחדל
export default function MapView({ courses, direction, mapBackground, userProgress, setViewingCourse }) {
    
    // מצב למקרא - סגור כברירת מחדל (סעיף 8)
    const [legendOpen, setLegendOpen] = useState(false);

    // חישוב מיקומים לפי מקצועות בצורה אסתטית על פני המפה
    const coursePositions = useMemo(() => {
        const positions = {};
        const subjects = [...new Set(courses.flatMap(c => c.fields || []))];
        
        // הגדרת "אזורים" במפה לפי אחוזים (x, y)
        const zones = [
            { x: 15, y: 15 }, // איים צפים
            { x: 80, y: 20 }, // יער פטריות
            { x: 35, y: 30 }, // הרי קרח
            { x: 20, y: 70 }, // מדבר
            { x: 65, y: 45 }, // ממלכה ירוקה
            { x: 65, y: 85 }, // הרי געש
        ];

        subjects.forEach((subject, sIdx) => {
            const zone = zones[sIdx % zones.length];
            const subjectCourses = courses.filter(c => c.fields?.includes(subject));
            
            subjectCourses.forEach((course, cIdx) => {
                // פיזור קל בתוך האזור כדי שלא יעלו אחד על השני
                const offsetX = (cIdx % 3) * 6;
                const offsetY = Math.floor(cIdx / 3) * 6;
                positions[course.id] = { 
                    x: zone.x + offsetX, 
                    y: zone.y + offsetY, 
                    subject 
                };
            });
        });
        return positions;
    }, [courses]);

    // ציור שבילים בסגנון ניאון (סעיף 7) וחיבור לנקודת התחלה (סעיף 2)
    const renderPaths = () => {
        const neonRoads = [];
        const startPoint = { x: 50, y: 50 }; // נקודת התחלה במרכז

        courses.forEach(course => {
            const pos = coursePositions[course.id];
            if (!pos) return;

            if (!course.prerequisites?.length) {
                // חיבור לנקודת התחלה
                neonRoads.push(
                    <g key={`start-path-${course.id}`}>
                        {/* אפקט הילה (glow) מאחורי קו הניאון הראשי */}
                        <line x1={`${startPoint.x}%`} y1={`${startPoint.y}%`} x2={`${pos.x}%`} y2={`${pos.y}%`} stroke="#fff" strokeWidth="6" strokeOpacity="0.2" filter="blur(3px)" />
                        {/* קו הניאון הלבן הבוהק */}
                        <line x1={`${startPoint.x}%`} y1={`${startPoint.y}%`} x2={`${pos.x}%`} y2={`${pos.y}%`} stroke="#fff" strokeWidth="2.5" />
                    </g>
                );
            } else {
                // חיבור בין קורסים
                course.prerequisites.forEach(preName => {
                    const preCourse = courses.find(c => c.name === preName);
                    const prePos = preCourse ? coursePositions[preCourse.id] : null;
                    if (!prePos) return;

                    neonRoads.push(
                        <g key={`path-${course.id}-${preName}`}>
                            {/* אפקט הילה (glow) */}
                            <line x1={`${prePos.x}%`} y1={`${prePos.y}%`} x2={`${pos.x}%`} y2={`${pos.y}%`} stroke="#fff" strokeWidth="6" strokeOpacity="0.2" filter="blur(3px)" />
                            {/* קו ניאון לבן */}
                            <line x1={`${prePos.x}%`} y1={`${prePos.y}%`} x2={`${pos.x}%`} y2={`${pos.y}%`} stroke="#fff" strokeWidth="2.5" />
                        </g>
                    );
                });
            }
        });
        return neonRoads;
    };

    const subjectColors = {
        'רובוטיקה': '#ef4444', 'תכנות': '#3b82f6', 'מדעים': '#10b981', 'אמנות': '#f59e0b', 'מיומנויות': '#8b5cf6'
    };

    return (
        <div className="relative w-full aspect-video rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white group bg-slate-200">
            {/* הרקע - המפה. סעיף 3: ללא תנועה, ללא זום, ללא אפקטי ריחוף. תמונה סטטית לחלוטין */}
            <img src={mapBackground} className="absolute inset-0 w-full h-full object-cover transition-none group-hover:scale-100" alt="Learning Map" />
            
            {/* שכבת עמעום קלה כדי שהתכנים יבלטו */}
            <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>

            {/* דרכי ניאון (סעיף 7) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {renderPaths()}
            </svg>

            {/* נקודת התחלה ברורה🚩 (סעיף 2) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 flex flex-col items-center justify-center z-30" style={{ left: '50%', top: '50%' }}>
                <span className="text-4xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">🚩</span>
                <span className="text-white text-[10px] font-black bg-black/60 px-2 py-0.5 rounded-full mt-1">START</span>
            </div>

            {/* קורסים / ישובים */}
            {courses.map(course => {
                const pos = coursePositions[course.id];
                if (!pos) return null;

                // חישוב התקדמות עבור הילה
                const pct = course.lessons?.length ? Math.round((Object.values(userProgress[course.id] || {}).filter(v => v === true).length / course.lessons.length) * 100) : 0;

                let icon = "🏡"; // מיומנות
                let size = "w-10 h-10";
                if (course.type === 'חקר') { icon = "🏰"; size = "w-14 h-14"; }
                if (course.type === 'פרויקטים') { icon = "🌆"; size = "w-16 h-16 animate-pulse"; }

                // הילה לפי התקדמות (סעיפים 5, 6)
                let haloColor = "";
                if (pct === 100) { haloColor = "0 0 20px 4px #4ade80"; } // הילה ירוקה להושלם (סעיף 5)
                else if (pct > 0) { haloColor = "0 0 20px 4px #fb923c"; } // הילה כתומה לחלקי (סעיף 6)

                return (
                    <div 
                        key={course.id}
                        {/* סעיף 4: ישוב לחיץ! */}
                        onClick={() => setViewingCourse(course)} 
                        className={`absolute -translate-x-1/2 -translate-y-1/2 ${size} flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-125 z-20 group/node`}
                        style={{ 
                            left: `${pos.x}%`, 
                            top: `${pos.y}%`,
                            boxShadow: haloColor // הילה לפי התקדמות
                        }}
                    >
                        <div className="relative">
                            <span className="text-3xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">{icon}</span>
                            {/* שם הקורס צף מעל (הושאר מהגרסה הקודמת כפי שהוסכם) */}
                            <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-lg border border-white/50 opacity-0 group-hover/node:opacity-100 transition-opacity whitespace-nowrap">
                                <span className="text-[10px] font-black text-slate-800">{course.name}</span>
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* מקרא צבעים (סעיף 8) - סגור כברירת מחדל, לחיץ לפתיחה/סגירה */}
            <div className={`absolute bottom-6 ${direction === 'rtl' ? 'right-6' : 'left-6'} bg-white/80 backdrop-blur-md rounded-[2rem] shadow-xl border border-white/40 z-40 transition-all ${legendOpen ? 'p-4' : 'p-2'}`}>
                {/* אייקון המקרא כשהוא סגור (גודל מינימלי) */}
                {!legendOpen && (
                    <button onClick={() => setLegendOpen(true)} className="text-2xl" title="פתח מקרא">
                        🗺️
                    </button>
                )}

                {/* המקרא המלא כשהוא פתוח */}
                {legendOpen && (
                    <>
                        <div className="flex justify-between items-center mb-2 border-b pb-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">מקרא מקצועות</p>
                            <button onClick={() => setLegendOpen(false)} className="text-red-500 font-bold text-lg hover:text-red-700" title="סגור מקרא">
                                ×
                            </button>
                        </div>
                        <div className="space-y-2">
                            {Object.entries(subjectColors).map(([sub, color]) => (
                                <div key={sub} className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
                                    <span className="text-[9px] font-bold text-slate-700">{sub}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
