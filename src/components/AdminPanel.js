import React, { useState } from 'react';
import { db, appId } from '../firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

export default function AdminPanel({ users, institutions, toast, isAdmin, onEditUser, onEditInst }) {
    const [filters, setFilters] = useState({});

    const handleFilter = (col, val) => setFilters({...filters, [col]: val.toLowerCase()});

    const filteredInst = institutions.filter(i => 
        (!filters.instName || i.name.toLowerCase().includes(filters.instName)) &&
        (!filters.instPrefix || i.prefix.toLowerCase().includes(filters.instPrefix))
    );

    const filteredUsers = users.filter(u => 
        (!filters.userName || (u.firstName + ' ' + u.lastName).toLowerCase().includes(filters.userName)) &&
        (!filters.userRole || u.role.toLowerCase().includes(filters.userRole))
    );

    const toggleRole = async (user) => {
        if (!isAdmin) return;
        const newRole = user.role === 'teacher' ? 'student' : 'teacher';
        try {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', user.id), { role: newRole });
            toast(`המשתמש הוגדר כ${newRole === 'teacher' ? 'מורה' : 'תלמיד'}`);
        } catch (e) { toast("שגיאה בעדכון תפקיד"); }
    };

    const SearchInput = ({ col, placeholder }) => (
        <div className="relative mt-2">
            <span className="absolute right-3 top-2.5 text-slate-300 text-xs">🔍</span>
            <input 
                className="w-full p-2 pr-8 bg-slate-50 border rounded-lg text-[10px] font-bold outline-none focus:border-purple-400"
                placeholder={placeholder}
                onChange={(e) => handleFilter(col, e.target.value)}
            />
        </div>
    );

    return (
        <div className="space-y-12 text-right" dir="rtl">
            {isAdmin && (
                <section className="bg-white p-8 rounded-[3rem] shadow-sm border">
                    <h2 className="text-2xl font-black mb-6 text-blue-600">ניהול מוסדות</h2>
                    <table className="w-full text-xs font-bold">
                        <thead>
                            <tr className="border-b text-slate-400">
                                <th className="p-4 text-right">סמל</th>
                                <th className="p-4 text-right w-1/4">שם המוסד <SearchInput col="instName" placeholder="חפש מוסד..." /></th>
                                <th className="p-4 text-right">מזהה <SearchInput col="instPrefix" placeholder="חפש מזהה..." /></th>
                                <th className="p-4 text-right">תוקף</th>
                                <th className="p-4 text-right">פעולות</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInst.map(inst => (
                                <tr key={inst.id} className="border-b">
                                    <td className="p-4 text-xl">{inst.symbol || '🏫'}</td>
                                    <td className="p-4"><button onClick={() => onEditInst(inst)} className="text-blue-600 hover:underline text-lg font-black">{inst.name}</button></td>
                                    <td className="p-4 uppercase text-slate-400 font-mono">{inst.prefix}</td>
                                    <td className={`p-4 ${new Date(inst.expiryDate) < new Date() ? 'text-red-500' : 'text-emerald-500'}`}>{inst.expiryDate}</td>
                                    <td className="p-4"><button onClick={async () => { if(window.confirm("מחק?")) await deleteDoc(doc(db,'artifacts',appId,'public','data','institutions',inst.id)) }} className="text-red-300 hover:text-red-600">מחק</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            )}

            <section className="bg-white p-8 rounded-[3rem] shadow-sm border">
                <h2 className="text-2xl font-black mb-6 text-emerald-600">{isAdmin ? 'כל המשתמשים' : 'תלמידי המוסד שלי'}</h2>
                <table className="w-full text-xs font-bold">
                    <thead>
                        <tr className="border-b text-slate-400">
                            <th className="p-4 text-right w-1/4">שם <SearchInput col="userName" placeholder="חפש שם..." /></th>
                            <th className="p-4 text-right">שם משתמש</th>
                            <th className="p-4 text-right">תפקיד <SearchInput col="userRole" placeholder="מורה/תלמיד..." /></th>
                            <th className="p-4 text-right">פעולות</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(u => (
                            <tr key={u.id} className="border-b">
                                <td className="p-4"><button onClick={() => onEditUser(u)} className="text-emerald-600 hover:underline text-lg font-black">{u.firstName} {u.lastName}</button></td>
                                <td className="p-4 font-mono">{u.username}</td>
                                <td className="p-4">
                                    <button onClick={() => toggleRole(u)} className={`px-3 py-1 rounded-full text-[10px] ${u.role === 'teacher' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                                        {u.role === 'teacher' ? 'מורה' : 'תלמיד'} {isAdmin && '🔄'}
                                    </button>
                                </td>
                                <td className="p-4"><button onClick={async () => { if(window.confirm("מחק?")) await deleteDoc(doc(db,'artifacts',appId,'public','data','users',u.id)) }} className="text-red-300 hover:text-red-600">מחק</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
}
