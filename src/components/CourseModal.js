import React, { useState } from 'react';
import { db, appId } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function CourseModal({ onClose, toast, geminiKey }) {
    const [data, setData] = useState({
        name: '', field: 'בינה מלאכותית', fromGrade: 'א', toGrade: 'יב', equipment: 'מחשב', type: 'מיומנויות',
        summary: '', goals: '', successGoals: '', skills: '', activeLearning: '', prerequisites: ''
    });
    const [aiLoading, setAiLoading] = useState(null);
    const [customField, setCustomField] = useState({ subject: false, equip: false });

    const handleAI = async (field, label) => {
        if (!data.name) return toast("הזן שם קורס קודם");
        setAiLoading(field);
        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: `כתוב ${label} מקצועי לקורס "${data.name}" לכיתות ${data.fromGrade}-${data.toGrade}.` }] }] })
            });
            const resData = await res.json();
            setData(prev => ({...prev, [field]: resData.candidates[0].content.parts[0].text.trim()}));
        } catch (e) { toast("שגיאה ב-AI"); }
        setAiLoading(null);
    };

    const save = async () => {
        if (!data.name) return toast("חובה שם קורס");
        const id = "c-" + Date.now();
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'courses', id), {...data, id});
        toast("הקורס נשמר!");
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[60] text-right" dir="rtl">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3rem] shadow-2xl p-10">
                <div className="flex justify-between items-center mb-8 border-b pb-4">
                    <h2 className="text-2xl font-black">יצירת קורס חדש</h2>
                    <button onClick={onClose} className="text-slate-300 text-3xl font-bold">&times;</button>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <input placeholder="שם הקורס" className="p-4 bg-slate-50 rounded-xl border outline-none font-black" onChange={e => setData({...data, name: e.target.value})} />
                        
                        {/* שדה מקצוע דינמי */}
                        {!customField.subject ? (
                            <select className="p-4 bg-slate-50 rounded-xl border font-bold" onChange={e => e.target.value === 'NEW' ? setCustomField({...customField, subject: true}) : setData({...data, field: e.target.value})}>
                                <option>בינה מלאכותית</option><option>תכנות</option><option>מתמטיקה</option><option value="NEW">+ אחר...</option>
                            </select>
                        ) : (
                            <input placeholder="הקלד מקצוע חדש" className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200 outline-none" onBlur={e => {setData({...data, field: e.target.value}); setCustomField({...customField, subject: false});}} />
                        )}
                    </div>

                    {/* שדות AI */}
                    {[{id:'summary', l:'תמצית'}, {id:'activeLearning', l:'למידה אקטיבית'}].map(f => (
                        <div key={f.id} className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-black">{f.l}</label>
                                <button onClick={() => handleAI(f.id, f.l)} className="bg-purple-600 text-white text-[10px] font-black px-3 py-1 rounded-full animate-pulse">
                                    {aiLoading === f.id ? 'מייצר...' : 'ייצר עם AI ✨'}
                                </button>
                            </div>
                            <textarea className="w-full p-4 bg-slate-50 rounded-xl border h-32 outline-none" value={data[f.id]} onChange={e => setData({...data, [f.id]: e.target.value})} />
                        </div>
                    ))}

                    <button onClick={save} className="w-full bg-purple-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl active:scale-95 transition-all">אשר ושמור קורס</button>
                </div>
            </div>
        </div>
    );
}
