const fs = require('fs');

let lines = fs.readFileSync('c:/Users/risha/ATAXYbot/index.html', 'utf8').split('\n');

// --- 1. Fix the Quiz Filters Bug ---
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("questionFilter === 'all' ? '${themeBg} text-white ${themeBorder}'")) {
        lines[i] = lines[i].replace("'${themeBg} text-white ${themeBorder}'", "themeBg + ' text-white ' + themeBorder");
    }
    if (lines[i].includes("questionFilter === 'bookmarked' ? '${themeBg} text-white ${themeBorder}'")) {
        lines[i] = lines[i].replace("'${themeBg} text-white ${themeBorder}'", "themeBg + ' text-white ' + themeBorder");
    }
    if (lines[i].includes("questionFilter === 'incorrect' ? '${themeBg} text-white ${themeBorder}'")) {
        lines[i] = lines[i].replace("'${themeBg} text-white ${themeBorder}'", "themeBg + ' text-white ' + themeBorder");
    }
}


// --- 2. Replace the <select> tag with the Custom Button ---
let selIdx = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('<select') && lines[i+1] && lines[i+1].includes('value={practiceSelectedTopic || ""}')) {
        selIdx = i;
        break;
    }
}

if (selIdx !== -1) {
    let selEnd = selIdx;
    while (!lines[selEnd].includes('</select>')) {
        selEnd++;
    }
    
    const customButton = `                                        <button 
                                            onClick={() => setPracticeShowTopicModal(true)}
                                            className={\`flex items-center gap-2 border rounded-sm transition-all px-3 py-1.5 \${practiceSelectedTopic ? themeBorder + ' ' + themeLightBg : 'border-gray-300 bg-white hover:border-gray-400'}\`}
                                        >
                                            <i className={\`fa-solid fa-filter text-[10px] \${practiceSelectedTopic ? themeText : 'text-gray-400'}\`}></i>
                                            <span className={\`text-xs font-bold truncate max-w-[120px] md:max-w-[160px] \${practiceSelectedTopic ? themeText : 'text-gray-600'}\`}>
                                                {practiceSelectedTopic ? safeRenderText(practiceSelectedTopic) : 'All Topics'}
                                            </span>
                                            <i className={\`fa-solid fa-chevron-down text-[10px] \${practiceSelectedTopic ? themeText : 'text-gray-400'}\`}></i>
                                        </button>`;
    
    lines.splice(selIdx, selEnd - selIdx + 1, customButton);
}


// --- 3. Rewrite Level 1 Batch Cards to "Gaming/Ultra Premium" ---
let indexCode = lines.join('\n');

const oldBatchesMapRegex = /\{PRACTICE_BATCHES\.map\(batch => \{[\s\S]*?\}\)\}/;

