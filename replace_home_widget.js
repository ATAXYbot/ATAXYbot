const fs = require('fs');

let lines = fs.readFileSync('c:/Users/risha/ATAXYbot/index.html', 'utf8').split('\n');

const start = lines.findIndex(l => l.includes('setShowDetailedAnalyzer(true)'));
const end = lines.findIndex(l => l.includes('{/* Detailed Analyzer Modal */}'));

if (start !== -1 && end !== -1) {
    const newWidget = `                     {/* Home Tab Target Analyzer Widget */}
                     {(() => {
                         const todayTotal = currentTargets.length;
                         const todayDone = currentTargets.filter(t => t.done).length;
                         const todayRate = todayTotal > 0 ? Math.round((todayDone / todayTotal) * 100) : 0;
                         
                         return (
                             <div onClick={() => setShowDetailedAnalyzer(true)} className="bg-gradient-to-r from-gray-900 to-[#010714] dark:from-[#021633] dark:to-[#010B1C] rounded-2xl shadow-lg border border-[#0AE0D0]/20 animate-pop-bounce delay-150 relative overflow-hidden cursor-pointer hover:scale-[1.02] hover:shadow-[0_10px_20px_rgba(0,255,255,0.1)] transition-all duration-300 group flex flex-col">
                                 <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FFFF] rounded-full mix-blend-screen filter blur-[70px] opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity"></div>
                                 
                                 <div className="flex items-center justify-between p-4 pb-3 relative z-10">
                                     <div className="flex items-center gap-3">
                                         <div className="w-10 h-10 rounded-full bg-[#00FFFF]/10 flex items-center justify-center border border-[#00FFFF]/20">
                                             <i className="fa-solid fa-chart-pie text-[#00FFFF] text-lg"></i>
                                         </div>
                                         <div>
                                             <h3 className="font-black text-white text-sm tracking-wide">Target Analyzer</h3>
                                             <div className="flex items-center gap-2 mt-0.5">
                                                 <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Today's Progress</span>
                                                 <div className={\`text-xs font-black px-1.5 rounded bg-black/50 \${todayRate >= 85 ? 'text-green-400' : todayRate >= 50 ? 'text-blue-400' : 'text-orange-400'}\`}>{todayRate}%</div>
                                             </div>
                                         </div>
                                     </div>
                                     <div className="flex flex-col items-end">
                                         <div className={\`bg-gradient-to-r \${consistencyColor} px-2 py-0.5 rounded-sm text-white text-[9px] font-black uppercase tracking-widest shadow-md\`}>
                                             {consistencyScore}
                                         </div>
                                         <div className="text-[9px] font-mono text-gray-500 mt-1">{todayDone}/{todayTotal} Targets</div>
                                     </div>
                                 </div>
                                 
                                 {/* Full Width Progress Bar */}
                                 <div className="w-full h-1.5 bg-gray-800 relative z-10 border-t border-[#0AE0D0]/10">
                                     <div className="h-full bg-gradient-to-r from-[#00A7A7] to-[#00FFFF] transition-all duration-1000 relative" style={{ width: \`\${todayRate}%\` }}>
                                         <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                                     </div>
                                 </div>
                             </div>
                         );
                     })()}`;
                     
    lines.splice(start, end - start, newWidget + '\n');
    fs.writeFileSync('c:/Users/risha/ATAXYbot/index.html', lines.join('\n'));
    console.log("Replaced Home Widget successfully.");
} else {
    console.log("Could not find start or end boundaries.");
}
