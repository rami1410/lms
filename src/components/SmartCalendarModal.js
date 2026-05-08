import React, { useState, useRef } from 'react';

export default function SmartCalendarModal({ onClose, toast, geminiKey }) {
    const [inputText, setInputText] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageBase64, setImageBase64] = useState(null);
    const [loading, setLoading] = useState(false);
    const [aiResult, setAiResult] = useState(null);
    const fileInputRef = useRef(null);

    // המרת התמונה לפורמט ש-Gemini יודע לקרוא
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(URL.createObjectURL(file));
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result.split(',')[1];
                setImageBase64({
                    inlineData: { data: base64String, mimeType: file.type }
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const analyzeEvent = async () => {
        if (!inputText.trim() && !imageBase64) return toast("אנא הזן טקסט או העלה תמונה של האירוע.");
        const key = geminiKey ? String(geminiKey).trim() : "";
        if (!key || key === "undefined") return toast("שגיאה: מפתח AI חסר.");

        setLoading(true);
        try {
            // שולפים את התאריך של היום כדי לתת ל-AI קונטקסט
            const today = new Date();
            const currentYear = today.getFullYear();
            const currentDate = today.toLocaleDateString('he-IL');

            const prompt = `אתה עוזר חכם לחילוץ פרטי אירועים.
            התאריך היום: ${currentDate}, שנת ${currentYear}.
            נתח את הטקסט או התמונה וחלץ את פרטי האירוע. 
            אם לא צוינה שנת האירוע, השתמש בשנת ${currentYear}. 
            אם לא צוינה שעת סיום, הנח שהאירוע נמשך שעה.
            
            חובה להחזיר את המידע לפי המבנה הבא:
            {
                "title": "שם האירוע",
                "description": "תיאור ופרטים חשובים (השאר ריק אם אין)",
                "location": "מיקום האירוע (השאר ריק אם אין)",
                "startDate": "YYYYMMDD",
                "startTime": "HHMMSS",
                "endDate": "YYYYMMDD",
                "endTime": "HHMMSS"
            }
            
            הקפד להחזיר תאריכים ושעות כמספרים רצופים בלבד (ללא מקפים או נקודתיים).
            טקסט המשתמש: "${inputText}"`;

            const contents = [{ parts: [{ text: prompt }] }];
            if (imageBase64) {
                contents[0].parts.push(imageBase64);
            }

            // קריאה מאובטחת עם נעילה למצב JSON בלבד (JSON Mode)
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${key}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    contents,
                    generationConfig: {
                        responseMimeType: "application/json"
                    }
                })
            });
            
            const result = await res.json();

            if (result.error) throw new Error(result.error.message);

            // בגלל מצב ה-JSON, אנחנו מקבלים נתונים נקיים לחלוטין
            const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
            const parsedData = JSON.parse(rawText);

            setAiResult(parsedData);

        } catch (e) {
            console.error("AI Error Details:", e);
            toast("הייתה בעיה בפענוח האירוע. ודא שהתמונה או הטקסט ברורים.");
        } finally {
            setLoading(false);
        }
    };

    // בניית קישור שפותח את גוגל יומן עם כל הפרטים (עם מנקה שגיאות אגרסיבי)
    const generateGoogleCalendarUrl = (eventData) => {
        // פונקציה שמנקה כל דבר שהוא לא מספר, למקרה שה-AI כתב מקפים בטעות
        const clean = (str) => (str ? String(str).replace(/\D/g, "") : "");
        
        const startDate = clean(eventData.startDate).padEnd(8, '0').slice(0, 8);
        const startTime = clean(eventData.startTime).padEnd(6, '0').slice(0, 6);
        let endDate = clean(eventData.endDate).padEnd(8, '0').slice(0, 8);
        const endTime = clean(eventData.endTime).padEnd(6, '0').slice(0, 6);
        
        // אם ה-AI לא הצליח להבין תאריך סיום, ניקח את תאריך ההתחלה
        if (!endDate || endDate.length < 8) endDate = startDate;
        
        const start = `${startDate}T${startTime}`;
        const end = `${endDate}T${endTime}`;
        
        const url = new URL('https://calendar.google.com/calendar/render');
        url.searchParams.append('action', 'TEMPLATE');
        url.searchParams.append('text', eventData.title || 'אירוע חדש');
        url.searchParams.append('dates', `${start}/${end}`);
        
        if (eventData.description) url.searchParams.append('details', eventData.description);
        if (eventData.location) url.searchParams.append('location', eventData.location);
        
        return url.toString();
    };

    const handleCreateEvent = () => {
        const url = generateGoogleCalendarUrl(aiResult);
        window.open(url, '_blank');
        toast("האירוע נפתח ביומן גוגל בהצלחה!");
        onClose();
    };

    // פונקציה לתצוגה יפה של התאריך למשתמש (בטוחה מפני קריסות)
    const displayDate = (rawDate, rawTime) => {
        if (!rawDate || !rawTime) return 'לא צוין';
        const d = String(rawDate).replace(/\D/g, "");
        const t = String(rawTime).replace(/\D/g, "");
        
        if (d.length >= 8 && t.length >= 4) {
            return `${d.slice(6,8)}/${d.slice(4,6)}/${d.slice(0,4)} בשעה ${t.slice(0,2)}:${t.slice(2,4)}`;
        }
        return `${rawDate} ${rawTime}`;
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[300]" onClick={onClose}>
            <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-10 overflow-y-auto max-h-[95vh] text-right" dir="rtl" onClick={e => e.stopPropagation()}>
                
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <div className="flex items-center gap-3">
                        <svg className="w-10 h-10 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5z"/>
                        </svg>
                        <h2 className="text-3xl font-black text-slate-800">הוספת אירוע בקסם</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-300 text-4xl hover:text-red-500 transition-colors">&times;</button>
                </div>

                {!aiResult ? (
                    <div className="space-y-6">
                        <p className="text-slate-600 font-bold">
                            הדבק טקסט, קישור, או העלה תמונה של הזמנה/לוז. ה-AI יחלץ את כל הפרטים וייצור עבורך אירוע מסודר ביומן גוגל.
                        </p>
                        
                        <textarea 
                            className="w-full p-4 bg-slate-50 rounded-2xl border-2 min-h-[100px] outline-none focus:border-blue-500 font-medium"
                            placeholder="הדבק לכאן את הודעת הוואטסאפ או הטקסט..."
                            value={inputText}
                            onChange={e => setInputText(e.target.value)}
                        />

                        <div 
                            onClick={() => fileInputRef.current.click()}
                            className="w-full p-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer flex flex-col items-center justify-center text-center group"
                        >
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                            {selectedImage ? (
                                <img src={selectedImage} alt="Preview" className="max-h-40 rounded-xl shadow-md mx-auto" />
                            ) : (
                                <>
                                    <span className="text-4xl mb-2 group-hover:scale-110 transition-transform block">📸</span>
                                    <span className="font-bold text-slate-500 group-hover:text-blue-600">לחץ להעלאת תמונת הזמנה או צילום מסך</span>
                                </>
                            )}
                        </div>

                        <button 
                            onClick={analyzeEvent} 
                            disabled={loading || (!inputText && !imageBase64)}
                            className="w-full bg-blue-600 text-white py-4 rounded-[2rem] font-black text-xl hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-3 shadow-lg">
                            {loading ? '🤖 מפענח את האירוע...' : '✨ צור אירוע אוטומטית'}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="bg-blue-50 p-6 rounded-3xl border-2 border-blue-100 space-y-4">
                            <h3 className="font-black text-blue-800 text-2xl mb-4 border-b border-blue-200 pb-2">וידוא פרטים:</h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-slate-500 font-bold">שם האירוע</p>
                                    <p className="font-black text-lg text-slate-800">{aiResult.title}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 font-bold">מיקום</p>
                                    <p className="font-bold text-slate-800">{aiResult.location || 'לא צוין'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 font-bold">תאריך התחלה</p>
                                    <p className="font-bold text-slate-800">{displayDate(aiResult.startDate, aiResult.startTime)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 font-bold">תאריך סיום</p>
                                    <p className="font-bold text-slate-800">{displayDate(aiResult.endDate, aiResult.endTime)}</p>
                                </div>
                            </div>
                            
                            <div className="pt-2">
                                <p className="text-sm text-slate-500 font-bold">תיאור</p>
                                <p className="text-slate-700 font-medium">{aiResult.description || 'ללא תיאור'}</p>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button onClick={() => setAiResult(null)} className="flex-1 py-4 rounded-[2rem] font-black bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                                חזור לתיקון
                            </button>
                            <button onClick={handleCreateEvent} className="flex-[2] py-4 rounded-[2rem] font-black bg-blue-600 text-white hover:bg-blue-700 shadow-xl active:scale-95 transition-all flex justify-center items-center gap-2">
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5z"/>
                                </svg>
                                פתח ביומן גוגל ושמור
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
