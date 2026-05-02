import React, { useState, useEffect } from 'react';
import { db, appId } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function Register({ onBack, institutions, users, toast }) {
    const [selectedInst, setSelectedInst] = useState(null);
    const [numPart, setNumPart] = useState('');
    const [data, setData] = useState({ 
        firstName: '', lastName: '', password: '', 
        institutionId: '', grade: 'א', role: 'student', status: 'pending' 
    });

    const handleInstChange = (id) => {
        const inst = institutions.find(i => i.id === id);
        setSelectedInst(inst);
        setData({...data, institutionId: id});
    };

    const handleNumChange = (val) => {
        // רק מספרים
        const clean = val.replace(/[^0-9]/g, '');
        setNumPart(clean);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!selectedInst) return toast("בחר מוסד לימודים");
        if (!numPart) return toast("הזן מספר לזיהוי");
        
        const finalUsername = selectedInst.prefix + numPart;
        
        if (users.find(u => u.username === finalUsername)) {
            return toast("שם המשתמש כבר תפוס, נסה מספר אחר");
        }

        const id = "user-" + Date.now();
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', id), { 
                ...data, 
                username: finalUsername,
                id 
            });
            toast("בקשת ההצטרפות נשלחה! המתן לאישור המורה");
            onBack();
        } catch (err) { toast("שגיאה ברישום"); }
    };

    return (
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-md text-right border border-slate-100 animate-fade-in" dir="rtl">
            <h2 className="text-3xl font-black mb-8 text-slate-800">הרשמה ל-LMS</h2>
            <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <input placeholder="שם פרטי" className="w-full p-4 bg-slate-50 rounded-2xl border font-bold outline-none focus:border-purple-500" onChange={e => setData({...data, firstName: e.target.value})} required />
                    <input placeholder="שם משפחה" className="w-full p-4 bg-slate-50 rounded-2xl border font-bold outline-none focus:border-purple-500" onChange={e => setData({...data, lastName: e.target.value})} required />
                </div>

                <select className="w-full p-4 bg-slate-50 rounded-2xl border font-bold outline-none" onChange={e => handleInstChange(e.target.value)} required>
                    <option value="">בחר מוסד לימודים *</option>
                    {institutions.map(ins => <option key={ins.id} value={ins.id}>{ins.name}</option>)}
                </select>

                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 mr-2">שם משתמש (האותיות נקבעות לפי המוסד)</label>
                    <div className="flex gap-2 items-center" dir="ltr">
                        <div className="bg-slate-200 px-5 py-4 rounded-2xl font-black text-slate-500 uppercase min-w-[70px] text-center border-2 border-slate-300">
                            {selectedInst ? selectedInst.prefix : '---'}
                        </div>
                        <input 
                            placeholder="הזן מספר" 
                            className="flex-grow p-4 bg-white rounded-2xl border-2 border-purple-200 font-black text-xl outline-none focus:border-purple-500 text-center"
                            value={numPart}
                            onChange={(e) => handleNumChange(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <input placeholder="סיסמה" type="password" className="w-full p-4 bg-slate-50 rounded-2xl border font-bold outline-none focus:border-purple-500" onChange={e => setData({...data, password: e.target.value})} required />
                
                <select className="w-full p-4 bg-slate-50 rounded-2xl border font-bold outline-none" onChange={e => setData({...data, grade: e.target.value})}>
                    {['א','ב','ג','ד','ה','ו','ז','ח','ט','י','יא','יב'].map(g => <option key={g} value={g}>כיתה {g}</option>)}
                </select>

                <button type="submit" className="w-full bg-purple-600 text-white py-5 rounded-2xl font-black text-xl shadow-lg hover:bg-purple-700 transition-all mt-4">שלח בקשת הצטרפות</button>
                <button type="button" onClick={onBack} className="w-full text-slate-400 font-bold py-2">חזרה להתחברות</button>
            </form>
        </div>
    );
}
