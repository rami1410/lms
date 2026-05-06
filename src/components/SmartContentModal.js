import React, { useState } from 'react';
import { db, appId } from '../firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

export default function SmartContentModal({ onClose, toast, existingCourses = [], geminiKey }) {
    const [inputContent, setInputContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [aiResult, setAiResult] = useState(null);
    const [approvedCourses, setApprovedCourses] = useState({});

    const analyzeContent = async () => {
        if (!inputContent.trim()) return toast("אנא הזן תוכן או קישור תחילה.");
        if (!existingCourses || existingCourses.length === 0) return toast("אין קורסים במערכת לסרוק.");
        const key = geminiKey ? String(geminiKey).trim() : "";
        if (!key || key === "undefined") return toast("שגיאה: מפתח AI חסר.");

        setLoading(true);
        try {
            // הכנת רשימת הקורסים עבור ה-AI (שם וזיהוי בלבד כדי לא להעמיס)
            const coursesList = existingCourses.map(c => ({ id: c.id, name: c.name, fields: c.fields || [] }));

            const prompt = `
            אני מנהל מערכת למידה. מצאתי את התוכן/ההשראה הבאה ברשת:
            "${inputContent}"
            
            הנה רשימת הקורסים הקיימים במערכת שלי:
            ${JSON.stringify(coursesList)}

            אנא נתח את התוכן וספק לי המלצות.
            חובה להחזיר אך ורק JSON תקין (Valid JSON). ללא טקסט מקדים, ללא סימני Markdown, וללא הערות.
            המבנה חייב להיות בדיוק ככה:
            {
                "contentTitle": "כותרת קצרה ומושכת עבור התוכן (עד 5 מילים)",
                "integrationMethod": "הסבר פדגוגי קצר (עד 3 משפטים) כיצד לשלב את התוכן במערכת",
                "recommendedCourses": [
                    { "id": "מזהה הקורס התואם מתוך הרשימה", "name": "שם הקורס", "reason": "משפט אחד המסביר למה התוכן מתאים לקורס זה" }
                ],
                "additionalLinks": ["חיפוש מומלץ 1 ביוטיוב/גוגל", "מושג נוסף שכדאי לחקור"]
            }
            `;

            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${key}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const result = await res.json();

            if (result.error) throw new Error(result.error.message);

            let rawText = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
            
            // "צייד JSON" - שולף רק את המבנה של הנתונים ומתעלם מפטפוטים של ה-AI מסביב
            const jsonMatch = rawText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                rawText = jsonMatch[0];
            } else {
                // למקרה קיצון שאנחנו צריכים ניקוי בסיסי
                rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            }
            
            const parsedData = JSON.parse(rawText);
            setAiResult(parsedData);
            
            // הגדרת כל הקורסים המומלצים כמאושרים (V) כברירת מחדל
            const initialApproval = {};
            if (parsedData.recommendedCourses) {
                parsedData.recommendedCourses.forEach(c => {
                    initialApproval[c.id] = true;
                });
            }
            setApprovedCourses(initialApproval);

        } catch (e) {
            console.error("AI Error Details:", e);
            toast("הייתה בעיה בפענוח התוכן. נסה לנסח אחרת.");
        } finally {
            setLoading(false);
        }
    };

    const toggleCourseApproval = (courseId) => {
        setApprovedCourses(prev => ({ ...prev, [courseId]: !prev[courseId] }));
    };

    const handleSave = async () => {
        const coursesToUpdate = Object.keys(approvedCourses).filter(id => approvedCourses[id]);
        if (coursesToUpdate.length === 0) {
            return toast("לא נבחרו קורסים להוספת התוכן.");
        }

        try {
            // בדיקה האם מדובר בקישור (URL) או בטקסט רגיל
            const isLink = inputContent.trim().startsWith('http');

            // הזרקת התוכן לכל קורס שאושר, כשיעור/פריט תוכן רגיל לחלוטין במערך ה-lessons
            for (let courseId of coursesToUpdate) {
                const courseRef = doc(db, 'artifacts', appId, 'public', 'data', 'courses', courseId);
                
                const newLesson = {
                    id: "lesson-ai-" + Date.now() + Math.floor(Math.random() * 1000),
                    title: aiResult.contentTitle || "העשרה פדגוגית",
                    type: isLink ? 'link' : 'text',
                    url: isLink ? inputContent.trim() : '',
                    content: isLink ? '' : inputContent,
                    description: aiResult.recommendedCourses.find(c => c.id === courseId)?.reason || "",
                    isSmartContent: true // סימון קטן מאחורי הקלעים כדי שנדע שזה הגיע מה-AI
                };

                await updateDoc(courseRef, {
                    lessons: arrayUnion(newLesson)
                });
            }
            toast(`התוכן התווסף כשיעור רגיל ל-${coursesToUpdate.length} קורסים!`);
            onClose();
        } catch (e) {
            console.error(e);
            toast("שגיאה בהזרקת התוכן לקורסים.");
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[300]" onClick={onClose}>
            <div className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl p-10 overflow-y-auto max-h-[95vh] text-right" dir="rtl" onClick={e => e.stopPropagation()}>
                
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-3xl font-black text-purple-600">✨ הוספת תוכן חכם</h2>
                    <button onClick={onClose} className="text-slate-300 text-4xl hover:text-red-500 transition-colors">&times;</button>
                </div>

                {!aiResult ? (
                    <div className="space-y-6">
                        <p className="text-slate-600 font-bold">
                            מצאת משהו מעורר השראה ברשת? הדבק כאן קישורים, טקסטים או רעיונות. 
                            המערכת תסרוק את כל הקורסים ותמליץ היכן ואיך לשלב את זה כשיעור או קישור רגיל.
                        </p>
                        <textarea 
                            className="w-full p-4 bg-slate-50 rounded-2xl border-2 min-h-[150px] outline-none focus:border-purple-500 font-medium"
                            placeholder="הדבק כאן קישור ליוטיוב, מאמר, או רעיון למערך שיעור..."
                            value={inputContent}
                            onChange={e => setInputContent(e.target.value)}
                        />
                        <button 
                            onClick={analyzeContent} 
                            disabled={loading}
                            className="w-full bg-slate-900 text-white py-4 rounded-[2rem] font-black text-xl hover:bg-purple-600 transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-3">
                            {loading ? '🤖 המערכת סורקת וחושבת...' : 'נתח והמלץ לי'}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        
                        <div className="bg-blue-50 p-6 rounded-3xl border-2 border-blue-100">
                            <h3 className="font-black text-blue-800 mb-2">📌 כותרת התוכן החדש:</h3>
                            <p className="text-lg font-bold text-slate-800">{aiResult.contentTitle}</p>
                        </div>

                        <div className="bg-purple-50 p-6 rounded-3xl border-2 border-purple-100">
                            <h3 className="font-black text-purple-800 mb-2">💡 איך לשלב פדגוגית?</h3>
                            <p className="text-sm font-bold text-slate-700">{aiResult.integrationMethod}</p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-black text-xl text-slate-800">🎯 קורסים לשיבוץ התוכן (בחר V או X)</h3>
                            {aiResult.recommendedCourses && aiResult.recommendedCourses.length > 0 ? (
                                aiResult.recommendedCourses.map(course => (
                                    <div key={course.id} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${approvedCourses[course.id] ? 'bg-white border-green-400 shadow-md' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                                        <div className="flex-1 ml-4">
                                            <h4 className="font-black text-lg text-slate-800">{course.name}</h4>
                                            <p className="text-xs font-bold text-slate-500">{course.reason}</p>
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            <button type="button" onClick={() => toggleCourseApproval(course.id)} className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl transition-all ${approvedCourses[course.id] ? 'bg-green-500 text-white scale-110 shadow-lg' : 'bg-slate-200 text-slate-400 hover:bg-green-100'}`}>V</button>
                                            <button type="button" onClick={() => toggleCourseApproval(course.id)} className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl transition-all ${!approvedCourses[course.id] ? 'bg-red-500 text-white scale-110 shadow-lg' : 'bg-slate-200 text-slate-400 hover:bg-red-100'}`}>X</button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-500 font-bold text-center py-4">ה-AI לא מצא קורסים שמתאימים ישירות לתוכן זה.</p>
                            )}
                        </div>

                        {aiResult.additionalLinks && aiResult.additionalLinks.length > 0 && (
                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                                <h3 className="font-black text-slate-800 mb-2">🔗 רעיונות נוספים להרחבה</h3>
                                <ul className="list-disc list-inside text-sm font-bold text-slate-600 space-y-1">
                                    {aiResult.additionalLinks.map((link, idx) => (
                                        <li key={idx}>{link}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="flex gap-4 pt-4 border-t border-slate-100">
                            <button onClick={() => setAiResult(null)} className="flex-1 py-4 rounded-[2rem] font-black bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                                חזור לניסוח מחדש
                            </button>
                            <button onClick={handleSave} className="flex-[2] py-4 rounded-[2rem] font-black bg-green-500 text-white hover:bg-green-600 shadow-xl active:scale-95 transition-all">
                                אשר והזרק תוכן לקורסים!
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