const newGamingBatchesMap = `{PRACTICE_BATCHES.map(batch => {
                                    if (batch.type === 'neet') {
                                        return (
                                            <div key={batch.id} onClick={() => setActivePracticeBatch(batch)} className="group relative w-full h-[180px] rounded-[2.5rem] overflow-hidden cursor-pointer shadow-[0_10px_40px_-10px_rgba(0,65,141,0.5)] hover:shadow-[0_20px_50px_-10px_rgba(0,65,141,0.7)] hover:-translate-y-2 transition-all duration-500 ease-out">
                                                {/* Gaming/Premium Blue Gradient Base */}
                                                <div className="absolute inset-0 bg-gradient-to-br from-[#00418d] via-[#003370] to-[#001a3d] z-0"></div>
                                                
                                                {/* Animated Medical Patterns */}
                                                <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] mix-blend-overlay z-0"></div>
                                                
                                                {/* Glowing Orbs */}
                                                <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl group-hover:bg-blue-300/30 transition-all duration-700 z-0"></div>
                                                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-teal-400/20 rounded-full blur-2xl group-hover:bg-teal-300/30 transition-all duration-700 z-0"></div>
                                                
                                                {/* Floating Medical Icons (Gaming Style) */}
                                                <i className="fa-solid fa-stethoscope absolute -right-4 -bottom-4 text-[120px] text-white/5 group-hover:text-blue-400/10 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700 z-10 drop-shadow-2xl"></i>
                                                <i className="fa-solid fa-pills absolute top-6 right-24 text-3xl text-blue-300/10 group-hover:text-teal-300/20 group-hover:-translate-y-4 transition-all duration-1000 z-10"></i>
                                                <i className="fa-solid fa-hospital absolute bottom-8 right-32 text-4xl text-blue-200/5 group-hover:text-blue-200/15 group-hover:-translate-x-4 transition-all duration-1000 z-10"></i>
                                                <i className="fa-solid fa-staff-snake absolute top-1/2 right-12 -translate-y-1/2 text-6xl text-white/5 group-hover:text-blue-100/10 group-hover:scale-125 transition-all duration-1000 z-10"></i>

                                                {/* Content */}
                                                <div className="relative z-20 h-full flex flex-col justify-center px-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner group-hover:bg-white/20 transition-all duration-500">
                                                            <i className="fa-solid fa-user-doctor text-2xl text-blue-100 group-hover:text-white group-hover:scale-110 transition-transform duration-500"></i>
                                                        </div>
                                                        <div>
                                                            <h3 className="text-3xl font-black text-white tracking-tight drop-shadow-md">NEET Bank</h3>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-400/30 text-[10px] font-black text-blue-200 uppercase tracking-widest backdrop-blur-sm">Medical Track</span>
                                                                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse shadow-[0_0_8px_rgba(45,212,191,0.8)]"></span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    } else if (batch.type === 'jee') {
                                        return (
                                            <div key={batch.id} onClick={() => setActivePracticeBatch(batch)} className="group relative w-full h-[180px] rounded-[2.5rem] overflow-hidden cursor-pointer shadow-[0_10px_40px_-10px_rgba(15,23,42,0.8)] hover:shadow-[0_20px_50px_-10px_rgba(6,182,212,0.4)] hover:-translate-y-2 transition-all duration-500 ease-out mt-4">
                                                {/* Gaming/Premium Engineer Base */}
                                                <div className="absolute inset-0 bg-[#0b0f19] z-0"></div>
                                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/40 via-transparent to-purple-900/40 z-0"></div>
                                                
                                                {/* Grid Pattern */}
                                                <div className="absolute inset-0 opacity-[0.1] bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] mix-blend-overlay z-0"></div>
                                                
                                                {/* Hacker/Cyberpunk Glows */}
                                                <div className="absolute top-0 right-0 w-[200%] h-[200%] bg-[conic-gradient(from_90deg_at_50%_50%,#00000000_50%,#06b6d4_100%)] opacity-0 group-hover:opacity-10 group-hover:animate-spin-slow transition-opacity duration-1000 z-0 pointer-events-none"></div>
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-400/20 transition-all duration-700 z-0"></div>
                                                
                                                {/* Floating Engineer Icons (Gaming Style) */}
                                                <i className="fa-solid fa-microchip absolute -right-6 -bottom-6 text-[130px] text-cyan-500/5 group-hover:text-cyan-400/15 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 z-10 drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]"></i>
                                                <i className="fa-solid fa-laptop-code absolute top-8 right-24 text-3xl text-cyan-300/10 group-hover:text-cyan-200/30 group-hover:-translate-y-3 transition-all duration-1000 z-10"></i>
                                                <i className="fa-solid fa-compass-drafting absolute bottom-8 right-36 text-4xl text-purple-400/10 group-hover:text-purple-300/30 group-hover:rotate-12 transition-all duration-1000 z-10"></i>
                                                <i className="fa-solid fa-ruler-combined absolute top-1/2 right-12 -translate-y-1/2 text-5xl text-white/5 group-hover:text-cyan-100/20 group-hover:scale-110 transition-all duration-1000 z-10"></i>

                                                {/* Content */}
                                                <div className="relative z-20 h-full flex flex-col justify-center px-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-14 h-14 rounded-2xl bg-[#1e293b] border border-cyan-500/30 flex items-center justify-center shadow-[inset_0_0_15px_rgba(6,182,212,0.2)] group-hover:shadow-[inset_0_0_25px_rgba(6,182,212,0.4)] group-hover:border-cyan-400 transition-all duration-500">
                                                            <i className="fa-solid fa-helmet-safety text-2xl text-cyan-500 group-hover:text-cyan-300 group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"></i>
                                                        </div>
                                                        <div>
                                                            <h3 className="text-3xl font-black text-white tracking-tight drop-shadow-md">JEE Bank</h3>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="px-2 py-0.5 rounded bg-cyan-900/40 border border-cyan-500/40 text-[10px] font-black text-cyan-400 uppercase tracking-widest backdrop-blur-sm">Engineer Track</span>
                                                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,1)]"></span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    } else {
                                        return (
                                            <div key={batch.id} onClick={() => setActivePracticeBatch(batch)} className="group relative w-full h-[100px] rounded-[2rem] overflow-hidden cursor-pointer shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out mt-4">
                                                <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 z-0"></div>
                                                <i className="fa-solid fa-vial absolute -right-2 -bottom-2 text-[60px] text-white/5 group-hover:scale-110 transition-all duration-500 z-10"></i>
                                                <div className="relative z-20 h-full flex items-center px-6 gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-gray-700 flex items-center justify-center">
                                                        <i className="fa-solid fa-flask text-gray-300"></i>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-white tracking-tight">{batch.name}</h3>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Standard Track</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                })}`;

indexCode = indexCode.replace(oldBatchesMapRegex, newGamingBatchesMap);

fs.writeFileSync('c:/Users/risha/ATAXYbot/index.html', indexCode);
console.log('Gaming themes applied and bugs fixed!');
