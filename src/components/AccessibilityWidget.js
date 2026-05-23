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
                html { font-size: 115% !important; }
            `;
        }

        if (highlightLinks) {
            // הדגשת קישורים וכפתורים בצורה בולטת
            css += `
                a, button, [role="button"], input[type="submit"], select {
                    text-decoration: underline !important;
                    text-decoration-thickness: 3px !important;
                    text-underline-offset: 4px !important;
                    color: #2563eb !important;
                    border-color: #2563eb !important;
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
                    className="absolute bottom-20 left-0 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 w-72 border border-slate-200/50 animate-in fade-in slide-in-from-bottom-4"
                >
                    <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                        <h2 className="text-xl font-black text-slate-800">התאמת נגישות</h2>
                        <button 
                            onClick={() => setIsOpen(false)} 
                            className="text-slate-400 hover:text-slate-700 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100"
                            aria-label="סגור תפריט"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>

                    <div className="space-y-4">
                        <label className="flex items-center justify-between cursor-pointer group py-2">
                            <span className="font-bold text-slate-700 text-base group-hover:text-blue-600 transition-colors">ניגודיות גבוהה</span>
                            <input
                                type="checkbox"
                                checked={highContrast}
                                onChange={(e) => setHighContrast(e.target.checked)}
                                className="w-5 h-5 rounded border-slate-300 accent-blue-600 cursor-pointer"
                            />
                        </label>

                        <label className="flex items-center justify-between cursor-pointer group py-2">
                            <span className="font-bold text-slate-700 text-base group-hover:text-blue-600 transition-colors">טקסט מוגדל</span>
                            <input
                                type="checkbox"
                                checked={largeText}
                                onChange={(e) => setLargeText(e.target.checked)}
                                className="w-5 h-5 rounded border-slate-300 accent-blue-600 cursor-pointer"
                            />
                        </label>

                        <label className="flex items-center justify-between cursor-pointer group py-2">
                            <span className="font-bold text-slate-700 text-base group-hover:text-blue-600 transition-colors">הדגשת קישורים</span>
                            <input
                                type="checkbox"
                                checked={highlightLinks}
                                onChange={(e) => setHighlightLinks(e.target.checked)}
                                className="w-5 h-5 rounded border-slate-300 accent-blue-600 cursor-pointer"
                            />
                        </label>
                    </div>
                </div>
            )}

            {/* כפתור הנגישות הצף בעיצוב מודרני ואלגנטי */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-label="פתח תפריט נגישות"
                className="bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl transition-all hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="4" r="2"></circle>
                    <path d="M4 9h16"></path>
                    <path d="M12 9v8"></path>
                    <path d="M8 22l4-5 4 5"></path>
                </svg>
            </button>
        </div>
    );
}
