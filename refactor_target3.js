const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

// 1. Add new state for Priority and Category
const stateRegex = /const \[newTargetEndTime, setNewTargetEndTime\] = useState\(""\);/;
if (stateRegex.test(content) && !content.includes('newTargetPriority')) {
    content = content.replace(stateRegex, `const [newTargetEndTime, setNewTargetEndTime] = useState("");
            const [newTargetPriority, setNewTargetPriority] = useState("Medium");
            const [newTargetCategory, setNewTargetCategory] = useState("Physics");`);
}

// 2. Remove "Set Target Portal" button from the Hello Student container
const helloBtnRegex = /<button onClick=\{\(\) => setShowTargetPortal\(true\)\}[\s\S]*?<\/button>/;
content = content.replace(helloBtnRegex, '');

// 3. Add Standalone "Set Target Portal" button and Analyzer inside Daily Targets
// We will look for the start of the Daily Targets box:
// `<div className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-lg shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 animate-pop-bounce delay-100 partner-platform">`

const dailyTargetsContainerRegex = /<div className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-lg shadow-gray-200\/50 dark:shadow-none border border-gray-100 dark:border-gray-800 animate-pop-bounce delay-100 partner-platform">/;

const standalonePortalBtn = `
                            {/* Standalone Target Portal Button */}
                            <div className="bg-[#021633] rounded-3xl p-5 shadow-xl border border-blue-500/20 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors duration-500"></div>
                                <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-blue-500/20 rounded-full blur-[40px] pointer-events-none"></div>
                                <div className="relative z-10 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                                        <i className="fa-solid fa-bullseye text-xl group-hover:scale-110 transition-transform"></i>
                                    </div>
                                    <div>
                                        <h3 className="text-white font-black text-lg">Set Target Portal</h3>
                                        <p className="text-blue-200/60 text-xs font-bold tracking-widest uppercase">Plan like a pro</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowTargetPortal(true)} className="relative z-10 w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm tracking-wider shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all duration-300 active:scale-95 flex items-center justify-center gap-2">
                                    Open Portal <i className="fa-solid fa-arrow-right"></i>
                                </button>
                            </div>
`;

if (dailyTargetsContainerRegex.test(content)) {
    content = content.replace(dailyTargetsContainerRegex, standalonePortalBtn + '\n<div className="bg-[#021633] rounded-3xl p-5 shadow-xl border border-blue-900/50 relative overflow-hidden mb-6">');
}

// 4. Update the Daily Targets Header to include the Completion Rate Analyzer
const dailyTargetsHeaderRegex = /<h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg flex items-center gap-2"><i className="fa-regular fa-calendar-check text-blue-500"><\/i> Daily Targets<\/h3>/;
const analyzerHeader = `
                                    <div className="flex-1">
                                        <h3 className="font-black text-white text-xl flex items-center gap-2 tracking-wide"><i className="fa-solid fa-fire-flame-curved text-orange-500"></i> Daily Targets</h3>
                                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1">Reality Check: {completionRate}% Completed Overall</p>
                                    </div>
`;
content = content.replace(dailyTargetsHeaderRegex, analyzerHeader);

// Fix the "Today" pill next to the header
content = content.replace(/<span className="text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">Today<\/span>/, '<span className="text-[10px] font-black text-blue-400 bg-blue-900/30 border border-blue-500/30 px-3 py-1.5 rounded-lg uppercase tracking-widest">Today</span>');

// 5. Overhaul the Target Rendering Logic in Home View
// We replace the mapping of uncompleted and completed targets
const uncompletedMapRegex = /\{uncompleted\.map\(t => \([\s\S]*?<\/button>\s*<\/div>\s*<\/div>\s*\)\)\}/;

