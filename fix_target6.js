const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const startStr = '<div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 rounded-2xl p-4 mb-6 flex items-center gap-4 relative overflow-hidden group shadow-lg">';
const endStr = '<div id="tour-target-list" className="space-y-2 mb-4 min-h-[60px]">';

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
    const newCircularWidget = `{(() => {
                                const todayTotal = currentTargets.length;
                                const todayDone = currentTargets.filter(t => t.done).length;
                                const todayRate = todayTotal > 0 ? Math.round((todayDone / todayTotal) * 100) : 0;
                                return (
                                    <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 rounded-2xl p-4 mb-6 flex items-center gap-4 relative overflow-hidden group shadow-lg">
                                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-400/30 transition-colors duration-700"></div>
                                        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent,rgba(59,130,246,0.1),transparent)] -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>
                                        
                                        <div className="w-16 h-16 relative shrink-0">
                                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                                <path className="stroke-blue-950" strokeWidth="4" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                                <path className="stroke-blue-400 animate-[drawCircle_1.5s_ease-out_forwards] drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" strokeDasharray={\`\${todayRate}, 100\`} strokeWidth="4" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                                <span className="text-[13px] font-black text-white drop-shadow-md">{todayRate}%</span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex-1 relative z-10">
                                            <h4 className="text-white font-black text-sm tracking-wide">Today's Progress</h4>
                                            <p className="text-[10px] text-blue-200/70 font-bold uppercase tracking-wider mt-1">{todayDone} out of {todayTotal} Targets Completed</p>
                                        </div>
                                    </div>
                                );
                            })()}
                            `;
                            
    content = content.substring(0, startIndex) + newCircularWidget + content.substring(endIndex);
    console.log("Successfully replaced the circular widget with today's rate logic.");
} else {
    console.log("Could not find start or end index.");
}

fs.writeFileSync('index.html', content, 'utf8');
