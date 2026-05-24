import React, { useState, useEffect, useRef } from 'react';

export default function LessonEditor({ activeLesson, setActiveLesson, isEditMode, lessons, setLessons, saveChanges, duplicateActiveLesson, deleteActiveLesson, toggleComplete, userProgress, getLessonIcon }) {
    
    const playerRef = useRef(null);
    const videoContainerRef = useRef(null); // רפרנס עבור הגדלה למסך מלא
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        if (!activeLesson || activeLesson.type !== 'video') return;

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

            playerRef.current = new window.YT.Player(`yt-placeholder-${activeLesson.id}`, {
                videoId: vidId,
                playerVars: {
                    rel: 0,
                    modestbranding: 1,
                    showinfo: 0,
                    controls: 1, 
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
                        if (event.data === 1) {
                            setIsPlaying(true);
                        } else {
                            setIsPlaying(false);
                        }
                    }
                }
            });
        }

        checkYTReady = setInterval(() => {
            if (window.YT && window.YT.Player) {
                clearInterval(checkYTReady);
                initCustomPlayer();
            }
        }, 100);

        interval = setInterval(() => {
            if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
                setCurrentTime(playerRef.current.getCurrentTime());
            }
        }, 500);

        // האזנה לשינוי מצב מסך מלא של הדפדפן כדי לעדכן את האייקון
        const onFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', onFullscreenChange);

        return () => {
            clearInterval(checkYTReady);
            clearInterval(interval);
            document.removeEventListener('fullscreenchange', onFullscreenChange);
            if (playerRef.current && typeof playerRef.current.destroy === 'function') {
                try { playerRef.current.destroy(); } catch (e) { console.error(e); }
            }
            setIsPlaying(false);
            setCurrentTime(0);
            setDuration(0);
        };
    }, [activeLesson?.id]);

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

    // מנגנון הגדלה/הקטנה למסך מלא של הנגן כולו
    const handleToggleFullscreen = () => {
        if (!videoContainerRef.current) return;
        if (!document.fullscreenElement) {
            videoContainerRef.current.requestFullscreen().catch(err => {
                console.error("שגיאה במעבר למסך מלא:", err);
            });
        } else {
            document.exitFullscreen();
        }
    };

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
            <div className="max-w-3xl mx-auto mt-10 text-center animate-fade-in">
                {isEditMode ? (
                    <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-dashed border-purple-200 space-y-4">
                        <h2 className="text-xl font-black text-purple-600">עריכת שם פרק</h2>
                        <input className="w-full p-4 bg-white rounded-2xl border-2 font-bold outline-none focus:border-purple-500 text-center text-xl" value={activeLesson.title} onChange={e => {
                            const updated = lessons.map(l => l.id === activeLesson.id ? {...l, title: e.target.value} : l);
                            setLessons(updated);
                            setActiveLesson({...activeLesson, title: e.target.value});
                        }} />
                        <div className="flex gap-4 pt-2 border-t border-purple-100">
                            <button onClick={deleteActiveLesson} className="flex-1 bg-red-100 text-red-600 hover:bg-red-200 py-3 rounded-xl font-black transition-colors shadow-sm">🗑️ מחיקת פרק</button>
                            <button onClick={saveChanges} className="flex-[2] bg-purple-600 text-white hover:bg-purple-700 py-3 rounded-xl font-black transition-colors shadow-lg">💾 שמור שינויים</button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-100 p-8 rounded-[2.5rem] border border-slate-200">
                        <span className="text-5xl block mb-2">📁</span>
                        <h2 className="text-3xl font-black text-slate-800">{activeLesson.title}</h2>
                        <p className="text-slate-500 mt-2 font-bold text-sm">בחר שיעור מתוך הפרק בתפריט הצדדי</p>
                    </div>
                )}
            </div>
        );
    }

    const renderVideo = (lesson) => {
        let rawUrl = lesson.embedUrl || lesson.url;
        if (!rawUrl) return null;

        let cleanUrl = rawUrl;
        let isYouTube = false;
        
        if (rawUrl.includes('youtube.com') || rawUrl.includes('youtu.be')) {
            isYouTube = true;
            let vidId = '';
            if (rawUrl.includes('watch?v=')) vidId = rawUrl.split('watch?v=')[1].split('&')[0];
            else if (rawUrl.includes('youtu.be/')) vidId = rawUrl.split('youtu.be/')[1].split('?')[0];
            else if (rawUrl.includes('embed/')) vidId = rawUrl.split('embed/')[1].split('?')[0];
            
            if (vidId) {
                cleanUrl = `https://www.youtube-nocookie.com/embed/${vidId}?rel=0&modestbranding=1&showinfo=0&controls=1&disablekb=1&playsinline=1&iv_load_policy=3`;
            }
        } else {
            cleanUrl = rawUrl.replace('
