import React, { useState } from 'react';
import { db, appId } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function InstitutionModal({ onClose, toast, initialData }) {
    const [data, setData] = useState(initialData || {
        name: '', symbol: '', type: 'חיצוני', expiryDate: '', prefix: '',
        grades: ['א', 'יב'], equipment: [], fields: []
    });

    const hebToEngMap = { 'ש':'a','נ':'b','ב':'c','ג':'d','ק':'e','כ':'f','ע':'g','י':'h','ן':'i','ח':'j','ל':'k','ך':'l','צ':'m','מ':'n','ם':'o','פ':'p','ר':'r','ד':'s','א':'t','ו':'u','ה':'v','ס':'x','ט':'y','ז':'z','ף':'p','ץ':'m' };

    const handlePrefixChange = (val) => {
        let fixed = val.split('').map(c => hebToEngMap[c] || c).join('').toLowerCase().replace(/[^a-z]/g, '');
        if (fixed.length > 3) return toast("עד 3 אותיות!");
        setData({...data, prefix: fixed});
    };

    const toggleTag = (list, val) => {
        const curr = data[list] || [];
        setData({...data, [list]: curr.includes(val) ? curr.filter(i => i !== val) : [...curr, val]});
    };

    const save = async (e) => {
        e.preventDefault();
        if (data.prefix.length !== 3) return toast("מזהה חייב להיות 3 אותיות");
        const id = data.id || "inst-" + Date.now();
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'institutions', id), {...data, id});
            toast("נשמר בהצלחה!");
            onClose();
        } catch (e) { toast("שגיאה"); }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[200]" onClick={onClose}>
            <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-10 text-right overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <h2 className="text-3xl font-black mb-6 text-blue-600 border-b pb-4">{data.id ? 'עריכת מוסד' : 'הגדרת מוסד חדש'}</h2>
                <form onSubmit={save} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <input placeholder="שם המוסד *" className="p-4 bg-slate-50 rounded-2xl border font-bold outline-none" value={data.name} onChange={e => setData({...data, name: e.target.value})} required />
                        <input placeholder="מזהה 3 אותיות (btg) *" dir="ltr" className="p-4 bg-blue-50 rounded-2xl border font-black text-center uppercase" value={data.prefix} onChange={e => handlePrefixChange(e.target.value)} required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <select className="p-4 bg-slate-50 rounded-2xl border font-bold" value={data.type} onChange={e => setData({...data, type: e.target.value})}>
                            <option value="חיצוני">מוסד חיצוני</option>
                            <option value="פנימי">מוסד פנימי (רואה הכל)</option>
                        </select>
                        <input type="date" className="p-4 bg-slate-50 rounded-2xl border font-bold" value={data.expiryDate} onChange={e => setData({...data, expiryDate: e.target.value})} required />
                    </div>

                    <div className="space-y-4 p-6 bg-slate-50 rounded-[2rem] border border-dashed">
                        <p className="font-black text-sm text-slate-500 underline">מאפייני המוסד (להתאמת קורסים אוטומטית):</p>
                        
                        <div className="space-y-2">
                            <label className="text-xs font-bold">תחומי לימוד במוסד:</label>
                            <div className="flex flex-wrap gap-2">
                                {['רובוטיקה', 'תכנות', 'מדעים', 'אמנות'].map(f => (
                                    <button key={f} type="button" onClick={() => toggleTag('fields', f)} className={`px-4 py-2 rounded-xl text-xs font-bold ${data.fields?.includes(f) ? 'bg-blue-600 text-white' : 'bg-white border text-slate-400'}`}>{f}</button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold">ציוד קיים במוסד:</label>
                            <div className="flex flex-wrap gap-2">
                                {['מחשבים', 'טאבלטים', 'ערכות לגו', 'מדפסת תלת מימד'].map(e => (
                                    <button key={e} type="button" onClick={() => toggleTag('equipment', e)} className={`px-4 py-2 rounded-xl text-xs font-bold ${data.equipment?.includes(e) ? 'bg-emerald-600 text-white' : 'bg-white border text-slate-400'}`}>{e}</button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="submit" className="flex-grow bg-blue-500 text-white py-4 rounded-2xl font-black shadow-lg">שמור מוסד</button>
                        <button type="button" onClick={onClose} className="px-8 bg-slate-100 text-slate-400 py-4 rounded-2xl font-black">ביטול</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
