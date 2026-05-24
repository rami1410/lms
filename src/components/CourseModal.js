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
        const prompt = `
            אתה ממוחה לפדגוגיה חדשנית בחברת "חותם חיים מבית רובוטיקס".
            כתוב תיאור שיווקי, מרתק ומקצועי (עד 4-5 פסקאות קצרות) עבור קורס בשם: "${name}".
            הקורס מיועד לתלמידים מכיתה ${fromGrade} עד ${toGrade}.
            תחומי הדעת של הקורס הם: ${fields.length > 0 ? fields.join(', ') : 'טכנולוגיה וחדשנות'}.
            התיאור צריך לפנות למורים, מנהלים ותלמידים, ולהדגיש פיתוח לומד עצמאי וכישורי המאה ה-21.
            ענה בעברית תקנית בלבד.
        `;

        try {
            // עודכן למודל הרשמי והזמין הנתמך כיום על ידי גוגל למניעת שגיאת קומפילציה/ריצה
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
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
                    <h2 className="text-2
