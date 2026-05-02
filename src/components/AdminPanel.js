import React from 'react';
import { db, appId } from '../firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

export default function AdminPanel({ users, institutions, toast }) {

    const approveUser = async (user) => {
        try {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', user.id), { status: 'approved' });
            toast("המשתמש אושר בהצלחה");
        } catch (e) { toast("שגיאה באישור המשתמש"); }
    };

    const deleteItem = async (col, id) => {
        if (!window.confirm("בטוח שברצונך למחוק?")) return;
        try {
            await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', col, id));
            toast("נמחק בהצלחה");
        } catch (e) { toast("שגיאה במחיקה"); }
    };

    return (
        <div className="space-y-12 text-right" dir="rtl">
            {/* טבלת מוסדות - כאן תראה את המאפיינים שביקשת */}
            <section className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
                <h2 className="text-2xl font-black mb-6 text-blue-600">ניהול מוסדות</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm font-bold">
                        <thead>
                            <tr className="border-b text-slate-400">
                                <th className="p-4 text-right">סמל</th>
                                <th className="p-4 text-right">שם המוסד</th>
                                <th className="p-4 text-right">מזהה (Prefix)</th>
                                <th className="p-4 text-right">סוג</th>
                                <th className="p-4 text-right">תוקף מנוי</th>
                                <th className="p-4 text-right">פעולות</th>
                            </tr>
                        </thead>
                        <tbody>
                            {institutions.map(inst => (
                                <tr key={inst.id} className="border-b hover:bg-slate-50 transition-colors">
                                    <td className="p-4 text-xl">{inst.symbol || '🏫'}</td>
                                    <td className="p-4">{inst.name}</td>
                                    <td className="p-4 font-mono text-blue-600 uppercase">{inst.prefix}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] ${inst.type === 'פנימי' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-600'}`}>{inst.type}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className={new Date(inst.expiryDate) < new Date() ? 'text-red-500 underline' : 'text-emerald-600'}>
                                            {inst.expiryDate || 'לא הוגדר'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <button onClick={() => deleteItem('institutions', inst.id)} className="text-red-400 hover:text-red-600">מחק</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* טבלת משתמשים להמתנה/אישור */}
            <section className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
                <h2 className="text-2xl font-black mb-6 text-emerald-600">משתמשים במערכת</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm font-bold">
                        <thead>
                            <tr className="border-b text-slate-400">
                                <th className="p-4 text-right">שם</th>
                                <th className="p-4 text-right">שם משתמש</th>
                                <th className="p-4 text-right">מוסד</th>
                                <th className="p-4 text-right">סטטוס</th>
                                <th className="p-4 text-right">פעולות</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} className="border-b">
                                    <td className="p-4">{u.firstName} {u.lastName}</td>
                                    <td className="p-4 font-mono">{u.username}</td>
                                    <td className="p-4">{institutions.find(i => i.id === u.institutionId)?.name || 'ללא מוסד'}</td>
                                    <td className="p-4">
                                        {u.status === 'pending' ? <span className="text-orange-500 animate-pulse italic">ממתין לאישור</span> : <span className="text-emerald-500">מאושר</span>}
                                    </td>
                                    <td className="p-4 flex gap-4">
                                        {u.status === 'pending' && <button onClick={() => approveUser(u)} className="text-emerald-600 hover:underline">אשר עכשיו</button>}
                                        <button onClick={() => deleteItem('users', u.id)} className="text-red-400 hover:underline text-xs">מחק</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
