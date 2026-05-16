import React, { useState, useEffect } from 'react';
import { db, appId } from '../firebase';
import { doc, updateDoc, arrayUnion, getDocs, collection, getDoc } from 'firebase/firestore';

export default function ImportModal({ onClose, toast }) {
    const [step, setStep] = useState(1);
    const [topicsMap, setTopicsMap] = useState(null); 
    const [file, setFile] = useState(null);
    const [dbCourses, setDbCourses] = useState([]);
    
    // States for the matching phase
    const [autoMatched, setAutoMatched] = useState([]);
    const [unmatched, setUnmatched] = useState([]);
    const [manualMatches, setManualMatches] = useState({}); 

    const [importing, setImporting] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });

    useEffect(() => {
        // טעינת ספריית הפענוח
        if (!window.Papa) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js';
            document.head.appendChild(script);
        }

        // שאיבת כל הקורסים הקיימים ב-DB מראש
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

    // פונקציה חכמה שמנקה תווים ומתרגמת קידוד URL לעברית אמיתית!
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

    // פעולת הסריקה הראשונית - מנתחת ומוצאת שידוכים, אך לא שומרת כלום עדיין!
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

                // חלוקה לאוטומטי מול ידני
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
                setStep(3); // מעבר למסך ההתאמה הידנית
            },
            error: (error) => {
                toast("שגיאה בקריאת הקובץ: " + error.message);
                setImporting(false);
            }
        });
    };

    // פעולת ההזרקה האמיתית לאחר שהמשתמש אישר הכל
    const executeImport = async () => {
        setStep(4);
        setImporting(true);

        const finalMatches = [...autoMatched];
        
        // הוספת הקורסים שהמשתמש שדך ידנית
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
                    // --- מנגנון הביסים (Chunking) למניעת קריסת שרת ---
                    const MAX_LESSONS_PER_UPDATE = 40; 
                    
                    for (let j = 0; j < newLessons.length; j += MAX_LESSONS_PER_UPDATE) {
                        const chunk = newLessons.slice(j, j + MAX_LESSONS_PER_UPDATE);
                        
                        await updateDoc(courseRef, {
                            lessons: arrayUnion(...chunk),
                            meetingsCount: existingLessons.length + newLessons.length
                        });
                        
                        await delay(500); // מנוחה של חצי שנייה לשרת
                    }

                    successCount += newLessons.length;
                }
            } catch (err) {
                console.error(`שגיאה בעדכון קורס ${match.dbId}:`, err);
                await delay(1000); 
            }
            setProgress({ current: i + 1, total: finalMatches.length });
        }
        
        toast(`הייבוא הושלם בהצלחה מטורפת! 🚀 ${successCount} שיעורים חוברו.`);
        setImporting(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[400]" onClick={onClose}>
            <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-10 text-right max-h-[90vh] overflow-hidden flex flex-col" dir="rtl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6 border-b pb-4 shrink-0">
                    <h2 className="text-3xl font-black text-green-600">📥 שחזור היררכיית קורסים</h2>
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
                        </>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <h3 className="text-2xl font-black text-slate-800">שלב 3: התאמת קורסים ידנית</h3>
                            <p className="text-slate-600">סיימנו לסרוק! המערכת זיהתה וחיברה אוטומטית <span className="font-bold text-green-600">{autoMatched.length} קורסים</span> בהצלחה.</p>
                            
                            {unmatched.length > 0 && (
                                <div className="mt-4 border-t pt-4">
                                    <p className="font-bold text-red-600 mb-4">נותרו {unmatched.length} קורסים מהקובץ שלא מצאנו להם שידוך מדויק. אנא בחר מהרשימה לאיזה קורס לשייך אותם:</p>
                                    
                                    {unmatched.map(u => (
                                        <div key={u.wpCourseId} className="bg-slate-50 p-4 rounded-xl mb-4 border border-slate-200 shadow-sm">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="font-black text-slate-800 break-all">{displaySlug(u.wpSlug)}</span>
                                                <span className="text-xs bg-slate-200 text-slate-700 px-3 py-1 rounded-full font-bold whitespace-nowrap mr-2">{u.lessons.length} שיעורים</span>
                                            </div>
                                            <select 
                                                value={manualMatches[u.wpCourseId] || ''}
                                                onChange={(e) => setManualMatches(prev => ({...prev, [u.wpCourseId]: e.target.value}))}
                                                className="w-full p-3 rounded-lg border-2 border-slate-300 focus:border-purple-500 outline-none text-slate-700 bg-white font-medium"
                                            >
                                                <option value="">-- דילוג (לא לייבא) או בחר קורס --</option>
                                                {dbCourses.map(c => (
                                                    <option key={c.dbId} value={c.dbId}>{c.name || 'קורס ללא שם'}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="pt-4 border-t mt-6">
                                <button onClick={executeImport} className="w-full bg-green-600 text-white py-4 rounded-[2rem] font-black text-xl hover:bg-green-700 transition-all shadow-xl active:scale-95">
                                    התחל הזרקה למערכת 🚀
                                </button>
                            </div>
                        </div>
                    )}

                    {(importing && (step === 1 || step === 2)) && (
                        <div className="text-center py-10">
                            <p className="font-black text-purple-600 text-xl animate-pulse">מנתח ומפענח את הקבצים...</p>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="bg-green-50 p-6 rounded-2xl border-2 border-green-200 text-center">
                            <p className="font-black text-green-800 text-xl mb-2">מזריק שיעורים ל-Database...</p>
                            <p className="text-sm text-green-700 mb-2 font-bold animate-pulse">במידה ויש הרבה שיעורים, השרת נח כדי לא לקרוס.</p>
                            <p className="text-green-600 font-black text-lg">{progress.current} מתוך {progress.total} קורסים עודכנו!</p>
                            <div className="w-full bg-green-200 rounded-full h-4 mt-4 overflow-hidden">
                                <div className="bg-green-600 h-full transition-all duration-300" style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
