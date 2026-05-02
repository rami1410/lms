import React, { useState } from 'react';
import { db, appId } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function CourseModal({ onClose, toast, geminiKey, existingCourses = [] }) {
    const [data, setData] = useState({
        name: '', 
        fields: [], 
        fromGrade: 'א', toGrade: 'יב', 
        equipment: [], 
        type: 'מיומנויות',
        summary: '', goals: '', targets: '', skills: '', activeLearning: '', 
        prerequisites: [] 
    });

    const [loadingField, setLoadingField] = useState(null);

    // הצעות קבועות לשדות בחירה
    const fieldSuggestions = ['בינה מלאכותית', 'רובוטיקה', 'תכנות', 'מתמטיקה', 'מדעים', 'אמנות', 'מוזיקה'];
    const equipSuggestions = ['מחשב', 'טאבלט', 'ערכת ארדואינו', 'משקפי VR', 'חומרי יצירה'];

    const handleAI = async (field, label) => {
        if (!data.name) return toast("יש להזין קודם את שם הקורס");
        
        // ניקוי מפתח ואימות (Vercel)
        const cleanKey = (geminiKey || "").trim();
        if (!cleanKey || cleanKey === "undefined" || cleanKey.length < 10) {
            return toast("שגיאה: מפתח AI לא הוגדר כראוי ב-Vercel");
        }

        setLoadingField(field);
        try {
            const prompt = `כתוב ${label} מקצועי עבור קורס בשם "${data.name}" המיועד לכיתות ${data.fromGrade}-${data.toGrade}. התחומים הם: ${data.fields.join(', ')}. תן רק את התוכן עצמו ללא הקדמות.`;
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${cleanKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const result = await res.json();
            if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
                setData(prev => ({ ...prev, [field]: result.candidates[0].content.parts[0].text.trim() }));
            } else {
                throw new Error("Invalid AI Response");
            }
        } catch (e) { 
            console.error(e);
            toast("תקלת תקשורת עם ה-AI. בדוק את תקינות המפתח."); 
        }
        finally { setLoadingField(null); }
    };

    const toggleTag = (listName, item) => {
        const current = data[listName];
        if (current.includes(item)) {
            setData({ ...data, [listName]: current.filter(i => i !== item) });
        } else {
            setData({ ...data, [listName]: [...current, item] });
        }
    };

    const save = async (e) => {
        e.preventDefault();
        if (!data.name) return toast("שם קורס הוא חובה");
        const id = "c-" + Date.now();
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'courses', id), { ...data, id, lessons: [] });
            toast("הקורס נשמר במערכת!");
            onClose();
        } catch (e) { toast("שגיאה בשמירת הקורס"); }
    };

    // רכיב פנימי לניהול תגיות (Multi-select)
    const CustomTagSelector = ({ label, selected, suggestions, listName, placeholder }) => (
        <div className="space-y-2">
            <label className="text-xs font-black text-slate-500">{label}</label>
            <div className="flex flex-wrap gap-2 mb-2 p-3 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 min-h-[50px]">
                {selected.length === 0 && <span className="text-slate-400 text-xs italic">טרם נבחרו פריטים...</span>}
                {selected.map(s => (
                    <span key={s} className="bg-purple-600 text-white px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-2 animate-fade-in">
                        {s} <button onClick={() => toggleTag(listName, s)} type="button" className="text-white hover:text-red-300">×</button>
                    </span>
                ))}
            </div>
            <div className="flex gap-2">
                <input 
                    className="flex-grow p-3 bg-white rounded-xl border-2 outline-none focus:border-purple-500 text-sm font-bold" 
                    placeholder={placeholder}
                    onKeyDown={(e) => { 
                        if(e.key === 'Enter') { 
                            e.preventDefault(); 
                            if(e.target.value.trim() && !selected.includes(e.target.value)) {
                                toggleTag(listName, e.target.value.trim());
                                e.target.value = '';
                            }
                        } 
                    }}
                />
                <select className="p-3 bg-white rounded-xl border-2 text-sm font-bold w-40" onChange={(e) => { 
                    if(e.target.value && !selected.includes(e.target.value)) toggleTag(listName, e.target.value);
                    e.target.value = '';
                }}>
                    <option value="">בחר מהרשימה</option>
                    {suggestions.filter(s => !selected.includes(s)).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 z-[200] text-right overflow-hidden" dir="rtl">
            <div className="bg-white w-full max-w-5xl rounded-[3.5rem] shadow-2xl p-10 overflow-y-auto max-h-[95vh] border-4 border-white">
                <div className="flex justify-between items-center mb-8 border-b pb-6">
                    <h2 className="text-4xl font-black text-slate-800">יצירת קורס מנצח 🚀</h2>
                    <button onClick={onClose} className="text-slate-300 text-5xl hover:text-red-500 transition-colors leading-none">&times;</button>
                </div>

                <form onSubmit={save} className="space-y-8">
                    {/* שורה ראשונה */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-1">
                            <label className="text-xs font-black text-slate-500">שם הקורס *</label>
                            <input className="w-full p-4 bg-slate-50 rounded-2xl border-2 font-black text-xl outline-none focus:border-purple-500" value={data.name} onChange={e => setData({...data, name: e.target.value})} required/>
                        </div>

                        <CustomTagSelector 
                            label="תחום נלמד (ניתן לבחור כמה או להקליד משהו חדש)"
                            selected={data.fields}
                            suggestions={fieldSuggestions}
                            listName="fields"
                            placeholder="הקלד מקצוע ו-Enter..."
                        />
                    </div>

                    {/* שורה שניה */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-black text-slate-500">מכיתה</label>
                                <select className="w-full p-4 bg-slate-50 rounded-2xl border-2 font-bold" value={data.fromGrade} onChange={e => setData({...data, fromGrade: e.target.value})}>
                                    {['א','ב','ג','ד','ה','ו','ז','ח','ט','י','יא','יב'].map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-black text-slate-500">עד כיתה</label>
                                <select className="w-full p-4 bg-slate-50 rounded-2xl border-2 font-bold" value={data.toGrade} onChange={e => setData({...data, toGrade: e.target.value})}>
                                    {['א','ב','ג','ד','ה','ו','ז','ח','ט','י','יא','יב'].map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                        </div>

                        <CustomTagSelector 
                            label="ציוד נדרש"
                            selected={data.equipment}
                            suggestions={equipSuggestions}
                            listName="equipment"
                            placeholder="הקלד ציוד ו-Enter..."
                        />
                    </div>

                    {/* מחוון סוג קורס */}
                    <div className="space-y-4">
                        <label className="text-xs font-black text-slate-500">סוג הקורס (בחר אחד)</label>
                        <div className="flex bg-slate-100 p-2 rounded-3xl gap-2">
                            {['מיומנויות', 'חקר', 'פרויקטים'].map(t => (
                                <button key={t} type="button" onClick={() => setData({...data, type: t})} className={`flex-1 py-4 rounded-2xl font-black transition-all ${data.type === t ? 'bg-white text-purple-600 shadow-xl scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}>{t}</button>
                            ))}
                        </div>
                    </div>

                    {/* שדות תוכן עם AI */}
                    <div className="grid grid-cols-1 gap-8">
                        {[
                            {id: 'summary', l: 'תמצית הקורס'},
                            {id: 'goals', l: 'מטרות הקורס'},
                            {id: 'targets', l: 'יעדי הצלחה מדידים'},
                            {id: 'activeLearning', l: 'התבלין המיוחד: למידה אקטיבית'}
                        ].map(f => (
                            <div key={f.id} className="space-y-2">
                                <div className="flex justify-between items-center px-2">
                                    <label className="text-sm font-black text-slate-600">{f.l}</label>
                                    <button type="button" onClick={() => handleAI(f.id, f.l)} className="bg-gradient-to-r from-purple-600 to-blue-500 text-white text-xs font-black px-5 py-2 rounded-full hover:shadow-lg transition-all active:scale-95">
                                        {loadingField === f.id ? 'מנתח נתונים...' : '✨ ייצר עם AI'}
                                    </button>
                                </div>
                                <textarea className="w-full p-5 bg-slate-50 rounded-[2rem] border-2 min-h-[120px] outline-none focus:border-purple-500 text-sm font-medium leading-relaxed" value={data[f.id]} onChange={e => setData({...data, [f.id]: e.target.value})} />
                            </div>
                        ))}
                    </div>

                    {/* דרישות קדם חכם */}
                    <div className="p-8 bg-slate-50 rounded-[3rem] border-2 border-slate-100">
                        <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-3">
                            <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-xs">!</span>
                            קורסים שהם תנאי סף (Prerequisites)
                        </h3>
                        {existingCourses.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {existingCourses.filter(c => c.id !== data.id).map(c => (
                                    <label key={c.id} className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer border-2 transition-all hover:scale-[1.02] ${data.prerequisites.includes(c.name) ? 'bg-purple-600 border-purple-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600'}`}>
                                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${data.prerequisites.includes(c.name) ? 'bg-white border-white' : 'border-slate-300'}`}>
                                            {data.prerequisites.includes(c.name) && <span className="text-purple-600 font-bold text-xs">✓</span>}
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            className="hidden"
                                            checked={data.prerequisites.includes(c.name)}
                                            onChange={() => {
                                                const current = data.prerequisites;
                                                const next = current.includes(c.name) ? current.filter(i => i !== c.name) : [...current, c.name];
                                                setData({...data, prerequisites: next});
                                            }}
                                        />
                                        <span className="text-xs font-black truncate">{c.name}</span>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-slate-400 text-sm font-bold italic">לא נמצאו קורסים אחרים במערכת לשיוך</div>
                        )}
                    </div>

                    <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-[2.5rem] font-black text-2xl hover:bg-purple-600 transition-all shadow-2xl mt-10 active:scale-95">אשר ושמור קורס במאגר</button>
                </form>
            </div>
        </div>
    );
}