const enhancedUncompleted = `{uncompleted.map(t => {
    let catColor = "text-gray-400 bg-gray-800/50 border-gray-700";
    let priColor = "text-gray-400";
    if (t.category === 'Physics') catColor = "text-emerald-400 bg-emerald-900/30 border-emerald-500/30";
    if (t.category === 'Chemistry') catColor = "text-amber-400 bg-amber-900/30 border-amber-500/30";
    if (t.category === 'Math' || t.category === 'Biology') catColor = "text-blue-400 bg-blue-900/30 border-blue-500/30";
    if (t.priority === 'High') priColor = "text-rose-500";
    if (t.priority === 'Medium') priColor = "text-amber-500";
    if (t.priority === 'Low') priColor = "text-blue-500";

    return (
        <div key={t.id} className="relative overflow-hidden flex flex-col p-4 rounded-2xl bg-[#010B1C]/50 border border-blue-900/40 hover:border-blue-500/50 shadow-md transition-all duration-300 transform hover:scale-[1.01] group mb-3">
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(59,130,246,0.03),transparent)] -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <div className="flex items-start justify-between gap-3 relative z-10">
                <div className="flex items-start gap-3 cursor-pointer flex-1" onClick={() => toggleTarget(t.id)}>
                    <div className="w-6 h-6 rounded-full border-2 border-blue-500 flex items-center justify-center shrink-0 mt-0.5 bg-blue-950/50 group-hover:bg-blue-500/20 transition-colors"></div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-100 group-hover:text-white transition-colors">{t.text}</span>
                        
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            {t.category && <span className={\`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border \${catColor}\`}>{t.category}</span>}
                            {t.priority && <span className="text-[10px] font-bold flex items-center gap-1"><i className={\`fa-solid fa-flag \${priColor}\`}></i> <span className="text-gray-400">{t.priority}</span></span>}
                            {(t.startTime || t.endTime) && <span className="text-[10px] text-gray-500 font-bold tracking-wider"><i className="fa-regular fa-clock mr-1"></i>{t.startTime || '?'} - {t.endTime || '?'}</span>}
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => setGlobalTimer({ active: true, targetId: t.id, targetText: t.text, startTime: Date.now(), duration: 25 * 60, elapsed: 0, paused: false })} className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white flex items-center justify-center transition-colors"><i className="fa-solid fa-play text-xs ml-0.5"></i></button>
                    <button onClick={() => removeTarget(t.id)} className="w-8 h-8 rounded-full text-red-400/50 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-colors"><i className="fa-solid fa-trash text-xs"></i></button>
                </div>
            </div>
        </div>
    );
})}`;

content = content.replace(uncompletedMapRegex, enhancedUncompleted);

// 6. Overhaul Completed Targets Mapping
const completedMapRegex = /\{completed\.length > 0 && \([\s\S]*?\{completed\.map\(t => \([\s\S]*?<\/button>\s*<\/div>\s*<\/div>\s*\)\)\}\s*<\/div>\s*\)\}/;

const enhancedCompleted = `{completed.length > 0 && (
    <div className="mt-6 border-t border-blue-900/30 pt-4">
        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2"><i className="fa-solid fa-check-double"></i> Completed ({completed.length})</h4>
        <div className="space-y-3">
            {completed.map(t => (
                <div key={t.id} className="relative flex items-center justify-between p-3 rounded-2xl bg-gray-900/40 border border-gray-800/50 opacity-60 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => toggleTarget(t.id)}>
                        <div className="w-6 h-6 rounded-full bg-green-500 border border-green-400 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(34,197,94,0.4)]">
                            <i className="fa-solid fa-check text-white text-xs"></i>
                        </div>
                        <span className="text-sm font-bold text-gray-500 line-through">{t.text}</span>
                    </div>
                    <button onClick={() => removeTarget(t.id)} className="w-8 h-8 rounded-full text-gray-600 hover:text-red-400 flex items-center justify-center transition-colors shrink-0"><i className="fa-solid fa-trash text-xs"></i></button>
                </div>
            ))}
        </div>
    </div>
)}`;

content = content.replace(completedMapRegex, enhancedCompleted);


