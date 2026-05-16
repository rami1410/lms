import React, { useState, useEffect } from 'react';
import { db, appId } from '../firebase';
import { doc, updateDoc, arrayUnion, getDocs, collection } from 'firebase/firestore';

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

    // פונקציית עזר למציאת התאמה חלקית בשמות
    const stringSimilarity = (str1, str2) => {
        if (!str1 || !str2) return 0;
        const s1 = str1.toLowerCase().replace(/[^a-zא-ת0-9]/g, '');
        const s2 = str2.toLowerCase().replace(/[^a-zא-ת0-9]/g, '');
        if (s1.includes(s2) || s2.includes(s1)) return 1;
        return 0; // פשוט כדי לראות אם יש הכלה
    };

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
                    // לפעמים שם הקורס הראשי מתחבא ב-Slug (כמו microbit-2)
                    const parentSlug = row['Parent Slug'] || '';
                    const courseId = row['Post Parent'] || row['Parent'] || row.parent;
                    
                    if (topicId && courseId) {
                        map[String(topicId).trim()] = {
                            courseId: String(courseId).trim(),
                            title: String(topicTitle).trim(),
                            slug: String(parentSlug).split('/')[0] // מחלץ את השם הבסיסי
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

        // משיכת כל הקורסים הקיימים ממסד הנתונים
        let existingDbCourses = [];
        try {
            const coursesRef = collection(db, 'artifacts', appId, 'public', 'data', 'courses');
            const snap = await getDocs(coursesRef);
            existingDbCourses = snap.docs.map(d => ({ dbId: d.id, ...d.data() }));
            console.log("קורסים קיימים במסד:", existingDbCourses.length);
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
                    
                    // רשת ביטחון רחבה למציאת הקורס (ID או שם דומה!)
                    let matchedCourse = existingDbCourses.find(c => {
                        const dbIdStr = String(c.dbId);
                        const cName = String(c.name || '');
                        
                        return dbIdStr === rawCourseId || 
                               dbIdStr === `wp-${rawCourseId}` || 
                               dbIdStr === `course-${rawCourseId}` || 
                               (cleanNumericId.length >= 3 && dbIdStr.includes(cleanNumericId)) || 
                               String(c.id) === rawCourseId || 
                               String(c.wpId) === rawCourseId ||
                               (searchSlug && cName && stringSimilarity(cName, searchSlug)); // חיפוש לפי שם!
                    });
                    
                    if (matchedCourse) {
                        try {
                            const courseRef = doc(db, 'artifacts', appId, 'public', 'data', 'courses', matchedCourse.dbId);
                            const existingLessons = matchedCourse.lessons || [];
                            const existingIds = existingLessons.map(l => l.id);
                            
                            const newLessons = lessonsToAdd.filter(l => !existingIds.includes(l.id));
