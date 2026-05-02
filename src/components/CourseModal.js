import React, { useState } from 'react';
import { db, appId } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function CourseModal({ onClose, toast, geminiKey }) {
    const [data, setData] = useState({
        name: '', field: 'בינה מלאכותית', fromGrade: 'א', toGrade: 'יב', equipment: 'מחשב', type: 'מיומנויות',
        summary: '', goals: '', targets: '', skills: '', activeLearning: ''
    });
    const [loadingField, setLoadingField] = useState(null);

    const handleAI = async (field, label) => {
        if (!data.name) return toast("הזן קודם את שם הקורס");
        
        // בדיקת אבטחה בתוך הקומפוננטה
        if (!geminiKey || geminiKey === "undefined") {
            console.error("AI Key missing in CourseModal. Prop value:", geminiKey);
            return toast("שגיאה: מפתח AI לא חובר למערכת");
        }

        setLoadingField(field);
        try {
            const prompt = `כתוב ${label} מקצועי ופדגוגי לקורס בשם "${data.name}" המיועד לכיתות ${data.fromGrade} עד ${data.toGrade}. תן רק את התוכן עצמו ללא הקדמות.`;
            
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            
            const result = await res.json();
            
            if (result.candidates && result.candidates[0].content.parts[0].text) {
                const aiText = result.candidates[0].content.parts[0].text.trim();
                setData(prev => ({ ...prev, [field]: aiText }));
            } else {
                throw new Error("Invalid AI response structure");
            }
        } catch (e) {
            console.error(e);
            toast("תקלה ביצירת תוכן AI");
        } finally {
            setLoadingField(null);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!data.name) return toast("חובה להזין שם קורס");
        
        const id = "course-" + Date.now();
        try {
            if (!db) throw new Error("Database not connected");
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'courses', id), { ...data, id });
            toast("הקורס נשמר בהצלחה!");
            onClose();
        } catch (e) {
            console.error(e);
            toast("שגיאה בשמירה - בדוק חיבור לפיירבייס");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[100] text-right" dir="rtl">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3rem] shadow-2xl p-10">
                <div className="flex justify-between items-center mb-8 border-b pb-4">
                    <h2 className="text-3xl font-black text-slate-800">יצירת קורס חדש</h2>
                    <button onClick={onClose} className="text-slate-300 text-4xl hover:text-slate-500 transition-colors">&times;</button>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 mr-2">שם הקורס</label>
                            <input className="w-full p-4 bg-slate-50 rounded-2xl border font-bold outline-none focus:border-purple-500" value={data.name} onChange={e => setData({...data, name: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 mr-2">תחום נלמד</label>
                            <select className="w-full p-4 bg-slate-50 rounded-2xl border font-bold outline-none" value={data.field} onChange={e => setData({...data, field: e.target.value})}>
                                <option>בינה מלאכותית</option><option>רובוטיקה</option><option>תכנות</option><option>מתמטיקה</option>
                            </select>
                        </div>
                    </div>

                    {[
                        { id: 'summary', label: 'תמצית הקורס' },
                        { id: 'goals', label: 'מטרות הקורס' },
                        { id: 'targets', label: 'יעדי הצלחה מדידים' }
                    ].map(f => (
                        <div key={f.id} className="space-y-2">
                            <div className="flex justify-between items-center px-2">
                                <label className="text-xs font-black text-slate-400">{f.label}</label>
                                <button type="button" onClick={() => handleAI(f.id, f.label)} disabled={loadingField !== null} className="bg-purple-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full hover:bg-purple-700 transition-all">
                                    {loadingField === f.id ? 'מעבד...' : 'ייצר עם AI ✨'}
                                </button>
                            </div>
                            <textarea className="w-full p-4 bg-slate-50 rounded-2xl border min-h-[100px] outline-none focus:border-purple-500 font-medium" value={data[f.id]} onChange={e => setData({...data, [f.id]: e.target.value})} />
                        </div>
                    ))}

                    <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xl shadow-xl hover:bg-black transition-all">אשר ושמור קורס</button>
                </form>
            </div>
        </div>
    );
}
