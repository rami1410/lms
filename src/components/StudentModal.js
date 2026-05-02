import React, { useState, useEffect } from 'react';
import { db, appId } from '../firebase';
import { doc, setDoc, collection, onSnapshot, writeBatch } from 'firebase/firestore';
import * as XLSX from 'xlsx';

export default function StudentModal({ onClose, toast }) {
    const [institutions, setInstitutions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({ 
        firstName: '', lastName: '', username: '', password: '', 
        institutionId: '', grade: 'א', role: 'student', status: 'approved' 
    });

    useEffect(() => {
        if (db) {
            return onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'institutions'), s => {
                setInstitutions(s.docs.map(d => ({...d.data(), id: d.id})));
            });
        }
    }, []);

    // המרת עברית לאנגלית קטנה וספרות בלבד
    const fixUsername = (val) => {
        if (!val) return "";
        const hebrewToEnglish = {
            'ש': 'a', 'נ': 'b', 'ב': 'c', 'ג': 'd', 'ק': 'e', 'כ': 'f', 'ע': 'g', 'י': 'h', 'ן': 'i', 'ח': 'j',
            'ל': 'k', 'ך': 'l', 'צ': 'm', 'מ': 'n', 'ם': 'o', 'פ': 'p', 'ר': 'r', 'ד': 's', 'א': 't', 'ו': 'u',
            'ה': 'v', 'ו': 'w', 'ס': 'x', 'ט': 'y', 'ז': 'z', 'ף': 'p', 'ץ': 'm'
        };
        let fixed = val.toString().toLowerCase().split('').map(char => hebrewToEnglish[char] || char).join('');
        return fixed.replace(/[^a-z0-9]/g, '');
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = async (evt) => {
            setLoading(true);
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const excelData = XLSX.utils.sheet_to_json(ws);

                const batch = writeBatch(db);
                excelData.forEach((row) => {
                    const id = "user-" + Date.now() + Math.random().toString(36).substr(2, 5);
                    batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'users', id), {
                        firstName: row.firstName || '',
                        lastName: row.lastName || '',
                        username: fixUsername(row.username),
                        password: row.password?.toString() || '1234',
                        institutionId: row.institutionId || data.institutionId,
                        grade: row.grade || 'א',
                        role: 'student',
                        status: 'approved',
                        id: id
                    });
                });

                await batch.commit();
                toast(`הייבוא הצליח! הוספו ${excelData.length} תלמידים`);
                onClose();
            } catch (err) {
                toast("שגיאה בקובץ - בדוק שהכותרות באנגלית");
            } finally {
                setLoading(false);
            }
        };
        reader.readAsBinaryString(file);
    };

    const save = async (e) => {
        e.preventDefault();
        if (!data.username || !data.firstName || !data.institutionId) return toast("מלא שדות חובה");
        setLoading(true);
        try {
            const id = "user-" + Date.now();
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', id), { ...data, id });
            toast("התלמיד נוסף!");
            onClose();
        } catch (e) { toast("שגיאה בשמירה"); }
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[200] text-right" dir="rtl">
            <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-10 overflow-y-auto max-h-[90vh]">
                <h2 className="text-3xl font-black mb-8 text-emerald-600">הוספת תלמידים</h2>
                
                <div className="mb-8 p-6 bg-emerald-50 rounded-[2rem] border-2 border-dashed border-emerald-200 text-center">
                    <p className="text-sm font-bold text-emerald-800 mb-4">ייבוא מהיר מקובץ אקסל</p>
                    <input type="file" accept=".xlsx, .xls" className="hidden" id="ex-up" onChange={handleFileUpload} />
                    <label htmlFor="ex-up" className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black cursor-pointer hover:bg-emerald-700">
                        {loading ? 'מעבד...' : '📁 בחר קובץ אקסל'}
                    </label>
                </div>

                <form onSubmit={save} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input placeholder="שם פרטי *" className="w-full p-4 bg-slate-50 rounded-2xl border font-bold outline-none" onChange={e => setData({...data, firstName: e.target.value})} required/>
                        <input placeholder="שם משפחה *" className="w-full p-4 bg-slate-50 rounded-2xl border font-bold outline-none" onChange={e => setData({...data, lastName: e.target.value})} required/>
                    </div>
                    <input placeholder="שם משתמש" dir="ltr" className="w-full p-4 bg-slate-50 rounded-2xl border font-bold text-left outline-none" 
                        value={data.username} onChange={e => setData({...data, username: fixUsername(e.target.value)})} required />
                    <input placeholder="סיסמה *" className="w-full p-4 bg-slate-50 rounded-2xl border font-bold outline-none" onChange={e => setData({...data, password: e.target.value})} required/>
                    <select className="w-full p-4 bg-slate-50 rounded-2xl border font-bold outline-none" onChange={e => setData({...data, institutionId: e.target.value})} required>
                        <option value="">בחר מוסד לימודים *</option>
                        {institutions.map(ins => <option key={ins.id} value={ins.id}>{ins.name}</option>)}
                    </select>
                    <select className="w-full p-4 bg-slate-50 rounded-2xl border font-bold outline-none" onChange={e => setData({...data, grade: e.target.value})}>
                        {['א','ב','ג','ד','ה','ו','ז','ח','ט','י','יא','יב'].map(g => <option key={g} value={g}>כיתה {g}</option>)}
                    </select>
                    <div className="flex gap-4 pt-6">
                        <button type="submit" className="flex-grow bg-emerald-500 text-white py-4 rounded-2xl font-black text-lg shadow-lg">שמור תלמיד</button>
                        <button type="button" onClick={onClose} className="px-8 bg-slate-100 text-slate-400 py-4 rounded-2xl font-black">ביטול</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
