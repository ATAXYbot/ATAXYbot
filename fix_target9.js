const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// 1. Rename "Set Target Portal" to "Set Target"
content = content.replace(/>Set Target Portal<\/h3>/g, '>Set Target</h3>');
content = content.replace(/>Open Portal <i/g, '>Open <i');
content = content.replace(/>Advanced Target Portal<\/h2>/g, '>Set Target</h2>');

// 2. Daily Targets UI in Home Tab
const dailyRegex = /return \(\s*<div key=\{t\.id\} className="relative overflow-hidden flex flex-col p-4 rounded-2xl bg-\[\#010B1C\]\/50 border border-blue-900\/40 hover:border-blue-500\/50 shadow-md transition-all duration-300 transform hover:scale-\[1\.01\] group mb-3">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\);/g;

const newDailyTargetItem = `return (
        <div key={t.id} className="relative overflow-hidden flex flex-col p-4 rounded-3xl bg-gradient-to-br from-[#021633] to-[#010B1C] border border-[#0AE0D0]/10 hover:border-[#0AE0D0]/40 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_0_25px_rgba(10,224,208,0.15)] transition-all duration-300 transform hover:-translate-y-1 group mb-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full mix-blend-screen filter blur-[40px] pointer-events-none group-hover:bg-[#0AE0D0]/20 transition-colors duration-700"></div>
            
            <div className="flex items-start justify-between gap-4 relative z-10">
                <div className="flex items-start gap-4 cursor-pointer flex-1" onClick={() => toggleTarget(t.id)}>
                    <div className={\`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300 \${t.done ? 'bg-[#0AE0D0] border-[#0AE0D0] shadow-[0_0_10px_rgba(10,224,208,0.5)]' : 'bg-transparent border-gray-600 group-hover:border-[#0AE0D0]'}\`}>
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

if (dailyRegex.test(content)) {
    content = content.replace(dailyRegex, newDailyTargetItem);
    console.log("Updated Daily Targets UI");
}

// 3. Redesign Target Portal Targets List
const portalRegex = /<div key=\{t\.id\} className=\{\`flex items-center justify-between p-3 rounded-2xl border transition-all \$\{t\.done \? 'bg-gray-50 dark:bg-gray-800\/50 border-transparent opacity-70' : 'bg-gradient-to-r from-blue-50\/50 to-indigo-50\/50 dark:from-blue-900\/10 dark:to-indigo-900\/10 border-blue-100 dark:border-blue-900\/30'\}\`\}>[\s\S]*?<\/div>\s*<\/button>\s*<\/div>/g;

const newPortalTargetItem = `<div key={t.id} className={\`group relative overflow-hidden flex items-center justify-between p-4 rounded-3xl border shadow-md transition-all duration-300 transform hover:-translate-y-0.5 \${t.done ? 'bg-gray-100 dark:bg-[#021633]/50 border-[#0AE0D0]/10 opacity-70' : 'bg-white dark:bg-gradient-to-br dark:from-[#021633] dark:to-[#010B1C] border-blue-100 dark:border-[#0AE0D0]/20 hover:border-blue-300 dark:hover:border-[#0AE0D0]/50 dark:hover:shadow-[0_0_15px_rgba(10,224,208,0.1)]'}\`}>
                                                            <div className="flex items-center gap-4 cursor-pointer flex-1 relative z-10" onClick={() => {
                                                                const updated = group.targets.map(x => x.id === t.id ? { ...x, done: !x.done } : x);
                                                                setTargetsData({ ...targetsData, [group.date]: updated });
                                                            }}>
                                                                <div className={\`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-300 \${t.done ? 'bg-[#0AE0D0] border-[#0AE0D0] shadow-[0_0_10px_rgba(10,224,208,0.5)]' : 'border-gray-300 dark:border-gray-600 group-hover:border-[#0AE0D0]'}\`}>
                                                                    <i className={\`fa-solid fa-check text-[#010B1C] text-xs transition-opacity duration-300 \${t.done ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}\`}></i>
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className={\`text-[15px] font-black transition-colors \${t.done ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-[#0AE0D0]'}\`}>{t.text}</span>
                                                                    {(t.startTime || t.endTime) && <span className={\`text-[10px] font-black tracking-wider mt-1 inline-flex items-center gap-1 \${t.done ? 'text-gray-400' : 'text-blue-500 dark:text-[#0AE0D0]'}\`}><i className="fa-regular fa-clock"></i>{t.startTime || '?'} - {t.endTime || '?'}</span>}
                                                                </div>
                                                            </div>
                                                            <button onClick={(e) => {
                                                                e.stopPropagation();
                                                                const updated = group.targets.filter(x => x.id !== t.id);
                                                                setTargetsData({ ...targetsData, [group.date]: updated });
                                                            }} className="w-8 h-8 rounded-full text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shrink-0 relative z-10">
                                                                <i className="fa-solid fa-trash text-sm"></i>
                                                            </button>
                                                        </div>`;

if (portalRegex.test(content)) {
    content = content.replace(portalRegex, newPortalTargetItem);
    console.log("Updated Portal Targets UI");
}

fs.writeFileSync('index.html', content, 'utf8');
