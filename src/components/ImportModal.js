import React, { useState, useEffect } from 'react';
import { db, appId } from '../firebase';
import { doc, updateDoc, arrayUnion, getDocs, collection, getDoc } from 'firebase/firestore';

export default function ImportModal({ onClose, toast }) {
    const [topicsMap, setTopicsMap] = useState(null); 
    const [file, setFile] = useState(null);
    const [importing, setImporting] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });

    useEffect(() => {
        if (!window.Papa) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js';
            document.head.appendChild(script);
        }
    }, []);

    const stringSimilarity = (str1, str2) => {
        if (!str1 || !str2) return 0;
        const s1 = str1.toLowerCase().replace(/[^a-zא-ת0-9]/g, '');
        const s2 = str2.toLowerCase().replace(/[^a-zא-ת0-9]/g, '');
        if (s1.includes(s2) || s2.includes(s1)) return 1;
        return 0; 
    };

    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    const handleTopicsUpload = (e) => {
        const topicsFile = e.target.files[0];
        if (!topicsFile) return;
        if (!window.Papa) return toast("ספריית הפענוח עדיין נטענת, נסה שוב בעוד שנייה.");

        window.Papa.parse(topicsFile, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim().replace(/^[\u200B\u200C\uFEFF]+|[\u200B\u200C\uFEFF]+$/g, ''),
            complete: (results) => {
                const map = {};
                results.data.forEach(row => {
                    const topicId = row['ID'] || row.id || row['Id'];
                    const topicTitle = row['Title'] || row.title || 'פרק כללי';
                    const parentSlug = row['Parent Slug'] || '';
                    const courseId = row['Post Parent'] || row['Parent'] || row.parent;
                    
                    if (topicId && courseId) {
                        map[String(topicId).trim()] = {
                            courseId: String(courseId).trim(),
                            title: String(topicTitle).trim(),
                            slug: String(parentSlug).split('/')[0] 
                        };
                    }
                });
                setTopicsMap(map);
                toast(`✅ נטענו ${Object.keys(map).length} פרקים למערכת! אפשר לעבור לשלב 2.`);
            },
            error: (err) => toast("שגיאה בטעינת קובץ המבנה: " + err.message)
        });
    };

    const handleLessonsImport = async () => {
        if (!file) return toast("אנא בחר את קובץ השיעורים (הסרטונים).");
        if (!topicsMap) return toast("חובה לטעון קודם את קובץ הנושאים בשלב 1!");
        if (!window.Papa) return toast("המערכת נטענת, המתן שנייה ונסה שוב.");
        
        setImporting(true);

        let existingDbCourses = [];
        try {
            const coursesRef = collection(db, 'artifacts', appId, 'public', 'data', 'courses');
            const snap = await getDocs(coursesRef);
            existingDbCourses = snap.docs.map(d => ({ dbId: d.id, ...d.data() }));
        } catch (err) {
            console.error("שגיאה בשליפת קורסים:", err);
            toast("שגיאת התחברות למסד הנתונים.");
            setImporting(false);
            return;
        }
        
        window.Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim().replace(/^[\u200B\u200C\uFEFF]+|[\u200B\u200C\uFEFF]+$/g, ''),
            complete: async (results) => {
                const rows = results.data;
                let successCount = 0;
                let coursesUpdatedCount = 0;
                
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
                    let topicId = row['Parent'] || row.parent || row['Post Parent']; 
                    
                    if (!topicId) return;
                    if (String(topicId).endsWith('.0')) topicId = String(topicId).slice(0, -2);
                    
                    const topicData = topicsMap[String(topicId).trim()];
                    if (!topicData) return;

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
                    
                    if (!coursesUpdates[courseId]) {
                        coursesUpdates[courseId] = { slug: topicData.slug, lessons: [] };
                    }
                    coursesUpdates[courseId].lessons.push(lesson);
                });

                const courseIds = Object.keys(coursesUpdates);
                setProgress({ current: 0, total: courseIds.length });
                
                for (let i = 0; i < courseIds.length; i++) {
                    const rawCourseId = String(courseIds[i]).trim();
                    const cleanNumericId = rawCourseId.replace(/\D/g, ''); 
                    const courseDataToImport = coursesUpdates[rawCourseId];
                    const lessonsToAdd = courseDataToImport.lessons;
                    const searchSlug = courseDataToImport.slug;
                    
                    let matchedCourse = existingDbCourses.find(c => {
                        const dbIdStr = String(c.dbId);
                        const cName = String(c.name || '');
                        
                        return dbIdStr === rawCourseId || 
                               dbIdStr === `wp-${rawCourseId}` || 
                               dbIdStr === `course-${rawCourseId}` || 
                               (cleanNumericId.length >= 3 && dbIdStr.includes(cleanNumericId)) || 
                               String(c.id) === rawCourseId || 
                               String(c.wpId) === rawCourseId ||
                               (searchSlug && cName && stringSimilarity(cName, searchSlug));
                    });
                    
                    if (matchedCourse) {
                        try {
                            const courseRef = doc(db, 'artifacts', appId, 'public', 'data', 'courses', matchedCourse.dbId);
                            const currentDoc = await getDoc(courseRef);
                            const currentData = currentDoc.data() || {};
                            const existingLessons = currentData.lessons || [];
                            const existingIds = existingLessons.map(l => l.id);
                            
                            const newLessons = lessonsToAdd.filter(l => !existingIds.includes(l.id));
                            
                            if (newLessons.length > 0) {
                                // --- מנגנון ה"ביסים" שעוקף את ההגבלה של גוגל ---
                                const MAX_LESSONS_PER_UPDATE = 40; 
                                
                                for (let j = 0; j < newLessons.length; j += MAX_LESSONS_PER_UPDATE) {
                                    const chunk = newLessons.slice(j, j + MAX_LESSONS_PER_UPDATE);
                                    
                                    await updateDoc(courseRef, {
                                        lessons: arrayUnion(...chunk),
                                        meetingsCount: existingLessons.length + newLessons.length
                                    });
                                    
                                    // נותן לשרת מנוחה של חצי שנייה כדי שלא יקרוס
                                    await delay(500); 
                                }

                                successCount += newLessons.length;
                                coursesUpdatedCount++;
                            }
                        } catch (err) {
                            console.error(`שגיאה בעדכון קורס ${matchedCourse.dbId}:`, err);
                            await delay(1000); // אם בכל זאת יש שגיאה, נחים שנייה שלמה וממשיכים
                        }
                    } else {
                        console.warn(`לא מצאנו קורס עבור: ID=${rawCourseId}, Slug=${searchSlug}`);
                    }
                    setProgress({ current: i + 1, total: courseIds.length });
                }
                
                if (successCount > 0) {
                    toast(`הייבוא הושלם בהצלחה מטורפת! 🚀 ${successCount} שיעורים חוברו ל-${coursesUpdatedCount} קורסים במערכת.`);
                } else {
                    toast(`הסתיים, אך לא מצאנו לאילו קורסים לשייך או שהשיעורים כבר קיימים.`);
                }
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
                            <p className="font-black text-green-800 text-xl mb-2">מחפש קורסים ומזריק שיעורים...</p>
                            <p className="text-sm text-green-700 mb-2 font-bold animate-pulse">מפצל קורסים גדולים כדי למנוע קריסת שרת...</p>
                            <p className="text-green-600 font-bold">{progress.current} מתוך {progress.total} קורסים נסרקו!</p>
                            <div className="w-full bg-green-200 rounded-full h-4 mt-4 overflow-hidden">
                                <div className="bg-green-600 h-full transition-all duration-300" style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}></div>
                            </div>
                        </div>
                    ) : (
                        <button 
                            onClick={handleLessonsImport} 
                            disabled={!file || !topicsMap}
                            className="w-full bg-slate-900 text-white py-4 rounded-[2rem] font-black text-xl hover:bg-green-600 transition-all shadow-xl active:scale-95 disabled:opacity-50">
                            התחל העתקה חכמה 🚀
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
