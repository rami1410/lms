import React, { useState, useEffect } from 'react';
import { db, appId } from '../firebase';
import { doc, updateDoc, arrayUnion, getDocs, collection, getDoc } from 'firebase/firestore';

export default function ImportModal({ onClose, toast }) {
    const [step, setStep] = useState(1);
    const [topicsMap, setTopicsMap] = useState(null); 
    const [file, setFile] = useState(null);
    const [dbCourses, setDbCourses] = useState([]);
    
    const [autoMatched, setAutoMatched] = useState([]);
    const [unmatched, setUnmatched] = useState([]);
    const [manualMatches, setManualMatches] = useState({}); 

    const [importing, setImporting] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [fixStatus, setFixStatus] = useState(''); // סטטוס לתיקון סרטונים

    useEffect(() => {
        if (!window.Papa) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js';
            document.head.appendChild(script);
        }

        const fetchDbCourses = async () => {
            try {
                const snap = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'courses'));
                setDbCourses(snap.docs.map(d => ({ dbId: d.id, ...d.data() })));
            } catch (err) {
                console.error("שגיאה בשליפת קורסים:", err);
            }
        };
        fetchDbCourses();
    }, []);

    const cleanString = (str) => {
        if (!str) return '';
        let decoded = str;
        try { decoded = decodeURIComponent(str); } catch (e) {}
        return decoded.toLowerCase().replace(/[^a-zא-ת0-9]/g, '');
    };

    const displaySlug = (slug) => {
        try { return decodeURIComponent(slug); } catch (e) { return slug; }
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
                toast(`✅ נטענו ${Object.keys(map).length} פרקים למערכת! אפשר לעבור לשיעורים.`);
            },
            error: (err) => toast("שגיאה בטעינת קובץ המבנה: " + err.message)
        });
    };

    const handlePrepareImport = () => {
        if (!file) return toast("אנא בחר את קובץ השיעורים.");
        if (!topicsMap) return toast("חובה לטעון קודם את קובץ הנושאים בשלב 1!");
        if (dbCourses.length === 0) return toast("ממתין לטעינת הקורסים מהשרת, נסה שוב.");
        
        setImporting(true);
        
        window.Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim().replace(/^[\u200B\u200C\uFEFF]+|[\u200B\u200C\uFEFF]+$/g, ''),
            complete: (results) => {
                const rows = results.data;
                
                const extractVideos = (content, videoField) => {
                    const links = new Set();
                    const combined = (content || '') + " " + (videoField || '');
                    const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|embed)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s<>]{11})/gi;
                    let match;
                    while ((match = ytRegex.exec(combined)) !== null) {
                        if (match[1]) {
                            // --- התיקון הקריטי כאן לייבוא עתידי: שומרים את הלינק כהטמעה (Embed) חוקית ---
                            links.add(`https://www.youtube.com/embed/${match[1]}`);
                        }
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
                    
                    const type = ytLinks.length > 0 ? 'video' : 'text'; 
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

                const matchedList = [];
                const unmatchedList = [];

                Object.keys(coursesUpdates).forEach(wpCourseId => {
                    const rawCourseId = String(wpCourseId).trim();
                    const cleanNumericId = rawCourseId.replace(/\D/g, ''); 
                    const courseDataToImport = coursesUpdates[rawCourseId];
                    const searchSlugClean = cleanString(courseDataToImport.slug);
                    
                    let matchedCourse = dbCourses.find(c => {
                        const dbIdStr = String(c.dbId);
                        const cNameClean = cleanString(c.name || '');
                        
                        return dbIdStr === rawCourseId || 
                               dbIdStr === `wp-${rawCourseId}` || 
                               (cleanNumericId.length >= 3 && dbIdStr.includes(cleanNumericId)) || 
                               String(c.wpId) === rawCourseId ||
                               (searchSlugClean && cNameClean && (cNameClean.includes(searchSlugClean) || searchSlugClean.includes(cNameClean)));
                    });

                    if (matchedCourse) {
                        matchedList.push({ wpCourseId, dbId: matchedCourse.dbId, dbName: matchedCourse.name, lessons: courseDataToImport.lessons });
                    } else {
                        unmatchedList.push({ wpCourseId, wpSlug: courseDataToImport.slug || rawCourseId, lessons: courseDataToImport.lessons });
                    }
                });

                setAutoMatched(matchedList);
                setUnmatched(unmatchedList);
                setImporting(false);
                setStep(3); 
            },
            error: (error) => {
                toast("שגיאה בקריאת הקובץ: " + error.message);
                setImporting(false);
            }
        });
    };

    const executeImport = async () => {
        setStep(4);
        setImporting(true);

        const finalMatches = [...autoMatched];
        unmatched.forEach(u => {
            const selectedDbId = manualMatches[u.wpCourseId];
            if (selectedDbId) {
                finalMatches.push({ wpCourseId: u.wpCourseId, dbId: selectedDbId, lessons: u.lessons });
            }
        });

        setProgress({ current: 0, total: finalMatches.length });
        let successCount = 0;

        for (let i = 0; i < finalMatches.length; i++) {
            const match = finalMatches[i];
            const courseRef = doc(db, 'artifacts', appId, 'public', 'data', 'courses', match.dbId);
            
            try {
                const currentDoc = await getDoc(courseRef);
                const currentData = currentDoc.data() || {};
                const existingLessons = currentData.lessons || [];
                const existingIds = existingLessons.map(l => l.id);
                
                const newLessons = match.lessons.filter(l => !existingIds.includes(l.id));
                
                if (newLessons.length > 0) {
                    const MAX_LESSONS_PER_UPDATE = 40; 
                    
                    for (let j = 0; j < newLessons.length; j += MAX_LESSONS_PER_UPDATE) {
                        const chunk = newLessons.slice(j, j + MAX_LESSONS_PER_UPDATE);
                        
                        await updateDoc(courseRef, {
                            lessons: arrayUnion(...chunk),
                            meetingsCount: existingLessons.length + newLessons.length
                        });
                        await delay(500);
                    }
                    successCount += newLessons.length;
                }
            } catch (err) {
                console.error(`שגיאה בעדכון קורס ${match.dbId}:`, err);
                await delay(1000); 
            }
            setProgress({ current: i + 1, total: finalMatches.length });
        }
        
        toast(`הייבוא הושלם בהצלחה! 🚀 ${successCount} שיעורים חוברו.`);
        setImporting(false);
        onClose();
    };

    // --- הפונקציה המתוקנת שהופכת כל קישור בעייתי להטמעה חוקית (Embed) ---
    const handleFixExistingVideos = async () => {
        if (!window.confirm("פעולה זו תעבור על כל הקורסים במערכת, ותהפוך את הקישורים השבורים של יוטיוב להטמעות תקינות (Embed) שלא יקפצו החוצה. להמשיך?")) return;
        
        setImporting(true);
        setFixStatus('מתחיל בסריקת מסד הנתונים...');
        
        try {
            const coursesRef = collection(db, 'artifacts', appId, 'public', 'data', 'courses');
            const snap = await getDocs(coursesRef);
            let fixedCoursesCount = 0;
            let fixedLessonsCount = 0;

            for (let i = 0; i < snap.docs.length; i++) {
                setFixStatus(`סורק קורס ${i + 1} מתוך ${snap.docs.length}...`);
                const docSnap = snap.docs[i];
                const data = docSnap.data();
                
                if (!data.lessons || data.lessons.length === 0) continue;

                let changed = false;
                const updatedLessons = data.lessons.map(l => {
                    // אם מדובר בוידאו או קישור ויש לו URL
                    if ((l.type === 'link' || l.type === 'video') && l.url) {
                        // Regex לחילוץ ה-ID הספציפי של הסרטון
                        const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|embed)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s<>]{11})/i;
                        const match = l.url.match(ytRegex);
                        
                        if (match && match[1]) {
                            // בונה מחדש כתובת embed תקנית
                            const properEmbedUrl = `https://www.youtube.com/embed/${match[1]}`;
                            
                            // מתקן אם הכתובת אינה חוקית או שהסוג לא וידאו
                            if (l.url !== properEmbedUrl || l.type !== 'video') {
                                changed = true;
                                fixedLessonsCount++;
                                return { ...l, type: 'video', url: properEmbedUrl };
                            }
                        }
                    }
                    return l;
                });

                if (changed) {
                    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'courses', docSnap.id), {
                        lessons: updatedLessons
                    });
                    fixedCoursesCount++;
                    await delay(300); // נותן לשרת אוויר
                }
            }

            toast(`✨ תוקן בהצלחה! ${fixedLessonsCount} סרטונים ב-${fixedCoursesCount} קורסים תוקנו והופכו להטמעה פנימית תקינה.`);
        } catch (error) {
            console.error("שגיאה בתיקון הסרטונים:", error);
            toast("שגיאה בתיקון הסרטונים. נסה שוב.");
        }
        
        setFixStatus('');
        setImporting(false);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[400]" onClick={onClose}>
            <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-10 text-right max-h-[90vh] overflow-hidden flex flex-col" dir="rtl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6 border-b pb-4 shrink-0">
                    <h2 className="text-3xl font-black text-green-600">📥 הזרקת סרטונים</h2>
                    <button onClick={onClose} className="text-slate-300 text-4xl hover:text-red-500 transition-colors">&times;</button>
                </div>

                <div className="overflow-y-auto flex-1 pr-2 space-y-6">
                    {(step === 1 || step === 2) && !importing && (
                        <>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                <label className="block font-black text-slate-700 mb-2">📍 שלב 1: טען את קובץ ה"נושאים" (הפרקים)</label>
                                <input type="file" accept=".csv" onChange={handleTopicsUpload} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700" />
                            </div>

                            <div className={`bg-slate-50 p-4 rounded-2xl border border-slate-200 ${!topicsMap ? 'opacity-50 pointer-events-none' : ''}`}>
                                <label className="block font-black text-slate-700 mb-2">🎬 שלב 2: בחר את קובץ ה"שיעורים"</label>
                                <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700" />
                            </div>

                            <button onClick={handlePrepareImport} disabled={!file || !topicsMap} className="w-full bg-slate-900 text-white py-4 rounded-[2rem] font-black text-xl hover:bg-purple-600 transition-all shadow-xl active:scale-95 disabled:opacity-50 mt-4">
                                סרוק קבצים וזהה קורסים 🔍
                            </button>

                            <div className="pt-8 mt-8 border-t border-slate-200">
                                <h3 className="font-bold text-slate-800 mb-2">הסרטונים מראים מסגרת אפורה או זורקים החוצה?</h3>
                                <button onClick={handleFixExistingVideos} className="w-full bg-blue-50 border-2 border-blue-600 text-blue-700 py-3 rounded-2xl font-black text-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95">
                                    🛠️ תיקון מהיר: המרת הקישורים להטמעות חוקיות
                                </button>
                                <p className="text-xs text-slate-500 mt-2 text-center">יוטיוב חוסמת סרטונים רגילים בתוך האתר. תיקון זה יחלץ את ה-ID שלהם ויהפוך אותם להטמעות (Embed) תקינות שע
