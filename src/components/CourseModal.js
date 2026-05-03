import React, { useState } from 'react';
import { db, appId } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function CourseModal({ onClose, toast, geminiKey, existingCourses = [], institutions = [], initialData }) {
    const [data, setData] = useState(initialData || {
        name: '', 
        fields: [], 
        fromGrade: 'א', 
        toGrade: 'יב', 
        equipment: [], 
        type: 'מיומנויות',
        summary: '', 
        goals: '', 
        targets: '', 
        activeLearning: '',
        prerequisites: [], 
        assignedInstitutions: []
    });

    const [loadingField, setLoadingField] = useState(null);

    const handleAI = async (field, label) => {
        if (!data.name) return toast("הזן קודם את שם הקורס");
        const key = geminiKey?.trim();
        if (!key || key === "undefined") return toast("שגיאה: מפתח AI לא מוגדר");

        setLoadingField(field);
        try {
            const prompt = `כתוב ${label} פדגוגי ומקצועי עבור קורס בשם "${data.name}" המיועד לכיתות ${data.fromGrade}-${data.toGrade}. התחומים הם: ${data.fields.join(', ')}. תן רק את התוכן ללא הקדמות.`;
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${key}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const result = await res.json();
            if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
                setData(prev => ({ ...prev, [field]: result.candidates[0].content.parts[0].text.trim() }));
            }
        } catch (e) { toast("תקלת AI"); }
        finally { setLoadingField(null); }
    };

    const toggleTag = (listName, val) => {
        const curr = data[listName] || [];
        if (curr.includes(val)) {
            setData({ ...data, [listName]: curr.filter(i => i !== val) });
        } else {
            setData({ ...data, [listName]: [...curr, val] });
        }
    };

    const save = async (e) => {
        e.preventDefault();
        if (!data.name) return toast("שם קורס הוא חובה");
        const id = data.id || "c-" + Date.now();
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'courses', id), { 
                ...data, 
                id, 
                lessons: data.lessons || [] 
            });
            toast("הקורס נשמר בהצלחה!");
            onClose();
        } catch (e) { toast("שגיאה בשמירה"); }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[200]" onClick={onClose}>
            <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl p-10 overflow-y-auto max-h-[90vh] text-right" dir="rtl" onClick={e => e.stopPropagation()}>
                
                <div className="flex justify-between items-center mb-8 border-b pb-4">
                    <h2 className="text-3xl font-black text-purple-600">יצירת קורס מנצח 🚀</h2>
                    <button onClick={onClose} className="text-slate-300 text-4xl hover:text-red-500 transition-colors">&times;</button>
                </div>

                <form onSubmit={save} className="space-y-8">
                    {/* שורה 1: שם וגילאים */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 mr-2">שם הקורס *</label>
                            <input className="w-full p-4 bg-slate-50 rounded-2xl border-2 font-black text-xl outline-none focus:border-purple-500" 
                                value={data.name} onChange={e => setData({...data, name: e.target.value})} required/>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500">מכיתה</label>
                                <select className="w-full p-4 bg-slate-50 rounded-2xl border-2 font-bold outline-none" 
                                    value={data.fromGrade} onChange={e => setData({...data, fromGrade: e.target.value})}>
                                    {['א','ב','ג','ד','ה','ו','ז','ח','ט','י','יא','יב'].map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500">עד כיתה</label>
                                <select className="w-full p-4 bg-slate-50 rounded-2xl border-2 font-bold outline-none" 
                                    value={data.toGrade} onChange={e => setData({...data, toGrade: e.target.value})}>
                                    {['א','ב','ג','ד','ה','ו','ז','ח','ט','י','יא','יב'].map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* שורה 2: תחומים וציוד */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500">תחומי לימוד (הקלד וסיים ב-Enter)</label>
                            <input className="w-full p-4 bg-slate-50 rounded-2xl border-2 outline-none focus:border-purple-500" 
                                onKeyDown={e => { if(e.key === 'Enter') { e.preventDefault(); if(e.target.value) toggleTag('fields', e.target.value); e.target.value = ''; } }}
                                placeholder="למשל: רובוטיקה, תכנות..." />
                            <div className="flex flex-wrap gap-2 mt-2">
                                {data.fields?.map(f => (
                                    <span key={f} className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                                        {f} <button type="button" onClick={() => toggleTag('fields', f)} className="hover:text-red-300">×</button>
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500">ציוד נדרש (הקלד וסיים ב-Enter)</label>
                            <input className="w-full p-4 bg-slate-50 rounded-2xl border-2 outline-none focus:border-purple-500" 
                                onKeyDown={e => { if(e.key === 'Enter') { e.preventDefault(); if(e.target.value) toggleTag('equipment', e.target.value); e.target.value = ''; } }}
                                placeholder="למשל: ערכת ארדואינו, מחשב..." />
                            <div className="flex flex-wrap gap-2 mt-2">
                                {data.equipment?.map(e => (
                                    <span key={e} className="bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                                        {e} <button type="button" onClick={() => toggleTag('equipment', e)} className="hover:text-red-300">×</button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* סוג הקורס */}
                    <div className="space-y-3">
                        <label className="text-xs font-black text-slate-500">סוג הקורס</label>
                        <div className="flex bg-slate-100 p-1 rounded-2xl gap-2">
                            {['מיומנויות', 'חקר', 'פרויקטים'].map(t => (
                                <button key={t} type="button" onClick={() => setData({...data, type: t})} 
                                    className={`flex-1 py-3 rounded-xl font-black transition-all ${data.type === t ? 'bg-white text-purple-600 shadow-md scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}>{t}</button>
                            ))}
                        </div>
                    </div>

                    {/* שדות תוכן עם AI */}
                    <div className="grid grid-cols-1 gap-6">
                        {[
                            { id: 'summary', l: 'תמצית הקורס' },
                            { id: 'goals', l: 'מטרות הקורס' },
                            { id: 'targets', l: 'יעדי הצלחה' },
                            { id: 'activeLearning', l: 'למידה אקטיבית' }
                        ].map(f => (
                            <div key={f.id} className="space-y-2">
                                <div className="flex justify-between items-center px-2">
                                    <label className="text-sm font-black text-slate-600">{f.l}</label>
                                    <button type="button" onClick={() => handleAI(f.id, f.l)} 
                                        className="bg-purple-600 text-white text-[10px] font-black px-4 py-1 rounded-full hover:scale-105 transition-transform">
                                        {loadingField === f.id ? 'מייצר...' : '✨ ייצר עם AI'}
                                    </button>
                                </div>
                                <textarea className="w-full p-4 bg-slate-50 rounded-2xl border-2 min-h-[100px] outline-none focus:border-purple-500 text-sm font-medium" 
                                    value={data[f.id]} onChange={e => setData({...data, [f.id]: e.target.value})} />
                            </div>
                        ))}
                    </div>

                    {/* דרישות קדם */}
                    <div className="p-6 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100">
                        <h3 className="text-sm font-black text-slate-800 mb-4">קורסים שהם תנאי סף (Prerequisites)</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {existingCourses.filter(c => c.id !== data.id).map(c => (
                                <label key={c.id} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border-2 transition-all ${data.prerequisites?.includes(c.name) ? 'bg-purple-600 text-white' : 'bg-white text-slate-600'}`}>
                                    <input type="checkbox" className="hidden" checked={data.prerequisites?.includes(c.name)}
                                        onChange={() => toggleTag('prerequisites', c.name)} />
                                    <span className="text-[10px] font-black">{c.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* שיוך מוסדות ידני */}
                    <div className="p-6 bg-purple-50 rounded-[2.5rem] border-2 border-purple-100">
                        <label className="text-sm font-black text-purple-600 mb-4 block">שיוך מוסדות ידני (השאר ריק להתאמה אוטומטית):</label>
                        <div className="flex flex-wrap gap-2">
                            {institutions.map(inst => (
                                <button key={inst.id} type="button" onClick={() => toggleTag('assignedInstitutions', inst.id)} 
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${data.assignedInstitutions?.includes(inst.id) ? 'bg-purple-600 text-white' : 'bg-white border text-slate-400'}`}>
                                    {inst.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-[2.5rem] font-black text-2xl hover:bg-purple-600 transition-all shadow-2xl">
                        {data.id ? 'עדכן קורס' : 'אשר ושמור קורס במערכת'}
                    </button>
                </form>
            </div>
        </div>
    );
}
