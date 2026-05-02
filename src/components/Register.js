import React, { useState } from 'react';
import { db, appId } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function Register({ onBack, institutions, users, toast, playBoom }) {
    const [data, setData] = useState({ 
        firstName: '', lastName: '', username: '', password: '', 
        institutionId: '', grade: 'א', role: 'student', status: 'pending' 
    });

    const fixUsername = (val) => {
        const hebrewToEnglish = {
            'ש': 'a', 'נ': 'b', 'ב': 'c', 'ג': 'd', 'ק': 'e', 'כ': 'f', 'ע': 'g', 'י': 'h', 'ן': 'i', 'ח': 'j',
            'ל': 'k', 'ך': 'l', 'צ': 'm', 'מ': 'n', 'ם': 'o', 'פ': 'p', 'ר': 'r', 'ד': 's', 'א': 't', 'ו': 'u',
            'ה': 'v', 'ו': 'w', 'ס': 'x', 'ט': 'y', 'ז': 'z', 'ף': 'p', 'ץ': 'm'
        };
        let fixed = val.toLowerCase().split('').map(char => hebrewToEnglish[char] || char).join('');
        return fixed.replace(/[^a-z0-9]/g, '');
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (users.find(u => u.username === data.username)) {
            if(playBoom) playBoom();
            return toast("שם המשתמש כבר תפוס");
        }
        const id = "user-" + Date.now();
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', id), { ...data, id });
            toast("נרשמת! המתן לאישור מנהל");
            onBack();
        } catch (err) { toast("שגיאה ברישום"); }
    };

    return (
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-md text-right" dir="rtl">
            <h2 className="text-3xl font-black mb-8 text-slate-800">הרשמה למערכת</h2>
            <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <input placeholder="שם פרטי" className="w-full p-4 bg-slate-50 rounded-2xl border font-bold outline-none" onChange={e => setData({...data, firstName: e.target.value})} required />
                    <input placeholder="שם משפחה" className="w-full p-4 bg-slate-50 rounded-2xl border font-bold outline-none" onChange={e => setData({...data, lastName: e.target.value})} required />
                </div>
                <input placeholder="שם משתמש (אנגלית)" dir="ltr" className="w-full p-4 bg-slate-50 rounded-2xl border font-bold text-left outline-none" 
                    value={data.username} onChange={e => setData({...data, username: fixUsername(e.target.value)})} required />
                <input placeholder="סיסמה" type="password" className="w-full p-4 bg-slate-50 rounded-2xl border font-bold outline-none" onChange={e => setData({...data, password: e.target.value})} required />
                <select className="w-full p-4 bg-slate-50 rounded-2xl border font-bold outline-none" onChange={e => setData({...data, institutionId: e.target.value})} required>
                    <option value="">בחר מוסד לימודים</option>
                    {institutions.map(ins => <option key={ins.id} value={ins.id}>{ins.name}</option>)}
                </select>
                <button type="submit" className="w-full bg-purple-600 text-white py-5 rounded-2xl font-black text-xl shadow-lg hover:bg-purple-700">שלח בקשת הצטרפות</button>
                <button type="button" onClick={onBack} className="w-full text-slate-400 font-bold py-2 text-sm">חזרה להתחברות</button>
            </form>
        </div>
    );
}
