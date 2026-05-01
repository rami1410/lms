import React from 'react';

const heToEnMap = { '/': 'q', '\'': 'w', 'ק': 'e', 'ר': 'r', 'א': 't', 'ט': 'y', 'ו': 'u', 'ן': 'i', 'ם': 'o', 'פ': 'p', 'ש': 'a', 'ד': 's', 'ג': 'd', 'כ': 'f', 'ע': 'g', 'י': 'h', 'ח': 'j', 'ל': 'k', 'ך': 'l', 'ז': 'z', 'ס': 'x', 'ב': 'c', 'ה': 'v', 'נ': 'b', 'מ': 'n', 'צ': 'm' };

export default function SafeInput({ value, onChange, placeholder, type = "text", playBoom, className }) {
    const handleChange = (e) => {
        let val = e.target.value;
        let cleaned = "";
        let error = false;
        for (let char of val) {
            let lowerChar = char.toLowerCase();
            if (heToEnMap[char]) { cleaned += heToEnMap[char]; }
            else if (/[a-z0-9]/.test(lowerChar)) { cleaned += lowerChar; }
            else { error = true; }
        }
        if (error && playBoom) playBoom();
        onChange(cleaned);
    };

    return (
        <input 
            type={type} 
            placeholder={placeholder} 
            value={value} 
            onChange={handleChange} 
            className={className}
        />
    );
}
