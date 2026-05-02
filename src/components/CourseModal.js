import React, { useState } from 'react';
import { db, appId } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function CourseModal({ onClose, toast, geminiKey, existingCourses, institutions }) {
    const [data, setData] = useState({
        name: '', fields: [], fromGrade: 'א', toGrade: 'יב', equipment: [], type: 'מיומנויות',
        summary: '', goals: '', targets: '', prerequisites: [], assignedInstitutions: []
    });

    const toggleTag = (list, val) => {
        const curr = data[list] || [];
        setData({...data, [list]: curr.includes(val) ? curr.filter(i => i !== val) : [...curr, val]});
    };

    const save = async (e) => {
        e.preventDefault();
        const id = "c-" + Date.now();
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'courses', id), {...data, id, lessons: []});
            toast("הקורס נוצר!");
            onClose();
        } catch (e) { toast("שגיאה"); }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[200]" onClick={onClose}>
            <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl p-10 overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <h2 className="text-3xl font-black mb-8 text-purple-600">יצירת קורס מנצח 🚀</h2>
                <form onSubmit={save} className="space-y-8">
                    <input placeholder="שם הקורס *" className="w-full p-4 bg-slate-50 rounded-2xl border font-black text-xl" value={data.name} onChange={e => setData({...data, name: e.target.value})} required/>
                    
                    <div className="p-6 bg-purple-50 rounded-[2rem] border-2 border-purple-100 space-y-4">
                        <label className="text-sm font-black text-purple-600">שיוך מוסדות (השאר ריק להתאמה אוטומטית):</label>
                        <div className="flex flex-wrap gap-2">
                            {institutions.map(inst => (
                                <button key={inst.id} type="button" onClick={() => toggleTag('assignedInstitutions', inst.id)} className={`px-4 py-2 rounded-xl text-xs font-bold ${data.assignedInstitutions?.includes(inst.id) ? 'bg-purple-600 text-white' : 'bg-white border text-slate-400'}`}>
                                    {inst.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-[2.5rem] font-black text-xl shadow-xl">אשר ושמור קורס</button>
                </form>
            </div>
        </div>
    );
}
