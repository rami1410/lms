import React, { useState, useEffect } from 'react';

export default function Accessibility() {
    const [accOpen, setAccOpen] = useState(false);
    const [accSettings, setAccSettings] = useState({ contrast: false, largeText: false, highlightLinks: false });

    const toggleAcc = (key) => {
        setAccSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // שליטה בגודל הטקסט הכללי של האתר דרך ה-body
    useEffect(() => {
        if (accSettings.largeText) {
            document.body.classList.add('text-lg');
        } else {
            document.body.classList.remove('text-lg');
        }
    }, [accSettings.largeText]);

    return (
        <>
            <style>{`
                ${accSettings.contrast ? `
                    .bg-white, .bg-slate-50, .bg-gray-50 { background-color: #121212 !important; color: #fff !important; border-color: #333 !important; }
                    .text-slate-600, .text-gray-600, .text-gray-500, .text-slate-800, .text-chotam-black { color: #fff !important; }
                    p, h1, h2, h3, h4, span { color: #fff !important; text-shadow: none !important; }
                    .category-content, .personal-box { background: rgba(0,0,0,0.9) !important; }
                    .marquee-container { background: #000 !important; border-color: #333 !important; }
                    .partner-logo { background: #222 !important; border-color: #444 !important; }
                ` : ''}
                ${accSettings.highlightLinks ? `
                    a, button { text-decoration: underline !important; font-weight: 900 !important; }
                ` : ''}
            `}</style>

            <div className="fixed bottom-6 left-6 z-[6000] no-print" dir="rtl">
                {accOpen && (
                    <div className="bg-white p-6 rounded-2xl shadow-2xl border border-slate-100 mb-4 w-64 text-right">
                        <h4 className="font-bold text-slate-800 border-b pb-2 mb-4">תפריט נגישות ♿</h4>
                        <div className="space-y-4">
                            <label className="flex items-center justify-between cursor-pointer group">
                                <span className="text-sm font-semibold text-slate-700 group-hover:text-[#46bad1]">ניגודיות גבוהה</span>
                                <input type="checkbox" checked={accSettings.contrast} onChange={() => toggleAcc('contrast')} className="w-5 h-5 accent-[#46bad1]" />
                            </label>
                            <label className="flex items-center justify-between cursor-pointer group">
                                <span className="text-sm font-semibold text-slate-700 group-hover:text-[#46bad1]">טקסט מוגדל</span>
                                <input type="checkbox" checked={accSettings.largeText} onChange={() => toggleAcc('largeText')} className="w-5 h-5 accent-[#46bad1]" />
                            </label>
                            <label className="flex items-center justify-between cursor-pointer group">
                                <span className="text-sm font-semibold text-slate-700 group-hover:text-[#46bad1]">הדגשת קישורים</span>
                                <input type="checkbox" checked={accSettings.highlightLinks} onChange={() => toggleAcc('highlightLinks')} className="w-5 h-5 accent-[#46bad1]" />
                            </label>
                        </div>
                    </div>
                )}
                <button 
                    onClick={() => setAccOpen(!accOpen)}
                    className="bg-[#1a1a1a] text-white w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-xl hover:scale-110 transition border-2 border-white"
                    title="אפשרויות נגישות">
                    ♿
                </button>
            </div>
        </>
    );
}
