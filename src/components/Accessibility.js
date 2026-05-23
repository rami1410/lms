import React, { useState, useEffect } from 'react';

export default function AccessibilityWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [highContrast, setHighContrast] = useState(false);
    const [largeText, setLargeText] = useState(false);
    const [highlightLinks, setHighlightLinks] = useState(false);

    // טעינת הגדרות נגישות מהזיכרון של הדפדפן (כדי שלא יתאפסו ברענון)
    useEffect(() => {
        const saved = localStorage.getItem('accessibilityPrefs');
        if (saved) {
            const prefs = JSON.parse(saved);
            setHighContrast(prefs.highContrast || false);
            setLargeText(prefs.largeText || false);
            setHighlightLinks(prefs.highlightLinks || false);
        }
    }, []);

    // יישום הגדרות ושמירה בכל פעם שהן משתנות
    useEffect(() => {
        localStorage.setItem('accessibilityPrefs', JSON.stringify({ highContrast, largeText, highlightLinks }));

        const cssId = 'accessibility-styles';
        let styleEl = document.getElementById(cssId);

        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = cssId;
            document.head.appendChild(styleEl);
        }

        // תקן נגישות AA מחייב פוקוס ויזואלי ברור לניווט עם מקלדת (Tab)
        let css = `
            *:focus-visible {
                outline: 3px solid #ffbf47 !important;
                outline-offset: 2px !important;
            }
        `;

        if (highContrast) {
            // הפיכת צבעים חכמה - שומרת על תמונות ווידאו בצבעם המקורי
            css += `
                html { filter: invert(100%) hue-rotate(180deg) contrast(150%) !important; background: #fff !important; }
                img, video, iframe, .preserve-color { filter: invert(100%) hue-rotate(180deg) !important; }
            `;
        }

        if (largeText) {
            // הגדלת כל הטקסט באתר באופן פרופורציונלי
            css += `
                html { font-size: 120% !important; }
            `;
        }

        if (highlightLinks) {
            // הדגשת קישורים וכפתורים בצורה בולטת
            css += `
                a, button, [role="button"], input[type="submit"] {
                    text-decoration: underline !important;
                    text-decoration-thickness: 3px !important;
                    text-underline-offset: 4px !important;
                    color: #0056b3 !important;
                    border-color: #0056b3 !important;
                }
            `;
        }

        styleEl.innerHTML = css;

        // סגירת תפריט עם כפתור ESC (חובה לתקן נגישות)
        const handleEsc = (e) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);

    }, [highContrast, largeText, highlightLinks]);

    return (
        <div className="fixed bottom-6 left-6 z-[9999]" dir="rtl">
            {/* תפריט הנגישות עצמו */}
            {isOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="תפריט נגישות"
                    className="absolute bottom-20 left-0 bg-white rounded-3xl shadow-2xl p-6 w-80 border border-slate-100 animate-in fade-in slide-in-from-bottom-4"
                >
                    <div className="flex items-center justify-end gap-3 mb-6 border-b border-slate-100 pb-4">
                        <h2 className="text-xl font-black text-slate-800">תפריט נגישות</h2>
                        <div className="bg-blue-600 text-white p-1.5 rounded-lg" aria-hidden="true">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12,2C13.1,2 14,2.9 14,4C14,5.1 13.1,6 12,6C10.9,6 10,5.1 10,4C10,2.9 10.9,2 12,2M8,22V17.5L10.3,15L8.5,9.4L6.1,10.1C6,11.2 5.3,12 4.1,12C3.1,12 2.2,11.2 2.2,10.2C2.2,9.1 3.1,8.3 4.1,8.3C4.8,8.3 5.4,8.7 5.7,9.2L8.2,8.4C8.6,8.2 9,8.4 9.2,8.8L11,14.6L14,12V8H16V13L12.5,15.6L13.1,17.5H18V22H16V19.1L14,18.4L13.1,22H8Z" /></svg>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="flex items-center justify-between cursor-pointer group py-2">
                            <span className="font-bold text-slate-700 text-lg group-hover:text-blue-600 transition-colors">ניגודיות גבוהה</span>
                            <input
                                type="checkbox"
                                checked={highContrast}
                                onChange={(e) => setHighContrast(e.target.checked)}
                                className="w-6 h-6 rounded border-slate-300 accent-blue-600 focus:ring-4 focus:ring-blue-500/30 cursor-pointer"
                                aria-label="הפעל ניגודיות גבוהה"
                            />
                        </label>

                        <label className="flex items-center justify-between cursor-pointer group py-2">
                            <span className="font-bold text-slate-700 text-lg group-hover:text-blue-600 transition-colors">טקסט מוגדל</span>
                            <input
                                type="checkbox"
                                checked={largeText}
                                onChange={(e) => setLargeText(e.target.checked)}
                                className="w-6 h-6 rounded border-slate-300 accent-blue-600 focus:ring-4 focus:ring-blue-500/30 cursor-pointer"
                                aria-label="הפעל טקסט מוגדל"
                            />
                        </label>

                        <label className="flex items-center justify-between cursor-pointer group py-2">
                            <span className="font-bold text-slate-700 text-lg group-hover:text-blue-600 transition-colors">הדגשת קישורים</span>
                            <input
                                type="checkbox"
                                checked={highlightLinks}
                                onChange={(e) => setHighlightLinks(e.target.checked)}
                                className="w-6 h-6 rounded border-slate-300 accent-blue-600 focus:ring-4 focus:ring-blue-500/30 cursor-pointer"
                                aria-label="הפעל הדגשת קישורים"
                            />
                        </label>
                    </div>
                    
                    <button
                       onClick={() => setIsOpen(false)}
                       className="w-full mt-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors focus:ring-4 focus:ring-slate-300"
                       aria-label="סגור תפריט נגישות"
                    >
                        סגור
                    </button>
                </div>
            )}

            {/* כפתור הנגישות הצף */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-label="פתח תפריט נגישות"
                className="bg-slate-900 hover:bg-slate-800 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-105 border-4 border-white focus:outline-none focus:ring-4 focus:ring-blue-500"
            >
                <div className="bg-blue-600 p-2.5 rounded-lg">
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M12,2C13.1,2 14,2.9 14,4C14,5.1 13.1,6 12,6C10.9,6 10,5.1 10,4C10,2.9 10.9,2 12,2M8,22V17.5L10.3,15L8.5,9.4L6.1,10.1C6,11.2 5.3,12 4.1,12C3.1,12 2.2,11.2 2.2,10.2C2.2,9.1 3.1,8.3 4.1,8.3C4.8,8.3 5.4,8.7 5.7,9.2L8.2,8.4C8.6,8.2 9,8.4 9.2,8.8L11,14.6L14,12V8H16V13L12.5,15.6L13.1,17.5H18V22H16V19.1L14,18.4L13.1,22H8Z" /></svg>
                </div>
            </button>
        </div>
    );
}
