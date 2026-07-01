const fs = require('fs');

function refactor() {
    let content = fs.readFileSync('index.html', 'utf-8');

    // 1. Add showTargetPortal state
    const state_pattern = /const \[targetsData, setTargetsData\] = useState\(\(\) => safeGetJSON\('ataxy_targets', null\) \|\| \{\}\);/;
    const state_replacement = `const [targetsData, setTargetsData] = useState(() => safeGetJSON('ataxy_targets', null) || {});\n            const [showTargetPortal, setShowTargetPortal] = useState(false);\n            const [targetPortalTab, setTargetPortalTab] = useState('present');`;
    if (state_pattern.test(content)) {
        content = content.replace(state_pattern, state_replacement);
    } else {
        console.log("Could not find targetsData state declaration");
    }

    // 2. Add 'Set Target' button
    const greeting_pattern = /Ready to crack your goals\?<\/p>\s*<\/div>/;
    const greeting_replacement = `Ready to crack your goals?</p>
                                    <button onClick={() => setShowTargetPortal(true)} className="mt-3 bg-white/20 hover:bg-white/30 text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-2 transition-colors border border-white/20 shadow-lg active:scale-95">
                                        <i className="fa-solid fa-bullseye"></i> Set Target Portal
                                    </button>
                                </div>`;
    content = content.replace(greeting_pattern, greeting_replacement);

    // 3. Modify Home Tab Daily Targets
    // We want to replace the date picker input and remove the form
    const date_picker_pattern = /<input type="date" min="2026-01-01" max="2126-12-31" value=\{selectedDate\} onChange=\{\(e\) => setSelectedDate\(e\.target\.value\)\} className="[^"]+" \/>/;
    content = content.replace(date_picker_pattern, ' <span className="text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">Today</span>');

    // Remove the form completely
    const form_pattern = /<form onSubmit=\{addTarget\} className="flex flex-col sm:flex-row gap-2 border-t border-gray-100 dark:border-gray-800 pt-4 mt-2">.*?<\/form>/s;
    content = content.replace(form_pattern, '');

    // Force Home Tab currentTargets to use todayStr only.
    const currentTargets_pattern = /const currentTargets = targetsData\[selectedDate\] \|\| \[\];/;
    content = content.replace(currentTargets_pattern, 'const currentTargets = targetsData[getTodayStr()] || [];');

    // 4. Inject TargetPortalOverlay component
    const portal_component = `
            const TargetPortalOverlay = () => {
                if (!showTargetPortal) return null;
                const todayStr = getTodayStr();
                
                const tabs = [
                    { id: 'past', label: 'Past', icon: 'fa-history' },
                    { id: 'present', label: 'Today', icon: 'fa-calendar-day' },
                    { id: 'future', label: 'Future', icon: 'fa-forward' }
                ];
                
                const getFilteredTargets = () => {
                    const allDates = Object.keys(targetsData).sort();
                    let datesToShow = [];
                    if (targetPortalTab === 'past') {
                        datesToShow = allDates.filter(d => d < todayStr).sort((a,b)=>a<b?1:-1); // sort descending
                    } else if (targetPortalTab === 'present') {
                        datesToShow = allDates.filter(d => d === todayStr);
                    } else if (targetPortalTab === 'future') {
                        datesToShow = allDates.filter(d => d > todayStr);
                    }
                    
                    return datesToShow.map(date => ({
                        date,
                        targets: targetsData[date] || []
                    })).filter(group => group.targets.length > 0 || group.date === selectedDate);
                };
                
                const renderAnalyzer = () => {
                    const allTargets = Object.values(targetsData).flat();
                    const total = allTargets.length;
                    const done = allTargets.filter(t => t.done).length;
                    const rate = total > 0 ? Math.round((done / total) * 100) : 0;
                    
                    return (
                        <div className="bg-gradient-to-br from-[#00A7A7] to-cyan-700 rounded-3xl p-5 text-white mb-6 shadow-xl shadow-cyan-500/20 relative overflow-hidden">
                            <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                            <h3 className="text-lg font-black mb-1 flex items-center gap-2"><i className="fa-solid fa-chart-line"></i> Target Analyzer</h3>
                            <p className="text-white/80 text-xs mb-4">Overall Performance Overview</p>
                            
                            <div className="flex gap-4 items-center">
                                <div className="w-20 h-20 relative shrink-0">
                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                        <path className="stroke-white/20" strokeWidth="4" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                        <path className="stroke-white animate-[drawCircle_1.5s_ease-out_forwards]" strokeDasharray={\`\${rate}, 100\`} strokeWidth="4" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                                        <span className="text-xl font-black">{rate}%</span>
                                    </div>
                                </div>
                                <div className="flex-1 grid grid-cols-2 gap-2">
                                    <div className="bg-white/10 rounded-xl p-2 text-center">
                                        <div className="text-2xl font-black">{total}</div>
                                        <div className="text-[10px] uppercase tracking-wider opacity-70">Total Targets</div>
                                    </div>
                                    <div className="bg-white/10 rounded-xl p-2 text-center">
                                        <div className="text-2xl font-black">{done}</div>
                                        <div className="text-[10px] uppercase tracking-wider opacity-70">Completed</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                };

                return (
                    <div className="fixed inset-0 z-[3000000] bg-gray-50/95 dark:bg-gray-950/95 backdrop-blur-xl animate-in fade-in zoom-in-95 flex flex-col">
                        <div className="flex-none pt-[calc(env(safe-area-inset-top)+1rem)] bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
                            <div className="h-16 px-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setShowTargetPortal(false)} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-300 active:scale-95 transition-transform">
                                        <i className="fa-solid fa-arrow-left"></i>
                                    </button>
                                    <div>
                                        <h2 className="text-lg font-black text-gray-900 dark:text-white leading-none">Advanced Target Portal</h2>
                                        <span className="text-xs text-gray-500 font-medium">Plan like a pro</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex px-4 gap-2 pb-3 pt-1 overflow-x-auto hide-scrollbar">
                                {tabs.map(tab => (
                                    <button 
                                        key={tab.id}
                                        onClick={() => setTargetPortalTab(tab.id)}
                                        className={\`px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all \${targetPortalTab === tab.id ? 'bg-[#00A7A7] text-white shadow-md shadow-cyan-500/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}\`}
                                    >
                                        <i className={\`fa-solid \${tab.icon}\`}></i> {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 pb-[180px]">
                            {renderAnalyzer()}
                            
                            <div className="space-y-6">
                                {getFilteredTargets().length === 0 && targetPortalTab !== 'present' ? (
                                    <div className="text-center py-10 text-gray-400">
                                        <i className="fa-regular fa-calendar-xmark text-4xl mb-3 opacity-50"></i>
                                        <p className="font-medium">No targets found for {targetPortalTab} dates.</p>
                                    </div>
                                ) : (
                                    getFilteredTargets().map(group => (
                                        <div key={group.date} className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                                            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">
                                                <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                                    <i className="fa-regular fa-calendar text-cyan-500"></i> {group.date === todayStr ? 'Today' : group.date}
                                                </h3>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                {group.targets.length === 0 ? (
                                                    <p className="text-xs text-gray-400 italic text-center py-2">No targets.</p>
                                                ) : (
                                                    group.targets.map(t => (
                                                        <div key={t.id} className={\`flex items-center justify-between p-3 rounded-2xl border transition-all \${t.done ? 'bg-gray-50 dark:bg-gray-800/50 border-transparent opacity-70' : 'bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 border-blue-100 dark:border-blue-900/30'}\`}>
                                                            <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => {
                                                                const updated = group.targets.map(x => x.id === t.id ? { ...x, done: !x.done } : x);
                                                                setTargetsData({ ...targetsData, [group.date]: updated });
                                                            }}>
                                                                <div className={\`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 \${t.done ? 'bg-green-500 border-green-500' : 'border-blue-400'}\`}>
                                                                    {t.done && <i className="fa-solid fa-check text-white text-xs"></i>}
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className={\`text-sm font-bold \${t.done ? 'line-through text-gray-500' : 'text-gray-800 dark:text-gray-100'}\`}>{t.text}</span>
                                                                    {(t.startTime || t.endTime) && <span className={\`text-[10px] font-black tracking-wider \${t.done ? 'text-gray-400' : 'text-blue-500 dark:text-blue-400'}\`}><i className="fa-regular fa-clock mr-1"></i>{t.startTime || '?'} - {t.endTime || '?'}</span>}
                                                                </div>
                                                            </div>
                                                            <button onClick={() => {
                                                                const updated = group.targets.filter(x => x.id !== t.id);
                                                                setTargetsData({ ...targetsData, [group.date]: updated });
                                                            }} className="w-8 h-8 rounded-full text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-colors shrink-0">
                                                                <i className="fa-solid fa-trash text-xs"></i>
                                                            </button>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Add Target Floating Bar */}
                        <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent dark:from-gray-950 dark:via-gray-950 pt-12 pb-[max(1rem,env(safe-area-inset-bottom))]">
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                if (!newTarget.trim()) return;
                                const dateToUse = selectedDate || todayStr;
                                const current = targetsData[dateToUse] || [];
                                const updated = [...current, { id: Date.now(), text: newTarget, done: false, startTime: newTargetStartTime, endTime: newTargetEndTime }];
                                setTargetsData({ ...targetsData, [dateToUse]: updated });
                                setNewTarget('');
                                setNewTargetStartTime('');
                                setNewTargetEndTime('');
                                if(targetPortalTab !== 'past' && dateToUse > todayStr) setTargetPortalTab('future');
                                else if(targetPortalTab !== 'past' && dateToUse === todayStr) setTargetPortalTab('present');
                            }} className="bg-white dark:bg-gray-900 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-gray-800 p-3 space-y-3">
                                
                                <div className="flex items-center gap-2 px-2">
                                    <div className="flex-1 flex bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2 items-center border border-gray-200 dark:border-gray-700">
                                        <i className="fa-regular fa-calendar text-gray-400 mr-2"></i>
                                        <input type="date" min="2026-01-01" max="2126-12-31" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-transparent border-none outline-none text-sm font-bold text-gray-700 dark:text-gray-200 w-full" required />
                                    </div>
                                    <div className="flex bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden justify-center items-center px-1">
                                        <input type="time" value={newTargetStartTime} onChange={(e) => setNewTargetStartTime(e.target.value)} className="w-20 bg-transparent px-1 py-2 text-xs font-bold focus:outline-none dark:text-white text-center" title="Start Time" />
                                        <span className="text-gray-400 text-xs">-</span>
                                        <input type="time" value={newTargetEndTime} onChange={(e) => setNewTargetEndTime(e.target.value)} className="w-20 bg-transparent px-1 py-2 text-xs font-bold focus:outline-none dark:text-white text-center" title="End Time" />
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={newTarget}
                                        onChange={(e) => setNewTarget(e.target.value)}
                                        placeholder={\`Add a target for \${selectedDate}...\`}
                                        className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00A7A7] focus:ring-2 focus:ring-cyan-200 dark:focus:ring-cyan-900 transition-all dark:text-white font-medium"
                                    />
                                    <button type="submit" className="w-12 h-12 bg-gradient-to-tr from-[#00A7A7] to-cyan-500 rounded-xl text-white flex items-center justify-center shadow-lg shadow-cyan-500/30 active:scale-95 transition-transform shrink-0 hover:from-cyan-600 hover:to-cyan-400">
                                        <i className="fa-solid fa-paper-plane"></i>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                );
            };
`;

    const main_return_pattern = /(return \(\s*<VoiceRoomErrorBoundary>)/;
    if (main_return_pattern.test(content)) {
        content = content.replace(main_return_pattern, portal_component + "\n$1");
    } else {
        console.log("Could not find main return");
    }
        
    const render_portal_pattern = /(\{showSplash && <GlobalLoader)/;
    content = content.replace(render_portal_pattern, "<TargetPortalOverlay />\n                        $1");

    fs.writeFileSync('index.html', content, 'utf-8');
    console.log("Refactored index.html successfully!");
}

refactor();
