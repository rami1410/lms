import React, { useMemo } from 'react';

export default function MapView({ courses, institutions, currentUser, t, direction, mapBackground }) {
    
    // 1. אלגוריתם מיקום אסתטי - מחשב קואורדינטות (x,y) לכל קורס
    const coursePositions = useMemo(() => {
        const positions = {};
        const subjects = [...new Set(courses.flatMap(c => c.fields || []))];
        const center = { x: 50, y: 50 }; // נקודת התחלה (מרכז המפה)
        
        subjects.forEach((subject, sIdx) => {
            const angle = (sIdx / subjects.length) * 2 * Math.PI;
            const subjectCourses = courses.filter(c => c.fields?.includes(subject));
            
            subjectCourses.forEach((course, cIdx) => {
                // חישוב מרחק - ככל שיש יותר דרישות קדם, הקורס רחוק יותר מהמרכז
                const distance = 15 + (course.prerequisites?.length || 0) * 15 + (cIdx * 5);
                const x = center.x + Math.cos(angle) * distance;
                const y = center.y + Math.sin(angle) * distance;
                positions[course.id] = { x, y, subject };
            });
        });
        return positions;
    }, [courses]);

    // 2. פונקציית עזר לציור שבילים
    const renderPaths = () => {
        const paths = [];
        courses.forEach(course => {
            const pos = coursePositions[course.id];
            if (!pos) return;

            if (!course.prerequisites || course.prerequisites.length === 0) {
                // שביל מנקודת ההתחלה (50,50)
                paths.push(<line key={`p-start-${course.id}`} x1="50%" y1="50%" x2={`${pos.x}%`} y2={`${pos.y}%`} stroke="#cbd5e1" strokeWidth="2" strokeDasharray="5,5" />);
            } else {
                // שביל מהקורס הקודם
                course.prerequisites.forEach(preName => {
                    const preCourse = courses.find(c => c.name === preName);
                    if (preCourse && coursePositions[preCourse.id]) {
                        const prePos = coursePositions[preCourse.id];
                        paths.push(<line key={`p-${preCourse.id}-${course.id}`} x1={`${prePos.x}%`} y1={`${prePos.y}%`} x2={`${pos.x}%`} y2={`${pos.y}%`} stroke="#94a3b8" strokeWidth="3" />);
                    }
                });
            }
        });
        return paths;
    };

    // 3. הגדרת צבעים למקצועות
    const subjectColors = {
        'רובוטיקה': '#8b5cf6', 'תכנות': '#3b82f6', 'מדעים': '#10b981', 'אמנות': '#f59e0b'
    };

    return (
        <div className="relative w-full aspect-video rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white bg-slate-200">
            {/* תמונת רקע המפה */}
            {mapBackground ? (
                <img src={mapBackground} className="absolute inset-0 w-full h-full object-cover opacity-80" alt="Map" />
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-emerald-50 flex items-center justify-center text-slate-300 font-black">העלה מפה בהגדרות</div>
            )}

            {/* שכבת ה-SVG לשבילים */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {renderPaths()}
            </svg>

            {/* נקודת התחלה */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg border-4 border-slate-800 z-10 flex items-center justify-center">
                🚩
            </div>

            {/* הקורסים (הישובים) */}
            {courses.map(course => {
                const pos = coursePositions[course.id];
                if (!pos) return null;

                let size = "w-6 h-6"; // מיומנות
                let style = { backgroundColor: subjectColors[pos.subject] || '#64748b' };
                let icon = "🏡";

                if (course.type === 'חקר') { 
                    size = "w-10 h-10"; 
                    icon = "🏰"; 
                }
                if (course.type === 'פרויקטים') { 
                    size = "w-12 h-12"; 
                    icon = "🌆"; 
                    style.boxShadow = "0 0 15px currentColor"; 
                }

                return (
                    <div 
                        key={course.id}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 ${size} rounded-xl shadow-xl flex items-center justify-center cursor-pointer hover:scale-125 transition-transform z-20 group`}
                        style={{ ...style, left: `${pos.x}%`, top: `${pos.y}%`, color: style.backgroundColor }}
                    >
                        <span className="text-white drop-shadow-md">{icon}</span>
                        {/* Tooltip עם שם הקורס */}
                        <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-900 text-white text-[10px] px-2 py-1 rounded-lg whitespace-nowrap font-black">
                            {course.name}
                        </div>
                    </div>
                );
            })}

            {/* מקרא צבעים בצד */}
            <div className={`absolute bottom-6 ${direction === 'rtl' ? 'right-6' : 'left-6'} bg-white/90 backdrop-blur p-4 rounded-3xl shadow-xl border border-white/50 space-y-2`}>
                <p className="font-black text-xs border-b pb-2 mb-2">מקרא מקצועות</p>
                {Object.entries(subjectColors).map(([sub, color]) => (
                    <div key={sub} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                        <span className="text-[10px] font-bold">{sub}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
