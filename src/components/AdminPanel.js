import React, { useState } from 'react';
import { db, appId } from '../firebase';
import { doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';

export default function AdminPanel({ users, institutions, courses, toast, isAdmin, onEditUser, onEditInst, onEditCourse }) {
    const [activeTab, setActiveTab] = useState('courses');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const SortIcon = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) return <span className="text-slate-300 ml-2 text-xs">↕</span>;
        return sortConfig.direction === 'asc' ? <span className="text-purple-600 ml-2 text-xs font-black">↑</span> : <span className="text-purple-600 ml-2 text-xs font-black">↓</span>;
    };

    const handleApproveUser = async (userId) => {
        try {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', userId), { status: 'approved' });
            toast('המשתמש אושר בהצלחה!');
        } catch (error) {
            console.error(error);
            toast('שגיאה באישור המשתמש.');
        }
    };

    let filteredCourses = courses.filter(c => c.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    if (sortConfig.key) {
        filteredCourses.sort((a, b) => {
            let aVal = a[sortConfig.key];
            let bVal = b[sortConfig.key];
            if (sortConfig.key === 'lessonsCount') { aVal = a.lessons?.length || 0; bVal = b.lessons?.length || 0; }
            if (sortConfig.key === 'institutions') { aVal = a.assignedInstitutions?.length || 0; bVal = b.assignedInstitutions?.length || 0; }
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    let filteredUsers = users.filter(u => 
        u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    let filteredInsts = institutions.filter(i => i.name?.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 p-8" dir="rtl">
            <div className="flex flex-wrap gap-4 border-b-2 border-slate-100 pb-4 mb-8">
                <button onClick={() => {setActiveTab('courses'); setSearchTerm('');}} className={`px-6 py-3 rounded-2xl font-black transition-all ${activeTab === 'courses' ? 'bg-purple-100 text-purple-700' : 'text-slate-500 hover:bg-slate-50'}`}>📚 ניהול קורסים</button>
                {isAdmin && <button onClick={() => {setActiveTab('users'); setSearchTerm('');}} className={`px-6 py-3 rounded-2xl font-black transition-all ${activeTab === 'users' ? 'bg-purple-100 text-purple-700' : 'text-slate-500 hover:bg-slate-50'}`}>👥 ניהול משתמשים</button>}
                {isAdmin && <button onClick={() => {setActiveTab('insts'); setSearchTerm('');}} className={`px-6 py-3 rounded-2xl font-black transition-all ${activeTab === 'insts' ? 'bg-purple-100 text-purple-700' : 'text-slate-500 hover:bg-slate-50'}`}>🏫 ניהול מוסדות</button>}
            </div>

            <div className="flex justify-between items-center mb-6">
                <div className="relative w-full max-w-md">
                    <input 
                        type="text" 
                        placeholder="חיפוש..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-slate-200 pl-4 pr-12 py-3 rounded-2xl outline-none focus:border-purple-500 font-bold transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
                </div>
            </div>

            <div className="overflow-x-auto">
                {activeTab === 'courses' && (
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 rounded-2xl">
                                <th className="p-4 font-black cursor-pointer" onClick={() => handleSort('name')}>שם הקורס <SortIcon columnKey="name" /></th>
                                <th className="p-4 font-black cursor-pointer text-center" onClick={() => handleSort('lessonsCount')}>כמות שיעורים <SortIcon columnKey="lessonsCount" /></th>
                                <th className="p-4 font-black">שכבות גיל</th>
                                <th className="p-4 font-black text-center">פעולות</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCourses.map((c, idx) => (
                                <tr key={c.id} className={`border-b border-slate-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                    <td className="p-4 font-bold text-slate-800">{c.name}</td>
                                    <td className="p-4 font-bold text-slate-600 text-center">{c.lessons?.length || 0}</td>
                                    <td className="p-4 text-slate-600 font-medium" dir="ltr">{c.fromGrade} - {c.toGrade}</td>
                                    <td className="p-4 text-center">
                                        <button onClick={() => onEditCourse(c)} className="bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg font-bold text-sm">עריכה</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {activeTab === 'users' && (
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 rounded-2xl">
                                <th className="p-4 font-black">שם מלא</th>
                                <th className="p-4 font-black">שם משתמש</th>
                                <th className="p-4 font-black">מוסד מקושר</th>
                                <th className="p-4 font-black text-center">סטטוס</th>
                                <th className="p-4 font-black text-center">פעולות</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(u => (
                                <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                                    <td className="p-4 font-bold text-slate-800">{u.firstName} {u.lastName}</td>
                                    <td className="p-4 font-mono text-slate-500">{u.username}</td>
                                    <td className="p-4 font-bold text-slate-500">{institutions.find(i => i.id === u.institutionId)?.name || 'ללא'}</td>
                                    <td className="p-4 text-center">
                                        {u.status === 'pending' ? <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded text-xs font-bold">ממתין לאישור</span> : <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs font-bold">מאושר</span>}
                                    </td>
                                    <td className="p-4 text-center">
                                        {u.status === 'pending' && <button onClick={() => handleApproveUser(u.id)} className="bg-green-600 text-white px-3 py-1.5 rounded-lg font-bold text-sm ml-2">אשר מנוי</button>}
                                        <button onClick={() => onEditUser(u)} className="bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-bold text-sm">עריכה</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {activeTab === 'insts' && (
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 rounded-2xl">
                                <th className="p-4 font-black">שם המוסד</th>
                                <th className="p-4 font-black">סוג</th>
                                <th className="p-4 font-black text-center">פעולות</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInsts.map(i => (
                                <tr key={i.id} className="border-b border-slate-50">
                                    <td className="p-4 font-bold text-slate-800">{i.name}</td>
                                    <td className="p-4 font-bold text-slate-600">{i.type}</td>
                                    <td className="p-4 text-center">
                                        <button onClick={() => onEditInst(i)} className="bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg font-bold text-sm">עריכה</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
