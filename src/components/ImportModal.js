import React, { useState, useEffect } from 'react';
import { db, appId } from '../firebase';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';

export default function ImportModal({ onClose, toast }) {
    const [topicsMap, setTopicsMap] = useState(null); 
    const [file, setFile] = useState(null);
    const [importing, setImporting] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });

    useEffect(() => {
        // טעינה אוטומטית של קורא ה-CSV ללא צורך בהתקנה ידנית בשרת!
        if (!window.Papa) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js';
            document.head.appendChild(script);
        }
    }, []);

    const handleTopicsUpload = (e) => {
        const topicsFile = e.target.files[0];
        if (!topicsFile) return;
        if (!window.Papa) return toast("ספריית הפענוח עדיין נטענת, נסה שוב בעוד שנייה.");

        window.Papa.parse(topicsFile, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim(),
            complete: (results) => {
                const map = {};
                results.data.forEach(row => {
                    const topicId = row['ID'] || row.id || row['Id'];
                    const topicTitle = row['Title'] || row.title || 'פרק כללי';
                    const courseId = row['Post Parent'] || row['Parent'] || row.parent;
                    
                    if (topicId && courseId) {
                        map[String(topicId).trim()] = {
                            courseId: String(courseId).trim(),
                            title: String(topicTitle).trim()
                        };
                    }
                });
                setTopicsMap(map);
                toast("✅ מבנה הפרקים נטען בהצלחה! אפשר לעבור לשלב 2.");
            },
            error: (err) => toast("שגיאה בטעינת קובץ המבנה: " + err.message)
        });
    };

    const handleLessonsImport = () => {
        if (!file) return toast("אנא בחר את קובץ השיעורים (הסרטונים).");
        if (!topicsMap) return toast("חובה לטעון קודם את קובץ הנושאים בשלב 1!");
        if (!window.Papa) return toast("המערכת נטענת, המתן שנייה ונסה שוב.");
        
        setImporting(true);
        
        window.Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim(),
            complete: async (results) => {
                const rows = results.data;
                let successCount = 0;
                let notFoundCount = 0;
                
                const extractVideos = (content, videoField) => {
                    const links = new Set();
                    const combined = (content || '') + " " + (videoField || '');
                    const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|embed)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s<>]{11})/gi;
                    let match;
                    while ((match = ytRegex.exec(combined)) !== null) {
                        if (match[1]) links.add(`https://www.youtube.com/watch?v=${match[1]}`);
                    }
                    return Array.from(links);
                };

                const coursesUpdates = {};

                rows.forEach((row, i) => {
                    const lessonTitle = row['Title'] || row.title || 'שיעור ללא שם';
                    const content = row['Content'] || row.content || '';
                    const rawVideo = row['_video'] || '';
                    const topicId = row['Parent'] || row.parent || row['Post Parent']; 

                    if (!topicId) return;
                    
                    const topicData = topicsMap[String(topicId).trim()];
                    if (!topicData) {
                        notFoundCount++;
                        return;
                    }

                    const ytLinks = extractVideos(content, rawVideo);
                    const type = ytLinks.length > 0 ? 'link' : 'text';
                    const url = ytLinks.length > 0 ? ytLinks[0] : '';
                    const cleanContent = content.replace(/(<([^>]+)>)/gi, "").trim();

                    const lesson = {
                        id: `lesson-wp-${row.ID || row.id || Date.now() + i}`,
                        title: lessonTitle, 
                        chapter: topicData.title, 
                        type: type,
                        url: url,
                        content: type === 'text' ? cleanContent : '',
                        description: 'יובא מוורדפרס'
                    };

                    const courseId = topicData.courseId;
                    if (!coursesUpdates[courseId]) coursesUpdates[courseId] = [];
                    coursesUpdates[courseId].push(lesson);
                });

                const courseIds = Object.keys(coursesUpdates);
                setProgress({ current: 0, total: courseIds.length });
                
                for (let i = 0; i < courseIds.length; i++) {
                    const rawCourseId = courseIds[i];
                    const lessonsToAdd = coursesUpdates[rawCourseId];
                    
                    // בדיקה כפולה - מוודא מציאת קורס גם עם קידומת wp- וגם בלי
                    let courseRef = doc(db, 'artifacts', appId, 'public', 'data', 'courses', `wp-${rawCourseId}`);
                    let courseSnap = await getDoc(courseRef);
                    
                    if (!courseSnap.exists()) {
                        courseRef = doc(db, 'artifacts', appId, 'public', 'data', 'courses', rawCourseId);
                        courseSnap = await getDoc(courseRef);
                    }
                    
                    try {
                        if (courseSnap.exists()) {
                            const existingLessons = courseSnap.data().lessons || [];
                            const existingIds = existingLessons.map(l => l.id);
                            
                            const newLessons = lessonsToAdd.filter(l => !existingIds.includes(l.id));
                            
                            if (newLessons.length > 0) {
                                await updateDoc(courseRef, {
                                    lessons: arrayUnion(...newLessons),
                                    meetingsCount: existingLessons.length + newLessons.length
                                });
                                successCount += newLessons.length;
                            }
                        }
                    } catch (err) {
                        console.error("שגיאה בעדכון קורס:", err);
                    }
                    setProgress({ current: i + 1, total: courseIds.length });
                }
                
                toast(`הייבוא הושלם! ${successCount} שיעורים חוברו למבנה הקורסים המקורי שלך.`);
                setImporting(false);
                onClose();
            },
            error: (error) => {
                toast("שגיאה בקריאת הקובץ: " + error.message);
                setImporting(false);
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[400]" onClick={onClose}>
            <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-10 text-right" dir="rtl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-3xl font-black text-green-600">📥 שחזור היררכיית קורסים</h2>
                    <button onClick={onClose} className="text-slate-300 text-4xl hover:text-red-500 transition-colors">&times;</button>
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <label className="block font-black text-slate-700 mb-2">📍 שלב 1: טען את קובץ ה"נושאים" (הפרקים)</label>
                        <p className="text-xs text-slate-500 mb-3">קובץ זה שומר על שמות הפרקים שסידרת במערכת הישנה.</p>
                        <input 
                            type="file" 
                            accept=".csv"
                            onChange={handleTopicsUpload}
                            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                            disabled={importing}
                        />
                    </div>

                    <div className={`bg-slate-50 p-4 rounded-2xl border border-slate-200 ${!topicsMap ? 'opacity-50 pointer-events-none' : ''}`}>
                        <label className="block font-black text-slate-700 mb-2">🎬 שלב 2: בחר את קובץ ה"שיעורים"</label>
                        <p className="text-xs text-slate-500 mb-3">כאן נמצאים הסרטונים ושמות השיעורים הספציפיים.</p>
                        <input 
                            type="file" 
                            accept=".csv"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                            disabled={importing || !topicsMap}
                        />
                    </div>

                    {importing ? (
                        <div className="bg-green-50 p-6 rounded-2xl border-2 border-green-200 text-center">
                            <p className="font-black text-green-800 text-xl mb-2">מעתיק את מבנה הקורסים 1:1...</p>
                            <p className="text-green-600 font-bold">{progress.current} מתוך {progress.total} קורסים נבדקו!</p>
                            <div className="w-full bg-green-200 rounded-full h-4 mt-4 overflow-hidden">
                                <div className="bg-green-600 h-full transition-all duration-300" style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}></div>
                            </div>
                        </div>
                    ) : (
                        <button 
                            onClick={handleLessonsImport} 
                            disabled={!file || !topicsMap}
                            className="w-full bg-slate-900 text-white py-4 rounded-[2rem] font-black text-xl hover:bg-green-600 transition-all shadow-xl active:scale-95 disabled:opacity-50">
                            התחל העתקה מדויקת 🚀
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
