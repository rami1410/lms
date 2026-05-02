import React, { useState } from 'react';
import { db, appId } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function CourseModal({ onClose, toast, geminiKey }) {
    const [data, setData] = useState({
        name: '', field: 'בינה מלאכותית', fromGrade: 'א', toGrade: 'יב', equipment: 'מחשב', type: 'מיומנויות',
        summary: '', goals: '', targets: '', skills: '', activeLearning: '', prerequisites: ''
    });
    const [loadingField, setLoadingField] = useState(null);

    const handleAI = async (field, label) => {
        if (!data.name) return toast("הזן קודם את שם הקורס");
        const cleanKey = (geminiKey || "").trim();
        if (!cleanKey || cleanKey === "undefined") return toast("שגיאה: מפתח AI לא נמצא. בדוק את Vercel.");

        setLoadingField(field);
        try {
            const prompt = `כתוב ${label} מקצועי ופדגוגי לקורס בשם "${data.name}" המיועד לכיתות ${data.fromGrade} עד ${data.toGrade}. התחום הוא ${data.field}. סוג הקורס הוא ${data.type}. ציוד נדרש: ${data.equipment}. תן רק את התוכן עצמו ללא הקדמות.`;
            
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${cleanKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const result = await res.json();
            if (result.candidates && result.candidates[0].content.parts[0].text) {
                setData(prev => ({ ...prev, [field]: result.candidates[0].content.parts[0].text.trim() }));
            } else { throw new Error(); }
        } catch (e) { toast("תקלת AI - לא ניתן לייצר תוכן כרגע"); }
        finally { setLoadingField(null); }
    };

    const save = async (e) => {
        e.preventDefault();
        if (!data.name) return toast("הזן שם קורס");
        const id = "c-" + Date.now();
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'courses', id), { ...data, id, lessons: [] });
            toast("הקורס נוצר בהצלחה!");
            onClose();
        } catch (e) { toast("שגיאה בשמירה לפיירבייס"); }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[200] text-right" dir="rtl">
            <div className="bg-white w-full max-w-4xl rounded-[2rem] shadow-2xl p-8 overflow-y-auto max-h-[95vh]">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-3xl font-black text-slate-800">יצירת קורס חדש</h2>
                    <button onClick={onClose} type="button" className="text-slate-400 text-3xl hover:text-slate-600 transition-colors">&times;</button>
                </div>

                <form onSubmit={save} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-black text-slate-500">שם הקורס</label>
                            <input className="w-full p-3 bg-slate-50 rounded-xl border font-bold outline-none focus:border-purple-500" value={data.name} onChange={e => setData({...data, name: e.target.value})} required/>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-black text-slate-500">תחום נלמד</label>
                            <select className="w-full p-3 bg-slate-50 rounded-xl border font-bold outline-none" value={data.field} onChange={e => setData({...data, field: e.target.value})}>
                                <option>בינה מלאכותית</option><option>רובוטיקה</option><option>תכנות</option><option>מתמטיקה</option><option>מדעים</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-black text-slate-500">מכיתה</label>
                            <select className="w-full p-3 bg-slate-50 rounded-xl border font-bold outline-none" value={data.fromGrade} onChange={e => setData({...data, fromGrade: e.target.value})}>
                                <option>א</option><option>ב</option><option>ג</option><option>ד</option><option>ה</option><option>ו</option><option>ז</option><option>ח</option><option>ט</option><option>י</option><option>יא</option><option>יב</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-black text-slate-500">עד כיתה</label>
                            <select className="w-full p-3 bg-slate-50 rounded-xl border font-bold outline-none" value={data.toGrade} onChange={e => setData({...data, toGrade: e.target.value})}>
                                <option>א</option><option>ב</option><option>ג</option><option>ד</option><option>ה</option><option>ו</option><option>ז</option><option>ח</option><option>ט</option><option>י</option><option>יא</option><option>יב</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-black text-slate-500">ציוד נדרש</label>
                            <select className="w-full p-3 bg-slate-50 rounded-xl border font-bold outline-none" value={data.equipment} onChange={e => setData({...data, equipment: e.target.value})}>
                                <option>מחשב</option><option>טאבלט</option><option>סמארטפון</option><option>ערכת רובוטיקה</option><option>אין צורך</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-black text-slate-500">סוג הקורס (מחוון)</label>
                        <div className="flex bg-slate-100 rounded-xl overflow-hidden border">
                            {['מיומנויות', 'חקר', 'פרויקטים'].map((t, i) => (
                                <button key={t} type="button" onClick={() => setData({...data, type: t})} className={`flex-1 py-2 text-sm font-bold transition-colors ${data.type === t ? 'bg-purple-100 text-purple-700 border-b-2 border-purple-600' : 'text-slate-500 hover:bg-slate-200'}`}>
                                    {i+1}. {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-black text-slate-500">תמצית הקורס</label>
                            <button type="button" onClick={() => handleAI('summary', 'תמצית הקורס')} className="bg-purple-600 text-white text-[10px] font-black px-3 py-1 rounded-full hover:bg-purple-700">
                                {loadingField === 'summary' ? 'מעבד...' : 'ייצר עם AI ✨'}
                            </button>
                        </div>
                        <textarea className="w-full p-3 bg-slate-50 rounded-xl border min-h-[80px] outline-none focus:border-purple-500 text-sm font-medium" value={data.summary} onChange={e => setData({...data, summary: e.target.value})} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-black text-slate-500">מטרות הקורס</label>
                                <button type="button" onClick={() => handleAI('goals', 'מטרות הקורס')} className="bg-purple-600 text-white text-[10px] font-black px-3 py-1 rounded-full hover:bg-purple-700">
                                    {loadingField === 'goals' ? 'מעבד...' : 'ייצר עם AI ✨'}
                                </button>
                            </div>
                            <textarea className="w-full p-3 bg-slate-50 rounded-xl border min-h-[80px] outline-none focus:border-purple-500 text-sm font-medium" value={data.goals} onChange={e => setData({...data, goals: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-black text-slate-500">יעדי הצלחה מדידים</label>
                                <button type="button" onClick={() => handleAI('targets', 'יעדי הצלחה מדידים')} className="bg-purple-600 text-white text-[10px] font-black px-3 py-1 rounded-full hover:bg-purple-700">
                                    {loadingField === 'targets' ? 'מעבד...' : 'ייצר עם AI ✨'}
                                </button>
                            </div>
                            <textarea className="w-full p-3 bg-slate-50 rounded-xl border min-h-[80px] outline-none focus:border-purple-500 text-sm font-medium" value={data.targets} onChange={e => setData({...data, targets: e.target.value})} />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-black text-slate-500">מיומנויות נרכשות</label>
                            <button type="button" onClick={() => handleAI('skills', 'מיומנויות נרכשות')} className="bg-purple-600 text-white text-[10px] font-black px-3 py-1 rounded-full hover:bg-purple-700">
                                {loadingField === 'skills' ? 'מעבד...' : 'ייצר עם AI ✨'}
                            </button>
                        </div>
                        <textarea className="w-full p-3 bg-slate-50 rounded-xl border min-h-[80px] outline-none focus:border-purple-500 text-sm font-medium" value={data.skills} onChange={e => setData({...data, skills: e.target.value})} />
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-black text-purple-600">התבלין המיוחד: למידה אקטיבית</label>
                            <button type="button" onClick={() => handleAI('activeLearning', 'פעילות למידה אקטיבית (תכנון, בנייה, עבודה בידיים)')} className="bg-purple-600 text-white text-[10px] font-black px-3 py-1 rounded-full hover:bg-purple-700">
                                {loadingField === 'activeLearning' ? 'מעבד...' : 'ייצר עם AI ✨'}
                            </button>
                        </div>
                        <textarea placeholder="תאר כיצד הלומד מבצע למידה פעילה (תכנון, בנייה, עבודה בידיים)." className="w-full p-3 bg-slate-50 rounded-xl border min-h-[80px] outline-none focus:border-purple-500 text-sm font-medium" value={data.activeLearning} onChange={e => setData({...data, activeLearning: e.target.value})} />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-black text-slate-500">קורסים שהם תנאי סף (Prerequisites)</label>
                        <input className="w-full p-3 bg-slate-50 rounded-xl border font-bold outline-none focus:border-purple-500" value={data.prerequisites} onChange={e => setData({...data, prerequisites: e.target.value})} />
                    </div>

                    <button type="submit" className="w-full bg-purple-600 text-white py-4 rounded-xl font-black text-xl shadow-lg hover:bg-purple-700 transition-all mt-6">אשר ושמור קורס</button>
                </form>
            </div>
        </div>
    );
}
