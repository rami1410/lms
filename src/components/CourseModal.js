import React, { useState } from 'react';
import { db, appId } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function CourseModal({ onClose, toast, geminiKey, existingCourses = [], institutions = [], initialData }) {
    // מאגרי ברירת מחדל
    const SUBJECT_RESERVOIR = [
        'מתמטיקה', 'אנגלית', 'פיזיקה', 'מדעי המחשב', 'רובוטיקה ובקרה', 'הגנת סייבר', 'ביולוגיה', 'כימיה', 
        'תנ"ך', 'ספרות', 'היסטוריה', 'אזרחות', 'מערכות רפואיות', 'הנדסת תוכנה', 'מדעי הנתונים (AI)', 
        'תקשורת וחברה', 'מדעי החברה', 'עיצוב וטכנולוגיה', 'מוזיקה', 'תיאטרון', 'חינוך גופני'
    ];

    const EQUIPMENT_RESERVOIR = [
        'מיקרוביט (Micro:bit)', 'מדפסת תלת-מימד', 'מכונת חיתוך לייזר', 'ערכת קארטינג הנדסית', 
        'ערכת אנרגיה מתחדשת', 'ערכת ארדואינו (Arduino)', 'משקפי VR/AR', 'טאבלטים', 'מחשבים ניידים'
    ];

    const [data, setData] = useState(initialData || {
        name: '', fields: [], fromGrade: 'א', toGrade: 'יב', equipment: [], type: 'מיומנויות',
        summary: '', goals: '', targets: '', activeLearning: '',
        prerequisites: [], assignedInstitutions: []
    });

    const [loadingField, setLoadingField] = useState(null);

    const handleAI = async (field, label) => {
        if (!data.name) return toast("יש להזין את שם הקורס תחילה");
        const key = geminiKey?.trim();
        if (!key || key === "undefined") return toast("שגיאה: מפתח AI לא נמצא");

        setLoadingField(field);
        try {
            const prompt = `כתוב ${label} פדגוגי ברמה גבוהה עבור קורס בשם "${data.name}". 
            המטרה היא ניסוח מקצועי המותאם למשרד החינוך. תן רק את התוכן, ללא הקדמות.`;
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${key}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const result = await res.json();
            if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
                setData(prev => ({ ...prev, [field]: result.candidates[0].content.parts[0].text.trim() }));
            }
        } catch (e) { toast("תקלת תקשורת עם ה-AI"); }
        finally { setLoadingField(null); }
    };

    const toggleItem = (listName, val) => {
        const curr = data[listName] || [];
        setData({ ...data, [listName]: curr.includes(val) ? curr.filter(i => i !== val) : [...curr, val] });
    };

    const save = async (e) => {
        e.preventDefault();
        if (!data.name) return toast("שם קורס הוא שדה חובה");
        const id = data.id || "c-" + Date.now();
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'courses', id), { ...data, id, lessons: data.lessons || [] });
            toast("הקורס נשמר במערכת!");
            onClose();
        } catch (e) { toast("שגיאה בשמירה"); }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[200]" onClick={onClose}>
            <div className="bg-white w-full max-w-5xl rounded-[3.5rem] shadow-2xl p-10 overflow-y-auto max-h-[95vh] text-right border-t-8 border-purple-600" dir="rtl" onClick={e => e.stopPropagation()}>
                
                <div className="flex justify-between items-center mb-8 border-b pb-4">
                    <h2 className="text-4xl font-black text-slate-800">יצירת קורס מנצח 🚀</h2>
                    <button onClick={onClose} className="text-slate-300 text-5xl hover:text-red-500 transition-colors">&times;</button>
                </div>

                <form onSubmit={save} className="space-y-10">
                    {/* פרטי בסיס */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500">שם הקורס (כותרת מניעה לפעולה) *</label>
                            <input className="w-full p-5 bg-slate-50 rounded-2xl border-2 font-black text-xl focus:border-purple-500 outline-none transition-all" 
                                value={data.name} onChange={e => setData({...data, name: e.target.value})} required/>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500">קהל יעד (מכיתה)</label>
                                <select className="w-full p-5 bg-slate-50 rounded-2xl border-2 font-bold outline-none focus:border-purple-500" value={data.fromGrade} onChange={e => setData({...data, fromGrade: e.target.value})}>
                                    {['א','ב','ג','ד','ה','ו','ז','ח','ט','י','יא','יב'].map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500">קהל יעד (עד כיתה)</label>
                                <select className="w-full p-5 bg-slate-50 rounded-2xl border-2 font-bold outline-none focus:border-purple-500" value={data.toGrade} onChange={e => setData({...data, toGrade: e.target.value})}>
                                    {['א','ב','ג','ד','ה','ו','ז','ח','ט','י','יא','יב'].map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* בחירת תחומים וציוד מהמאגר */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-sm font-black text-slate-700 underline">תחומי לימוד (בגרות 2026)</label>
                            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-4 bg-slate-50 rounded-[2rem] border-2">
                                {SUBJECT_RESERVOIR.map(f => (
                                    <button key={f} type="button" onClick={() => toggleItem('fields', f)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${data.fields?.includes(f) ? 'bg-purple-600 text-white shadow-lg' : 'bg-white text-slate-400 border hover:border-purple-300'}`}>{f}</button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-sm font-black text-slate-700 underline">ציוד טכנולוגי נדרש</label>
                            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-4 bg-slate-50 rounded-[2rem] border-2">
                                {EQUIPMENT_RESERVOIR.map(e => (
                                    <button key={e} type="button" onClick={() => toggleItem('equipment', e)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${data.equipment?.includes(e) ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-slate-400 border hover:border-emerald-300'}`}>{e}</button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* סוג הקורס */}
                    <div className="space-y-4">
                        <label className="text-xs font-black text-slate-500">מתודולוגיית הלמידה</label>
                        <div className="flex bg-slate-100 p-2 rounded-3xl gap-2">
                            {['מיומנויות', 'חקר', 'פרויקטים'].map(t => (
                                <button key={t} type="button" onClick={() => setData({...data, type: t})} 
                                    className={`flex-1 py-4 rounded-2xl font-black transition-all ${data.type === t ? 'bg-white text-purple-600 shadow-xl scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}>{t}</button>
                            ))}
                        </div>
                    </div>

                    {/* שדות תוכן פדגוגיים */}
                    <div className="grid grid-cols-1 gap-10">
                        {[
                            { id: 'summary', l: 'תמצית הקורס', p: 'תאר בקצרה ובשפה שיווקית-פדגוגית את מהות הקורס, הערך המוסף שהוא מעניק ללומד והקשר לעולם המעשה. ניסוח זה מהווה את כרטיס הביקור של הקורס.' },
                            { id: 'goals', l: 'מטרות הקורס', p: 'פרט את יעדי העל של תוכנית הלימודים, תוך דגש על פיתוח כישורים קוגניטיביים, רגשיים וחברתיים. מהו השינוי העמוק שאנו מצפים לראות בלומד?' },
                            { id: 'targets', l: 'יעדי הצלחה מדידים', p: 'הגדר תוצרים אופרטיביים ואבני דרך ברורות שניתן להעריך בסיום התהליך. על היעדים להיות ספציפיים (SMART) ולשקף את רמת השליטה הנדרשת.' },
                            { id: 'activeLearning', l: 'אסטרטגיות למידה אקטיבית', p: 'תאר את המתודולוגיות המעודדות מעורבות פעילה: חקר עצמאי, פתרון בעיות, עבודת צוות ושימוש בכלים טכנולוגיים. כיצד התלמיד הופך מצרכן ידע ליוצר ידע?' }
                        ].map(f => (
                            <div key={f.id} className="space-y-3">
                                <div className="flex justify-between items-center px-4">
                                    <label className="text-lg font-black text-slate-800">{f.l}</label>
                                    <button type="button" onClick={() => handleAI(f.id, f.l)} 
                                        className="bg-gradient-to-l from-purple-600 to-indigo-500 text-white text-xs font-black px-6 py-2 rounded-full hover:scale-105 shadow-md">
                                        {loadingField === f.id ? 'מנתח נתונים...' : '✨ ייצר ניסוח אקדמי עם AI'}
                                    </button>
                                </div>
                                <textarea className="w-full p-6 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100 min-h-[120px] outline-none focus:border-purple-400 text-sm font-medium leading-relaxed" 
                                    placeholder={f.p} value={data[f.id]} onChange={e => setData({...data, [f.id]: e.target.value})} />
                            </div>
                        ))}
                    </div>

                    {/* תנאי סף - קורסים קיימים */}
                    <div className="p-8 bg-slate-50 rounded-[3rem] border-2 border-slate-100">
                        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm">!</span>
                            קורסים שהם תנאי סף (Prerequisites)
                        </h3>
                        {existingCourses.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {existingCourses.filter(c => c.id !== data.id).map(c => (
                                    <button key={c.id} type="button" onClick={() => toggleItem('prerequisites', c.name)} 
                                        className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${data.prerequisites?.includes(c.name) ? 'bg-purple-600 border-purple-600 text-white shadow-xl' : 'bg-white border-slate-200 text-slate-500 hover:border-purple-300'}`}>
                                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${data.prerequisites?.includes(c.name) ? 'bg-white border-white' : 'border-slate-300'}`}>
                                            {data.prerequisites?.includes(c.name) && <span className="text-purple-600 font-bold">✓</span>}
                                        </div>
                                        <span className="text-xs font-black truncate">{c.name}</span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-slate-400 text-sm font-bold italic">לא הוגדרו קורסים נוספים במערכת לשיוך כדרישות קדם</div>
                        )}
                    </div>

                    {/* שיוך מוסדות ידני */}
                    <div className="p-8 bg-purple-50 rounded-[3rem] border-2 border-purple-100">
                        <label className="text-lg font-black text-purple-600 mb-6 block">שיוך מוסדות ידני (אופציונלי):</label>
                        <div className="flex flex-wrap gap-3">
                            {institutions.map(inst => (
                                <button key={inst.id} type="button" onClick={() => toggleItem('assignedInstitutions', inst.id)} 
                                    className={`px-6 py-3 rounded-2xl text-xs font-black transition-all ${data.assignedInstitutions?.includes(inst.id) ? 'bg-purple-600 text-white shadow-lg' : 'bg-white border-2 text-slate-400 border-purple-100'}`}>
                                    {inst.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-slate-900 text-white py-7 rounded-[3rem] font-black text-2xl hover:bg-purple-600 transition-all shadow-2xl active:scale-95">
                        {data.id ? 'עדכן קורס במאגר' : 'אשר ושמור קורס מנצח'}
                    </button>
                </form>
            </div>
        </div>
    );
}
