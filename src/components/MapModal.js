import React, { useState } from 'react';
import { db, appId } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function MapModal({ onClose, toast, initialData }) {
    const [data, setData] = useState(initialData || {
        name: '',
        url: '',
        minGrade: 'א',
        maxGrade: 'יב',
        theme: 'פנטזיה',
        notes: '',
        isDefault: false
    });

    const save = async (e) => {
        e.preventDefault();
        if (!data.url || !data.name) return toast("נא למלא שם וקישור למפה");
        
        const id = data.id || "map-" + Date.now();
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'maps', id), { 
                ...data, 
                id 
            });
            toast(data.id ? "המפה עודכנה" : "מפה חדשה נוספה למאגר!");
            onClose();
        } catch (e) { toast("שגיאה בשמירה"); }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[200]" onClick={onClose}>
            <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-10 text-right border-4 border-orange-50" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6 border-b-2 border-orange-100 pb-4">
                    <h2 className="text-2xl font-black text-orange-600">🗺️ ניהול מפות מערכת</h2>
                </div>
                
                <form onSubmit={save} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 mr-2">שם המפה (למשל: עולם הפנטזיה)</label>
                        <input className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-orange-500 font-bold outline-none"
                            value={data.name} onChange={e => setData({...data, name: e.target.value})} required />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 mr-2">קישור לתמונה (URL)</label>
                        <input dir="ltr" className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-orange-500 font-bold outline-none text-left"
                            placeholder="https://..." value={data.url} onChange={e => setData({...data, url: e.target.value})} required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400">מיועד מגיל/כיתה</label>
                            <select className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-orange-500 font-bold outline-none" 
                                value={data.minGrade} onChange={e => setData({...data, minGrade: e.target.value})}>
                                {['א','ב','ג','ד','ה','ו','ז','ח','ט','י','יא','יב'].map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400">עד גיל/כיתה</label>
                            <select className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-orange-500 font-bold outline-none" 
                                value={data.maxGrade} onChange={e => setData({...data, maxGrade: e.target.value})}>
                                {['א','ב','ג','ד','ה','ו','ז','ח','ט','י','יא','יב'].map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 mr-2">ערכת נושא ויזואלית</label>
                        <select className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-orange-500 font-bold outline-none" 
                            value={data.theme} onChange={e => setData({...data, theme: e.target.value})}>
                            <option value="פנטזיה">פנטזיה (קטאן)</option>
                            <option value="טכנולוגי">טכנולוגי / עתידני</option>
                            <option value="חלל">חלל</option>
                            <option value="טבע">טבע / פרא</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 mr-2">הערות פדגוגיות</label>
                        <textarea className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-orange-500 font-medium h-24 outline-none"
                            value={data.notes} onChange={e => setData({...data, notes: e.target.value})} />
                    </div>

                    <div className="flex items-center gap-2 p-2">
                        <input type="checkbox" id="isDefault" checked={data.isDefault} onChange={e => setData({...data, isDefault: e.target.checked})} className="w-4 h-4 accent-orange-600" />
                        <label htmlFor="isDefault" className="text-xs font-black text-slate-600">קבע כמפת ברירת מחדל למערכת</label>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="submit" className="flex-grow bg-orange-500 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-orange-600 active:scale-95 transition-all">שמור מפה</button>
                        <button type="button" onClick={onClose} className="px-6 bg-slate-100 text-slate-400 py-4 rounded-2xl font-black">ביטול</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
