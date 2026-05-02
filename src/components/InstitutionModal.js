import React, { useState } from 'react';
import { db, appId } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function InstitutionModal({ onClose, toast, initialData }) {
    const [data, setData] = useState(initialData || {
        name: '', symbol: '', type: 'חיצוני', expiryDate: '', prefix: '',
        grades: [1, 12], equipment: [], fields: [], mapBackground: ''
    });

    const save = async (e) => {
        e.preventDefault();
        const id = data.id || "inst-" + Date.now();
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'institutions', id), {...data, id});
            toast("מוסד עודכן בהצלחה!");
            onClose();
        } catch (e) { toast("שגיאה"); }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[200]" onClick={onClose}>
            <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-10 text-right overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <h2 className="text-3xl font-black mb-6 text-blue-600 border-b pb-4">הגדרת מוסד ומפה</h2>
                <form onSubmit={save} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <input placeholder="שם המוסד *" className="p-4 bg-slate-50 rounded-2xl border font-bold outline-none" value={data.name} onChange={e => setData({...data, name: e.target.value})} required />
                        <input placeholder="URL לתמונת מפה (רקע)" dir="ltr" className="p-4 bg-slate-50 rounded-2xl border font-bold" value={data.mapBackground} onChange={e => setData({...data, mapBackground: e.target.value})} />
                    </div>
                    {/* ... שאר השדות של המוסד ... */}
                    <button type="submit" className="w-full bg-blue-500 text-white py-4 rounded-2xl font-black shadow-lg">שמור מוסד</button>
                </form>
            </div>
        </div>
    );
}
