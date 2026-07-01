const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// 1. Redesign Target Portal Add Target Form classes
content = content.replace(/className="bg-\[\#021633\] rounded-3xl shadow-\[0_-10px_40px_rgba\(0,0,0,0\.5\)\] border border-blue-900\/50 p-4 space-y-3 backdrop-blur-xl"/, 'className="bg-gradient-to-t from-[#010714] to-[#021633] rounded-[2rem] shadow-[0_-15px_40px_rgba(0,0,0,0.5)] border-t border-[#0AE0D0]/20 p-5 space-y-4 backdrop-blur-3xl relative overflow-hidden"');

content = content.replace(/className="flex-1 flex bg-\[\#010B1C\]\/50 rounded-xl px-3 py-2\.5 items-center border border-blue-900\/40"/g, 'className="flex-1 flex bg-[#010B1C]/80 rounded-xl px-3 py-2.5 items-center border border-blue-900/50 hover:border-[#0AE0D0]/50 focus-within:border-[#0AE0D0] transition-colors shadow-inner"');

content = content.replace(/className="flex bg-\[\#010B1C\]\/50 border border-blue-900\/40 rounded-xl overflow-hidden justify-center items-center px-2"/g, 'className="flex bg-[#010B1C]/80 border border-blue-900/50 hover:border-[#0AE0D0]/50 focus-within:border-[#0AE0D0] rounded-xl overflow-hidden justify-center items-center px-2 transition-colors shadow-inner"');

content = content.replace(/className="flex-1 bg-\[\#010B1C\]\/50 rounded-xl px-3 border border-blue-900\/40 flex items-center overflow-hidden"/g, 'className="flex-1 bg-[#010B1C]/80 rounded-xl px-3 border border-blue-900/50 hover:border-[#0AE0D0]/50 focus-within:border-[#0AE0D0] flex items-center overflow-hidden transition-colors shadow-inner"');

// 2. Add Target button class changes
content = content.replace(/<button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded-xl shadow-\[0_0_15px_rgba\(37,99,235,0\.4\)\] transition-colors flex items-center justify-center gap-2">/g, '<button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-[#0AE0D0] hover:from-blue-500 hover:to-[#00FFFF] text-white font-black py-3.5 rounded-xl shadow-[0_0_20px_rgba(10,224,208,0.4)] hover:shadow-[0_0_30px_rgba(10,224,208,0.6)] transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2 relative z-10">');

// 3. Redesign Target Portal Targets List (fix the regex)
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

content = content.replace(portalRegex, newPortalTargetItem);

fs.writeFileSync('index.html', content, 'utf8');
console.log("Updated Portal Form UI and Button");
