import React, { useState } from 'react';
import { db, appId } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function MapModal({ onClose, toast, localMaps, initialData }) {
    const [data, setData] = useState(initialData || { name: '', url: '', minGrade: 'א', maxGrade: 'יב', theme: 'פנטזיה', notes: '', isDefault: false });

    // פונקציה לקביעת מפה כברירת מחדל (מתוך הרשימה)
    const setDefaultMap = async (mapToDefault) => {
        try {
            const updates = localMaps.map(m => {
                const mapRef = doc(db, 'artifacts', appId, 'public', 'data', 'maps', m.id);
                return setDoc(mapRef, { ...m, isDefault: m.id === mapToDefault.id }, { merge: true });
            });
            await Promise.all(updates);
            toast(`המפה "${mapToDefault.name}" נקבעה כברירת מחדל של המערכת!`);
        } catch (e) { toast("שגיאה בקביעת מפה כברירת מחדל"); }
    };

    const save = async (e) => {
        e.preventDefault();
        const id = data.id || "map-" + Date.now();
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'maps', id), { ...data, id });
            toast("המפה נשמרה במאגר!");
            onClose();
        } catch (e) { toast("שגיאה בשמירה"); }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[200]" onClick={onClose}>
            <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl p-10 text-right border-4 border-orange-50 overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
                
                <h2 className="text-3xl font-black text-orange-600 mb-8 border-b pb-4">ניהול ומבחר מפות למוסדות</h2>

                {/* חלק 1: מאגר המפות הקיים */}
                <section className="mb-12 space-y-6">
                    <h3 className="text-xl font-black text-slate-800">מאגר המפות הקיים במערכת:</h3>
                    <div className="grid grid-cols-3 gap-6">
                        {localMaps.map(map => (
                            <div key={map.id} className={`p-6 rounded-[2.5rem] border-2 flex flex-col items-center gap-4 ${map.isDefault ? 'bg-orange-50 border-orange-200 shadow-xl' : 'bg-slate-50 border-slate-100 hover:border-orange-200 hover:bg-white'}`}>
                                <img src={map.url} className="w-full h-32 object-cover rounded-2xl shadow-md" alt={map.name} />
                                <div className="text-center">
                                    <p className="font-black text-sm text-slate-800">{map.name}</p>
                                    <p className="text-[10px] text-slate-400">כיתות {map.minGrade}-{map.maxGrade}</p>
                                    <p className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[9px] font-bold mt-2 inline-block">ערכת נושא: {map.theme}</p>
                                </div>
                                <div className="flex gap-2 w-full mt-2">
                                    {!map.isDefault && (
                                        <button onClick={() => setDefaultMap(map)} className="flex-grow bg-orange-600 text-white text-[10px] px-3 py-2 rounded-xl font-black">קבע כברירת מחדל</button>
                                    )}
                                    {map.isDefault && (
                                        <div className="flex-grow bg-white text-orange-600 text-[10px] px-3 py-2 rounded-xl font-black border border-orange-200">מפת ברירת מחדל ✓</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="border-t-2 border-slate-100 my-10"></div>

                {/* חלק 2: הוספת מפה חדשה למאגר (כפי שביקשת בטופס) */}
                <section className="space-y-6">
                    <h3 className="text-xl font-black text-orange-600">הוספת מפה חדשה למאגר:</h3>
                    <form onSubmit={save} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <input placeholder="שם המפה" className="w-full p-4 bg-slate-50 rounded-2xl border font-bold" value={data.name} onChange={e => setData({...data, name: e.target.value})} required />
                            <input placeholder="ערכת נושא ויזואלית (למשל: פנטזיה, חלל)" className="w-full p-4 bg-slate-50 rounded-2xl border font-bold" value={data.theme} onChange={e => setData({...data, theme: e.target.value})} />
                        </div>
                        <input placeholder="URL קישור לתמונה במאגר שלך (PostImage)" dir="ltr" className="w-full p-4 bg-slate-50 rounded-2xl border" value={data.url} onChange={e => setData({...data, url: e.target.value})} required />
                        <div className="grid grid-cols-2 gap-4">
                            <select className="p-4 bg-slate-50 rounded-2xl border font-bold" value={data.minGrade} onChange={e => setData({...data, minGrade: e.target.value})}>
                                {['א','ב','ג','ד','ה','ו','ז','ח','ט','י','יא','יב'].map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                            <select className="p-4 bg-slate-50 rounded-2xl border font-bold" value={data.maxGrade} onChange={e => setData({...data, maxGrade: e.target.value})}>
                                {['א','ב','ג','ד','ה','ו','ז','ח','ט','י','יא','יב'].map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        <textarea placeholder="הערות פדגוגיות (למשל: למקצועות טכנולוגיים בלבד)" className="w-full p-4 bg-slate-50 rounded-2xl border h-24" value={data.notes} onChange={e => setData({...data, notes: e.target.value})} />
                        <div className="flex items-center gap-2 p-2">
                            <input type="checkbox" id="isDefaultAdd" checked={data.isDefault} onChange={e => setData({...data, isDefault: e.target.checked})} className="w-4 h-4" />
                            <label htmlFor="isDefaultAdd" className="text-xs font-black">קבע כמפת ברירת מחדל עם השמירה</label>
                        </div>
                        <button type="submit" className="w-full bg-orange-500 text-white py-5 rounded-[2rem] font-black shadow-lg hover:bg-orange-600 transition-all">שמור מפה חדשה במאגר</button>
                    </form>
                </section>
                
                <button type="button" onClick={onClose} className="absolute top-6 left-6 text-slate-300 font-black hover:text-red-500">×</button>
            </div>
        </div>
    );
}
