import React, { useState, useEffect } from 'react';
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

    const handlePrefixChange = (val) => {
        // רק אותיות אנגליות, המרה לקטנות
        const cleanVal = val.toLowerCase().replace(/[^a-z]/g, '');
        
        if (val.length > 3) {
            toast("ניתן להזין עד 3 אותיות בלבד!");
            return;
        }
        setData({...data, prefix: cleanVal});
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
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 text-right">
                <h2 className="text-2xl font-black mb-6 text-blue-600 border-b pb-4">
                    {data.id ? 'עריכת מוסד' : 'הגדרת מוסד חדש'}
                </h2>
                <form onSubmit={save} className="space-y-4">
                    <input placeholder="שם המוסד *" className="w-full p-4 bg-slate-50 rounded-2xl border font-bold outline-none focus:border-blue-500"
                        value={data.name} onChange={e => setData({...data, name: e.target.value})} required />
                    
                    <input placeholder="סמל (למשל 🏫)" className="w-full p-4 bg-slate-50 rounded-2xl border font-bold outline-none"
                        value={data.symbol} onChange={e => setData({...data, symbol: e.target.value})} />

                    <div className="grid grid-cols-2 gap-4">
                        <select className="p-4 bg-slate-50 rounded-2xl border font-bold outline-none" 
                            value={data.type} onChange={e => setData({...data, type: e.target.value})}>
                            <option value="חיצוני">חיצוני</option>
                            <option value="פנימי">פנימי</option>
                        </select>
                        <input type="date" className="p-4 bg-slate-50 rounded-2xl border font-bold outline-none"
                            value={data.expiryDate} onChange={e => setData({...data, expiryDate: e.target.value})} required />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-black text-slate-400 mr-2">מזהה ייחודי (3 אותיות קטנות - btg) *</label>
                        <input 
                            placeholder="abc" 
                            dir="ltr" 
                            className="w-full p-4 bg-slate-50 rounded-2xl border font-black text-center text-xl outline-none focus:border-blue-500 uppercase"
                            value={data.prefix} 
                            onChange={e => handlePrefixChange(e.target.value)} 
                            required 
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="submit" className="flex-grow bg-blue-500 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-blue-600 transition-all">שמור מוסד</button>
                        <button type="button" onClick={onClose} className="px-6 bg-slate-100 text-slate-400 py-4 rounded-2xl font-black">ביטול</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
