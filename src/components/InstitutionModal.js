import React, { useState } from 'react';
import { db, appId } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function InstitutionModal({ onClose, toast }) {
    const [name, setName] = useState('');

    const save = async (e) => {
        e.preventDefault();
        if (!name) return toast("נא להזין שם מוסד");
        const id = "inst-" + Date.now();
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'institutions', id), { name, id });
            toast("המוסד נוסף בהצלחה!");
            onClose();
        } catch (e) { toast("שגיאה בשמירה"); }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[200]" dir="rtl">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 text-right">
                <h2 className="text-2xl font-black mb-6 text-blue-600">הוספת מוסד לימודים חדש</h2>
                <form onSubmit={save} className="space-y-4">
                    <input 
                        placeholder="שם המוסד (למשל: בית ספר דקלים)" 
                        className="w-full p-4 bg-slate-50 rounded-2xl border font-bold focus:border-blue-500 outline-none"
                        onChange={e => setName(e.target.value)}
                        required
                    />
                    <div className="flex gap-4 pt-4">
                        <button type="submit" className="flex-grow bg-blue-500 text-white py-4 rounded-2xl font-black shadow-lg">שמור מוסד</button>
                        <button type="button" onClick={onClose} className="px-6 bg-slate-100 text-slate-400 py-4 rounded-2xl font-black">ביטול</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
