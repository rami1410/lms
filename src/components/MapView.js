import React, { useMemo } from 'react';

export default function MapView({ courses, direction, mapBackground }) {
    const coursePositions = useMemo(() => {
        const positions = {};
        const subjects = [...new Set(courses.flatMap(c => c.fields || []))];
        const zones = [
            { x: 15, y: 15 }, { x: 80, y: 20 }, { x: 35, y: 30 },
            { x: 20, y: 70 }, { x: 65, y: 45 }, { x: 65, y: 85 },
        ];

        subjects.forEach((subject, sIdx) => {
            const zone = zones[sIdx % zones.length];
            const subjectCourses = courses.filter(c => c.fields?.includes(subject));
            subjectCourses.forEach((course, cIdx) => {
                positions[course.id] = { 
                    x: zone.x + (cIdx % 3) * 6, 
                    y: zone.y + Math.floor(cIdx / 3) * 6, 
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
                    <line key={`path-${course.id}-${preName}`} x1={`${prePos.x}%`} y1={`${prePos.y}%`} x2={`${pos.x}%`} y2={`${pos.y}%`} stroke="white" strokeWidth="2" strokeDasharray="5,5" opacity="0.5" />
                );
            });
        });
    };

    return (
        <div className="relative w-full aspect-video rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white bg-slate-800">
            <img src={mapBackground} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="Map" />
            <svg className="absolute inset-0 w-full h-full pointer-events-none">{renderPaths()}</svg>
            {courses.map(course => {
                const pos = coursePositions[course.id];
                if (!pos) return null;
                let icon = course.type === 'חקר' ? "🏰" : course.type === 'פרויקטים' ? "🌆" : "🏡";
                return (
                    <div key={course.id} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer transition-all hover:scale-125" style={{ left: `${pos.x}%`, top: `${pos.y}%` }}>
                        <span className="text-3xl drop-shadow-lg">{icon}</span>
                        <div className="bg-white/90 backdrop-blur px-2 py-0.5 rounded-full shadow text-[10px] font-black mt-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{course.name}</div>
                    </div>
                );
            })}
        </div>
    );
}
