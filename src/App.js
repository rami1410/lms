// ... (אותם Imports כמו קודם)

export const APP_VERSION = "2.02"; // עדכון גרסה

export default function App() {
    // ... (אותם States כמו קודם)

    return (
        <div dir="rtl" className={`min-h-screen ${currentUser ? 'bg-white text-slate-900' : 'bg-slate-950 text-white'}`}>
            <div className="fixed bottom-4 left-4 text-white text-[10px] font-black z-50 drop-shadow-md">V {APP_VERSION}</div>
            
            {!currentUser ? (
                <div className="relative min-h-screen flex items-center justify-center p-4">
                    {/* רקע וידאו */}
                    <div className="fixed inset-0 z-0 pointer-events-none">
                        <iframe className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[115vw] h-[115vh] opacity-50 scale-125" src={`https://www.youtube.com/embed/${BACKGROUND_VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${BACKGROUND_VIDEO_ID}&controls=0&start=30`} frameBorder="0" />
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
                    </div>

                    {!isRegistering ? (
                        <Login onLogin={handleLogin} onRegisterToggle={()=>setIsRegistering(true)} lang={lang} setLang={setLang} t={t} playBoom={playBoom} />
                    ) : (
                        /* הוספתי כאן את users={localUsers} */
                        <Register 
                            onBack={()=>setIsRegistering(false)} 
                            institutions={localInstitutions} 
                            users={localUsers} 
                            toast={showToast} 
                            playBoom={playBoom} 
                        />
                    )}
                </div>
            ) : (
                /* ... שאר הקוד של ה-Dashboard נשאר זהה */
            )}
            
            {/* ... שאר הקוד נשאר זהה */}
        </div>
    );
}
