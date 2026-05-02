import React, { useState } from 'react';
import { db, appId } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import * as XLSX from 'xlsx';

export default function StudentModal({ onClose, toast, institutions, allUsers, initialData, isAdmin }) {
    const [data, setData] = useState(initialData || { firstName:'', lastName:'', password:'1234', institutionId:'', grade:'א' });
    const [numPart, setNumPart] = useState(initialData?.username?.replace(/[^0-9]/g, '') || '');

    const handleExcel = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (evt) => {
            const wb = XLSX.read(evt.target.result, { type: 'binary' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json(ws);
            toast(`נטענו ${json.length} תלמידים. לחץ שמירה לביצוע.`);
            // כאן אפשר להוסיף לוגיקת שמירה ב-Batch
        };
        reader.readAsBinaryString(file);
    };

    const resetPassword = () => {
        const newPass = Math.random().toString(36).slice(-6);
        setData({...data, password: newPass});
        toast(`סיסמה חדשה הונפקה: ${newPass}`);
    };

    const save = async (e) => {
        e.preventDefault();
        const inst = institutions.find(i => i.id === data.institutionId);
        const finalUser = (inst?.prefix || 'std') + numPart;
        const id = data.id || "user-" + Date.now();
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', id), {...data, username: finalUser, id, role:'student', status:'approved'});
            toast("נשמר!");
            onClose();
        } catch (e) { toast("שגיאה"); }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[200]" onClick={onClose}>
            <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 text-right" onClick={e => e.stopPropagation()}>
                <h2 className="text-3xl font-black mb-8 text-emerald-600">{data.id ? 'עריכת תלמיד' : 'הוספת תלמיד'}</h2>
                
                {!data.id && (
                    <div className="mb-6 p-4 bg-slate-50 rounded-2xl border-2 border-dashed text-center">
                        <label className="cursor-pointer text-xs font-black text-emerald-600">📁 ייבוא מאקסל<input type="file" className="hidden" onChange={handleExcel} /></label>
                    </div>
                )}

                <form onSubmit={save} className="space-y-4">
                    <input placeholder="שם פרטי" className="w-full p-4 bg-slate-50 rounded-2xl border font-bold" value={data.firstName} onChange={e => setData({...data, firstName: e.target.value})} required/>
                    <input placeholder="שם משפחה" className="w-full p-4 bg-slate-50 rounded-2xl border font-bold" value={data.lastName} onChange={e => setData({...data, lastName: e.target.value})} required/>
                    
                    {data.id && (
                        <div className="flex gap-2">
                            <input className="flex-grow p-4 bg-slate-100 rounded-2xl border font-mono" value={data.password} readOnly />
                            <button type="button" onClick={resetPassword} className="bg-orange-500 text-white px-4 rounded-2xl font-bold text-xs">איפוס</button>
                        </div>
                    )}

                    <select className="w-full p-4 bg-slate-50 rounded-2xl border font-bold" value={data.institutionId} onChange={e => setData({...data, institutionId: e.target.value})} required>
                        <option value="">בחר מוסד *</option>
                        {institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                    </select>

                    <button type="submit" className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black shadow-lg">שמור תלמיד</button>
                </form>
            </div>
        </div>
    );
}
