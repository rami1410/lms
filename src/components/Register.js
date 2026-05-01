import React, { useState, useRef } from 'react';
import SafeInput from './SafeInput';
import { db, appId } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { LOGO_URL } from '../App';

export default function Register({ onBack, institutions, users, toast, playBoom }) {
    const [data, setData] = useState({ 
        fname: '', lname: '', user: '', institution: '', grade: 'א', role: 'student', pass1: '', pass2: '' 
    });

    const fnameRef = useRef();
    const userRef = useRef();

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!data.fname.trim()) { 
            toast("נא להזין שם פרטי"); 
            fnameRef.current?.focus(); 
            playBoom(); return; 
        }
        
        const exists = users.find(u => u.username === data.user);
        if (exists) {
            toast("שם המשתמש כבר תפוס");
            playBoom(); return;
        }

        if (data.pass1 !== data.pass2) {
            toast("הסיסמאות אינן תואמות");
            playBoom(); return;
        }
        
        try {
            const uId = `user-${Date.now()}`;
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', uId), {
                ...data, id: uId, status: 'pending', username: data.user, password: data.pass1
            });
            toast("נרשמת! המתן לאישור אדמין.");
            onBack();
        } catch (e) { toast("שגיאה ברישום"); }
    };

    return (
        <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl p-10 relative z-10 text-right text-slate-900">
            <img src={LOGO_URL} className="h-20 mx-auto mb-6 rounded-2xl" />
            <h1 className="text-3xl font-black text-center mb-2">רישום חדש</h1>
            
            {/* בחירת תפקיד */}
            <div className="flex bg-slate-100 p-1 rounded-2xl mb-6 mt-4">
                <button type="button" onClick={() => setData({...data, role: 'student'})} className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${data.role === 'student' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>תלמיד</button>
                <button type="button" onClick={() => setData({...data, role: 'mentor'})} className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${data.role === 'mentor' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>מנחה</button>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <input ref={fnameRef} placeholder="שם פרטי" className="p-4 bg-slate-50 rounded-xl border outline-none font-bold" onChange={e=>setData({...data, fname: e.target.value})} />
                    <input placeholder="שם משפחה" className="p-4 bg-slate-50 rounded-xl border outline-none font-bold" onChange={e=>setData({...data, lname: e.target.value})} />
                </div>
                <SafeInput value={data.user} onChange={val=>setData({...data, user: val})} placeholder="שם משתמש (אנגלית)" playBoom={playBoom} className="w-full p-4 bg-slate-50 rounded-xl border text-center font-black outline-none" />
                <div className="grid grid-cols-2 gap-4">
                    <select className="p-4 bg-slate-50 rounded-xl border font-bold outline-none" onChange={e=>setData({...data, institution: e.target.value})}>
                        <option value="">מוסד</option>
                        {institutions.map(inst => <option key={inst.id}>{inst.name}</option>)}
                    </select>
                    <select className="p-4 bg-slate-50 rounded-xl border font-bold outline-none" onChange={e=>setData({...data, grade: e.target.value})}>
                        {['א','ב','ג','ד','ה','ו','ז','ח','ט','י','יא','יב'].map(g => <option key={g}>{g}</option>)}
                    </select>
                </div>
                <SafeInput type="password" value={data.pass1} onChange={val=>setData({...data, pass1: val})} placeholder="סיסמה" playBoom={playBoom} className="w-full p-4 bg-slate-50 rounded-xl border text-center font-black" />
                <SafeInput type="password" value={data.pass2} onChange={val=>setData({...data, pass2: val})} placeholder="אימות סיסמה" playBoom={playBoom} className="w-full p-4 bg-slate-50 rounded-xl border text-center font-black" />
                <button className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl text-xl shadow-xl mt-4">הרשמה</button>
                <button type="button" onClick={onBack} className="w-full text-slate-400 font-bold text-xs">חזרה לכניסה</button>
            </form>
        </div>
    );
}
