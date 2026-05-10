import React, { useState } from 'react';
import { db, appId } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import Papa from 'papaparse';

export default function ImportModal({ onClose, toast }) {
    const [file, setFile] = useState(null);
    const [importing, setImporting] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });

    const handleImport = () => {
        if (!file) return toast("אנא בחר את קובץ ה-CSV שהורדת מוורדפרס.");
        
        setImporting(true);
        
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim(),
            complete: async (results) => {
                const rows = results.data;
                const courseRows = rows.filter(row => {
                    const pt = row['Post Type'] || '';
                    return pt !== 'lesson' && pt !== 'topic';
                });
                
                setProgress({ current: 0, total: courseRows.length });
                let successCount = 0;
                
                // פונקציית צייד: מוצאת כל קישור יוטיוב בתוך טקסט
                const extractYouTubeLinks = (text) => {
                    if (!text) return [];
                    // מחפש את כל הווריאציות של לינקים ליוטיוב
                    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/gi;
                    const links = [];
                    let match;
                    while ((match = regex.exec(text)) !== null) {
                        links.push(`https://www.youtube.com/watch?v=${match[1]}`); // פורמט אחיד ונקי
                    }
                    return links;
                };
                
                for (let i = 0; i < courseRows.length; i++) {
                    const row = courseRows[i];
                    
                    const title = row['Title'] || row.Title || 'קורס מיובא ללא שם';
                    const content = row['Content'] || row.Content || '';
                    const excerpt = row['Excerpt'] || row.Excerpt || '';
                    const imageUrl = row['Image URL'] || '';
                    const categories = row['קטגוריות הקורס'] || '';
                    
                    const rawVideoField = row['_video'] || '';
                    const rawEmbedField = row['_learndash_course_grid_video_embed_code'] || '';

                    // מפעילים את צייד היוטיוב על כל השדות הרלוונטיים כדי לא לפספס שום סרטון
                    const ytLinks = [...new Set([
                        ...extractYouTubeLinks(rawVideoField),
                        ...extractYouTubeLinks(rawEmbedField),
                        ...extractYouTubeLinks(content)
                    ])];

                    // הופכים כל קישור שמצאנו ל"שיעור" במערכת החדשה
                    const lessons = ytLinks.map((url, idx) => ({
                        id: `lesson-yt-${Date.now()}-${idx}`,
                        title: ytLinks.length === 1 ? 'סרטון הקורס' : `סרטון שיעור ${idx + 1}`,
                        type: 'link', // מוגדר כקישור כדי שהמערכת תדע לנגן אותו
                        url: url,
                        content: '',
                        description: 'יובא מהמערכת הישנה'
                    }));
                    
                    let cleanSummary = excerpt.replace(/(<([^>]+)>)/gi, "").trim();
                    if (!cleanSummary) {
                        cleanSummary = content.replace(/(<([^>]+)>)/gi, "").trim();
                        if (cleanSummary.length > 150) cleanSummary = cleanSummary.substring(0, 150) + "...";
                    }
                    
                    const rowId = row['ID'] || row.ID;
                    const id = rowId ? "wp-" + rowId : "imported-" + Date.now() + i;
                    
                    const courseData = {
                        id: id,
                        name: title,
                        summary: cleanSummary || "אין תיאור לקורס זה",
                        description: content, 
                        fields: categories ? categories.split(',').map(c => c.trim()) : ['ייבוא מוורדפרס'],
                        imageUrl: imageUrl, 
                        fromGrade: 'א',
                        toGrade: 'יב',
                        meetingsCount: lessons.length > 0 ? lessons.length : 10, // מעדכן את מספר המפגשים לפי כמות הסרטונים
                        type: 'מיומנויות',
                        lessons: lessons, // הזרקת הסרטונים פנימה!
                        createdAt: new Date().toISOString()
                    };

                    try {
                        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'courses', id), courseData);
                        successCount++;
                        setProgress({ current: successCount, total: courseRows.length });
                    } catch (err) {
                        console.error("שגיאה בשמירת קורס:", err);
                    }
                }
                
                toast(`הייבוא הושלם! ${successCount} קורסים עודכנו עם קישורי יוטיוב.`);
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
                    <h2 className="text-3xl font-black text-green-600">📥 ייבוא סרטונים ותוכן</h2>
                    <button onClick={onClose} className="text-slate-300 text-4xl hover:text-red-500 transition-colors">&times;</button>
                </div>

                <div className="space-y-6">
                    <p className="text-slate-600 font-bold">
                        בחר את קובץ ה-CSV. המערכת תסרוק אותו כדי לצוד את כל קישורי היוטיוב שהיו בוורדפרס, ותזריק אותם אוטומטית לתוך הקורסים הקיימים שלך.
                    </p>

                    <input 
                        type="file" 
                        accept=".csv"
                        onChange={(e) => setFile(e.target.files[0])}
                        className="w-full p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer font-bold text-slate-600"
                        disabled={importing}
                    />

                    {importing ? (
                        <div className="bg-green-50 p-6 rounded-2xl border-2 border-green-200 text-center">
                            <p className="font-black text-green-800 text-xl mb-2">מייבא סרטונים, נא להמתין...</p>
                            <p className="text-green-600 font-bold">{progress.current} מתוך {progress.total} קורסים נסרקו ועודכנו!</p>
                            <div className="w-full bg-green-200 rounded-full h-4 mt-4 overflow-hidden">
                                <div className="bg-green-600 h-full transition-all duration-300" style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}></div>
                            </div>
                        </div>
                    ) : (
                        <button 
                            onClick={handleImport} 
                            disabled={!file}
                            className="w-full bg-slate-900 text-white py-4 rounded-[2rem] font-black text-xl hover:bg-green-600 transition-all shadow-xl active:scale-95 disabled:opacity-50">
                            עדכן קורסים עם סרטונים 🚀
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
