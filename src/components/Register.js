import React, { useState } from 'react';
import { db, appId } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { LOGO_URL } from '../App';

export default function Register({ onBack, institutions, users, toast, t, lang }) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [institutionId, setInstitutionId] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!firstName || !lastName || !username || !password || !institutionId) {
            return toast(lang === 'he' ? 'אנא מלא את כל השדות' : 'Please fill all fields');
        }

        if (users.find(u => u.username === username)) {
            return toast(lang === 'he' ? 'שם המשתמש כבר קיים במערכת' : 'Username already exists');
        }

        setIsSaving(true);
        const newUserId = `user-${Date.now()}`;
        
        // מנגנון אישור חכם לפי סוג המוסד
        const inst = institutions.find(i => i.id === institutionId);
        const autoApprove = inst?.type === 'פנימי';
        
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', newUserId), {
                firstName,
                lastName,
                username,
                password,
                institutionId,
                role: 'student',
                status: autoApprove ? 'approved' : 'pending',
                createdAt: new Date().toISOString()
            });
            
            if (autoApprove) {
                toast(lang === 'he' ? 'נרשמת בהצלחה! כעת תוכל להתחבר' : 'Registered successfully! Please login');
            } else {
                toast(lang === 'he' ? 'נרשמת בהצלחה! החשבון ממתין לאישור מנהל.' : 'Registered! Pending admin approval.');
            }
            onBack();
        } catch (error) {
            console.error(error);
            toast(lang === 'he' ? 'שגיאה בהרשמה' : 'Registration error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-md flex flex-col items-center relative z-10">
            <img src={LOGO_URL} alt="Logo" className="h-16 mb-6" />
            <h2 className="text-3xl font-black text-slate-800 mb-8 text-center">{t('register_title')}</h2>

            <form onSubmit={handleRegister} className="w-full space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder={t('first_name')} value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-200 p-4 rounded-2xl outline-none focus:border-purple-500 font-bold" />
                    <input type="text" placeholder={t('last_name')} value={lastName} onChange={e => setLastName(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-200 p-4 rounded-2xl outline-none focus:border-purple-500 font-bold" />
                </div>
                
                <input type="text" placeholder={t('username')} value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-200 p-4 rounded-2xl outline-none focus:border-purple-500 font-bold" dir="ltr" />
                
                <input type="password" placeholder={t('password')} value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-200 p-4 rounded-2xl outline-none focus:border-purple-500 font-bold" dir="ltr" />
                
                <select value={institutionId} onChange={e => setInstitutionId(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-200 p-4 rounded-2xl outline-none focus:border-purple-500 font-bold">
                    <option value="">{t('select_institution')}</option>
                    {institutions.map(inst => (
                        <option key={inst.id} value={inst.id}>{inst.name}</option>
                    ))}
                </select>

                <button type="submit" disabled={isSaving} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-lg hover:bg-purple-600 transition-colors shadow-xl mt-4 disabled:opacity-50">
                    {isSaving ? '...' : t('create_account')}
                </button>
            </form>

            <button onClick={onBack} className="mt-8 text-slate-500 font-bold hover:text-purple-600 transition-colors">
                {t('back_to_login')}
            </button>
        </div>
    );
}
