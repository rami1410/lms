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
        if (!geminiKey || geminiKey === 'undefined') {
            return toast("חסר מפתח התחברות ל-AI (API Key)");
        }
        
        setAiLoading(field);
        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: `כתוב ${label} מקצועי לקורס "${data.name}" לכיתות ${data.fromGrade}-${data.toGrade}.` }] }] })
            });
            
            const resData = await res.json();
            
            // הגנה: בודקים אם יש תוצאה אמיתית לפני שמנסים לקרוא אותה
            if (resData && resData.candidates && resData.candidates.length > 0) {
                 setData(prev => ({...prev, [field]: resData.candidates[0].content.parts[0].text.trim()}));
            } else {
                 console.error("AI Response Error:", resData);
                 toast("שגיאה ביצירת התוכן. אנא נסה שוב.");
            }
            
        } catch (e) { 
            console.error(e);
            toast("תקלת תקשורת עם שרת ה-AI"); 
        } finally {
            setAiLoading(null);
        }
    };

    const save = async () => {
        if (!data.name) return toast("חובה להזין שם קורס");
        const id = "c-" + Date.now();
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'courses', id), {...data, id});
            toast("הקורס נשמר בהצלחה!");
            onClose();
        } catch (e) {
            toast("שגיאה בשמירת הקורס");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[60] text-right text-slate-900" dir="rtl">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3rem] shadow-2xl p-10">
                <div className="flex justify-between items-center mb-8 border-b pb-4">
                    <h2 className="text-2xl font-black">יצירת קורס חדש</h2>
                    <button onClick={onClose} className="text-slate-300 text-3xl font-bold hover:text-slate-500 transition-colors">&times;</button>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                             <label className="text-xs font-black text-slate-500">שם הקורס</label>
                             <input placeholder="לדוגמה: מבוא לרובוטיקה" className="w-full p-4 bg-slate-50 rounded-xl border outline-none font-black focus:border-purple-500" value={data.name} onChange={e => setData({...data, name: e.target.value})} />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500">תחום נלמד</label>
                            {!customField.subject ? (
                                <select className="w-full p-4 bg-slate-50 rounded-xl border font-bold outline-none focus:border-purple-500" onChange={e => e.target.value === 'NEW' ? setCustomField({...customField, subject: true}) : setData({...data, field: e.target.value})}>
                                    <option>בינה מלאכותית</option>
                                    <option>תכנות</option>
                                    <option>מתמטיקה</option>
                                    <option value="NEW">+ אחר (הקלד משהו חדש)...</option>
                                </select>
                            ) : (
                                <input placeholder="הקלד מקצוע חדש ולחץ מחוץ לתיבה" className="w-full p-4 bg-purple-50 rounded-xl border-2 border-purple-300 outline-none font-bold" autoFocus onBlur={e => {if(e.target.value) setData({...data, field: e.target.value}); setCustomField({...customField, subject: false});}} />
                            )}
                        </div>
                    </div>

                     <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500">מכיתה</label>
                                    <select className="w-full p-4 bg-slate-50 rounded-xl border font-bold outline-none" onChange={e=>setData({...data, fromGrade: e.target.value})}>
                                        {['א','ב','ג','ד','ה','ו','ז','ח','ט','י','יא','יב'].map(g => <option key={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500">עד כיתה</label>
                                    <select className="w-full p-4 bg-slate-50 rounded-xl border font-bold outline-none" value={data.toGrade} onChange={e=>setData({...data, toGrade: e.target.value})}>
                                        {['א','ב','ג','ד','ה','ו','ז','ח','ט','י','יא','יב'].map(g => <option key={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500">ציוד נדרש</label>
                                    {!customField.equip ? (
                                        <select className="w-full p-4 bg-slate-50 rounded-xl border outline-none font-bold" onChange={e => {
                                            if(e.target.value === 'NEW') setCustomField({...customField, equip: true});
                                            else setData({...data, equipment: e.target.value});
                                        }}>
                                            <option>מחשב</option><option>טאבלט</option><option>מעבדה</option><option>ערכת רובוטיקה</option>
                                            <option value="NEW">+ הוסף ציוד חדש...</option>
                                        </select>
                                    ) : (
                                        <input type="text" className="w-full p-4 bg-purple-50 rounded-xl border border-purple-300 outline-none font-bold" placeholder="הקלד ציוד חדש" autoFocus onBlur={(e) => {
                                            if(e.target.value) setData({...data, equipment: e.target.value});
                                            setCustomField({...customField, equip: false});
                                        }} />
                                    )}
                                </div>
                            </div>

                    {/* שדות AI */}
                    {[
                        {id:'summary', l:'תמצית הקורס'}, 
                        {id:'goals', l:'מטרות הקורס'},
                        {id:'successGoals', l:'יעדי הצלחה מדידים'},
                        {id:'skills', l:'מיומנויות נרכשות'},
                        {id:'activeLearning', l:'התבלין המיוחד: למידה אקטיבית'}
                    ].map(f => (
                        <div key={f.id} className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-black text-slate-900">{f.l}</label>
                                <button onClick={() => handleAI(f.id, f.l)} disabled={aiLoading !== null} className={`text-white text-[10px] font-black px-3 py-1 rounded-full shadow-sm transition-all ${aiLoading === f.id ? 'bg-slate-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 active:scale-95'}`}>
                                    {aiLoading === f.id ? 'מייצר תוכן...' : 'ייצר עם AI ✨'}
                                </button>
                            </div>
                            <textarea className="w-full p-4 bg-slate-50 rounded-xl border h-28 outline-none focus:border-purple-500 font-medium leading-relaxed resize-y" value={data[f.id]} onChange={e => setData({...data, [f.id]: e.target.value})} />
                        </div>
                    ))}
                    
                    <div className="space-y-2 pt-4">
                        <label className="text-xs font-black text-slate-500">קורסים שהם תנאי סף (Prerequisites)</label>
                        <input type="text" className="w-full p-4 bg-slate-50 rounded-xl border outline-none font-bold focus:border-purple-500" value={data.prerequisites} onChange={e=>setData({...data, prerequisites:e.target.value})} />
                    </div>

                    <button onClick={save} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xl shadow-xl hover:bg-black active:scale-95 transition-all mt-8">אשר ושמור קורס</button>
                </div>
            </div>
        </div>
    );
}
