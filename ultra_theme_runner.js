const fs = require('fs');

let code = fs.readFileSync('c:/Users/risha/ATAXYbot/index.html', 'utf8');

// 1. Add practiceShowTopicModal state
if (!code.includes('const [practiceShowTopicModal, setPracticeShowTopicModal]')) {
    code = code.replace(
        "const [practiceShowPalette, setPracticeShowPalette] = useState(false);",
        "const [practiceShowPalette, setPracticeShowPalette] = useState(false);\n            const [practiceShowTopicModal, setPracticeShowTopicModal] = useState(false);"
    );
}

// 2. Update Theme Variables
const oldVars = `                    const themeText = isNeet ? 'text-[#00a651]' : isJee ? 'text-[#00418d]' : 'text-gray-800 dark:text-gray-200';
                    const themeBg = isNeet ? 'bg-[#00a651]' : isJee ? 'bg-[#00418d]' : 'bg-gray-800';
                    const themeBorder = isNeet ? 'border-[#00a651]' : isJee ? 'border-[#00418d]' : 'border-gray-800';
                    const themeHoverBorder = isNeet ? 'hover:border-[#00a651] dark:hover:border-[#00a651]' : isJee ? 'hover:border-[#00418d] dark:hover:border-[#00418d]' : 'hover:border-gray-400 dark:hover:border-gray-500';
                    const themeHoverText = isNeet ? 'group-hover:text-[#00a651]' : isJee ? 'group-hover:text-[#00418d]' : 'group-hover:text-gray-600 dark:group-hover:text-gray-300';
                    const themeGroupHoverBg = isNeet ? 'group-hover:bg-[#00a651]' : isJee ? 'group-hover:bg-[#00418d]' : 'group-hover:bg-gray-700';
                    const themeLightBg = isNeet ? 'bg-green-50 dark:bg-green-900/20' : isJee ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-gray-900/20';
                    const themeLightBorder = isNeet ? 'border-green-200 dark:border-green-800' : isJee ? 'border-blue-200 dark:border-blue-800' : 'border-gray-200 dark:border-gray-800';
                    const themeRing = isNeet ? 'ring-[#00a651]' : isJee ? 'ring-[#00418d]' : 'ring-gray-800';
                    const themeIcon = isNeet ? 'fa-stethoscope' : isJee ? 'fa-microchip' : 'fa-book';
                    const themeActiveBg = isNeet ? 'bg-[#008c44]' : isJee ? 'bg-[#002f6c]' : 'bg-gray-900';`;

const newVars = `                    const themeText = isNeet ? 'text-[#00418d]' : isJee ? 'text-[#0ea5e9]' : 'text-gray-800 dark:text-gray-200';
                    const themeBg = isNeet ? 'bg-[#00418d]' : isJee ? 'bg-[#0f172a]' : 'bg-gray-800';
                    const themeBorder = isNeet ? 'border-[#00418d]' : isJee ? 'border-[#0ea5e9]' : 'border-gray-800';
                    const themeHoverBorder = isNeet ? 'hover:border-[#00418d] dark:hover:border-[#00418d]' : isJee ? 'hover:border-[#0ea5e9] dark:hover:border-[#0ea5e9]' : 'hover:border-gray-400 dark:hover:border-gray-500';
                    const themeHoverText = isNeet ? 'group-hover:text-[#00418d]' : isJee ? 'group-hover:text-[#0ea5e9]' : 'group-hover:text-gray-600 dark:group-hover:text-gray-300';
                    const themeGroupHoverBg = isNeet ? 'group-hover:bg-[#00418d]' : isJee ? 'group-hover:bg-[#0ea5e9]' : 'group-hover:bg-gray-700';
                    const themeLightBg = isNeet ? 'bg-blue-50 dark:bg-blue-900/20' : isJee ? 'bg-slate-900 dark:bg-slate-900' : 'bg-gray-50 dark:bg-gray-900/20';
                    const themeLightBorder = isNeet ? 'border-blue-200 dark:border-blue-800' : isJee ? 'border-slate-700 dark:border-slate-700' : 'border-gray-200 dark:border-gray-800';
                    const themeRing = isNeet ? 'ring-[#00418d]' : isJee ? 'ring-[#0ea5e9]' : 'ring-gray-800';
                    const themeIcon = isNeet ? 'fa-stethoscope' : isJee ? 'fa-microchip' : 'fa-book';
                    const themeActiveBg = isNeet ? 'bg-[#003370]' : isJee ? 'bg-[#020617]' : 'bg-gray-900';`;

