import React, { useState } from 'react';
import { db, appId } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function InstitutionModal({ onClose, toast, initialData }) {
    const [data, setData] = useState(initialData || {
        name: '', symbol: '', type: 'חיצוני', expiryDate: '', prefix: '',
        grades: ['א', 'יב'], equipment: [], fields: [], mapBackground: ''
    });

    const hebToEngMap = { 'ש':'a','נ':'b','ב':'c','ג':'d','ק':'e','כ':'f','ע':'g','י':'h','ן':'i','ח':'j','ל':'k','ך':'l','צ':'m','מ':'n','ם':'o','פ':'p','ר':'r','ד':'s','א':'t','ו':'u','ה':'v','ס':'x','ט':'y','ז':'z','ף':'p','ץ':'m' };

    const handlePrefixChange = (val) => {
        let fixed = val.split('').map(c => hebToEngMap[c] || c).join('').toLowerCase().replace(/[^a-z]/g, '');
        if (fixed.length > 3) return toast("עד 3 אותיות בלבד!");
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
            toast("המוסד נשמר!");
            onClose();
        } catch (e) { toast("שגיאה"); }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[200]" onClick={onClose}>
            <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-10 text-right overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <h2 className="text-3xl font-black mb-6 text-blue-600 border-b pb-4">הגדרת מוסד ומפה</h2>
                <form onSubmit={save} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <input placeholder="שם המוסד *" className="p-4 bg-slate-50 rounded-2xl border font-bold" value={data.name} onChange={e => setData({...data, name: e.target.value})} required />
                        <input placeholder="מזהה (btg) *" dir="ltr" className="p-4 bg-blue-50 rounded-2xl border font-black text-center" value={data.prefix} onChange={e => handlePrefixChange(e.target.value)} required />
                    </div>
                    <input placeholder="URL לתמונת מפה אישית" dir="ltr" className="w-full p-4 bg-slate-50 rounded-2xl border" value={data.mapBackground} onChange={e => setData({...data, mapBackground: e.target.value})} />
                    
                    <div className="grid grid-cols-2 gap-4">
                        <select className="p-4 bg-slate-50 rounded-2xl border" value={data.type} onChange={e => setData({...data, type: e.target.value})}>
                            <option value="חיצוני">מוסד חיצוני</option>
                            <option value="פנימי">מוסד פנימי</option>
                        </select>
                        <input type="date" className="p-4 bg-slate-50 rounded-2xl border" value={data.expiryDate} onChange={e => setData({...data, expiryDate: e.target.value})} required />
                    </div>

                    <div className="space-y-4 p-6 bg-slate-50 rounded-[2rem] border">
                        <p className="font-black text-sm">תחומי לימוד (Enter להוספה):</p>
                        <input className="w-full p-3 rounded-xl border" onKeyDown={e => {if(e.key==='Enter'){e.preventDefault(); toggleTag('fields', e.target.value); e.target.value='';}}} placeholder="הוסף תחום..." />
                        <div className="flex flex-wrap gap-2">{data.fields.map(f => <button key={f} type="button" onClick={()=>toggleTag('fields',f)} className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs">{f} ×</button>)}</div>
                    </div>

                    <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg">שמור מוסד</button>
                </form>
            </div>
        </div>
    );
}
