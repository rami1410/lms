import React, { useState } from 'react';
import { db, appId } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function InstitutionModal({ onClose, toast }) {
    const [data, setData] = useState({
        name: '',
        symbol: '',
        type: 'חיצוני',
        expiryDate: '',
        prefix: ''
    });

    const save = async (e) => {
        e.preventDefault();
        if (data.prefix.length !== 3) return toast("מזהה המוסד חייב להיות בדיוק 3 אותיות");
        if (!data.expiryDate) return toast("יש להזין תאריך תוקף");
        
        const id = "inst-" + Date.now();
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'institutions', id), { 
                ...data, 
                id,
                prefix: data.prefix.toLowerCase() 
            });
            toast("המוסד נוצר בהצלחה!");
            onClose();
        } catch (e) { toast("שגיאה בשמירה"); }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[200]" dir="rtl">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 text-right">
                <h2 className="text-2xl font-black mb-6 text-blue-600 border-b pb-4">הגדרת מוסד חדש</h2>
                <form onSubmit={save} className="space-y-4">
                    <input placeholder="שם המוסד *" className="w-full p-4 bg-slate-50 rounded-2xl border font-bold outline-none focus:border-blue-500"
                        onChange={e => setData({...data, name: e.target.value})} required />
                    
                    <input placeholder="סמל מוסד (אייקון או טקסט)" className="w-full p-4 bg-slate-50 rounded-2xl border font-bold outline-none"
                        onChange={e => setData({...data, symbol: e.target.value})} />

                    <div className="grid grid-cols-2 gap-4">
                        <select className="p-4 bg-slate-50 rounded-2xl border font-bold outline-none" 
                            onChange={e => setData({...data, type: e.target.value})}>
                            <option value="חיצוני">מוסד חיצוני</option>
                            <option value="פנימי">מוסד פנימי</option>
                        </select>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400">תוקף המנוי *</label>
                            <input type="date" className="w-full p-4 bg-slate-50 rounded-2xl border font-bold outline-none"
                                onChange={e => setData({...data, expiryDate: e.target.value})} required />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-black text-slate-400 mr-2">מזהה ייחודי (3 אותיות באנגלית - למשל BTG) *</label>
                        <input placeholder="ABC" maxLength="3" dir="ltr" className="w-full p-4 bg-slate-50 rounded-2xl border font-black text-center text-xl uppercase outline-none focus:border-blue-500"
                            onChange={e => setData({...data, prefix: e.target.value})} required />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="submit" className="flex-grow bg-blue-500 text-white py-4 rounded-2xl font-black shadow-lg">צור מוסד</button>
                        <button type="button" onClick={onClose} className="px-6 bg-slate-100 text-slate-400 py-4 rounded-2xl font-black">ביטול</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
