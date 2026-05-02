import React, { useState } from 'react';
import { db, appId } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function StudentModal({ onClose, toast }) {
    const [data, setData] = useState({ firstName: '', lastName: '', username: '', password: '', role: 'student', status: 'approved' });

    const save = async (e) => {
        e.preventDefault();
        if (!data.username || !data.password || !data.firstName) return toast("יש למלא את כל שדות החובה");
        const id = "user-" + Date.now();
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', id), { ...data, id });
            toast("התלמיד נוסף בהצלחה למערכת!");
            onClose();
        } catch (e) { 
            console.error(e);
            toast("שגיאה בשמירת התלמיד"); 
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[200] text-right" dir="rtl">
            <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10">
                <h2 className="text-3xl font-black mb-8 border-b pb-4 text-emerald-600">הוספת תלמיד</h2>
                <form onSubmit={save} className="space-y-4">
                    <input placeholder="שם פרטי *" className="w-full p-4 bg-slate-50 rounded-2xl border font-bold focus:border-emerald-500 outline-none" onChange={e => setData({...data, firstName: e.target.value})} required/>
                    <input placeholder="שם משפחה" className="w-full p-4 bg-slate-50 rounded-2xl border font-bold focus:border-emerald-500 outline-none" onChange={e => setData({...data, lastName: e.target.value})} />
                    <input placeholder="שם משתמש (לכניסה) *" className="w-full p-4 bg-slate-50 rounded-2xl border font-bold focus:border-emerald-500 outline-none" onChange={e => setData({...data, username: e.target.value})} required/>
                    <input placeholder="סיסמה *" type="text" className="w-full p-4 bg-slate-50 rounded-2xl border font-bold focus:border-emerald-500 outline-none" onChange={e => setData({...data, password: e.target.value})} required/>
                    
                    <div className="flex gap-4 pt-4">
                        <button type="submit" className="flex-grow bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-black text-lg transition-colors">שמור תלמיד</button>
                        <button type="button" onClick={onClose} className="px-6 bg-slate-100 text-slate-400 hover:text-slate-600 py-4 rounded-2xl font-black transition-colors">ביטול</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
