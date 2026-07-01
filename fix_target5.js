const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// 1. Remove the old Target Analyzer widget block
const analyzerStart = '{/* Home Tab Target Analyzer Widget */}';
const analyzerStartIndex = content.indexOf(analyzerStart);

if (analyzerStartIndex !== -1) {
    // Find the end of this block which is the matching '})()}'
    const endStr = '})()}';
    let analyzerEndIndex = content.indexOf(endStr, analyzerStartIndex);
    if (analyzerEndIndex !== -1) {
        // Remove the block
        content = content.substring(0, analyzerStartIndex) + content.substring(analyzerEndIndex + endStr.length);
        console.log("Removed old Home Tab Target Analyzer Widget.");
    }
}

// 2. Update the Category Dropdown options
const optionsStr = `<option value="Physics" className="bg-slate-900">Physics</option>
                                        <option value="Chemistry" className="bg-slate-900">Chemistry</option>
                                        <option value="Math" className="bg-slate-900">Math</option>
                                        <option value="Biology" className="bg-slate-900">Biology</option>
                                        <option value="Other" className="bg-slate-900">Other</option>`;
const newOptionsStr = `<option value="Physics" className="bg-slate-900">Physics</option>
                                        <option value="Chemistry" className="bg-slate-900">Chemistry</option>
                                        <option value="Mathmatics" className="bg-slate-900">Mathmatics</option>
                                        <option value="Botany" className="bg-slate-900">Botany</option>
                                        <option value="Zoology" className="bg-slate-900">Zoology</option>
                                        <option value="Other" className="bg-slate-900">Other</option>`;
content = content.replace(optionsStr, newOptionsStr);

// Also replace the category color logic
const catColorStr = `if (t.category === 'Math' || t.category === 'Biology') catColor = "text-blue-400 bg-blue-900/30 border-blue-500/30";`;
const newCatColorStr = `if (t.category === 'Mathmatics' || t.category === 'Botany' || t.category === 'Zoology') catColor = "text-blue-400 bg-blue-900/30 border-blue-500/30";`;
content = content.replace(catColorStr, newCatColorStr);

// 3. Update the new circular progress bar to use Today's stats instead of Overall
// We replace the entire div block that starts with <div className="bg-gradient-to-r from-blue-900/40
const circularWidgetRegex = /<div className="bg-gradient-to-r from-blue-900\/40 to-indigo-900\/40 border border-blue-500\/30 rounded-2xl p-4 mb-6 flex items-center gap-4 relative overflow-hidden group shadow-lg">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<div id="tour-target-list"/;

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
                            <div id="tour-target-list"`;

if (circularWidgetRegex.test(content)) {
    content = content.replace(circularWidgetRegex, newCircularWidget);
    console.log("Successfully updated the circular widget to use today's rate.");
} else {
    console.log("Could not find the circular widget block.");
}

fs.writeFileSync('index.html', content, 'utf8');
console.log("Completed fix_target5.js script.");
