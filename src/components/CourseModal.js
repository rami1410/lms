import React, { useState } from 'react';
import { db, appId } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function CourseModal({ onClose, toast, geminiKey }) {
    const [data, setData] = useState({
        name: '', field: 'בינה מלאכותית', fromGrade: 'א', toGrade: 'יב',
        summary: '', goals: '', targets: '', lessons: []
    });
    const [loadingField, setLoadingField] = useState(null);

    const handleAI = async (field, label) => {
        if (!data.name) return toast("הזן קודם את שם הקורס");
        const cleanKey = (geminiKey || "").trim();
        if (!cleanKey || cleanKey === "undefined") return toast("שגיאה: מפתח AI לא נמצא");

        setLoadingField(field);
        try {
            const prompt = `כתוב ${label} מקצועי לקורס "${data.name}" לכיתות ${data.fromGrade}-${data.toGrade}. תן רק את התוכן.`;
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${cleanKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const result = await res.json();
            if (result.candidates) {
                setData(prev => ({ ...prev, [field]: result.candidates[0].content.parts[0].text.trim() }));
            } else { throw new Error(); }
        } catch (e) { toast("תקלת AI - וודא שהמפתח ב-Vercel תקין"); }
        finally { setLoadingField(null); }
    };

    const save = async () => {
        if (!data.name) return toast("הזן שם קורס");
        const id = "c-" + Date.now();
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'courses', id), { ...data, id });
            toast("הקורס נוצר! כעת לחץ 'כניסה' כדי להוסיף תכנים");
            onClose();
        } catch (e) { toast("שגיאה בשמירה"); }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[200] text-right" dir="rtl">
            <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-10 overflow-y-auto max-h-[90vh]">
                <h2 className="text-3xl font-black mb-8 border-b pb-4">יצירת קורס חדש</h2>
                <div className="space-y-6">
                    <input placeholder="שם הקורס" className="w-full p-4 bg-slate-50 rounded-2xl border font-bold outline-none focus:border-purple-500" value={data.name} onChange={e => setData({...data, name: e.target.value})} />
                    
                    {['summary', 'goals'].map(f => (
                        <div key={f} className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-black text-slate-400">{f === 'summary' ? 'תמצית' : 'מטרות'}</label>
                                <button onClick={() => handleAI(f, f)} className="text-purple-600 text-[10px] font-black">{loadingField === f ? 'מעבד...' : 'ייצר עם AI ✨'}</button>
                            </div>
                            <textarea className="w-full p-4 bg-slate-50 rounded-2xl border min-h-[100px]" value={data[f]} onChange={e => setData({...data, [f]: e.target.value})} />
                        </div>
                    ))}

                    <div className="flex gap-4">
                        <button onClick={save} className="flex-grow bg-purple-600 text-white py-5 rounded-2xl font-black text-xl shadow-lg">צור קורס</button>
                        <button onClick={onClose} className="px-8 bg-slate-100 text-slate-400 py-5 rounded-2xl font-black">ביטול</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