code = code.replace(oldVars, newVars);


// 3. Stunning Level 1 Batch Cards
// The current PRACTICE_BATCHES map block
const oldBatchesMap = `                                {PRACTICE_BATCHES.map(batch => {
                                    let bgClass = 'bg-gradient-to-br from-gray-800 to-gray-900';
                                    let iconClass = 'text-white/5';
                                    let iconName = 'fa-folder';

                                    if (batch.type === 'neet') {
                                        bgClass = 'bg-gradient-to-br from-[#00a651] to-[#008c44] shadow-[0_8px_30px_rgb(0,166,81,0.2)]';
                                        iconClass = 'text-white/10';
                                        iconName = 'fa-stethoscope';
                                    } else if (batch.type === 'jee') {
                                        bgClass = 'bg-gradient-to-br from-[#00418d] to-[#002f6c] shadow-[0_8px_30px_rgb(0,65,141,0.2)]';
                                        iconClass = 'text-white/10';
                                        iconName = 'fa-microchip';
                                    } else if (batch.type === 'checking') {
                                        bgClass = 'bg-gradient-to-br from-gray-700 to-gray-900 shadow-[0_8px_30px_rgb(0,0,0,0.2)]';
                                        iconClass = 'text-white/5';
                                        iconName = 'fa-vial';
                                    }

                                    return (
                                        <div key={batch.id} onClick={() => setActivePracticeBatch(batch)} className={\`p-6 rounded-3xl cursor-pointer hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 relative overflow-hidden \${bgClass}\`}>
                                            <div className="relative z-10">
                                                <h3 className="text-xl font-black mb-1 text-white flex items-center gap-2">
                                                    {batch.type === 'neet' && <i className="fa-solid fa-user-doctor text-green-300 text-sm"></i>}
                                                    {batch.type === 'jee' && <i className="fa-solid fa-helmet-safety text-blue-300 text-sm"></i>}
                                                    {batch.name}
                                                </h3>
                                                <p className={\`text-xs font-bold tracking-widest uppercase \${batch.type === 'jee' ? 'text-blue-300' : batch.type === 'neet' ? 'text-green-300' : 'text-gray-400'}\`}>
                                                    {batch.type === 'jee' ? 'Future Engineer Track' : batch.type === 'neet' ? 'Future Doctor Track' : 'Standard Practice Track'}
                                                </p>
                                            </div>
                                            <i className={\`fa-solid \${iconName} \${iconClass} absolute -right-4 -bottom-4 text-6xl\`}></i>
                                        </div>
                                    );
                                })}`;

