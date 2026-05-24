import React, { useState, useEffect, useRef } from 'react';

export default function LessonEditor({ activeLesson, setActiveLesson, isEditMode, lessons, setLessons, saveChanges, duplicateActiveLesson, deleteActiveLesson, toggleComplete, userProgress, getLessonIcon }) {
    
    // מצבי ניהול עבור נגן הוידאו המאובטח והמותאם אישית שלנו
    const playerRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);

    useEffect(() => {
        if (!activeLesson || activeLesson.type !== 'video') return;

        // טעינה דינמית ובטוחה של ה-API של יוטיוב במידה ואינו קיים
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        let interval;
        let checkYTReady;

        function initCustomPlayer() {
            let rawUrl = activeLesson.embedUrl || activeLesson.url;
            if (!rawUrl) return;

            let vidId = '';
            if (rawUrl.includes('watch?v=')) vidId = rawUrl.split('watch?v=')[1].split('&')[0];
            else if (rawUrl.includes('youtu.be/')) vidId = rawUrl.split('youtu.be/')[1].split('?')[0];
            else if (rawUrl.includes('embed/')) vidId = rawUrl.split('embed/')[1].split('?')[0];

            if (!vidId) return;

            // יצירת מופע הנגן של יוטיוב על האלמנט הייחודי
            playerRef.current = new window.YT.Player(`yt-placeholder-${activeLesson.id}`, {
                videoId: vidId,
                playerVars: {
                    rel: 0,
                    modestbranding: 1,
                    showinfo: 0,
                    controls: 0, // מעלימים לחלוטין את הלחצנים המקוריים של יוטיוב
                    disablekb: 1,
                    playsinline: 1,
                    iv_load_policy: 3,
                    fs: 0
                },
                events: {
                    onReady: (event) => {
                        setDuration(event.target.getDuration());
                        setPlaybackRate(event.target.getPlaybackRate());
                    },
                    onStateChange: (event) => {
                        // מצב 1 פירושו שהסרטון מתנגן בפועל
                        if (event.data === 1) {
                            setIsPlaying(true);
                        } else {
                            setIsPlaying(false);
                        }
                    }
                }
            });
        }

        // בדיקה מחזורית מאובטחת שה-API נטען בדפדפן לפני הפעלת הנגן
        checkYTReady = setInterval(() => {
            if (window.YT && window.YT.Player) {
                clearInterval(checkYTReady);
                initCustomPlayer();
            }
        }, 100);

        // מעקב רציף ועדכון ציר הזמן של הסרטון ב-React שלנו
        interval = setInterval(() => {
            if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
                setCurrentTime(playerRef.current.getCurrentTime());
            }
        }, 500);

        return () => {
            clearInterval(checkYTReady);
            clearInterval(interval);
            if (playerRef.current && typeof playerRef.current.destroy === 'function') {
                try { playerRef.current.destroy(); } catch (e) { console.error(e); }
            }
            setIsPlaying(false);
            setCurrentTime(0);
            setDuration(0);
        };
    }, [activeLesson?.id]);

    // פונקציות שליטה מותאמות אישית
    const handlePlayPause = () => {
        if (!playerRef.current) return;
        if (isPlaying) {
            playerRef.current.pauseVideo();
            setIsPlaying(false);
        } else {
            playerRef.current.playVideo();
            setIsPlaying(true);
        }
    };

    const handleTimelineSeek = (e) => {
        const targetSeconds = parseFloat(e.target.value);
        setCurrentTime(targetSeconds);
        if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
            playerRef.current.seekTo(targetSeconds, true);
        }
    };

    const handleSpeedRateChange = (e) => {
        const speed = parseFloat(e.target.value);
        setPlaybackRate(speed);
        if (playerRef.current && typeof playerRef.current.setPlaybackRate === 'function') {
            playerRef.current.setPlaybackRate(speed);
        }
    };

    // פורמט תצוגת זמן ידידותי (MM:SS)
    const formatVideoTime = (seconds) => {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (!activeLesson) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
                <span className="text-6xl">👈</span>
                <span className="font-black text-3xl">בחר שיעור מהתפריט לעריכה או צפייה</span>
            </div>
        );
    }

    if (activeLesson.type === 'chapter') {
        return (
            <div className="max-w-3xl mx-auto mt-20 text-center animate-fade-in">
                {isEditMode ? (
                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-dashed border-purple-200 space-y-6">
                        <h2 className="text-xl font-black text-purple-600">עריכת שם פרק</h2>
                        <input className="w-full p-4 bg-white rounded-2xl border-2 font-bold outline-none focus:border-purple-500 text-center text-2xl" value={activeLesson.title} onChange={e => {
                            const updated = lessons.map(l => l.id === activeLesson.id ? {...l, title: e.target.value} : l);
                            setLessons(updated);
                            setActiveLesson({...activeLesson, title: e.target.value});
                        }} />
                        <div className="flex gap-4 pt-4 border-t border-purple-100">
                            <button onClick={deleteActiveLesson} className="flex-1 bg-red-100 text-red-600 hover:bg-red-200 py-4 rounded-2xl font-black transition-colors shadow-sm">🗑️ מחיקת פרק</button>
                            <button onClick={saveChanges} className="flex-[2] bg-purple-600 text-white hover:bg-purple-700 py-4 rounded-2xl font-black transition-colors shadow-lg">💾 שמור שינויים</button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-100 p-12 rounded-[3rem] border border-slate-200">
                        <span className="text-6xl block mb-4">📁</span>
                        <h2 className="text-4xl font-black text-slate-800">{activeLesson.title}</h2>
                        <p className="text-slate-500 mt-4 font-bold">בחר שיעור מתוך הפרק בתפריט הצדדי</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            {isEditMode ? (
                <div className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-dashed border-purple-200 space-y-6">
                    <h2 className="text-xl font-black text-purple-600">עריכת שיעור ({activeLesson.type})</h2>
                    <input className="w-full p-4 bg-white rounded-2xl border-2 font-bold outline-none focus:border-purple-500" value={activeLesson.title} onChange={e => {
                        const updated = lessons.map(l => l.id === activeLesson.id ? {...l, title: e.target.value} : l);
                        setLessons(updated);
                        setActiveLesson({...activeLesson, title: e.target.value});
                    }} />
                    <textarea className="w-full p-4 bg-white rounded-2xl border-2 font-medium h-40 outline-none focus:border-purple-500" placeholder={activeLesson.type === 'html' ? "הדבק כאן קוד HTML..." : "תוכן השיעור..."} value={activeLesson.content || ''} onChange={e => {
                        const updated = lessons.map(l => l.id === activeLesson.id ? {...l, content: e.target.value} : l);
                        setLessons(updated);
                        setActiveLesson({...activeLesson, content: e.target.value});
                    }} />
                    {activeLesson.type !== 'text' && activeLesson.type !== 'html' && (
                        <input dir="ltr" className="w-full p-4 bg-white rounded-2xl border-2 font-bold outline-none focus:border-purple-500" placeholder="URL קישור להטמעה" value={activeLesson.embedUrl || activeLesson.url || ''} onChange={e => {
                            const updated = lessons.map(l => l.id === activeLesson.id ? {...l, embedUrl: e.target.value, url: e.target.value} : l);
                            setLessons(updated);
                            setActiveLesson({...activeLesson, embedUrl: e.target.value, url: e.target.value});
                        }} />
                    )}
                    
                    <div className="flex gap-4 pt-4 border-t border-purple-100">
                        <button onClick={deleteActiveLesson} className="flex-1 bg-red-100 text-red-600 hover:bg-red-200 py-4 rounded-2xl font-black transition-colors shadow-sm">🗑️ מחיקת שיעור</button>
                        <button onClick={duplicateActiveLesson} className="flex-1 bg-slate-200 text-slate-700 hover:bg-slate-300 py-4 rounded-2xl font-black transition-colors shadow-sm">📑 שכפול שיעור</button>
                        <button onClick={saveChanges} className="flex-[2] bg-purple-600 text-white hover:bg-purple-700 py-4 rounded-2xl font-black transition-colors shadow-lg">💾 שמור שינויים</button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-center bg-slate-50 p-6 rounded-[2rem] border">
                        <div className="flex items-center gap-3">
                            {getLessonIcon(activeLesson.type)}
                            <h2 className="text-2xl font-black text-slate-800">{activeLesson.title}</h2>
                        </div>
                        <button onClick={() => toggleComplete(activeLesson.id)} className={`px-8 py-3 rounded-2xl font-black transition-all ${userProgress[activeLesson.id] ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-slate-900 text-white shadow-xl hover:scale-105 hover:bg-purple-600'}`}>
                            {userProgress[activeLesson.id] ? 'הושלם ✓' : 'סמן כהושלם'}
                        </button>
                    </div>
                    
                    <div className="min-h-[500px]">
                        {activeLesson.isSmartContent && activeLesson.description && (
                            <div className="bg-purple-50 p-6 rounded-3xl border-2 border-purple-200 mb-8 shadow-sm flex gap-4 items-start">
                                <div className="text-3xl">💡</div>
                                <div>
                                    <h3 className="font-black text-purple-800 mb-1">המלצה פדגוגית לשילוב התוכן (AI)</h3>
                                    <p className="text-slate-700 font-bold">{activeLesson.description}</p>
                                </div>
                            </div>
                        )}

                        {activeLesson.type === 'html' ? (
                            <div className="bg-white p-4 rounded-3xl border shadow-sm" dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
                        ) : activeLesson.type === 'video' && (activeLesson.embedUrl || activeLesson.url) ? (
                            
                            /* נגן הוידאו הלבן והמאובטח לחלוטין מבית רובוטיקס */
                            <div key={activeLesson.id} className="bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-800 overflow-hidden">
                                {/* אזור הסרטון החתוך (Crop) */}
                                <div className="relative w-full overflow-hidden bg-black" style={{ paddingTop: '56.25%' }}>
                                    <div 
                                        id={`yt-placeholder-${activeLesson.id}`} 
                                        className="absolute" 
                                        style={{
                                            width: '112%',
                                            height: '130%',
                                            top: '-15%',
                                            left: '-6%',
                                        }}
                                    />
                                    {/* מסך מגן שקוף למניעת אינטראקציות עם המערכת של יוטיוב */}
                                    <div className="absolute inset-0 bg-transparent z-10 pointer-events-none" />
                                </div>

                                {/* סרגל הכלים המקצועי והמותאם אישית שלנו (React Custom Bar) */}
                                <div className="p-5 flex items-center gap-4 bg-slate-950 border-t border-slate-800 select-none" dir="rtl">
                                    <button 
                                        onClick={handlePlayPause} 
                                        className="bg-purple-600 hover:bg-purple-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-black transition-all shadow-lg text-lg shrink-0"
                                        title={isPlaying ? "השהה" : "נגן"}
                                    >
                                        {isPlaying ? '⏸' : '▶'}
                                    </button>

                                    {/* ציר זמן נוכחי */}
                                    <span className="text-xs font-mono font-bold text-slate-400 shrink-0 select-none">
                                        {formatVideoTime(currentTime)}
                                    </span>

                                    {/* סליידר גרירה של ציר הזמן */}
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max={duration || 100} 
                                        value={currentTime} 
                                        onChange={handleTimelineSeek}
                                        className="flex-grow accent-purple-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer hover:bg-slate-700 transition-colors"
                                    />

                                    {/* זמן כולל של הסרטון */}
                                    <span className="text-xs font-mono font-bold text-slate-400 shrink-0 select-none">
                                        {formatVideoTime(duration)}
                                    </span>

                                    {/* תפריט שליטה על מהירות ההפעלה */}
                                    <div className="flex items-center gap-1 border-r border-slate-800 pr-4">
                                        <select 
                                            value={playbackRate} 
                                            onChange={handleSpeedRateChange}
                                            className="bg-slate-900 border border-slate-700 text-white font-bold rounded-xl px-3 py-2 text-xs outline-none focus:border-purple-500 cursor-pointer text-center"
                                        >
                                            <option value="0.5">0.5x</option>
                                            <option value="1">1.0x (רגיל)</option>
                                            <option value="1.25">1.25x</option>
                                            <option value="1.5">1.5x</option>
                                            <option value="2">2.0x</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                        ) : activeLesson.type === 'link' ? (
                            <div className="bg-slate-50 p-12 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-center">
                                <span className="text-6xl mb-4">🔗</span>
                                <h3 className="text-2xl font-black text-slate-800 mb-6">קישור חיצוני / משאב עזר</h3>
                                <a href={activeLesson.url || activeLesson.embedUrl} target="_blank" rel="noreferrer" className="bg-purple-600 text-white px-8 py-4 rounded-full font-black text-lg hover:bg-purple-700 hover:scale-105 transition-all shadow-xl">לחץ כאן לפתיחת הקישור בחלון חדש</a>
                            </div>
                        ) : (activeLesson.embedUrl || activeLesson.url) && activeLesson.type !== 'text' ? (
                            <iframe title="c" className="w-full h-[600px] rounded-3xl border shadow-xl" src={activeLesson.embedUrl || activeLesson.url} allowFullScreen />
                        ) : (
                            <div className="prose prose-lg max-w-none text-right bg-white p-8 rounded-3xl border shadow-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: activeLesson.content || '' }} />
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
