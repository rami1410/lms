import React, { useState, useEffect } from 'react';
import { db, appId } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function StudentModal({ onClose, toast, institutions, allUsers, initialData }) {
    const [selectedInst, setSelectedInst] = useState(null);
    const [numPart, setNumPart] = useState('');
    const [data, setData] = useState(initialData || { 
        firstName: '', lastName: '', password: '1234', institutionId: '', grade: 'א' 
    });

    useEffect(() => {
        if (initialData && institutions.length > 0) {
            const inst = institutions.find(i => i.id === initialData.institutionId);
            if (inst) {
                setSelectedInst(inst);
                // חילוץ החלק המספרי מהיוזרניים הקיים
                const num = initialData.username.replace(inst.prefix, '');
                setNumPart(num);
            }
        }
    }, [initialData, institutions]);

    const handleInstChange = (id) => {
        const inst = institutions.find(i => i.id === id);
        setSelectedInst(inst);
        setData({...data, institutionId: id});
    };

    const save = async (e) => {
        e.preventDefault();
        if (!selectedInst) return toast("חובה לבחור מוסד");
        if (!numPart) return toast("חובה להזין מספר משתמש");
        
        const finalUsername = selectedInst.prefix + numPart;
        const id = data.id || "user-" + Date.now();
        
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', id), { 
                ...data, 
                username: finalUsername,
                id, 
                role: data.role || 'student', 
                status: data.status || 'approved' 
            });
            toast(data.id ? "פרטי המשתמש עודכנו" : `תלמיד נוצר! שם משתמש: ${finalUsername}`);
            onClose();
        } catch (e) { toast("שגיאה בשמירה"); }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[200]" dir="rtl">
            <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 text-right">
                <h2 className="text-3xl font-black mb-8 text-emerald-600 border-b pb-4">
                    {data.id ? 'עריכת משתמש' : 'הוספת תלמיד'}
                </h2>
                <form onSubmit={save} className="space-y-4">
                    <select className="w-full p-4 bg-slate-50 rounded-2xl border font-bold outline-none focus:border-emerald-500"
                        value={data.institutionId} onChange={e => handleInstChange(e.target.value)} required>
                        <option value="">בחר מוסד לימודים *</option>
                        {institutions.map(ins => <option key={ins.id} value={ins.id}>{ins.name} ({ins.prefix})</option>)}
                    </select>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 mr-2">שם משתמש סופי</label>
                        <div className="flex gap-2 items-center" dir="ltr">
                            <div className="bg-slate-100 px-4 py-4 rounded-2xl font-black text-slate-400 uppercase min-w-[60px] text-center border">
                                {selectedInst ? selectedInst.prefix : '---'}
                            </div>
                            <input 
                                placeholder="מספר" 
                                className="flex-grow p-4 bg-white rounded-2xl border font-black text-xl outline-none focus:border-emerald-500 text-center"
                                value={numPart}
                                onChange={(e) => setNumPart(e.target.value.replace(/[^0-9]/g, ''))}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <input placeholder="שם פרטי" className="w-full p-4 bg-slate-50 rounded-2xl border font-bold" 
                            value={data.firstName} onChange={e => setData({...data, firstName: e.target.value})} required/>
                        <input placeholder="שם משפחה" className="w-full p-4 bg-slate-50 rounded-2xl border font-bold" 
                            value={data.lastName} onChange={e => setData({...data, lastName: e.target.value})} required/>
                    </div>

                    <input placeholder="סיסמה" className="w-full p-4 bg-slate-50 rounded-2xl border font-bold outline-none" 
                        value={data.password} onChange={e => setData({...data, password: e.target.value})} />

                    <div className="flex gap-4 pt-6">
                        <button type="submit" className="flex-grow bg-emerald-500 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-emerald-600 transition-all">שמור</button>
                        <button type="button" onClick={onClose} className="px-8 bg-slate-100 text-slate-400 py-4 rounded-2xl font-black">ביטול</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
