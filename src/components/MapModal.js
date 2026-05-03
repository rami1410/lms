import React, { useState } from 'react';
import { db, appId } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function MapModal({ onClose, toast, initialData }) {
    const [data, setData] = useState(initialData || { name: '', url: '', minGrade: 'א', maxGrade: 'יב', theme: 'פנטזיה', notes: '', isDefault: false });

    const save = async (e) => {
        e.preventDefault();
        const id = data.id || "map-" + Date.now();
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'maps', id), { ...data, id });
            toast("המפה נשמרה!");
            onClose();
        } catch (e) { toast("שגיאה בשמירה"); }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[200]" onClick={onClose}>
            <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-10 text-right border-4 border-orange-50" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-black text-orange-600 mb-6 border-b pb-4">🗺️ ניהול מפות מערכת</h2>
                <form onSubmit={save} className="space-y-4">
                    <input placeholder="שם המפה" className="w-full p-4 bg-slate-50 rounded-2xl border font-bold" value={data.name} onChange={e => setData({...data, name: e.target.value})} required />
                    <input placeholder="URL לתמונה" dir="ltr" className="w-full p-4 bg-slate-50 rounded-2xl border" value={data.url} onChange={e => setData({...data, url: e.target.value})} required />
                    <div className="flex items-center gap-2 p-2">
                        <input type="checkbox" id="isDefault" checked={data.isDefault} onChange={e => setData({...data, isDefault: e.target.checked})} className="w-4 h-4" />
                        <label htmlFor="isDefault" className="text-xs font-black">קבע כמפת ברירת מחדל</label>
                    </div>
                    <button type="submit" className="w-full bg-orange-500 text-white py-4 rounded-2xl font-black">שמור מפה</button>
                    <button type="button" onClick={onClose} className="w-full text-slate-400 font-bold py-2">ביטול</button>
                </form>
            </div>
        </div>
    );
}
