import React from 'react';
import { db, appId } from '../firebase';
import { doc, updateDoc, writeBatch } from 'firebase/firestore';

export default function AdminPanel({ users, institutions, toast }) {
    const bulkCreate = async () => {
        const batch = writeBatch(db);
        for (let i = 1; i <= 100; i++) {
            const id = `std-${Date.now()}-${i}`;
            batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'users', id), {
                username: `student${i}`, password: `1234`, firstName: `תלמיד`, lastName: `${i}`,
                role: 'student', status: 'approved', id
            });
        }
        await batch.commit();
        toast("100 חשבונות נוצרו!");
    };

    return (
        <div className="bg-slate-50 p-8 rounded-[3rem] text-right">
            <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-black">ניהול מערכת</h2>
                <button onClick={bulkCreate} className="bg-black text-white px-6 py-3 rounded-2xl font-black shadow-lg">יצירת 100 חשבונות מהירה ⚡</button>
            </div>
            
            <div className="grid gap-6">
                <section className="bg-white p-6 rounded-3xl shadow-sm border">
                    <h3 className="font-black mb-4 text-purple-600 text-sm">אישורי כניסה ממתינים</h3>
                    {users.filter(u => u.status === 'pending').map(u => (
                        <div key={u.id} className="flex justify-between items-center py-3 border-b last:border-0">
                            <span className="font-bold">{u.firstName} {u.lastName} ({u.username})</span>
                            <button onClick={() => updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', u.id), {status:'approved'})} className="bg-emerald-500 text-white px-4 py-1 rounded-lg font-black text-xs">אשר</button>
                        </div>
                    ))}
                </section>
            </div>
        </div>
    );
}
