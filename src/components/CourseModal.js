import React, { useState, useEffect } from 'react';
import { db, appId } from '../firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';

export default function InstitutionModal({ onClose, toast, initialData }) {
    const [isSaving, setIsSaving] = useState(false);

    const [name, setName] = useState('');
    const [type, setType] = useState('עירייה');
    const [customId, setCustomId] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [mapBackground, setMapBackground] = useState('');
    
    const [fromGrade, setFromGrade] = useState(1);
    const [toGrade, setToGrade] = useState(12);
    const [fields, setFields] = useState([]);

    const availableFields = ['רובוטיקה', 'תכנות', 'מייקרים', 'בינה מלאכותית', 'אלקטרוניקה', 'תלת מימד', 'מדעים', 'עיצוב', 'חלל'];
    const instTypes = ['עירייה', 'בית ספר', 'מתנ"ס', 'חוג', 'פרטי'];

    useEffect(() => {
        if (initialData) {
            setName(initialData.name || '');
            setType(initialData.type || 'עירייה');
            setCustomId(initialData.id && !initialData.id.startsWith('inst-') ? initialData.id : '');
            setExpiryDate(initialData.expiryDate || '');
            setMapBackground(initialData.mapBackground || '');
            
            if (initialData.grades && initialData.grades.length > 0) {
                setFromGrade(Math.min(...initialData.grades));
                setToGrade(Math.max(...initialData.grades));
            }
            setFields(initialData.fields || []);
        }
    }, [initialData]);

    const handleFieldToggle = (field) => {
        setFields(prev => prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]);
    };

    const handleSave = async () => {
        if (!name || !name.trim()) return toast('חובה להזין את שם המוסד.');
        setIsSaving(true);

        const gradesArray = [];
        for (let i = Number(fromGrade); i <= Number(toGrade); i++) {
            gradesArray.push(i);
        }

        const instData = {
            name,
            type,
            expiryDate,
            mapBackground,
            grades: gradesArray,
            fields,
            updatedAt: new Date().toISOString()
        };

        try {
            if (initialData?.id) {
                await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'institutions', initialData.id), instData);
                toast('המוסד עודכן בהצלחה!');
            } else {
                const newId = customId.trim() || `inst-${Date.now()}`;
                instData.createdAt = new Date().toISOString();
                await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'institutions', newId), instData);
                toast('המוסד נוצר בהצלחה!');
            }
            onClose();
        } catch (error) {
            console.error("שגיאה בשמירת המוסד:", error);
            toast('שגיאה בשמירה, נסה שוב.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[500]" onClick={onClose} dir="rtl">
            <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                
                <div className="bg-slate-900 p-6 text-white flex justify-between items-center shrink-0">
                    <h2 className="text-2xl font-black">{initialData ? '✏️ עריכת מוסד' : '🏫 יצירת מוסד / הרשאה חדשה'}</h2>
                    <button onClick={onClose} className="text-white/50 hover:text-white text-3xl transition-colors">&times;</button>
                </div>

                <div className="p-8 overflow-y-auto flex-1 space-y-6 bg-slate-50">
                    
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                            <label className="block font-bold text-slate-700 mb-2">שם המוסד / העירייה</label>
                            <input 
                                type="text" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                placeholder="עיריית תל אביב / בי״ס אלון..."
                                className="w-full bg-slate-50 border-2 border-slate-200 p-3 rounded-xl outline-none focus:border-purple-500 font-bold transition-colors"
                            />
                        </div>

                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                            <label className="block font-bold text-slate-700 mb-2">סוג מוסד</label>
                            <select 
                                value={type} 
                                onChange={(e) => setType(e.target.value)} 
                                className="w-full bg-slate-50 border-2 border-slate-200 p-3 rounded-xl outline-none focus:border-purple-500 font-bold transition-colors">
                                {instTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                            <label className="block font-bold text-slate-700 mb-2">מזהה מוסד (ID) - אופציונלי</label>
                            <input 
                                type="text" 
                                value={customId} 
                                onChange={(e) => setCustomId(e.target.value)} 
                                disabled={!!initialData}
                                placeholder="tlv-2024"
                                className="w-full bg-slate-50 border-2 border-slate-200 p-3 rounded-xl outline-none focus:border-purple-500 transition-colors disabled:opacity-50 text-left" dir="ltr"
                            />
                        </div>

                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                            <label className="block font-bold text-slate-700 mb-2">תוקף ההרשאה</label>
                            <input 
                                type="date" 
                                value={expiryDate} 
                                onChange={(e) => setExpiryDate(e.target.value)} 
                                className="w-full bg-slate-50 border-2 border-slate-200 p-3 rounded-xl outline-none focus:border-purple-500 font-bold transition-colors"
                            />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <label className="block font-bold text-slate-700 mb-2">תמונת רקע במפה (URL) - אופציונלי</label>
                        <input 
                            type="text" 
                            value={mapBackground} 
                            onChange={(e) => setMapBackground(e.target.value)} 
                            placeholder="https://..."
                            className="w-full bg-slate-50 border-2 border-slate-200 p-3 rounded-xl outline-none focus:border-purple-500 transition-colors text-left" dir="ltr"
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                            <label className="block font-bold text-slate-700 mb-4">שכבות גיל מורשות</label>
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <span className="text-xs text-slate-500 font-bold block mb-1">מכיתה</span>
                                    <select value={fromGrade} onChange={e => setFromGrade(e.target.value)} className="w-full p-2 rounded-lg border-2 border-slate-200 bg-slate-50 font-bold">
                                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <span className="text-xs text-slate-500 font-bold block mb-1">עד כיתה</span>
                                    <select value={toGrade} onChange={e => setToGrade(e.target.value)} className="w-full p-2 rounded-lg border-2 border-slate-200 bg-slate-50 font-bold">
                                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                            <label className="block font-bold text-slate-700 mb-4">תחומי דעת מורשים</label>
                            <div className="flex flex-wrap gap-2">
                                {availableFields.map(field => (
                                    <button 
                                        key={field}
                                        onClick={() => handleFieldToggle(field)}
                                        className={`px-3 py-1 rounded-full text-sm font-bold border-2 transition-colors ${fields.includes(field) ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                                        {field}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>

                <div className="bg-white border-t border-slate-100 p-6 flex justify-end gap-4 shrink-0">
                    <button onClick={onClose} className="px-8 py-3 rounded-full font-bold text-slate-500 hover:bg-slate-100 transition-colors">
                        ביטול
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="bg-slate-900 text-white px-10 py-3 rounded-full font-black text-lg hover:bg-purple-600 transition-colors shadow-xl disabled:opacity-50 flex items-center gap-2">
                        {isSaving ? 'שומר...' : '💾 שמירת מוסד'}
                    </button>
                </div>
