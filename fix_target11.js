const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// 1. Redesign "Standalone Target Portal Button" to have glass shine and no internal button
const oldPortalButtonBlock = /\{\/\* Standalone Target Portal Button \*\/\}\s*<div className="bg-\[\#021633\] rounded-3xl p-5 shadow-xl border border-blue-500\/20 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden group">[\s\S]*?<\/button>\s*<\/div>/;

const newPortalButtonBlock = `{/* Standalone Target Portal Button */}
                            <div onClick={() => setShowTargetPortal(true)} className="group cursor-pointer bg-gradient-to-br from-[#021633]/90 to-[#010B1C]/90 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-blue-500/30 hover:border-[#0AE0D0]/50 mb-8 flex items-center justify-between gap-4 relative overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_15px_50px_rgba(10,224,208,0.2)]">
                                {/* Intense Glass Shine Effect */}
                                <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.2),transparent)] -translate-x-full group-hover:translate-x-full transition-transform duration-[1200ms] pointer-events-none"></div>
                                <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-600/30 rounded-full blur-[50px] pointer-events-none group-hover:bg-[#0AE0D0]/30 transition-colors duration-700"></div>
                                <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#0AE0D0]/20 rounded-full blur-[50px] pointer-events-none group-hover:bg-blue-500/30 transition-colors duration-700"></div>
                                
                                <div className="relative z-10 flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600/20 to-[#0AE0D0]/20 border border-[#0AE0D0]/40 flex items-center justify-center text-[#0AE0D0] group-hover:text-white group-hover:shadow-[0_0_25px_rgba(10,224,208,0.6)] group-hover:border-white transition-all duration-500 shrink-0">
                                        <i className="fa-solid fa-bullseye text-2xl group-hover:scale-110 transition-transform"></i>
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="text-white font-black text-xl tracking-wide group-hover:text-[#0AE0D0] transition-colors">Set Target</h3>
                                        <p className="text-blue-200/70 text-[10px] sm:text-xs font-bold tracking-widest uppercase mt-1 flex items-center gap-2">
                                            Plan like a pro <span className="w-1.5 h-1.5 rounded-full bg-[#0AE0D0] animate-pulse"></span>
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="relative z-10 w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#0AE0D0]/20 border border-transparent group-hover:border-[#0AE0D0]/50 transition-all duration-500 group-hover:translate-x-2 shrink-0">
                                    <i className="fa-solid fa-arrow-right text-gray-400 group-hover:text-white text-lg transition-colors"></i>
                                </div>
                            </div>`;

if (oldPortalButtonBlock.test(content)) {
    content = content.replace(oldPortalButtonBlock, newPortalButtonBlock);
    console.log("Updated Standalone Target Portal Button");
}

// 2. Add "Complete me" animation to Daily Targets
// Need to replace the daily target item jsx block again to add the animate-ping ring and breathing glowing shadow to the uncompleted items.
const oldDailyRegex = /return \(\s*<div key=\{t\.id\} className="relative overflow-hidden flex flex-col p-4 rounded-3xl bg-gradient-to-br from-\[\#021633\] to-\[\#010B1C\] border border-\[\#0AE0D0\]\/10 hover:border-\[\#0AE0D0\]\/40 shadow-\[0_4px_20px_rgba\(0,0,0,0\.3\)\] hover:shadow-\[0_0_25px_rgba\(10,224,208,0\.15\)\] transition-all duration-300 transform hover:-translate-y-1 group mb-4">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\);/g;

const newDailyTargetItem = `return (
        <div key={t.id} className={\`relative overflow-hidden flex flex-col p-4 rounded-3xl transition-all duration-300 transform group mb-4 \${t.done ? 'bg-gradient-to-br from-[#021633] to-[#010B1C] border border-[#0AE0D0]/10 hover:border-[#0AE0D0]/40 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:-translate-y-1' : 'bg-gradient-to-br from-[#021633] to-[#010B1C] border border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:-translate-y-1.5'}\`}>
            {/* Ambient Background Glow for incomplete tasks */}
            {!t.done && <div className="absolute inset-0 bg-blue-500/5 animate-[pulse_4s_ease-in-out_infinite] pointer-events-none"></div>}
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full mix-blend-screen filter blur-[40px] pointer-events-none group-hover:bg-[#0AE0D0]/20 transition-colors duration-700"></div>
            
            <div className="flex items-start justify-between gap-4 relative z-10">
                <div className="flex items-start gap-4 cursor-pointer flex-1" onClick={() => toggleTarget(t.id)}>
                    
                    <div className={\`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300 relative \${t.done ? 'bg-[#0AE0D0] border-[#0AE0D0] shadow-[0_0_10px_rgba(10,224,208,0.5)]' : 'bg-transparent border-blue-400 group-hover:border-[#0AE0D0]'}\`}>
                        {!t.done && <div className="absolute inset-0 rounded-md ring-2 ring-blue-500/40 animate-ping opacity-75 pointer-events-none"></div>}
                        <i className={\`fa-solid fa-check text-xs text-[#010B1C] transition-opacity duration-300 \${t.done ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}\`}></i>
                    </div>
                    
                    <div className="flex flex-col">
                        <span className={\`text-[15px] font-black transition-colors \${t.done ? 'text-gray-500 line-through' : 'text-white group-hover:text-[#0AE0D0]'}\`}>{t.text}</span>
                        
                        <div className="flex flex-wrap items-center gap-2 mt-2.5">
                            {t.category && <span className={\`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-inner \${catColor}\`}>{t.category}</span>}
                            {t.priority && <span className={\`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-inner \${priColor}\`}><i className="fa-solid fa-bolt text-yellow-400 mr-1"></i> {t.priority}</span>}
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-col items-end justify-between h-full gap-3">
                    <button onClick={(e) => { e.stopPropagation(); deleteTarget(t.id); }} className="text-gray-500 hover:text-rose-500 hover:bg-rose-500/10 w-8 h-8 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                        <i className="fa-solid fa-trash text-sm"></i>
                    </button>
                    {t.targetTime && <span className="text-[10px] text-gray-400 font-mono font-bold bg-[#010B1C]/80 px-2 py-1 rounded-md border border-gray-800"><i className="fa-regular fa-clock text-[#0AE0D0]/70 mr-1"></i>{t.targetTime}</span>}
                </div>
            </div>
        </div>
    );`;

if (oldDailyRegex.test(content)) {
    content = content.replace(oldDailyRegex, newDailyTargetItem);
    console.log("Updated Daily Targets Animation");
} else {
    console.log("Could not find the Daily Targets block with regex.");
}

fs.writeFileSync('index.html', content, 'utf8');
