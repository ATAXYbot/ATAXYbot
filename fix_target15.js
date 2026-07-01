const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const oldRegex = /<div key=\{group\.date\} className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">[\s\S]*?<div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">[\s\S]*?<h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">[\s\S]*?<i className="fa-regular fa-calendar text-blue-500"><\/i> \{group\.date === todayStr \? 'Today' : group\.date\}[\s\S]*?<\/h3>[\s\S]*?<\/div>/;

const newHeader = `<div key={group.date} className="bg-[#021633]/80 rounded-[2rem] p-5 shadow-lg border border-[#0AE0D0]/20 mb-6 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(10,224,208,0.15)] hover:border-[#0AE0D0]/40 group/groupcard">
                                            {(() => {
                                                const total = group.targets.length;
                                                const done = group.targets.filter(t => t.done).length;
                                                const rate = total > 0 ? Math.round((done / total) * 100) : 0;
                                                return (
                                                    <div className="flex items-center justify-between mb-5 pb-4 border-b border-blue-900/50">
                                                        <h3 className="font-black text-white text-lg flex items-center gap-2 tracking-wide">
                                                            <i className="fa-regular fa-calendar text-[#0AE0D0] group-hover/groupcard:animate-pulse"></i> {group.date === todayStr ? 'Today' : group.date}
                                                        </h3>
                                                        
                                                        {total > 0 && (
                                                            <div className="flex items-center gap-3 bg-[#010B1C]/50 px-3 py-1.5 rounded-2xl border border-blue-900/30">
                                                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-right">
                                                                    <span className="block text-[#0AE0D0] text-sm">{rate}%</span>
                                                                    {done}/{total}
                                                                </div>
                                                                <div className="w-8 h-8 relative shrink-0">
                                                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                                                        <path className="stroke-blue-950" strokeWidth="4" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                                                        <path className="stroke-[#0AE0D0] drop-shadow-[0_0_5px_rgba(10,224,208,0.5)]" strokeDasharray={\`\${rate}, 100\`} strokeWidth="4" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })()}`;

if (oldRegex.test(content)) {
    content = content.replace(oldRegex, newHeader);
    console.log("Updated date group header to include progress circle.");
} else {
    console.log("Could not find the date group header block.");
}

fs.writeFileSync('index.html', content, 'utf8');