const newBatchesMap = `                                {PRACTICE_BATCHES.map(batch => {
                                    let bgClass = 'bg-gradient-to-br from-gray-800 to-gray-900';
                                    let iconClass = 'text-white/5';
                                    let iconName = 'fa-folder';

                                    if (batch.type === 'neet') {
                                        bgClass = 'bg-[#00418d] shadow-[0_8px_30px_rgb(0,65,141,0.3)] border border-blue-400/20';
                                        iconClass = 'text-white/5';
                                        iconName = 'fa-stethoscope';
                                    } else if (batch.type === 'jee') {
                                        bgClass = 'bg-[#0f172a] shadow-[0_8px_30px_rgb(15,23,42,0.4)] border border-cyan-500/20';
                                        iconClass = 'text-cyan-500/5';
                                        iconName = 'fa-microchip';
                                    } else if (batch.type === 'checking') {
                                        bgClass = 'bg-gradient-to-br from-gray-800 to-gray-900 shadow-[0_8px_30px_rgb(0,0,0,0.3)] border border-gray-700';
                                        iconClass = 'text-white/5';
                                        iconName = 'fa-vial';
                                    }

                                    return (
                                        <div key={batch.id} onClick={() => setActivePracticeBatch(batch)} className={\`p-8 rounded-[2rem] cursor-pointer hover:-translate-y-2 active:scale-[0.98] transition-all duration-500 relative overflow-hidden group \${bgClass}\`}>
                                            {/* Dynamic Glow Effect */}
                                            <div className={\`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 \${batch.type === 'neet' ? 'bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.3),_transparent_60%)]' : batch.type === 'jee' ? 'bg-[radial-gradient(circle_at_top_right,_rgba(6,182,212,0.15),_transparent_60%)]' : ''}\`}></div>
                                            
                                            {/* Medical/Engineer Pattern Overlay */}
                                            {batch.type === 'neet' && <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>}
                                            {batch.type === 'jee' && <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay"></div>}

                                            <div className="relative z-10 flex flex-col h-full justify-center">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className={\`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner backdrop-blur-sm \${batch.type === 'neet' ? 'bg-white/10 text-blue-100' : batch.type === 'jee' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-white/10 text-white'}\`}>
                                                        <i className={\`fa-solid \${batch.type === 'neet' ? 'fa-user-doctor' : batch.type === 'jee' ? 'fa-helmet-safety' : 'fa-flask'}\`}></i>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-2xl font-black text-white tracking-tight">{batch.name}</h3>
                                                        <p className={\`text-xs font-bold tracking-widest uppercase mt-0.5 \${batch.type === 'jee' ? 'text-cyan-400' : batch.type === 'neet' ? 'text-blue-200' : 'text-gray-400'}\`}>
                                                            {batch.type === 'jee' ? 'Future Engineer Track' : batch.type === 'neet' ? 'Future Doctor Track' : 'Standard Practice Track'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Large Watermark Icon */}
                                            <i className={\`fa-solid \${iconName} \${iconClass} absolute -right-6 -bottom-6 text-[100px] group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700 ease-out\`}></i>
                                        </div>
                                    );
                                })}`;

code = code.replace(oldBatchesMap, newBatchesMap);


// 4. Replace <select> with Custom Button
const oldSelectDiv = `<div className={\`relative flex items-center border rounded-sm transition-all \${practiceSelectedTopic ? themeBorder + ' ' + themeLightBg : 'border-gray-300 bg-white hover:border-gray-400'}\`}>
                                            <div className={\`absolute left-2 \${practiceSelectedTopic ? themeText : 'text-gray-400'} pointer-events-none\`}>
                                                <i className="fa-solid fa-filter text-[10px]"></i>
                                            </div>
                                            <select
                                                value={practiceSelectedTopic || ""}
                                                onChange={(e) => {
                                                    setPracticeSelectedTopic(e.target.value || null);
                                                    setCurrentQuestionIndex(0);
                                                }}
                                                className={\`appearance-none pl-6 pr-6 py-1.5 text-xs font-bold outline-none cursor-pointer w-[140px] md:w-[180px] bg-transparent truncate \${practiceSelectedTopic ? themeText : 'text-gray-600'}\`}
                                            >
                                                <option value="">All Topics</option>
                                                {activePracticeChapter.topics?.map((top, i) => (
                                                    <option key={i} value={top.name}>{top.name}</option>
                                                ))}
                                            </select>
                                            <div className={\`absolute right-2 \${practiceSelectedTopic ? themeText : 'text-gray-400'} pointer-events-none\`}>
                                                <i className="fa-solid fa-chevron-down text-[10px]"></i>
                                            </div>
                                        </div>`;

const customButton = `<button 
                                            onClick={() => setPracticeShowTopicModal(true)}
                                            className={\`flex items-center gap-2 border rounded-sm transition-all px-3 py-1.5 \${practiceSelectedTopic ? themeBorder + ' ' + themeLightBg : 'border-gray-300 bg-white hover:border-gray-400'}\`}
                                        >
                                            <i className={\`fa-solid fa-filter text-[10px] \${practiceSelectedTopic ? themeText : 'text-gray-400'}\`}></i>
                                            <span className={\`text-xs font-bold truncate max-w-[120px] md:max-w-[160px] \${practiceSelectedTopic ? themeText : 'text-gray-600'}\`}>
                                                {practiceSelectedTopic ? safeRenderText(practiceSelectedTopic) : 'All Topics'}
                                            </span>
                                            <i className={\`fa-solid fa-chevron-down text-[10px] \${practiceSelectedTopic ? themeText : 'text-gray-400'}\`}></i>
                                        </button>`;

