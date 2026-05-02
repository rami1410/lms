import React, { useState } from 'react';
import * as XLSX from 'xlsx';

export default function AdminPanel({ users, institutions, toast, isAdmin, onEditUser, onEditInst }) {
    const exportToExcel = () => {
        const data = users.map(u => ({
            "שם פרטי": u.firstName,
            "שם משפחה": u.lastName,
            "שם משתמש": u.username,
            "סיסמה": u.password,
            "מוסד": institutions.find(i => i.id === u.institutionId)?.name || "לא משויך"
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Students");
        XLSX.writeFile(wb, "Student_List.xlsx");
        toast("הקובץ מוכן להורדה!");
    };

    return (
        <div className="space-y-12 text-right" dir="rtl">
            <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm">
                <h2 className="text-2xl font-black text-emerald-600">ניהול משתמשים</h2>
                <button onClick={exportToExcel} className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-md">📥 ייצוא לאקסל (למורה)</button>
            </div>
            {/* ... שאר הטבלאות מהגרסה הקודמת ... */}
        </div>
    );
}
