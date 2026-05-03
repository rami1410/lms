import React, { useState } from 'react';
import { db, appId } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function CourseModal({ onClose, toast, geminiKey, existingCourses, institutions, initialData }) {
    const [data, setData] = useState(initialData || {
        name: '', fields: [], fromGrade: 'א', toGrade: 'יב', equipment: [], type: 'מיומנויות',
        summary: '', goals: '', targets: '', prerequisites: [], assignedInstitutions: []
    });
    const [loadingField, setLoadingField] = useState(null);

    const handleAI = async (field, label) => {
        if (!data.name) return toast("הזן קודם שם קורס");
        const key = geminiKey?.trim();
        if (!key || key === "undefined") return toast("מפתח AI חסר");
        setLoadingField(field);
        try {
            const prompt = `כתוב ${label} עבור קורס "${data.name}" לכיתות ${data.fromGrade}-${data.toGrade}. תן רק תוכן.`;
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${key}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const result = await res.json();
            if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
                setData(prev => ({ ...prev, [field]: result.candidates[0].content.parts[0].text.trim() }));
            }
        } catch (e) { toast("שגיאת AI"); }
        finally { setLoadingField(null); }
    };

    const toggleTag = (list, val) => {
        const curr = data[list] || [];
        setData({...data, [list]: curr.includes(val) ? curr.filter(i => i !== val) : [...curr, val]});
    };

    const save = async (e) => {
        e.preventDefault();
        const id = data.id || "c-" + Date.now();
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'courses', id), {...data, id, lessons: data.lessons || []});
            toast("הקורס נשמר!");
            onClose();
        } catch (e) { toast("שגיאה בשמירה"); }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[200]" onClick={onClose}>
            <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl p-10 overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <h2 className="text-3xl font-black mb-8 text-purple-600 border-b pb-4">יצירת קורס מנצח 🚀</h2>
                <form onSubmit={save} className="space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <input placeholder="שם הקורס *" className="w-full p-4 bg-slate-50 rounded-2xl border font-black" value={data.name} onChange={e => setData({...data, name: e.target.value})} required/>
                            <div className="grid grid-cols-2 gap-2">
                                <select className="p-4 bg-slate-50 rounded-2xl border font-bold" value={data.fromGrade} onChange={e => setData({...data, fromGrade: e.target.value})}>
                                    {['א','ב','ג','ד','ה','ו','ז','ח','ט','י','יא','יב'].map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                                <select className="p-4 bg-slate-50 rounded-2xl border font-bold" value={data.toGrade} onChange={e => setData({...data, toGrade: e.target.value})}>
                                    {['א','ב','ג','ד','ה','ו','ז','ח','ט','י','יא','יב'].map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black">תחומים (Enter להוספה):</label>
                            <input className="w-full p-4 bg-slate-50 rounded-2xl border" onKeyDown={e => { if(e.key==='Enter'){ e.preventDefault(); toggleTag('fields', e.target.value); e.target.value=''; }}} placeholder="הקלד תחום..." />
                            <div className="flex flex-wrap gap-1">{data.fields.map(f => <span key={f} className="bg-purple-100 text-purple-600 px-2 py-1 rounded-lg text-xs font-bold">{f}</span>)}</div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {['summary', 'goals', 'targets'].map(f => (
                            <div key={f} className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-black uppercase">{f}</label>
                                    <button type="button" onClick={() => handleAI(f, f)} className="bg-purple-600 text-white text-[10px] px-3 py-1 rounded-full">{loadingField===f ? 'מעבד...' : '✨ AI'}</button>
                                </div>
                                <textarea className="w-full p-4 bg-slate-50 rounded-2xl border h-24" value={data[f]} onChange={e => setData({...data, [f]: e.target.value})} />
                            </div>
                        ))}
                    </div>

                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-dashed space-y-4">
                        <label className="text-sm font-black text-slate-500">שיוך מוסדות ידני:</label>
                        <div className="flex flex-wrap gap-2">
                            {institutions.map(inst => (
                                <button key={inst.id} type="button" onClick={() => toggleTag('assignedInstitutions', inst.id)} className={`px-4 py-2 rounded-xl text-xs font-bold ${data.assignedInstitutions?.includes(inst.id) ? 'bg-purple-600 text-white' : 'bg-white border'}`}>{inst.name}</button>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-[2.5rem] font-black text-xl shadow-xl">אשר ושמור קורס</button>
                </form>
            </div>
        </div>
    );
}