code = code.replace(oldSelectDiv, customButton);


// 5. Append Custom Bottom-Sheet Modal for Topics
// It should be placed right above the Palette Slide-over Modal
const paletteStart = `{/* CBT Palette Slide-over Modal */}`;

const topicModal = `{/* Stunning Custom Topic Modal */}
                                {practiceShowTopicModal && (
                                    <div className="fixed inset-0 z-[99999] flex flex-col justify-end items-center sm:items-center sm:justify-center">
                                        {/* Backdrop */}
                                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setPracticeShowTopicModal(false)}></div>
                                        
                                        {/* Modal Body */}
                                        <div className={\`relative w-full sm:w-[400px] sm:rounded-3xl rounded-t-3xl bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-full duration-300 pb-safe\`}>
                                            {/* Header */}
                                            <div className={\`p-5 \${themeBg} text-white flex justify-between items-center shrink-0\`}>
                                                <h3 className="font-bold text-lg tracking-wide flex items-center gap-2"><i className="fa-solid fa-list-ul"></i> Select Topic</h3>
                                                <button onClick={() => setPracticeShowTopicModal(false)} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors active:scale-95"><i className="fa-solid fa-xmark"></i></button>
                                            </div>
                                            
                                            {/* Scrollable List */}
                                            <div className="p-2 overflow-y-auto max-h-[60vh] bg-gray-50 flex flex-col gap-1">
                                                <button 
                                                    onClick={() => { setPracticeSelectedTopic(null); setCurrentQuestionIndex(0); setPracticeShowTopicModal(false); }}
                                                    className={\`p-4 rounded-xl flex items-center justify-between transition-all active:scale-98 \${!practiceSelectedTopic ? themeLightBg + ' ' + themeBorder + ' border shadow-sm' : 'bg-white border border-transparent hover:border-gray-200 hover:bg-gray-100 text-gray-700'}\`}
                                                >
                                                    <span className={\`font-bold \${!practiceSelectedTopic ? themeText : ''}\`}>All Topics Combined</span>
                                                    {!practiceSelectedTopic && <i className={\`fa-solid fa-circle-check \${themeText} text-lg\`}></i>}
                                                </button>

                                                {activePracticeChapter.topics?.map((top, i) => {
                                                    const isSelected = practiceSelectedTopic === top.name;
                                                    const qCount = top.questions?.length || 0;
                                                    return (
                                                        <button 
                                                            key={i}
                                                            onClick={() => { setPracticeSelectedTopic(top.name); setCurrentQuestionIndex(0); setPracticeShowTopicModal(false); }}
                                                            className={\`p-4 rounded-xl flex items-center justify-between transition-all active:scale-[0.98] \${isSelected ? themeLightBg + ' ' + themeBorder + ' border shadow-sm' : 'bg-white border border-transparent hover:border-gray-200 hover:bg-gray-100 text-gray-700'}\`}
                                                        >
                                                            <div className="flex flex-col items-start text-left">
                                                                <span className={\`font-bold text-sm line-clamp-2 \${isSelected ? themeText : ''}\`}>{safeRenderText(top.name)}</span>
                                                                <span className="text-[10px] font-semibold text-gray-500 mt-1 bg-gray-100 px-2 py-0.5 rounded-sm">{qCount} Qs</span>
                                                            </div>
                                                            {isSelected && <i className={\`fa-solid fa-circle-check \${themeText} text-lg shrink-0 ml-3\`}></i>}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                `;

code = code.replace(paletteStart, topicModal + paletteStart);

fs.writeFileSync('c:/Users/risha/ATAXYbot/index.html', code);
console.log('Ultra Theme applied successfully!');
