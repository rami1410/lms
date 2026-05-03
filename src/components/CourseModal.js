import React, { useState } from 'react';
import { db, appId } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function CourseModal({ onClose, toast, geminiKey, existingCourses = [], institutions = [], initialData }) {
    // מאגרי ברירת מחדל לרשימות הנפתחות
    const SUBJECT_SUGGESTIONS = [
        'מתמטיקה', 'אנגלית', 'פיזיקה', 'מדעי המחשב', 'רובוטיקה ובקרה', 'הגנת סייבר', 'ביולוגיה', 'כימיה', 
        'תנ"ך', 'ספרות', 'היסטוריה', 'אזרחות', 'מערכות רפואיות', 'הנדסת תוכנה', 'מדעי הנתונים (AI)', 
        'תקשורת וחברה', 'מדעי החברה', 'עיצוב וטכנולוגיה', 'מוזיקה', 'תיאטרון', 'חינוך גופני'
    ];

    const EQUIPMENT_SUGGESTIONS = [
        'מיקרוביט (Micro:bit)', 'מדפסת תלת מימד', 'מכונת לייזר', 'ערכת קארטינג', 
        'ערכת אנרגיה מתחדשת', 'ערכת ארדואינו', 'משקפי VR/AR', 'טאבלטים', 'מחשבים ניידים'
    ];

    const [data, setData] = useState(initialData || {
        name: '', fields: [], fromGrade: 'א', toGrade: 'יב', equipment: [], type: 'מיומנויות',
        meetingsCount: 10, // השדה החדש
        summary: '', goals: '', targets: '', activeLearning: '',
        prerequisites: [], assignedInstitutions: []
    });

    const [loadingField, setLoadingField] = useState(null);

    const handleAI = async (field, label) => {
        if (!data.name) return toast("יש להזין את שם הקורס תחילה");
        const key = geminiKey ? String(geminiKey).trim() : "";
        if (!key || key === "undefined") return toast("שגיאה: מפתח AI חסר ב-Vercel");

        setLoadingField(field);
        try {
            const prompt = `כתוב ${label} פדגוגי ברמה גבוהה עבור קורס בשם "${data.name}". המטרה היא ניסוח מקצועי המותאם למשרד החינוך. תן רק את התוכן.`;
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${key}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const result = await res.json();
            
            if (result.error) {
                console.error("AI Error:", result.error);
                throw new Error(result.error.message);
            }

            if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
                setData(prev => ({ ...prev, [field]: result.candidates[0].content.parts[0].text.trim() }));
            }
        } catch (e) { 
            console.error("AI Fetch catch:", e);
            toast("תקלת AI: בדוק קונסול או וודא שהמפתח תקין"); 
        }
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
        if (data.fields.length === 0) return toast("חובה לבחור לפחות תחום לימוד אחד כדי שהקורס יופיע במפה!");
        
        const id = data.id || "c-" + Date.now();
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'courses', id), { 
                ...data, 
                id, 
                lessons: data.lessons || [] 
            });
            toast("הקורס נשמר במערכת!");
            onClose();
        } catch (e) { toast("שגיאה בשמירה"); }
    };

    // רכיב פנימי לבחירת תגיות קומפקטית
    const CompactTagSelector = ({ label, selected, suggestions, listName, placeholder }) => (
        <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border-2 border-slate-100">
            <label className="text-sm font-black text-slate-700">{label}</label>
            <div className="flex flex-wrap gap-2 mb-2 min-h-[30px]">
                {selected.length === 0 && <span className="text-slate-400 text-xs italic">לא נבחרו פריטים...</span>}
                {selected.map(s => (
                    <span key={s} className="bg-purple-600 text-white px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-2">
                        {s} <button type="button" onClick={() => toggleTag(listName, s)} className="text-white hover:text-red-300">×</button>
                    </span>
                ))}
            </div>
            <div className="flex gap-2">
                <input 
                    className="flex-grow p-3 bg-white rounded-xl border outline-none focus:border-purple-500 text-xs font-bold" 
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
                <select className="p-3 bg-white rounded-xl border text-xs font-bold w-40" onChange={(e) => { 
                    if(e.target.value && !selected.includes(e.target.value)) toggleTag(listName, e.target.value);
                    e.target.value = '';
                }}>
                    <option value="">בחר מהרשימה...</option>
                    {suggestions.filter(s => !selected.includes(s)).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[200]" onClick={onClose}>
            <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl p-10 overflow-y-auto max-h-[95vh] text-right" dir="rtl" onClick={e => e.stopPropagation()}>
                
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
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500">מכיתה</label>
                                <select className="w-full p-4 bg-slate-50 rounded-2xl border-2 font-bold outline-none" value={data.fromGrade} onChange={e => setData({...data, fromGrade: e.target.value})}>
                                    {['א','ב','ג','ד','ה','ו','ז','ח','ט','י','יא','יב'].map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500">עד כיתה</label>
                                <select className="w-full p-4 bg-slate-50 rounded-2xl border-2 font-bold outline-none" value={data.toGrade} onChange={e => setData({...data, toGrade: e.target.value})}>
                                    {['א','ב','ג','ד','ה','ו','ז','ח','ט','י','יא','יב'].map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500">כמות מפגשים</label>
                                <input type="number" min="1" max="100" className="w-full p-4 bg-slate-50 rounded-2xl border-2 font-bold outline-none text-center" 
                                    value={data.meetingsCount} onChange={e => setData({...data, meetingsCount: Number(e.target.value)})} required/>
                            </div>
                        </div>
                    </div>

                    {/* שורה 2: תחומים וציוד */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <CompactTagSelector 
                            label="תחומי לימוד *" 
                            selected={data.fields} 
                            suggestions={SUBJECT_SUGGESTIONS} 
                            listName="fields" 
                            placeholder="הקלד תחום ולחץ Enter..." 
                        />
                        <CompactTagSelector 
                            label="ציוד נדרש" 
                            selected={data.equipment} 
                            suggestions={EQUIPMENT_SUGGESTIONS} 
                            listName="equipment" 
                            placeholder="הקלד ציוד ולחץ Enter..." 
                        />
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
                    <div className="grid grid-cols-1 gap-8">
                        {[
                            { id: 'summary', l: 'תמצית הקורס', p: 'תאר בקצרה ובשפה שיווקית-פדגוגית את מהות הקורס, הערך המוסף שהוא מעניק ללומד והקשר לעולם המעשה.' },
                            { id: 'goals', l: 'מטרות הקורס', p: 'פרט את יעדי העל של תוכנית הלימודים, תוך דגש על פיתוח כישורים קוגניטיביים, רגשיים וחברתיים.' },
                            { id: 'targets', l: 'יעדי הצלחה מדידים', p: 'הגדר תוצרים אופרטיביים ואבני דרך ברורות שניתן להעריך בסיום התהליך (SMART).' },
                            { id: 'activeLearning', l: 'אסטרטגיות למידה אקטיבית', p: 'תאר את המתודולוגיות המעודדות מעורבות פעילה: חקר עצמאי, פתרון בעיות, עבודת צוות.' }
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
                                    placeholder={f.p} value={data[f.id]} onChange={e => setData({...data, [f.id]: e.target.value})} />
                            </div>
                        ))}
                    </div>

                    {/* דרישות קדם */}
                    <div className="p-6 bg-slate-50 rounded-[2rem] border-2 border-slate-100">
                        <h3 className="text-sm font-black text-slate-800 mb-4">קורסים שהם תנאי סף (Prerequisites)</h3>
                        {existingCourses.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {existingCourses.filter(c => c.id !== data.id).map(c => (
                                    <button key={c.id} type="button" onClick={() => toggleTag('prerequisites', c.name)} 
                                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-right ${data.prerequisites?.includes(c.name) ? 'bg-purple-600 border-purple-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:border-purple-300'}`}>
                                        <div className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center ${data.prerequisites?.includes(c.name) ? 'bg-white border-white' : 'border-slate-300'}`}>
                                            {data.prerequisites?.includes(c.name) && <span className="text-purple-600 font-bold text-xs">✓</span>}
                                        </div>
                                        <span className="text-xs font-black truncate">{c.name}</span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4 text-slate-400 text-xs font-bold italic">לא הוגדרו קורסים נוספים במערכת</div>
                        )}
                    </div>

                    <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-[2.5rem] font-black text-xl hover:bg-purple-600 transition-all shadow-xl active:scale-95">
                        {data.id ? 'עדכן קורס במאגר' : 'אשר ושמור קורס במערכת'}
                    </button>
                </form>
            </div>
        </div>
    );
}
