import React, { useState } from 'react';
import { db, appId } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function ContactForm() {
    const [formData, setFormData] = useState({
        organization: '',
        fullName: '',
        role: '',
        email: '',
        phone: '',
        notes: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.fullName || !formData.email || !formData.phone) {
            alert('נא למלא שדות חובה: שם מלא, אימייל וטלפון.');
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            if (db) {
                await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'leads'), {
                    ...formData,
                    createdAt: new Date().toISOString(),
                    status: 'new'
                });
            }

            const response = await fetch("https://formspree.io/f/xoqgypzo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    email: formData.email,
                    message: `
                        פנייה חדשה מאתר ה-LMS של רובוטיקס:
                        --------------------------------------
                        שם הארגון/בית הספר: ${formData.organization}
                        שם מלא: ${formData.fullName}
                        תפקיד בארגון: ${formData.role}
                        כתובת אימייל: ${formData.email}
                        טלפון לחזרה: ${formData.phone}
                        
                        משהו נוסף שחשוב שנדע?
                        ${formData.notes || 'לא הוזן תוכן נוסף.'}
                    `
                })
            });

            if (response.ok) {
                setSubmitStatus('success');
                setFormData({ organization: '', fullName: '', role: '', email: '', phone: '', notes: '' });
            } else {
                throw new Error('Server Error');
            }
        } catch (error) {
            console.error("Error:", error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="contact" className="bg-white py-12 px-4 border-t border-slate-100 w-full">
            <div className="max-w-xl mx-auto space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
                        נשמח לקבל כמה פרטים בסיסיים
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 w-full">
                    <input type="text" name="organization" value={formData.organization} onChange={handleChange} placeholder="שם הארגון" className="w-full bg-white border-2 border-slate-800 p-4 rounded-xl outline-none font-bold text-slate-700 text-right text-sm md:text-base focus:border-cyan-500" />
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="שם מלא *" required className="w-full bg-white border-2 border-slate-800 p-4 rounded-xl outline-none font-bold text-slate-700 text-right text-sm md:text-base focus:border-cyan-500" />
                    <input type="text" name="role" value={formData.role} onChange={handleChange} placeholder="תפקיד בארגון" className="w-full bg-white border-2 border-slate-800 p-4 rounded-xl outline-none font-bold text-slate-700 text-right text-sm md:text-base focus:border-cyan-500" />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="כתובת אימייל *" required className="w-full bg-white border-2 border-slate-800 p-4 rounded-xl outline-none font-bold text-slate-700 text-left text-sm md:text-base focus:border-cyan-500" dir="ltr" />
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="טלפון *" required className="w-full bg-white border-2 border-slate-800 p-4 rounded-xl outline-none font-bold text-slate-700 text-right text-sm md:text-base focus:border-cyan-500" />
                    <textarea name="notes" value={formData.notes} onChange={handleChange} rows="4" placeholder="משהו נוסף שחשוב שנדע?" className="w-full bg-white border-2 border-slate-800 p-4 rounded-xl outline-none font-bold text-slate-700 text-right text-sm md:text-base focus:border-cyan-500 resize-none" />

                    {submitStatus === 'success' && (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl font-bold text-center text-sm">
                            ✓ הפנייה נשלחה בהצלחה! העתק נשלח ל-rami@robotix.co.il
                        </div>
                    )}
                    {submitStatus === 'error' && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl font-bold text-center text-sm">
                            ✕ שגיאה בשליחת המידע. נא לנסות שנית.
                        </div>
                    )}

                    <div className="flex justify-center pt-2">
                        <button type="submit" disabled={isSubmitting} className="bg-cyan-500 hover:bg-cyan-600 text-white font-black text-lg md:text-xl py-3.5 rounded-full shadow-xl hover:scale-105 transition-all disabled:opacity-50 w-full sm:w-64 text-center cursor-pointer">
                            {isSubmitting ? 'שולח...' : 'שליחה'}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}
