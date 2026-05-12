import React, { useState, useEffect, useRef } from 'react';

export default function FloatingBot({ geminiKey }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'היי! אני עוזר הלמידה החכם של האתר. 🤖\nאפשר לעזור לך למצוא קורס או לענות על שאלה?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    
    const messagesEndRef = useRef(null);

    // === מנגנון הקלדה ומחיקה אוטומטית (Typewriter Effect) ===
    const [placeholder, setPlaceholder] = useState('');
    const [promptIndex, setPromptIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // הרעיונות שהבוט "מקליד" כדי לעודד אנשים
    const prompts = [
        "איך מחברים את המיקרוביט?",
        "איזה קורס מתאים למתחילים?",
        "אפשר הסבר על חיישן מרחק?",
        "יש לך שאלה? אני כאן..."
    ];

    useEffect(() => {
        const currentPrompt = prompts[promptIndex];
        const typeSpeed = isDeleting ? 40 : 100; // מחיקה מהירה יותר מהקלדה
        
        // כמה זמן לחכות כשהמשפט שלם או כשהוא נמחק לגמרי
        const delay = placeholder === currentPrompt && !isDeleting ? 2000 : (placeholder === '' && isDeleting ? 500 : typeSpeed);

        const timeout = setTimeout(() => {
            if (!isDeleting && placeholder !== currentPrompt) {
                setPlaceholder(currentPrompt.slice(0, placeholder.length + 1));
            } else if (isDeleting && placeholder !== '') {
                setPlaceholder(currentPrompt.slice(0, placeholder.length - 1));
            } else if (!isDeleting && placeholder === currentPrompt) {
                setIsDeleting(true);
            } else if (isDeleting && placeholder === '') {
                setIsDeleting(false);
                setPromptIndex((prev) => (prev + 1) % prompts.length);
            }
        }, delay);

        return () => clearTimeout(timeout);
    }, [placeholder, isDeleting, promptIndex]);

    // גלילה אוטומטית להודעה האחרונה
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !geminiKey) return;
        
        const userText = input.trim();
        setMessages(prev => [...prev, { role: 'user', text: userText }]);
        setInput('');
        setLoading(true);

        try {
            const prompt = `אתה עוזר למידה פדגוגי באתר קורסים לרובוטיקה וטכנולוגיה. 
            ענה תמיד בעברית, בסבר פנים יפות, קצר ולעניין (עד 3 משפטים). 
            שאלת המשתמש: "${userText}"`;

            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const data = await res.json();
            
            if (data.error) throw new Error(data.error.message);
            
            const botText = data.candidates[0].content.parts[0].text;
            setMessages(prev => [...prev, { role: 'bot', text: botText }]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'bot', text: 'מצטער, חוויתי תקלה קטנה בחיבור. אפשר לנסות שוב?' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[500] flex flex-col items-end" dir="rtl">
            
            {/* חלון הצ'אט (מוצג רק כשהוא פתוח) */}
            {isOpen && (
                <div className="bg-white w-[350px] h-[500px] mb-4 rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
                    {/* כותרת עליונה */}
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white flex justify-between items-center shadow-md z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl backdrop-blur-sm">🤖</div>
                            <div>
                                <h3 className="font-black text-lg leading-tight">בוט ייעוץ</h3>
                                <p className="text-xs text-purple-100 font-bold">מחובר ומוכן לעזור</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 p-2 rounded-full transition-colors">&times;</button>
                    </div>

                    {/* אזור ההודעות */}
                    <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm font-medium leading-relaxed whitespace-pre-wrap shadow-sm ${msg.role === 'user' ? 'bg-purple-100 text-purple-900 rounded-tr-none border border-purple-200' : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-end">
                                <div className="bg-white border border-slate-200 text-slate-500 p-3 rounded-2xl rounded-tl-none flex gap-1 shadow-sm">
                                    <span className="animate-bounce">.</span><span className="animate-bounce" style={{animationDelay: '0.2s'}}>.</span><span className="animate-bounce" style={{animationDelay: '0.4s'}}>.</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* אזור ההקלדה */}
                    <div className="p-4 bg-white border-t border-slate-100">
                        <div className="flex relative">
                            <input 
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder={placeholder}
                                className="w-full bg-slate-100 text-slate-800 rounded-full pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium text-sm"
                            />
                            <button 
                                onClick={handleSend}
                                disabled={loading || !input.trim()}
                                className="absolute left-1 top-1 bottom-1 bg-purple-600 text-white w-10 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors disabled:bg-slate-300">
                                ⇧
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* כפתור הפתיחה הצף */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="bg-slate-900 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-3xl hover:scale-110 active:scale-95 transition-all hover:bg-purple-600 border-4 border-white">
                {isOpen ? '×' : '💬'}
            </button>
        </div>
    );
}
