import React, { useMemo } from 'react';

export default function MapView({ courses, direction, mapBackground }) {
    
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

    const renderPaths = () => {
        return courses.map(course => {
            const pos = coursePositions[course.id];
            if (!pos || !course.prerequisites?.length) return null;

            return course.prerequisites.map(preName => {
                const preCourse = courses.find(c => c.name === preName);
                const prePos = preCourse ? coursePositions[preCourse.id] : null;
                if (!prePos) return null;

                return (
                    <line 
                        key={`path-${course.id}-${preName}`}
                        x1={`${prePos.x}%`} y1={`${prePos.y}%`} 
                        x2={`${pos.x}%`} y2={`${pos.y}%`} 
                        stroke="rgba(255,255,255,0.5)" strokeWidth="3" strokeDasharray="8,4"
                    />
                );
            });
        });
    };

    const subjectColors = {
        'רובוטיקה': '#ef4444', 'תכנות': '#3b82f6', 'מדעים': '#10b981', 'אמנות': '#f59e0b', 'מיומנויות': '#8b5cf6'
    };

    return (
        <div className="relative w-full aspect-video rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white group">
            {/* הרקע - המפה שלך */}
            <img src={mapBackground} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[20s] group-hover:scale-110" alt="Learning Map" />
            
            {/* שכבת עמעום קלה כדי שהתכנים יבלטו */}
            <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>

            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {renderPaths()}
            </svg>

            {courses.map(course => {
                const pos = coursePositions[course.id];
                if (!pos) return null;

                let icon = "🏡"; // מיומנות
                let size = "w-10 h-10";
                if (course.type === 'חקר') { icon = "🏰"; size = "w-14 h-14"; }
                if (course.type === 'פרויקטים') { icon = "🌆"; size = "w-16 h-16 animate-pulse"; }

                return (
                    <div 
                        key={course.id}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 ${size} flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-125 z-20 group/node`}
                        style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                    >
                        <div className="relative">
                            <span className="text-3xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">{icon}</span>
                            {/* שם הקורס צף מעל */}
                            <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-lg border border-white/50 opacity-0 group-hover/node:opacity-100 transition-opacity whitespace-nowrap">
                                <span className="text-[10px] font-black text-slate-800">{course.name}</span>
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* מקרא צבעים */}
            <div className="absolute top-6 left-6 bg-white/80 backdrop-blur-md p-4 rounded-[2rem] shadow-xl border border-white/40 hidden md:block">
                <p className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-tighter">Legend</p>
                <div className="space-y-2">
                    {Object.entries(subjectColors).map(([sub, color]) => (
                        <div key={sub} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
                            <span className="text-[9px] font-bold text-slate-700">{sub}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
