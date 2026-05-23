import React from 'react';
import ThreeBackground from './ThreeBackground';
import Accessibility from './Accessibility';
import LandingHeader from './LandingHeader';
import LandingContent from './LandingContent';
import { LOGO_URL } from '../App';

export default function LandingPage({ onLoginClick }) {
    const catalogUrl = "https://heyzine.com/flip-book/426cdf50eb.html";

    return (
        <div className="antialiased font-sans relative bg-white" dir="rtl">
            <ThreeBackground />
            <Accessibility />
            
            <style>{`
                body { scroll-behavior: smooth; overflow-x: hidden; }
                .section-strip { position: relative; min-height: 100vh; display: flex; align-items: center; padding: 5rem 0; z-index: 20; }
                .category-content { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(10px); border-radius: 2rem; transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1); opacity: 0; transform: translateX(100px); }
                .category-content.visible { opacity: 1; transform: translateX(0); }
                .category-image-wrapper { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.2); border-radius: 2rem; overflow: hidden; opacity: 0; transform: scale(0.8); transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
                .category-image-wrapper.visible { opacity: 1; transform: scale(1); }
                
                .marquee-container { width: 100%; overflow: hidden; padding: 3rem 0; background: #fff; border-top: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0; }
                .marquee-track { display: flex; width: max-content; animation: scroll-left 40s linear infinite; }
                @keyframes scroll-left { 0% { transform: translateX(0); } 100% { transform: translateX(50%); } }
                .partner-logo { width: 140px; height: 140px; margin: 0 40px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(0,0,0,0.05); flex-shrink: 0; padding: 15px; border: 1px solid #eee; }
                .partner-logo img { max-width: 90%; max-height: 90%; object-fit: contain; }
                
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 5000; backdrop-filter: blur(15px); align-items: center; justify-content: center; }
                .modal-content { background: white; padding: 3rem; border-radius: 2.5rem; max-width: 600px; width: 90%; position: relative; animation: modalIn 0.4s ease-out; }
                @keyframes modalIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
                
                .scroll-indicator { position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); text-align: center; color: #1a1a1a; opacity: 0.6; animation: bounce 2s infinite; cursor: pointer; }
                @keyframes bounce { 0%, 20%, 50%, 80%, 100% {transform: translateY(0) translateX(-50%);} 40% {transform: translateY(-10px) translateX(-50%);} 60% {transform: translateY(-5px) translateX(-50%);} }
                
                .personal-box { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; border: 1px solid #f0f0f0; }
                .personal-box:hover { transform: translateY(-10px); border-color: #2bb2c4; box-shadow: 0 20px 40px rgba(43,178,196,0.2); }
                
                /* עודכנו בדיוק לצבעי המותג מהלוגו שהעלת */
                .text-chotam-teal { color: #2bb2c4; } .bg-chotam-teal { background-color: #2bb2c4; } .border-chotam-teal { border-color: #2bb2c4; }
                .text-chotam-green { color: #99ca3c; } .bg-chotam-green { background-color: #99ca3c; } .border-chotam-green { border-color: #99ca3c; }
                .text-chotam-yellow { color: #ffcc00; } .bg-chotam-yellow { background-color: #ffcc00; } .border-chotam-yellow { border-color: #ffcc00; }
                .text-chotam-orange { color: #f7941d; } .bg-chotam-orange { background-color: #f7941d; } .border-chotam-orange { border-color: #f7941d; }
                .text-chotam-red { color: #f15a24; } .bg-chotam-red { background-color: #f15a24; } .border-chotam-red { border-color: #f15a24; }
                .text-chotam-black { color: #1a1a1a; } .bg-chotam-black { background-color: #1a1a1a; }
                
                @media print {
                    @page { size: A4; margin: 20mm; }
                    body { background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .no-print { display: none !important; }
                    .print-only { display: block !important; }
                    .print-break-inside-avoid { page-break-inside: avoid; }
                    .shadow-xl, .shadow-2xl, .shadow-sm { box-shadow: none !important; border: 1px solid #e2e8f0; }
                    canvas { display: none !important; }
                }
                .print-only { display: none; }
            `}</style>

            {/* כותרת מיוחדת שמופיעה רק ב-PDF */}
            <div className="print-only text-center mb-10 pb-6 border-b-4 border-chotam-teal">
                <img src={LOGO_URL} alt="חותם חיים" className="h-24 mx-auto mb-4" />
                <h1 className="text-4xl font-black text-slate-900 mb-2">סיכום פעילות וקטלוג - חותם חיים</h1>
                <p className="text-xl text-slate-600">מערכת למידה חדשנית מבית רובוטיקס</p>
                <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="font-bold text-lg mb-2">לצפייה בקטלוג המלא והאינטראקטיבי שלנו סרקו את הקוד או היכנסו לקישור:</p>
                    <a href={catalogUrl} className="text-chotam-teal font-bold" dir="ltr">{catalogUrl}</a>
                </div>
            </div>

            <LandingHeader onLoginClick={onLoginClick} />
            <LandingContent />
        </div>
    );
}
