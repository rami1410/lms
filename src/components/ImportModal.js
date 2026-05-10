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
            complete: async (results) => {
                const rows = results.data;
                // מנסה לסנן רק שורות שהן באמת קורסים (בהנחה ש-Tutor מגדיר אותן ככה בקובץ)
                const courseRows = rows.filter(row => row['Post Type'] !== 'lesson' && row['Post Type'] !== 'topic');
                
                setProgress({ current: 0, total: courseRows.length });
                let successCount = 0;
                
                for (let i = 0; i < courseRows.length; i++) {
                    const row = courseRows[i];
                    
                    const title = row.Title || 'קורס מיובא ללא שם';
                    let content = row.Content || '';
                    
                    // ניקוי אלמנטים מיותרים של וורדפרס מהתיאור
                    let cleanSummary = content.replace(/(<([^>]+)>)/gi, "");
                    if (cleanSummary.length > 150) cleanSummary = cleanSummary.substring(0, 150) + "...";
                    
                    const id = row.ID ? "wp-" + row.ID : "imported-" + Date.now() + i;
                    
                    const courseData = {
                        id: id,
                        name: title,
                        summary: cleanSummary || "אין תיאור לקורס זה",
                        description: content, 
                        fields: ['ייבוא מוורדפרס'],
                        fromGrade: 'א',
                        toGrade: 'יב',
                        meetingsCount: 10,
                        type: 'מיומנויות',
                        lessons: [], 
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
                
                toast(`הייבוא הושלם! ${successCount} קורסים הועלו בהצלחה.`);
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
                    <h2 className="text-3xl font-black text-blue-600">📥 ייבוא קורסים מוורדפרס</h2>
                    <button onClick={onClose} className="text-slate-300 text-4xl hover:text-red-500 transition-colors">&times;</button>
                </div>

                <div className="space-y-6">
                    <p className="text-slate-600 font-bold">
                        בחר את קובץ ה-CSV שהורדת מ-WP All Export. המערכת תסרוק אותו ותייצר עבורך את כל הקורסים אוטומטית.
                    </p>

                    <input 
                        type="file" 
                        accept=".csv"
                        onChange={(e) => setFile(e.target.files[0])}
                        className="w-full p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer font-bold text-slate-600"
                        disabled={importing}
                    />

                    {importing ? (
                        <div className="bg-blue-50 p-6 rounded-2xl border-2 border-blue-200 text-center">
                            <p className="font-black text-blue-800 text-xl mb-2">מייבא קורסים, נא להמתין...</p>
                            <p className="text-blue-600 font-bold">{progress.current} מתוך {progress.total} קורסים הועלו!</p>
                            <div className="w-full bg-blue-200 rounded-full h-4 mt-4 overflow-hidden">
                                <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}></div>
                            </div>
                        </div>
                    ) : (
                        <button 
                            onClick={handleImport} 
                            disabled={!file}
                            className="w-full bg-slate-900 text-white py-4 rounded-[2rem] font-black text-xl hover:bg-blue-600 transition-all shadow-xl active:scale-95 disabled:opacity-50">
                            התחל ייבוא נתונים 🚀
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