// 7. Remove Analyzer from TargetPortalOverlay
content = content.replace(/\{renderAnalyzer\(\)\}/g, '');
const renderAnalyzerRegex = /const renderAnalyzer = \(\) => \{[\s\S]*?\};\s*return \(/;
content = content.replace(renderAnalyzerRegex, 'return (');


// 8. Update Target Creation Form inside TargetPortalOverlay to include Priority and Category
const portalFormRegex = /<form onSubmit=\{\(e\) => \{[\s\S]*?\}\} className="bg-white dark:bg-gray-900 rounded-3xl shadow-\[0_10px_40px_rgba\(0,0,0,0.1\)\] dark:shadow-\[0_10px_40px_rgba\(0,0,0,0.3\)\] border border-gray-100 dark:border-gray-800 p-3 space-y-3">/;

const newPortalForm = `<form onSubmit={(e) => {
    e.preventDefault();
    if (!newTarget.trim()) return;
    const dateToUse = selectedDate || todayStr;
    const current = targetsData[dateToUse] || [];
    const updated = [...current, { 
        id: Date.now(), 
        text: newTarget, 
        done: false, 
        startTime: newTargetStartTime, 
        endTime: newTargetEndTime,
        priority: newTargetPriority,
        category: newTargetCategory
    }];
    setTargetsData({ ...targetsData, [dateToUse]: updated });
    setNewTarget('');
    setNewTargetStartTime('');
    setNewTargetEndTime('');
    if(targetPortalTab !== 'past' && dateToUse > todayStr) setTargetPortalTab('future');
    else if(targetPortalTab !== 'past' && dateToUse === todayStr) setTargetPortalTab('present');
}} className="bg-[#021633] rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border border-blue-900/50 p-4 space-y-3 backdrop-blur-xl">`;

content = content.replace(portalFormRegex, newPortalForm);


// 9. Add Priority and Category selects to the form UI
const dateInputRowRegex = /<div className="flex items-center gap-2 px-2">[\s\S]*?<\/div>\s*<\/div>\s*<div className="flex items-center gap-2">/;

const newInputsRow = `
<div className="flex items-center gap-2 px-1">
    <div className="flex-1 flex bg-[#010B1C]/50 rounded-xl px-3 py-2.5 items-center border border-blue-900/40">
        <i className="fa-regular fa-calendar text-blue-500 mr-2 text-xs"></i>
        <input type="date" min="2026-01-01" max="2126-12-31" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-transparent border-none outline-none text-xs font-bold text-gray-200 w-full" required />
    </div>
    <div className="flex bg-[#010B1C]/50 border border-blue-900/40 rounded-xl overflow-hidden justify-center items-center px-2">
        <input type="time" value={newTargetStartTime} onChange={(e) => setNewTargetStartTime(e.target.value)} className="w-16 bg-transparent py-2.5 text-xs font-bold focus:outline-none text-gray-200 text-center" title="Start Time" />
        <span className="text-gray-600 text-xs">-</span>
        <input type="time" value={newTargetEndTime} onChange={(e) => setNewTargetEndTime(e.target.value)} className="w-16 bg-transparent py-2.5 text-xs font-bold focus:outline-none text-gray-200 text-center" title="End Time" />
    </div>
</div>
<div className="flex items-center gap-2 px-1">
    <div className="flex-1 bg-[#010B1C]/50 rounded-xl px-3 border border-blue-900/40 flex items-center overflow-hidden">
        <i className="fa-solid fa-flag text-blue-500 text-xs"></i>
        <select value={newTargetPriority} onChange={e => setNewTargetPriority(e.target.value)} className="w-full bg-transparent border-none outline-none text-xs font-bold text-gray-200 py-2.5 px-2 appearance-none">
            <option value="High" className="bg-slate-900">High Priority</option>
            <option value="Medium" className="bg-slate-900">Med Priority</option>
            <option value="Low" className="bg-slate-900">Low Priority</option>
        </select>
    </div>
    <div className="flex-1 bg-[#010B1C]/50 rounded-xl px-3 border border-blue-900/40 flex items-center overflow-hidden">
        <i className="fa-solid fa-tags text-blue-500 text-xs"></i>
        <select value={newTargetCategory} onChange={e => setNewTargetCategory(e.target.value)} className="w-full bg-transparent border-none outline-none text-xs font-bold text-gray-200 py-2.5 px-2 appearance-none">
            <option value="Physics" className="bg-slate-900">Physics</option>
            <option value="Chemistry" className="bg-slate-900">Chemistry</option>
            <option value="Math" className="bg-slate-900">Math</option>
            <option value="Biology" className="bg-slate-900">Biology</option>
            <option value="Other" className="bg-slate-900">Other</option>
        </select>
    </div>
</div>
<div className="flex items-center gap-2 mt-1">`;

content = content.replace(dateInputRowRegex, newInputsRow);

// Fix target text input classes
content = content.replace(/className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-all dark:text-white font-medium"/g, 'className="flex-1 bg-[#010B1C]/80 border border-blue-900/50 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-900/50 transition-all text-white font-medium shadow-inner"');


fs.writeFileSync('index.html', content, 'utf8');
console.log("Refactoring applied successfully.");
