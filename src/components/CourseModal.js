import React, { useState, useEffect } from 'react';
import { db, appId } from '../firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';

export default function CourseModal({ onClose, toast, geminiKey, institutions = [], initialData = null }) {
    const [isSaving, setIsSaving] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState('');
    const [video, setVideo] = useState('');
    const [fromGrade, setFromGrade] = useState(1);
    const [toGrade, setToGrade] = useState(12);
    const [fields, setFields] = useState([]);
    const [assignedInstitutions, setAssignedInstitutions] = useState([]);

    const availableFields = ['רובוטיקה', 'תכנות', 'מייקרים', 'בינה מלאכותית', 'אלקטרוניקה', 'תלת מימד', 'מדעים', 'עיצוב', 'חלל'];

    useEffect(() => {
        if (initialData) {
            setName(initialData.name || '');
            setDescription(initialData.description || '');
            setImage(initialData.image || '');
            setVideo(initialData.video || '');
            setFromGrade(initialData.fromGrade || 1);
            setToGrade(initialData.toGrade || 12);
            setFields(initialData.fields || []);
            setAssignedInstitutions(initialData.assignedInstitutions || []);
        }
    }, [initialData]);

    const handleFieldToggle = (field) => {
        setFields(prev => prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]);
    };

    const handleInstToggle = (instId) => {
        setAssignedInstitutions(prev => prev.includes(instId) ? prev.filter(id => id !== instId) : [...prev, instId]);
    };

    const generateDescriptionWithAI = async () => {
        if (!name || !name.trim()) return toast('נא להזין שם קורס בשדה למעלה לפני הפעלת ה-AI.');
        if (!geminiKey) return toast('מפתח ה-API של Gemini חסר במערכת.');

        setIsGenerating(true);
        
        // פירוק מחרוזת השרשור בצורה נקייה ומאובטחת למניעת שגיאות סינטקס
        const promptText = "אתה מומחה לפדגוגיה חדשנית בחברת חותם חיים מבית רובוטיקס. " +
            "כתוב תיאור שיווקי, מרתק ומקצועי (עד 4-5 פסקאות קצרות) עבור קורס בשם: \"" + name + "\". " +
            "הקורס מיועד לתלמידים מכיתה " + fromGrade + " עד " + toGrade + ". " +
            "תחומי הדעת של הקורס הם: " + (fields.length > 0 ? fields.join(', ') : 'טכנולוגיה וחדשנות') + ". " +
            "התיאור צריך לפנות למורים, מנהלים ותלמידים, ולהדגיש פיתוח לומד עצמאי וכישורי המאה ה-21. " +
            "ענה בעברית תקנית בלבד.";

        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error.message);
            
            const aiText = data.candidates[0].content.parts[0].text;
            setDescription(aiText);
            toast('✨ התיאור נוצר בהצלחה באמצעות AI!');
        } catch (error) {
            console.error(error);
            toast('שגיאה ביצירת התוכן. נסה שוב.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!name || !name.trim()) return toast('חובה להזין את שם הקורס לפני השמירה.');
        setIsSaving(true);

        const courseData = {
            name,
            description,
            image,
            video,
            fromGrade: Number(fromGrade),
            toGrade: Number(toGrade),
            fields,
            assignedInstitutions,
            updatedAt: new Date().toISOString()
        };

        try {
            if (initialData?.id) {
                await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'courses', initialData.id), courseData);
                toast('הקורס עודכן בהצלחה!');
            } else {
                const newId = `course-${Date.now()}`;
                courseData.createdAt = new Date().toISOString();
                courseData.lessons = []; 
                await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'courses', newId), courseData);
                toast('הקורס נוצר בהצלחה!');
            }
            onClose();
        } catch (error) {
            console.error("שגיאה בשמירת הקורס:", error);
            toast('שגיאה בשמירה, נסה שוב.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[500]" onClick={onClose} dir="rtl">
            <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                
                <div className="bg-slate-900 p-6 text-white flex justify-between items-center shrink-0">
                    <h2 className="text-2xl font-black">{initialData ? '✏️ עריכת קורס' : '➕ יצירת קורס חדש'}</h2>
                    <button onClick={onClose} className="text-white/50 hover:text-white text-3xl transition-colors">&times;</button>
                </div>

                <div className="p-8 overflow-y-auto flex-1 space-y-8 bg-slate-50">
                    
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <label className="block font-bold text-slate-700 mb-2">שם הקורס</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            placeholder="מבוא לרובוטיקה ו-AI"
                            className="w-full bg-slate-50 border-2 border-slate-200 p-4 rounded-2xl outline-none focus:border-purple-500 font-bold text-lg transition-colors"
                        />
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <div className="flex justify-between items-end mb-2">
                            <label className="block font-bold text-slate-700">תיאור וסילבוס</label>
                            <button 
                                type="button"
                                onClick={generateDescriptionWithAI}
                                disabled={isGenerating}
                                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50">
                                {isGenerating ? 'מייצר קסמים...' : '✨ נסח לי תיאור עם AI'}
                            </button>
                        </div>
                        <textarea 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            rows="6"
                            placeholder="תאר את הקורס (או תן ל-AI לכתוב עבורך)..."
                            className="w-full bg-slate-50 border-2 border-slate-200 p-4 rounded-2xl outline-none focus:border-purple-500 transition-colors"
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                            <label className="block font-bold text-slate-700 mb-4">שכבות גיל</label>
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <span className="text-xs text-slate-500 font-bold block mb-1">מכיתה</span>
                                    <select value={fromGrade} onChange={e => setFromGrade(e.target.value)} className="w-full p-3 rounded-xl border-2 border-slate-200 bg-slate-50 font-bold">
                                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <span className="text-xs text-slate-500 font-bold block mb-1">עד כיתה</span>
                                    <select value={toGrade} onChange={e => setToGrade(e.target.value)} className="w-full p-3 rounded-xl border-2 border-slate-200 bg-slate-50 font-bold">
                                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                            <label className="block font-bold text-slate-700 mb-4">תחומי דעת (תגיות)</label>
                            <div className="flex flex-wrap gap-2">
                                {availableFields.map(field => {
                                    const isSelected = fields.includes(field);
                                    return (
                                        <button 
                                            key={field}
                                            type="button"
                                            onClick={() => handleFieldToggle(field)}
                                            className={`px-3 py-1.5 rounded-full text-sm font-bold border-2 transition-colors ${isSelected ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                                            {field
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                            <label className="block font-bold text-slate-700 mb-2">קישור לתמונה (קאבר)</label>
                            <input 
                                type="text" 
                                value={image} 
                                onChange={(e) => setImage(e.target.value)} 
                                placeholder="https://..."
                                className="w-full bg-slate-50 border-2 border-slate-200 p-3 rounded-xl outline-none focus:border-purple-500 text-left" dir="ltr"
                            />
                        </div>
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                            <label className="block font-bold text-slate-700 mb-2">קישור לסרטון פרומו</label>
                            <input 
                                type="text" 
                                value={video} 
                                onChange={(e) => setVideo(e.target.value)} 
                                placeholder="https://..."
                                className="w-full bg-slate-50 border-2 border-slate-200 p-3 rounded-xl outline-none focus:border-purple-500 text-left" dir="ltr"
                            />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <label className="block font-bold text-slate-700 mb-2">שיוך פרטני למוסדות</label>
                        <p className="text-xs text-slate-500 mb-4 font-medium">אם לא נבחרו מוסדות, הקורס יהיה פתוח לכל המוסדות שהגדרות הגיל ותחומי הדעת שלהם תואמות לקורס.</p>
                        <div className="max-h-48 overflow-y-auto border-2 border-slate-100 rounded-xl p-2 bg-slate-50 grid grid-cols-2 gap-2">
                            {institutions.map(inst => (
                                <label key={inst.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-100 cursor-pointer hover:bg-purple-50 transition-colors">
                                    <input 
                                        type="checkbox" 
                                        checked={assignedInstitutions.includes(inst.id)} 
                                        onChange={() => handleInstToggle(inst.id)} 
                                        className="w-5 h-5 accent-purple-600 rounded"
                                    />
                                    <span className="font-bold text-slate-700">{inst.name}</span>
                                </label>
                            ))}
                            {(!institutions || institutions.length === 0) && <span className="text-slate-400 font-bold p-2">לא נמצאו מוסדות במערכת.</span>}
                        </div>
                    </div>

                </div>

                <div className="bg-white border-t border-slate-100 p-6 flex justify-end gap-4 shrink-0">
                    <button type="button" onClick={onClose} className="px-8 py-3 rounded-full font-bold text-slate-500 hover:bg-slate-100 transition-colors">
                        ביטול
                    </button>
                    <button 
                        type="button"
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="bg-slate-900 text-white px-10 py-3 rounded-full font-black text-lg hover:bg-purple-600 transition-colors shadow-xl disabled:opacity-50 flex items-center gap-2">
                        {isSaving ? 'שומר...' : '💾 שמירת קורס'}
                    </button>
                </div>
            </div>
        </div>
    );
}
