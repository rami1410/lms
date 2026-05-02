import React, { useState, useEffect } from 'react';
import { db, appId } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function StudentModal({ onClose, toast, institutions, allUsers }) {
    const [data, setData] = useState({ firstName: '', lastName: '', password: '1234', institutionId: '', grade: 'א' });
    const [generatedUsername, setGeneratedUsername] = useState('');

    useEffect(() => {
        if (data.institutionId) {
            const inst = institutions.find(i => i.id === data.institutionId);
            if (inst && inst.prefix) {
                const instUsers = allUsers.filter(u => u.username && u.username.startsWith(inst.prefix));
                const nextNum = (instUsers.length + 1).toString().padStart(3, '0');
                setGeneratedUsername(`${inst.prefix}${nextNum}`);
            }
        } else {
            setGeneratedUsername('');
        }
    }, [data.institutionId, allUsers, institutions]);

    const save = async (e) => {
        e.preventDefault();
        if (!data.institutionId) return toast("חובה לבחור מוסד לימודים");
        const id = "user-" + Date.now();
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', id), { 
                ...data, 
                username: generatedUsername,
                id, 
                role: 'student', 
                status: 'approved' 
            });
            toast(`תלמיד נוצר! שם משתמש: ${generatedUsername}`);
            onClose();
        } catch (e) { toast("שגיאה בשמירה"); }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[200]" dir="rtl">
            <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 text-right">
                <h2 className="text-3xl font-black mb-8 text-emerald-600">הוספת תלמיד</h2>
                <form onSubmit={save} className="space-y-4">
                    <select className="w-full p-4 bg-slate-50 rounded-2xl border font-bold outline-none focus:border-emerald-500"
                        value={data.institutionId} onChange={e => setData({...data, institutionId: e.target.value})} required>
                        <option value="">בחר מוסד לימודים *</option>
                        {institutions.map(ins => <option key={ins.id} value={ins.id}>{ins.name} ({ins.prefix})</option>)}
                    </select>

                    {generatedUsername && (
                        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center animate-pulse">
                            <span className="block text-xs font-black text-emerald-600 mb-1">שם משתמש אוטומטי:</span>
                            <span className="text-2xl font-black text-slate-800 tracking-widest uppercase">{generatedUsername}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <input placeholder="שם פרטי" className="w-full p-4 bg-slate-50 rounded-2xl border font-bold outline-none" 
                            onChange={e => setData({...data, firstName: e.target.value})} required/>
                        <input placeholder="שם משפחה" className="w-full p-4 bg-slate-50 rounded-2xl border font-bold outline-none" 
                            onChange={e => setData({...data, lastName: e.target.value})} required/>
                    </div>

                    <input placeholder="סיסמה (ברירת מחדל 1234)" className="w-full p-4 bg-slate-50 rounded-2xl border font-bold outline-none" 
                        onChange={e => setData({...data, password: e.target.value})} />

                    <div className="flex gap-4 pt-6">
                        <button type="submit" className="flex-grow bg-emerald-500 text-white py-4 rounded-2xl font-black shadow-lg">שמור תלמיד</button>
                        <button type="button" onClick={onClose} className="px-8 bg-slate-100 text-slate-400 py-4 rounded-2xl font-black">ביטול</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
