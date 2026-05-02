import React, { useState, useEffect } from 'react';
import { db, appId } from '../firebase';
import { doc, setDoc, collection, onSnapshot, writeBatch } from 'firebase/firestore';
import * as XLSX from 'xlsx'; // יש לוודא שהתקנת את הספרייה: npm install xlsx

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
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const excelData = XLSX.utils.sheet_to_json(ws);

                const batch = writeBatch(db);
                excelData.forEach((row) => {
                    const id = "user-" + Date.now() + Math.random().toString(36).substr(2, 5);
                    const userDoc = {
                        firstName: row.firstName || '',
                        lastName: row.lastName || '',
                        username: fixUsername(row.username),
                        password: row.password?.toString() || '1234',
                        institutionId: row.institutionId || data.institutionId,
                        grade: row.grade || 'א',
                        role: 'student',
                        status: 'approved',
                        id: id
                    };
                    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', id);
                    batch.set(docRef, userDoc);
                });

                await batch.commit();
                toast(`ייבוא הושלם! הוספו ${excelData.length} תלמידים`);
                onClose();
            } catch (err) {
                console.error(err);
                toast("שגיאה בקריאת הקובץ - וודא שהפורמט תקין");
            } finally {
                setLoading(false);
            }
        };
        reader.readAsBinaryString(file);
    };

    const save = async (e) => {
        e.preventDefault();
        if (!data.username || !data.password || !data.firstName || !data.institutionId) {
            return toast("יש למלא את כל שדות החובה");
        }
        setLoading(true);
        try {
            const id = "user-" + Date.now();
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', id), { ...data, id });
            toast("התלמיד נוסף בהצלחה!");
            onClose();
        } catch (e) { toast("שגיאה בשמירה"); }
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[200] text-right" dir="rtl">
            <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-10 overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-3xl font-black text-emerald-600">הוספת תלמיד</h2>
                    <div className="bg-emerald-50 px-3 py-1 rounded-full text-[10px] font-black text-emerald-600 uppercase">Class Manager</div>
                </div>

                {/* אזור ייבוא אקסל */}
                <div className="mb-8 p-6 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 text-center">
                    <p className="text-sm font-bold text-slate-500 mb-4">ייבוא כיתה שלמה מאקסל</p>
                    <input 
                        type="file" 
                        accept=".xlsx, .xls" 
                        className="hidden" 
                        id="excel-upload" 
                        onChange={handleFileUpload} 
                    />
                    <label 
                        htmlFor="excel-upload" 
                        className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black cursor-pointer hover:bg-emerald-700 transition-all inline-block"
                    >
                        {loading ? 'מעלה...' : '📁 בחר קובץ אקסל'}
                    </label>
                </div>

                <div className="relative flex items-center mb-8">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink mx-4 text-slate-400 text-xs font-bold">או הוספה ידנית</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <form onSubmit={save} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input placeholder="שם פרטי *" className="w-full p-4 bg-slate-50 rounded-2xl border font-bold focus:border-emerald-500 outline-none" 
                            onChange={e => setData({...data, firstName: e.target.value})} required/>
                        <input placeholder="שם משפחה *" className="w-full p-4 bg-slate-50 rounded-2xl border font-bold focus:border-emerald-500 outline-none" 
                            onChange={e => setData({...data, lastName: e.target.value})} required/>
                    </div>

                    <input 
                        placeholder="שם משתמש" 
                        dir="ltr"
                        className="w-full p-4 bg-slate-50 rounded-2xl border font-bold focus:border-emerald-500 outline-none text-left" 
                        value={data.username}
                        onChange={e => setData({...data, username: fixUsername(e.target.value)})} 
                        required
                    />

                    <input placeholder="סיסמה *" type="text" className="w-full p-4 bg-slate-50 rounded-2xl border font-bold focus:border-emerald-500 outline-none" 
                        onChange={e => setData({...data, password: e.target.value})} required/>

                    <select className="w-full p-4 bg-slate-50 rounded-2xl border font-bold focus:border-emerald-500 outline-none"
                        value={data.institutionId} onChange={e => setData({...data, institutionId: e.target.value})} required>
                        <option value="">בחר מוסד לימודים *</option>
                        {institutions.map(ins => <option key={ins.id} value={ins.id}>{ins.name}</option>)}
                    </select>

                    <select className="w-full p-4 bg-slate-50 rounded-2xl border font-bold focus:border-emerald-500 outline-none"
                        value={data.grade} onChange={e => setData({...data, grade: e.target.value})}>
                        {['א','ב','ג','ד','ה','ו','ז','ח','ט','י','יא','יב'].map(g => <option key={g} value={g}>כיתה {g}</option>)}
                    </select>
                    
                    <div className="flex gap-4 pt-6">
                        <button type="submit" disabled={loading} className="flex-grow bg-emerald-500 text-white py-4 rounded-2xl font-black text-lg shadow-lg">שמור תלמיד</button>
                        <button type="button" onClick={onClose} className="px-8 bg-slate-100 text-slate-400 py-4 rounded-2xl font-black">ביטול</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
