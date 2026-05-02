import React, { useState } from 'react';
import { db, appId } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function InstitutionModal({ onClose, toast, initialData }) {
    const [data, setData] = useState(initialData || {
        name: '',
        symbol: '',
        type: 'חיצוני',
        expiryDate: '',
        prefix: ''
    });

    // מפת המרת מקלדת: עברית לאנגלית (לפי מיקום המקשים)
    const hebToEngMap = {
        'ש': 'a', 'נ': 'b', 'ב': 'c', 'ג': 'd', 'ק': 'e', 'כ': 'f', 'ע': 'g', 'י': 'h', 'ן': 'i', 'ח': 'j',
        'ל': 'k', 'ך': 'l', 'צ': 'm', 'מ': 'n', 'ם': 'o', 'פ': 'p', 'ר': 'r', 'ד': 's', 'א': 't', 'ו': 'u',
        'ה': 'v', 'ו': 'w', 'ס': 'x', 'ט': 'y', 'ז': 'z', 'ף': 'p', 'ץ': 'm'
    };

    const handlePrefixChange = (inputVal) => {
        // 1. המרת עברית לאנגלית אם צריך
        let fixedVal = inputVal.split('').map(char => hebToEngMap[char] || char).join('');
        
        // 2. ניקוי תווים שהם לא אותיות באנגלית וכפיית אותיות קטנות
        fixedVal = fixedVal.toLowerCase().replace(/[^a-z]/g, '');

        // 3. חסימת אורך (מקסימום 3)
        if (fixedVal.length > 3) {
            toast("ניתן להזין עד 3 אותיות בלבד!");
            return;
        }

        setData({ ...data, prefix: fixedVal });
    };

    const save = async (e) => {
        e.preventDefault();
        if (data.prefix.length !== 3) return toast("המזהה חייב להיות בדיוק 3 אותיות");
        
        const id = data.id || "inst-" + Date.now();
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'institutions', id), { 
                ...data, 
                id 
            });
            toast(data.id ? "המוסד עודכן" : "המוסד נוצר בהצלחה!");
            onClose();
        } catch (e) { toast("שגיאה בשמירה"); }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[200]" dir="rtl">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 text-right border-4 border-blue-50">
                <h2 className="text-2xl font-black mb-6 text-blue-600 border-b-2 border-blue-100 pb-4">
                    {data.id ? 'עריכת מוסד' : 'הגדרת מוסד חדש'}
                </h2>
                <form onSubmit={save} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 mr-2">שם המוסד *</label>
                        <input className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 font-bold outline-none transition-all"
                            value={data.name} onChange={e => setData({...data, name: e.target.value})} required />
                    </div>
                    
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 mr-2">סמל (למשל 🏫)</label>
                        <input className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 font-bold outline-none"
                            value={data.symbol} onChange={e => setData({...data, symbol: e.target.value})} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400">סוג</label>
                            <select className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 font-bold outline-none" 
                                value={data.type} onChange={e => setData({...data, type: e.target.value})}>
                                <option value="חיצוני">חיצוני</option>
                                <option value="פנימי">פנימי</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400">תוקף מנוי *</label>
                            <input type="date" className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 font-bold outline-none"
                                value={data.expiryDate} onChange={e => setData({...data, expiryDate: e.target.value})} required />
                        </div>
                    </div>

                    <div className="space-y-1 mt-4">
                        <label className="text-xs font-black text-blue-600 mr-2">מזהה ייחודי (3 אותיות קטנות בלבד - למשל btg) *</label>
                        <div className="relative">
                            <input 
                                placeholder="abc" 
                                dir="ltr" 
                                className="w-full p-5 bg-blue-50 rounded-2xl border-2 border-blue-200 font-black text-center text-3xl outline-none focus:border-blue-500 lowercase tracking-widest transition-all"
                                value={data.prefix} 
                                onChange={e => handlePrefixChange(e.target.value)} 
                                required 
                            />
                            {data.prefix.length === 3 && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 text-xl">✓</span>}
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="submit" className="flex-grow bg-blue-500 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-blue-600 active:scale-95 transition-all">שמור מוסד</button>
                        <button type="button" onClick={onClose} className="px-6 bg-slate-100 text-slate-400 py-4 rounded-2xl font-black">ביטול</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
