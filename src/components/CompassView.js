import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function CompassView({ currentUser, viewMode, courses, users, allProgress }) {
    const isTeacher = viewMode === 'teacher' || viewMode === 'admin';
    const [sortConfig, setSortConfig] = useState({ key: 'pct', direction: 'desc' });
    const [selectedItem, setSelectedItem] = useState(null);

    // --- עיבוד נתונים למורה (לפי תלמידים) ---
    const studentsData = useMemo(() => {
        if (!isTeacher) return [];
        const relevantUsers = viewMode === 'teacher' ? users.filter(u => u.institutionId === currentUser.institutionId && u.role !== 'teacher') : users.filter(u => u.role !== 'admin');
        
        return relevantUsers.map(u => {
            const uprog = allProgress[u.id] || {};
            let totalCompleted = 0;
            let totalLessons = 0;
            let activeCourses = 0;

            courses.forEach(c => {
                const p = uprog[c.id] || {};
                const comp = Object.values(p).filter(v => v === true).length;
                if (comp > 0) activeCourses++;
                totalCompleted += comp;
                totalLessons += c.lessons?.length || 0;
            });

            return {
                id: u.id,
                name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username,
                activeCourses,
                totalCompleted,
                pct: totalLessons ? Math.round((totalCompleted / totalLessons) * 100) : 0
            };
        });
    }, [isTeacher, users, courses, allProgress, currentUser.institutionId, viewMode]);

    // --- עיבוד נתונים לתלמיד (לפי קורסים) ---
    const studentCoursesData = useMemo(() => {
        if (isTeacher) return [];
        const myProg = allProgress[currentUser.id] || {};
        
        return courses.map(c => {
            const p = myProg[c.id] || {};
            const completed = Object.values(p).filter(v => v === true).length;
            const total = c.lessons?.length || 0;
            return {
                id: c.id,
                name: c.name,
                completed,
                total,
                pct: total ? Math.round((completed / total) * 100) : 0
            };
        }).filter(c => c.total > 0); // מציג רק קורסים שיש בהם שיעורים
    }, [isTeacher, courses, allProgress, currentUser.id]);

    // --- יצירת 3 קריאות לפעולה חכמות ---
    const actionItems = useMemo(() => {
        const items = [];
        if (isTeacher) {
            const stuckStudents = studentsData.filter(s => s.pct > 0 && s.pct < 20).slice(0, 2);
            const stars = studentsData.filter(s => s.pct > 80);
            
            if (stuckStudents.length > 0) items.push(`בדוק מה קורה עם ${stuckStudents[0].name}, נראה שיש קושי בהתקדמות (רק ${stuckStudents[0].pct}%).`);
            else items.push("כל התלמידים הפעילים מתקדמים בקצב טוב! אין מעכבים.");
            
            if (stars.length > 0) items.push(`פרגן ל-${stars[0].name}! הגיע ל-${stars[0].pct}% השלמה כוללת.`);
            else items.push("עודד את הכיתה להיכנס ולהתחיל את המטלות של השבוע.");
            
            items.push(`סך הכל ${studentsData.filter(s => s.pct > 0).length} תלמידים פעילים כרגע במערכת.`);
        } else {
            const inProgress = studentCoursesData.filter(c => c.pct > 0 && c.pct < 100).sort((a, b) => b.pct - a.pct);
            const untouched = studentCoursesData.filter(c => c.pct === 0);
            
            if (inProgress.length > 0) items.push(`המשך את הקורס "${inProgress[0].name}" - אתה כבר ב-${inProgress[0].pct}%!`);
            else items.push("זה הזמן המושלם להתחיל קורס חדש!");
            
            if (untouched.length > 0) items.push(`הקורס "${untouched[0].name}" ממתין לך. כנס לשיעור הראשון.`);
            else items.push("כל הכבוד! התחלת את כל הקורסים הפתוחים עבורך.");
            
            const totalCompleted = studentCoursesData.reduce((acc, curr) => acc + curr.completed, 0);
            items.push(`השלמת עד כה ${totalCompleted} שיעורים בסך הכל. המשך כך!`);
        }
        // השלמה ל-3 במקרה חסר
        while(items.length < 3) items.push("הכל נראה מצוין, המשך בעבודה הטובה!");
        return items.slice(0, 3);
    }, [isTeacher, studentsData, studentCoursesData]);

    // --- מיון הטבלה ---
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const sortedData = useMemo(() => {
        const data = isTeacher ? [...studentsData] : [...studentCoursesData];
        return data.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
            if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [isTeacher, studentsData, studentCoursesData, sortConfig]);

    const COLORS = ['#9333ea', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            {/* כותרת עליונה */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-800">המצפן שלי 🧭</h1>
                    <p className="text-slate-500 font-bold">{isTeacher ? 'תמונת מצב כיתתית' : 'תמונת מצב אישית'}</p>
                </div>
            </div>

            {/* קוביית קריאה לפעולה (3 סעיפים) */}
            <div className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-[2rem] p-8 shadow-xl text-white">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
                    <span>⚡</span> מה אני צריך לעשות היום:
                </h2>
                <ul className="space-y-4">
                    {actionItems.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-4 bg-white/10 p-4 rounded-2xl hover:bg-white/20 transition-colors cursor-default">
                            <span className="bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">{idx + 1}</span>
                            <span className="font-bold text-lg pt-0.5">{item}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* אזור הגרפים */}
            <div className="grid md:grid-cols-2 gap-8">
                {/* גרף עמודות */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 h-80 flex flex-col">
                    <h3 className="font-black text-lg text-slate-700 mb-4">{isTeacher ? 'התקדמות תלמידים מובילים' : 'התקדמות בקורסים (%)'}</h3>
                    <div className="flex-grow">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sortedData.slice(0, 5)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 12}} />
                                <YAxis tick={{fill: '#64748b', fontSize: 12}} />
                                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                                <Bar dataKey="pct" name="אחוז השלמה" radius={[10, 10, 0, 0]}>
                                    {sortedData.slice(0, 5).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* גרף פאי */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 h-80 flex flex-col">
                    <h3 className="font-black text-lg text-slate-700 mb-4">{isTeacher ? 'פילוח מצב כיתה' : 'חלוקת שיעורים (הושלם מול נותר)'}</h3>
                    <div className="flex-grow">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                {isTeacher ? (
                                    <Pie data={[
                                        { name: 'מצטיינים (80%+)', value: studentsData.filter(s => s.pct >= 80).length },
                                        { name: 'בתהליך (20-79%)', value: studentsData.filter(s => s.pct >= 20 && s.pct < 80).length },
                                        { name: 'מתעכבים (0-19%)', value: studentsData.filter(s => s.pct < 20).length }
                                    ]} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        <Cell fill="#10b981" />
                                        <Cell fill="#3b82f6" />
                                        <Cell fill="#ef4444" />
                                    </Pie>
                                ) : (
                                    <Pie data={[
                                        { name: 'שיעורים שהושלמו', value: studentCoursesData.reduce((acc, c) => acc + c.completed, 0) },
                                        { name: 'שיעורים שנותרו', value: studentCoursesData.reduce((acc, c) => acc + (c.total - c.completed), 0) }
                                    ]} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        <Cell fill="#9333ea" />
                                        <Cell fill="#cbd5e1" />
                                    </Pie>
                                )}
                                <Tooltip contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* טבלה דינמית וניתנת למיון */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="font-black text-xl text-slate-800">{isTeacher ? 'רשימת לומדים' : 'הקורסים שלי'}</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="p-4 font-black text-slate-500 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('name')}>
                                    {isTeacher ? 'שם התלמיד' : 'שם הקורס'} {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="p-4 font-black text-slate-500 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort(isTeacher ? 'activeCourses' : 'total')}>
                                    {isTeacher ? 'קורסים פעילים' : 'סה"כ שיעורים'} {sortConfig.key === (isTeacher ? 'activeCourses' : 'total') && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="p-4 font-black text-slate-500 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort(isTeacher ? 'totalCompleted' : 'completed')}>
                                    שיעורים שהושלמו {sortConfig.key === (isTeacher ? 'totalCompleted' : 'completed') && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="p-4 font-black text-slate-500 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('pct')}>
                                    אחוז השלמה {sortConfig.key === 'pct' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {sortedData.map((row) => (
                                <React.Fragment key={row.id}>
                                    <tr className="hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => setSelectedItem(selectedItem === row.id ? null : row.id)}>
                                        <td className="p-4 font-bold text-slate-800">{row.name}</td>
                                        <td className="p-4 font-medium text-slate-600">{isTeacher ? row.activeCourses : row.total}</td>
                                        <td className="p-4 font-medium text-slate-600">{isTeacher ? row.totalCompleted : row.completed}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-grow h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-purple-500 rounded-full" style={{width: `${row.pct}%`}}></div>
                                                </div>
                                                <span className="font-bold text-sm min-w-[3rem]">{row.pct}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                    {/* הרחבת פרטים בעת לחיצה */}
                                    {selectedItem === row.id && (
                                        <tr className="bg-purple-50/50">
                                            <td colSpan="4" className="p-6">
                                                <div className="text-center font-bold text-purple-800">
                                                    {isTeacher ? 
                                                        `ל-${row.name} יש התקדמות של ${row.pct}% מתוך סך כל חומרי הלימוד.` : 
                                                        `בקורס זה נותרו לך עוד ${row.total - row.completed} שיעורים לסיום.`}
                                                    <br/>
                                                    <span className="text-sm opacity-70">(כאן ניתן להוסיף בעתיד פירוט עמוק יותר בלחיצה)</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                            {sortedData.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-slate-400 font-bold">אין נתונים להצגה כרגע.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
