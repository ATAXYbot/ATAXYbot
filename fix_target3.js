const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

// 1. Fix the Calendar clicking bug
// Add `relative` to the `<input type="date">` to constrain its absolutely positioned `::-webkit-calendar-picker-indicator`
const dateInputRegex = /<input type="date" min="2026-01-01" max="2126-12-31" value=\{selectedDate\} onChange=\{\(e\) => setSelectedDate\(e\.target\.value\)\} className="bg-transparent border-none outline-none text-xs font-bold text-gray-200 w-full" required \/>/g;
content = content.replace(dateInputRegex, '<input type="date" min="2026-01-01" max="2126-12-31" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-transparent border-none outline-none text-xs font-bold text-gray-200 w-full relative" required />');

// 2. Enhance the Completion Rate UI in Daily Targets
const headerRegex = /<div className="flex justify-between items-center mb-4 pr-\[90px\] lg:pr-0">[\s\S]*?<div className="flex-1">[\s\S]*?<h3 className="font-black text-white text-xl flex items-center gap-2 tracking-wide"><i className="fa-solid fa-fire-flame-curved text-orange-500"><\/i> Daily Targets<\/h3>[\s\S]*?<p className="text-\[11px\] text-gray-400 font-bold uppercase tracking-widest mt-1">Reality Check: \{completionRate\}% Completed Overall<\/p>[\s\S]*?<\/div>[\s\S]*?<span className="text-\[10px\] font-black text-blue-400 bg-blue-900\/30 border border-blue-500\/30 px-3 py-1\.5 rounded-lg uppercase tracking-widest">Today<\/span>[\s\S]*?<\/div>/;

const enhancedHeader = `
<div className="flex justify-between items-center mb-5">
    <h3 className="font-black text-white text-xl flex items-center gap-2 tracking-wide">
        <i className="fa-solid fa-fire-flame-curved text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]"></i> Daily Targets
    </h3>
    <span className="text-[10px] font-black text-blue-400 bg-blue-900/30 border border-blue-500/30 px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-inner">Today</span>
</div>

<div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 rounded-2xl p-4 mb-6 flex items-center gap-4 relative overflow-hidden group shadow-lg">
    <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-400/30 transition-colors duration-700"></div>
    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent,rgba(59,130,246,0.1),transparent)] -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
    
    <div className="w-16 h-16 relative shrink-0">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path className="stroke-blue-950" strokeWidth="4" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <path className="stroke-blue-400 animate-[drawCircle_1.5s_ease-out_forwards] drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" strokeDasharray={\`\${completionRate}, 100\`} strokeWidth="4" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-[13px] font-black text-white drop-shadow-md">{completionRate}%</span>
        </div>
    </div>
    
    <div className="flex-1 relative z-10">
        <h4 className="text-white font-black text-sm tracking-wide">Overall Consistency</h4>
        <p className="text-[10px] text-blue-200/70 font-bold uppercase tracking-wider mt-1">{completedTargets} out of {totalTargets} Targets Completed</p>
    </div>
</div>
`;

if (headerRegex.test(content)) {
    content = content.replace(headerRegex, enhancedHeader);
    console.log("Successfully enhanced the completion rate UI.");
} else {
    console.log("Could not find the target header regex.");
}


fs.writeFileSync('index.html', content, 'utf8');
console.log("Fixes applied successfully.");
