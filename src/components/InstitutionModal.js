import React, { useState } from 'react';
import { db, appId } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function InstitutionModal({ onClose, toast, initialData, localMaps = [], existingCourses = [] }) {
    
    // פונקציה לחישוב אוטומטי של סוף שנת הלימודים (30.6)
    const getDefaultExpiry = () => {
        const now = new Date();
        let year = now.getFullYear();
        // אם אנחנו אחרי יוני (חודש 5 ב-0-index), זה אומר שהשנה הבאה היא סוף שנת הלימודים
        if (now.getMonth() > 5) {
            year += 1;
        }
        return `${year}-06-30`;
    };

    // מפת המרת מקלדת (עברית לאנגלית)
    const hebToEngMap = {
        'ש':'a','נ':'b','ב':'c','ג':'d','ק':'e','כ':'f','ע':'g','י':'h','ן':'i','ח':'j',
        'ל':'k','ך':'l','צ':'m','מ':'n','ם':'o','פ':'p','ר':'r','ד':'s','א':'t','ו':'u',
        'ה':'v','ס':'x','ט':'y','ז':'z','ף':'p','ץ':'m'
    };

    // מאגרי ברירת מחדל + שאיבה אוטומטית של ערכים חדשים מהקורסים הקיימים
    const SUBJECT_SUGGESTIONS = [...new Set([
        'מתמטיקה', 'אנגלית', 'פיזיקה', 'מדעי המחשב', 'רובוטיקה ובקרה', 'הגנת סייבר', 'ביולוגיה', 'כימיה', 
        'תנ"ך', 'ספרות', 'היסטוריה', 'אזרחות', 'מערכות רפואיות', 'הנדסת תוכנה', 'מדעי הנתונים (AI)', 
        'תקשורת וחברה', 'מדעי החברה', 'עיצוב וטכנולוגיה', 'מוזיקה', 'תיאטרון', 'חינוך גופני',
        ...existingCourses.flatMap(c => c.fields || []) 
    ])];

    const EQUIPMENT_SUGGESTIONS = [...new Set([
        'מיקרוביט (Micro:bit)', 'מדפסת תלת מימד', 'מכונת לייזר', 'ערכת קארטינג', 
        'ערכת אנרגיה מתחדשת', 'ערכת ארדואינו', 'משקפי VR/AR', 'טאבלטים', 'מחשבים ניידים',
        ...existingCourses.flatMap(c => c.equipment || [])
    ])];

    const [data, setData] = useState(initialData || {
        name: '', 
        symbol: '', 
        prefix: '',
        type: 'חיצוני', 
        expiryDate: getDefaultExpiry(), // תאריך חכם אוטומטי
        mapBackground: '', 
        fields: [], 
        equipment: []
    });

    const handlePrefixChange = (val) => {
        // המרה חכמה לאנגלית, כפיית אותיות קטנות וחסימת תווים
        let fixed = val.split('').map(c => hebToEngMap[c] || c).join('').toLowerCase().replace(/[^a-z]/g, '');
        // הגבלה ל-3 אותיות
        if (fixed.length > 3) fixed = fixed.substring(0, 3);
        setData({...data, prefix: fixed});
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
        if (data.prefix.length !== 3) return toast("קוד המוסד חייב להיות בדיוק 3 אותיות");
        const id = data.id || "inst-" + Date.now();
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'institutions', id), {...data, id});
            toast(data.id ? "המוסד עודכן בהצלחה!" : "המוסד נשמר במערכת!");
            onClose();
        } catch (e) { toast("שגיאה בשמירה"); }
    };

    // רכיב פנימי לבחירת תגיות קומפקטית (תחומים וציוד)
    const CompactTagSelector = ({ label, selected, suggestions, listName, placeholder }) => (
        <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border-2 border-slate-100">
            <label className="text-sm font-black text-slate-700">{label}</label>
            <div className="flex flex-wrap gap-2 mb-2 min-h-[30px]">
                {selected.length === 0 && <span className="text-slate-400 text-xs italic">לא נבחרו פריטים...</span>}
                {selected.map(s => (
                    <span key={s} className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-2">
                        {s} <button type="button" onClick={() => toggleTag(listName, s)} className="text-white hover:text-red-300">×</button>
                    </span>
                ))}
            </div>
            <div className="flex gap-2">
                <input 
                    className="flex-grow p-3 bg-white rounded-xl border outline-none focus:border-blue-500 text-xs font-bold" 
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
                <select className="p-3 bg-white rounded-xl border text-xs font-bold w-40 outline-none focus:border-blue-500" onChange={(e) => { 
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
            <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl p-10 overflow-y-auto max-h-[95vh] text-right border-t-8 border-blue-600" dir="rtl" onClick={e => e.stopPropagation()}>
                
                <div className="flex justify-between items-center mb-8 border-b pb-4">
                    <h2 className="text-3xl font-black text-blue-600">{data.id ? 'עריכת מוסד 🏫' : 'הגדרת מוסד חדש 🏫'}</h2>
                    <button onClick={onClose} className="text-slate-300 text-4xl hover:text-red-500 transition-colors">&times;</button>
                </div>

                <form onSubmit={save} className="space-y-8">
                    
                    {/* שורה 1: שם, סמל, קוד */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500">שם המוסד *</label>
                            <input className="w-full p-4 bg-slate-50 rounded-2xl border-2 font-black outline-none focus:border-blue-500" 
                                value={data.name} onChange={e => setData({...data, name: e.target.value})} required/>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500">סמל מוסד (למשל 🏫)</label>
                            <input className="w-full p-4 bg-slate-50 rounded-2xl border-2 font-black outline-none focus:border-blue-500 text-center" 
                                value={data.symbol} onChange={e => setData({...data, symbol: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500">קוד מוסד (3 אותיות) *</label>
                            <input className="w-full p-4 bg-slate-50 rounded-2xl border-2 font-black outline-none focus:border-blue-500 text-center uppercase text-blue-600 tracking-widest" 
                                dir="ltr" placeholder="abc" value={data.prefix} onChange={e => handlePrefixChange(e.target.value)} required/>
                        </div>
                    </div>

                    {/* שורה 2: תוקף וסוג */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500">סוג מוסד</label>
                            <select className="w-full p-4 bg-slate-50 rounded-2xl border-2 font-bold outline-none focus:border-blue-500" value={data.type} onChange={e => setData({...data, type: e.target.value})}>
                                <option value="חיצוני">מוסד חיצוני</option>
                                <option value="פנימי">מוסד פנימי (גישה לכל הקורסים)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500">תוקף מנוי (ברירת מחדל: 30.6 הקרוב)</label>
                            <input type="date" className="w-full p-4 bg-slate-50 rounded-2xl border-2 font-bold outline-none focus:border-blue-500" 
                                value={data.expiryDate} onChange={e => setData({...data, expiryDate: e.target.value})} required/>
                        </div>
                    </div>

                    {/* שורה 3: בחירת מפה ממאגר המפות */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500">מפת ברירת מחדל למוסד</label>
                        <select className="w-full p-4 bg-slate-50 rounded-2xl border-2 font-bold outline-none focus:border-blue-500"
                            value={data.mapBackground || ''} onChange={e => setData({...data, mapBackground: e.target.value})}>
                            <option value="">🗺️ בחר מפה ממאגר המערכת (יקבל ברירת מחדל אוטומטית אם ריק)</option>
                            {localMaps.map(m => (
                                <option key={m.id} value={m.url}>{m.name} {m.theme ? `(${m.theme})` : ''}</option>
                            ))}
                        </select>
                    </div>

                    {/* שורה 4: תחומים וציוד (להתאמת קורסים אוטומטית) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <CompactTagSelector 
                            label="תחומי לימוד משויכים למוסד" 
                            selected={data.fields} 
                            suggestions={SUBJECT_SUGGESTIONS} 
                            listName="fields" 
                            placeholder="הקלד תחום ולחץ Enter..." 
                        />
                        <CompactTagSelector 
                            label="ציוד קיים במוסד" 
                            selected={data.equipment} 
                            suggestions={EQUIPMENT_SUGGESTIONS} 
                            listName="equipment" 
                            placeholder="הקלד ציוד ולחץ Enter..." 
                        />
                    </div>

                    <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-[2.5rem] font-black text-xl hover:bg-blue-600 transition-all shadow-xl active:scale-95">
                        {data.id ? 'עדכן מוסד במאגר' : 'אשר ושמור מוסד במערכת'}
                    </button>
                </form>
            </div>
        </div>
    );
}
