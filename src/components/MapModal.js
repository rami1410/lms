import React, { useState } from 'react';
import { db, appId } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function MapModal({ onClose, toast }) {
    const [data, setData] = useState({ name: '', description: '', link: '' });

    const save = async (e) => {
        e.preventDefault();
        if (!data.name) return toast("חובה להזין שם למפה");
        const id = "map-" + Date.now();
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'maps', id), { ...data, id });
            toast("המפה נוספה בהצלחה!");
            onClose();
        } catch (e) { 
            console.error(e);
            toast("שגיאה בשמירת המפה"); 
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[200] text-right" dir="rtl">
            <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10">
                <h2 className="text-3xl font-black mb-8 border-b pb-4 text-blue-600">הוספת מפה חדשה</h2>
                <form onSubmit={save} className="space-y-4">
                    <input placeholder="שם המפה *" className="w-full p-4 bg-slate-50 rounded-2xl border font-bold focus:border-blue-500 outline-none" onChange={e => setData({...data, name: e.target.value})} required/>
                    <textarea placeholder="תיאור קצר של המפה" className="w-full p-4 bg-slate-50 rounded-2xl border font-bold min-h-[100px] focus:border-blue-500 outline-none" onChange={e => setData({...data, description: e.target.value})} />
                    <input placeholder="קישור למפה (URL) / קוד הטמעה" className="w-full p-4 bg-slate-50 rounded-2xl border font-bold focus:border-blue-500 outline-none text-left" dir="ltr" onChange={e => setData({...data, link: e.target.value})} />
                    
                    <div className="flex gap-4 pt-4">
                        <button type="submit" className="flex-grow bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-2xl font-black text-lg transition-colors">שמור מפה</button>
                        <button type="button" onClick={onClose} className="px-6 bg-slate-100 text-slate-400 hover:text-slate-600 py-4 rounded-2xl font-black transition-colors">ביטול</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
