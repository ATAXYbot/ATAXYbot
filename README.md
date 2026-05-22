```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <!-- Viewport is crucial for Telegram Mini Apps to look like real apps -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>ATAXY Learning</title>
    
    <!-- Tailwind CSS for styling -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- FontAwesome for Icons (Web Safe) -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- React and Babel (Allows React to run directly in the browser) -->
    <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    
    <!-- Telegram Web App SDK -->
    <script src="https://telegram.org/js/telegram-web-app.js"></script>

    <style>
        /* Hide scrollbar for a clean app feel */
        ::-webkit-scrollbar { display: none; }
        body { -ms-overflow-style: none; scrollbar-width: none; user-select: none; -webkit-user-select: none; }
    </style>
</head>
<body class="bg-gray-50">
    <!-- This is where the React App will be injected -->
    <div id="root"></div>

    <script type="text/babel">
        const { useState, useRef, useEffect } = React;

        // --- MOCK DATA ---
        const BATCHES = [
          { id: 1, name: "Arjuna Master Batch", target: "Class 11 + JEE", price: "Free", color: "bg-blue-600", students: "12k+" },
          { id: 2, name: "Lakshya Pro", target: "Class 12 + NEET", price: "Free", color: "bg-indigo-600", students: "18k+" },
          { id: 3, name: "Foundation 10th", target: "Class 10 Boards", price: "Free", color: "bg-emerald-600", students: "5k+" },
          { id: 4, name: "Yakeen NEET 2.0 2027", target: "Dropper + NEET", price: "Free", color: "bg-purple-600", students: "25k+", subBatches: [
            { id: 41, name: "Legend Batch", target: "Phase 1", color: "bg-purple-500" },
            { id: 42, name: "Alpha Batch", target: "Phase 2", color: "bg-fuchsia-500" }
          ]},
        ];

        const SUBJECTS = [
          { id: 'phy', name: "Physics", icon: "⚛️", chapters: 12 },
          { id: 'chem_phys', name: "Physical Chemistry", icon: "⚗️", chapters: 5 },
          { id: 'chem_org', name: "Organic Chemistry", icon: "🧪", chapters: 6 },
          { id: 'chem_inorg', name: "Inorganic Chemistry", icon: "🧊", chapters: 4 },
          { id: 'math', name: "Mathematics", icon: "📐", chapters: 10 },
          { id: 'bio_zoo', name: "Zoology", icon: "🦍", chapters: 10 },
          { id: 'bio_bot', name: "Botany", icon: "🌿", chapters: 8 },
        ];

        const CHAPTERS = [
          { id: 'chap_mole', subjectId: 'chem_phys', name: 'Mole Concept', count: "1 Lecture" },
          { id: 'chap_kinematics', subjectId: 'phy', name: 'Kinematics', count: "3 Lectures" },
        ];

        const VIDEOS = [
          { id: 101, chapterId: 'chap_kinematics', title: "L-01 : Kinematics & Motion in 1D", duration: "1h 45m", date: "Today", url: "https://www.w3schools.com/html/mov_bbb.mp4", notes: true },
          { id: 102, chapterId: 'chap_kinematics', title: "L-02 : Projectile Motion Concepts", duration: "2h 10m", date: "Yesterday", url: "https://www.w3schools.com/html/mov_bbb.mp4", notes: true },
          
          // Telegram Download Link
          { id: 104, chapterId: 'chap_mole', title: "L-01 : Mole Concept Introduction", duration: "1h 20m", date: "Today", url: "https://ne6-bd9be46d442c.herokuapp.com/stream/2287510?hash=ddb669&d=true", notes: true },
        ];

        const NOTICES = [
          { id: 1, title: "Physics Sunday Marathon!", date: "22 May", type: "Live Class" },
          { id: 2, title: "Chemistry Chapter 2 Notes Uploaded", date: "21 May", type: "Study Material" },
          { id: 3, title: "Mock Test Results Announced", date: "19 May", type: "Alert" },
        ];

        // ==========================================
        // 🚀 ADVANCED ATAXY VIDEO PLAYER 
        // ==========================================
        const AtaxyPlayer = ({ src, poster }) => {
          const videoRef = useRef(null);
          const playerContainerRef = useRef(null);
          const [isPlaying, setIsPlaying] = useState(false);
          const [isBuffering, setIsBuffering] = useState(false);
          const [progress, setProgress] = useState(0);
          const [currentTime, setCurrentTime] = useState("00:00");
          const [duration, setDuration] = useState("00:00");
          const [showControls, setShowControls] = useState(true);
          const [playbackSpeed, setPlaybackSpeed] = useState(1);
          const [isFullScreen, setIsFullScreen] = useState(false);
          const controlsTimeoutRef = useRef(null);

          const formatTime = (timeInSeconds) => {
            if (isNaN(timeInSeconds)) return "00:00";
            const minutes = Math.floor(timeInSeconds / 60);
            const seconds = Math.floor(timeInSeconds % 60);
            return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
          };

          const togglePlay = (e) => {
            if (e) e.stopPropagation();
            if (videoRef.current.paused) {
              videoRef.current.play();
              setIsPlaying(true);
            } else {
              videoRef.current.pause();
              setIsPlaying(false);
            }
          };

          const handleTimeUpdate = () => {
            const current = videoRef.current.currentTime;
            const total = videoRef.current.duration;
            setProgress((current / total) * 100);
            setCurrentTime(formatTime(current));
          };

          const handleLoadedMetadata = () => {
            setDuration(formatTime(videoRef.current.duration));
          };

          const handleSeek = (e) => {
            e.stopPropagation();
            const seekTime = (e.target.value / 100) * videoRef.current.duration;
            videoRef.current.currentTime = seekTime;
            setProgress(e.target.value);
          };

          const toggleSpeed = (e) => {
            e.stopPropagation();
            const speeds = [1, 1.25, 1.5, 1.75, 2];
            const currentIndex = speeds.indexOf(playbackSpeed);
            const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
            setPlaybackSpeed(nextSpeed);
            videoRef.current.playbackRate = nextSpeed;
          };

          const toggleFullScreen = async (e) => {
            e.stopPropagation();
            const container = playerContainerRef.current;

            if (!isFullScreen) {
              setIsFullScreen(true);
              try {
                if (container.requestFullscreen) await container.requestFullscreen();
                else if (container.webkitRequestFullscreen) container.webkitRequestFullscreen();
                
                if (window.screen && window.screen.orientation && window.screen.orientation.lock) {
                  await window.screen.orientation.lock('landscape');
                }
              } catch (err) {
                console.log("Native APIs blocked by WebView, relying on CSS fallback.");
              }
            } else {
              setIsFullScreen(false);
              try {
                if (document.exitFullscreen) await document.exitFullscreen();
                else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
                
                if (window.screen && window.screen.orientation && window.screen.orientation.unlock) {
                  window.screen.orientation.unlock();
                }
              } catch (err) {}
            }
          };

          const handleUserActivity = () => {
            setShowControls(true);
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
            controlsTimeoutRef.current = setTimeout(() => {
              if (isPlaying) setShowControls(false);
            }, 3000);
          };

          return (
            <div 
              ref={playerContainerRef}
              className={`${isFullScreen ? 'fixed inset-0 z-[99999] w-screen h-screen bg-black' : 'w-full aspect-video bg-black relative'} flex items-center justify-center group overflow-hidden`}
              onMouseMove={handleUserActivity}
              onClick={handleUserActivity}
              onTouchStart={handleUserActivity}
            >
              <video 
                ref={videoRef}
                src={src} 
                poster={poster}
                className="w-full h-full object-contain"
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onWaiting={() => setIsBuffering(true)}
                onPlaying={() => setIsBuffering(false)}
                onClick={togglePlay}
              />

              {/* Branding Watermark */}
              <div className={`absolute top-3 right-4 z-20 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                <span className="text-white font-black italic tracking-widest text-sm drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                  ATAXY
                </span>
              </div>

              {isFullScreen && showControls && (
                 <button onClick={toggleFullScreen} className="absolute top-4 left-4 z-30 bg-black/50 text-white w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/80">
                    <i className="fa-solid fa-compress"></i>
                 </button>
              )}

              {/* Buffering Spinner */}
              {isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/20 pointer-events-none">
                  <i className="fa-solid fa-spinner fa-spin text-white text-4xl drop-shadow-lg"></i>
                </div>
              )}

              {/* Play/Pause Center Overlay */}
              <div 
                className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
                onClick={togglePlay}
              >
                {!isBuffering && (
                  <button className="bg-blue-600/90 text-white rounded-full w-16 h-16 flex items-center justify-center transform hover:scale-110 transition-transform shadow-[0_0_15px_rgba(37,99,235,0.5)]">
                    {isPlaying ? <i className="fa-solid fa-pause text-2xl"></i> : <i className="fa-solid fa-play text-2xl ml-1"></i>}
                  </button>
                )}
              </div>

              {/* Control Bar */}
              <div 
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-4 pt-8 pb-3 transition-transform duration-300 z-20 ${showControls ? 'translate-y-0' : 'translate-y-full'}`}
                onClick={(e) => e.stopPropagation()} 
              >
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={progress || 0}
                  onChange={handleSeek}
                  className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500 mb-3"
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-white">
                    <button onClick={togglePlay} className="hover:text-blue-400 transition-colors w-6">
                      {isPlaying ? <i className="fa-solid fa-pause"></i> : <i className="fa-solid fa-play"></i>}
                    </button>
                    <div className="flex items-center gap-2 text-xs font-medium tracking-wide">
                      <span>{currentTime}</span><span className="text-gray-400">/</span><span className="text-gray-400">{duration}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-white">
                    <button onClick={toggleSpeed} className="text-xs font-bold bg-white/20 hover:bg-blue-600 text-white px-2 py-1 rounded transition-colors w-10 text-center">
                      {playbackSpeed}x
                    </button>
                    <button onClick={toggleFullScreen} className="hover:text-blue-400 transition-colors p-1 w-6">
                      {isFullScreen ? <i className="fa-solid fa-compress"></i> : <i className="fa-solid fa-expand"></i>}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        };
        // ==========================================

        function App() {
          const [currentTab, setCurrentTab] = useState('home');
          const [activeBatch, setActiveBatch] = useState(null);
          const [activeSubBatch, setActiveSubBatch] = useState(null);
          const [activeSubject, setActiveSubject] = useState(null);
          const [activeChapter, setActiveChapter] = useState(null);
          const [activeVideo, setActiveVideo] = useState(null);
          const [videoTab, setVideoTab] = useState('videos');

          // Initialize Telegram on mount
          useEffect(() => {
              if (window.Telegram && window.Telegram.WebApp) {
                  window.Telegram.WebApp.ready();
                  window.Telegram.WebApp.expand();
              }
          }, []);

          const handleBack = () => {
            if (activeVideo) setActiveVideo(null);
            else if (activeChapter) setActiveChapter(null);
            else if (activeSubject) setActiveSubject(null);
            else if (activeSubBatch) setActiveSubBatch(null);
            else if (activeBatch) { setActiveBatch(null); setCurrentTab('batches'); }
          };

          const BottomNav = () => (
            <div className="fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around pb-safe z-50">
              <button onClick={() => { setCurrentTab('home'); setActiveBatch(null); setActiveSubBatch(null); setActiveSubject(null); setActiveChapter(null); setActiveVideo(null); }} className={`flex flex-col items-center p-3 w-full ${currentTab === 'home' ? 'text-blue-600' : 'text-gray-500'}`}>
                <i className="fa-solid fa-house text-xl mb-1"></i>
                <span className="text-[10px] font-medium">Home</span>
              </button>
              <button onClick={() => { setCurrentTab('batches'); setActiveSubBatch(null); setActiveSubject(null); setActiveChapter(null); setActiveVideo(null); }} className={`flex flex-col items-center p-3 w-full ${currentTab === 'batches' ? 'text-blue-600' : 'text-gray-500'}`}>
                <i className="fa-solid fa-book-open text-xl mb-1"></i>
                <span className="text-[10px] font-medium">Batches</span>
              </button>
              <button onClick={() => setCurrentTab('notices')} className={`flex flex-col items-center p-3 w-full ${currentTab === 'notices' ? 'text-blue-600' : 'text-gray-500'}`}>
                <i className="fa-solid fa-bell text-xl mb-1"></i>
                <span className="text-[10px] font-medium">Notices</span>
              </button>
              <button onClick={() => setCurrentTab('profile')} className={`flex flex-col items-center p-3 w-full ${currentTab === 'profile' ? 'text-blue-600' : 'text-gray-500'}`}>
                <i className="fa-solid fa-user text-xl mb-1"></i>
                <span className="text-[10px] font-medium">Profile</span>
              </button>
            </div>
          );

          const HomeView = () => (
            <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="bg-blue-600 p-5 rounded-b-3xl shadow-lg text-white mb-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-xl font-bold">Hello, Student! 👋</h2>
                    <p className="text-blue-100 text-sm">Ready to learn something new today?</p>
                  </div>
                  <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-xl shadow-inner">S</div>
                </div>
              </div>
              <div className="px-5 space-y-6">
                <div className="bg-gradient-to-r from-orange-400 to-rose-400 rounded-2xl p-4 text-white shadow-md relative overflow-hidden">
                  <div className="relative z-10">
                    <span className="bg-white text-orange-500 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">Free Test</span>
                    <h3 className="text-lg font-bold mt-2">All India Mock Test</h3>
                    <p className="text-sm opacity-90 mb-3">Attempt now to check your rank!</p>
                    <button className="bg-white text-rose-500 font-bold text-sm px-4 py-2 rounded-lg shadow">Attempt Now</button>
                  </div>
                  <i className="fa-solid fa-award absolute -right-4 -bottom-4 text-8xl text-white opacity-20"></i>
                </div>
                <div>
                  <h3 className="text-gray-800 font-bold text-lg mb-3">Quick Access</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {SUBJECTS.slice(0,4).map(sub => (
                      <div key={sub.id} className="flex flex-col items-center justify-center bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                        <span className="text-2xl mb-1">{sub.icon}</span>
                        <span className="text-[10px] font-semibold text-gray-600 text-center">{sub.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );

          const BatchesView = () => (
            <div className="pb-24 pt-6 px-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">My Batches</h2>
              <p className="text-gray-500 text-sm mb-6">Select a batch to continue your studies</p>
              <div className="space-y-4">
                {BATCHES.map(batch => (
                  <div key={batch.id} onClick={() => setActiveBatch(batch)} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer transform active:scale-[0.98] transition-transform">
                    <div className={`${batch.color} h-2 w-full`}></div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded uppercase">{batch.price}</span>
                        <span className="text-xs text-gray-500 font-medium flex items-center gap-1"><i className="fa-solid fa-user text-[10px]"></i> {batch.students}</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-800">{batch.name}</h3>
                      <p className="text-gray-500 text-sm mb-4">{batch.target}</p>
                      <button className="w-full bg-gray-50 hover:bg-gray-100 text-blue-600 font-bold py-2.5 rounded-xl border border-gray-200 flex items-center justify-center gap-2 transition-colors">Let's Study <i className="fa-solid fa-chevron-right text-xs"></i></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );

          const BatchDetailView = () => {
            const isSubBatchMode = activeBatch.subBatches && !activeSubBatch;
            const currentHeader = activeSubBatch || activeBatch;

            return (
              <div className="pb-24 animate-in slide-in-from-right duration-200">
                <div className={`${currentHeader.color || activeBatch.color} pt-8 pb-10 px-5 text-white shadow-md rounded-b-3xl`}>
                  <div className="flex items-center gap-3 mb-6">
                    <button onClick={handleBack} className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm"><i className="fa-solid fa-chevron-left"></i></button>
                    <h2 className="font-bold text-lg line-clamp-1">{currentHeader.name}</h2>
                  </div>
                  <h1 className="text-3xl font-bold mb-2">{isSubBatchMode ? 'Sections' : 'Subjects'}</h1>
                  <p className="text-white/80 text-sm">{isSubBatchMode ? 'Select a section to continue' : 'Select a subject to view lectures and notes'}</p>
                </div>
                <div className="px-5 mt-6 space-y-3">
                  {isSubBatchMode ? (
                    activeBatch.subBatches.map(sub => (
                      <div key={sub.id} onClick={() => setActiveSubBatch(sub)} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer active:bg-gray-50">
                        <div className="flex items-center gap-4">
                          <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white ${sub.color}`}><i className="fa-solid fa-book-open text-xl"></i></div>
                          <div><h3 className="font-bold text-gray-800 text-lg">{sub.name}</h3><p className="text-xs text-gray-500">{sub.target}</p></div>
                        </div>
                        <i className="fa-solid fa-chevron-right text-gray-400"></i>
                      </div>
                    ))
                  ) : (
                    SUBJECTS.map(sub => (
                      <div key={sub.id} onClick={() => setActiveSubject(sub)} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer active:bg-gray-50">
                        <div className="flex items-center gap-4">
                          <div className="text-3xl bg-gray-50 h-12 w-12 rounded-full flex items-center justify-center">{sub.icon}</div>
                          <div><h3 className="font-bold text-gray-800 text-lg">{sub.name}</h3><p className="text-xs text-gray-500">{sub.chapters} Chapters</p></div>
                        </div>
                        <i className="fa-solid fa-chevron-right text-gray-400"></i>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          };

          const SubjectDetailView = () => {
            const subjectChapters = CHAPTERS.filter(c => c.subjectId === activeSubject.id);
            return (
              <div className="pb-24 animate-in slide-in-from-right duration-200">
                <div className="bg-white border-b border-gray-200 sticky top-0 z-10 pt-5 px-5 pb-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <button onClick={handleBack} className="p-1 w-8"><i className="fa-solid fa-chevron-left text-xl text-gray-800"></i></button>
                    <h2 className="font-bold text-xl text-gray-800 flex items-center gap-2">{activeSubject.icon} {activeSubject.name}</h2>
                  </div>
                </div>
                <div className="px-5 mt-4 space-y-3">
                  {subjectChapters.length > 0 ? (
                    subjectChapters.map(chapter => (
                      <div key={chapter.id} onClick={() => setActiveChapter(chapter)} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer active:bg-gray-50">
                        <div className="flex items-center gap-4">
                          <div className="bg-blue-50 text-blue-600 h-10 w-10 rounded-lg flex items-center justify-center"><i className="fa-solid fa-folder text-xl"></i></div>
                          <div><h3 className="font-bold text-gray-800 text-base">{chapter.name}</h3><p className="text-xs text-gray-500">{chapter.count}</p></div>
                        </div>
                        <i className="fa-solid fa-chevron-right text-gray-400"></i>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 mt-10"><i className="fa-solid fa-folder-open text-4xl text-gray-300 mb-2"></i><p>Chapters will be uploaded soon!</p></div>
                  )}
                </div>
              </div>
            );
          };

          const ChapterDetailView = () => {
            const chapterVideos = VIDEOS.filter(v => v.chapterId === activeChapter.id);
            return (
              <div className="pb-24 animate-in slide-in-from-right duration-200">
                <div className="bg-white border-b border-gray-200 sticky top-0 z-10 pt-5 px-5 pb-3">
                  <div className="flex items-center gap-3 mb-3">
                    <button onClick={handleBack} className="p-1 w-8"><i className="fa-solid fa-chevron-left text-xl text-gray-800"></i></button>
                    <h2 className="font-bold text-xl text-gray-800 line-clamp-1">{activeChapter.name}</h2>
                  </div>
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button onClick={() => setVideoTab('videos')} className={`flex-1 py-1.5 text-sm font-semibold rounded-md ${videoTab === 'videos' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>Lectures</button>
                    <button onClick={() => setVideoTab('notes')} className={`flex-1 py-1.5 text-sm font-semibold rounded-md ${videoTab === 'notes' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>Notes / DPPs</button>
                  </div>
                </div>
                <div className="px-5 mt-4 space-y-4">
                  {videoTab === 'videos' && chapterVideos.map((vid) => (
                    <div key={vid.id} onClick={() => setActiveVideo(vid)} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col cursor-pointer">
                      <div className="bg-gray-800 h-32 relative flex items-center justify-center group">
                        <img src={`https://picsum.photos/seed/${vid.id}/400/200`} alt="thumb" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                        <i className="fa-solid fa-circle-play text-white text-5xl z-10 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all"></i>
                        <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded font-medium z-10">{vid.duration}</span>
                      </div>
                      <div className="p-3">
                        <h3 className="font-bold text-sm text-gray-800 line-clamp-2 leading-snug">{vid.title}</h3>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-500 flex items-center gap-1"><i className="fa-regular fa-clock"></i> {vid.date}</span>
                          {vid.notes && <span className="bg-blue-50 text-blue-600 text-[10px] px-2 py-1 rounded font-bold">Notes Attached</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                  {videoTab === 'notes' && chapterVideos.map((vid) => (
                     <div key={`note-${vid.id}`} className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-rose-100 text-rose-500 w-10 h-10 flex items-center justify-center rounded-lg"><i className="fa-solid fa-file-lines text-xl"></i></div>
                          <div><h3 className="font-bold text-sm text-gray-800">Class Notes: {vid.title.split(':')[0]}</h3><p className="text-xs text-gray-500">PDF Document • 2.4 MB</p></div>
                        </div>
                        <button className="text-blue-600 bg-blue-50 w-8 h-8 rounded-full flex items-center justify-center"><i className="fa-solid fa-download"></i></button>
                     </div>
                  ))}
                </div>
              </div>
            );
          };

          const VideoPlayerView = () => {
            return (
              <div className="bg-black min-h-screen animate-in slide-in-from-bottom duration-300">
                <div className="sticky top-0 z-50 bg-black text-white p-4 flex items-center gap-3">
                  <button onClick={handleBack} className="p-1 w-8"><i className="fa-solid fa-chevron-left text-xl"></i></button>
                  <h2 className="font-semibold text-sm line-clamp-1">{activeVideo.title}</h2>
                </div>
                
                <AtaxyPlayer 
                  src={activeVideo.url} 
                  poster={`https://picsum.photos/seed/${activeVideo.id}/800/450`} 
                />

                <div className="bg-white min-h-[60vh] rounded-t-2xl relative z-10 p-5 pt-6">
                  <h1 className="text-xl font-bold text-gray-800 mb-2">{activeVideo.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 border-b border-gray-100 pb-4">
                    <span className="flex items-center gap-1"><i className="fa-regular fa-clock"></i> {activeVideo.duration}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><i className="fa-solid fa-video"></i> Recorded Lecture</span>
                  </div>

                  <h3 className="font-bold text-gray-800 mb-3">Materials for this class</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center gap-3"><i className="fa-solid fa-file-lines text-rose-500 text-xl"></i><span className="font-medium text-sm text-gray-700">Class Notes (Annotated)</span></div>
                      <button className="text-blue-600"><i className="fa-solid fa-download"></i></button>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center gap-3"><i className="fa-solid fa-file-lines text-indigo-500 text-xl"></i><span className="font-medium text-sm text-gray-700">DPP (Daily Practice Paper)</span></div>
                      <button className="text-blue-600"><i className="fa-solid fa-download"></i></button>
                    </div>
                  </div>
                </div>
              </div>
            );
          };

          const NoticesView = () => (
            <div className="pb-24 pt-6 px-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Notice Board</h2>
              <div className="space-y-4">
                {NOTICES.map(notice => (
                  <div key={notice.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                     <div className="flex justify-between items-start mb-2">
                        <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded uppercase">{notice.type}</span>
                        <span className="text-xs text-gray-500 font-medium">{notice.date}</span>
                      </div>
                      <h3 className="text-base font-bold text-gray-800">{notice.title}</h3>
                      <p className="text-sm text-gray-500 mt-2">Please check your respective batches for more details regarding this update.</p>
                  </div>
                ))}
              </div>
            </div>
          );

          return (
            <div className="min-h-screen font-sans max-w-md mx-auto relative shadow-2xl overflow-hidden">
              {activeVideo ? <VideoPlayerView /> : activeChapter ? <ChapterDetailView /> : activeSubject ? <SubjectDetailView /> : activeBatch ? <BatchDetailView /> : (
                <>
                  {currentTab === 'home' && <HomeView />}
                  {currentTab === 'batches' && <BatchesView />}
                  {currentTab === 'notices' && <NoticesView />}
                  {currentTab === 'profile' && (
                    <div className="p-5 pt-10 text-center animate-in fade-in">
                      <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full mx-auto flex items-center justify-center text-3xl font-bold mb-4">S</div>
                      <h2 className="text-xl font-bold">Student Profile</h2>
                      <p className="text-gray-500">More settings coming soon!</p>
                    </div>
                  )}
                  <BottomNav />
                </>
              )}
            </div>
          );
        }

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
    </script>
</body>
</html>


```
