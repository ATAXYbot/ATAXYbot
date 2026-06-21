const fs = require('fs');
const lines = fs.readFileSync('c:/Users/risha/ATAXYbot/index.html', 'utf8').split('\n');

function findIndex(str) {
    return lines.findIndex(l => l.includes(str));
}

// 1. Replace Home Widget (Lines 7765 to 7808)
const homeWidgetStart = findIndex('setShowDetailedAnalyzer(true)');
const homeWidgetEnd = findIndex('{/* Detailed Analyzer Modal */}');

if (homeWidgetStart !== -1 && homeWidgetEnd !== -1) {
    const homeWidgetNew = `                     <div onClick={() => setShowDetailedAnalyzer(true)} className="bg-gradient-to-r from-gray-900 to-[#010714] dark:from-[#021633] dark:to-[#010B1C] rounded-2xl p-4 shadow-lg border border-[#0AE0D0]/20 animate-pop-bounce delay-150 relative overflow-hidden cursor-pointer hover:scale-[1.02] hover:shadow-[0_10px_20px_rgba(0,255,255,0.1)] transition-all duration-300 group flex items-center justify-between">
                         <div className="absolute top-0 right-0 w-24 h-24 bg-[#00FFFF] rounded-full mix-blend-screen filter blur-[60px] opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity"></div>
                         
                         <div className="flex items-center gap-3 relative z-10">
                             <div className="w-11 h-11 rounded-full bg-[#00FFFF]/10 flex items-center justify-center border border-[#00FFFF]/20">
                                 <i className="fa-solid fa-chart-pie text-[#00FFFF] text-xl"></i>
                             </div>
                             <div>
                                 <h3 className="font-black text-white text-sm tracking-wide">Target Analyzer</h3>
                                 <div className="flex items-center gap-2 mt-0.5">
                                     <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Daily Rate</span>
                                     <div className={\`text-xs font-black px-1.5 rounded bg-black/50 \${dailyRate >= 85 ? 'text-green-400' : dailyRate >= 50 ? 'text-blue-400' : 'text-orange-400'}\`}>{dailyRate}%</div>
                                 </div>
                             </div>
                         </div>
                         
                         <div className="relative z-10 text-right flex flex-col items-end">
                             <div className={\`bg-gradient-to-r \${consistencyColor} px-2 py-0.5 rounded-sm text-white text-[9px] font-black uppercase tracking-widest shadow-md mb-2\`}>
                                 {consistencyScore}
                             </div>
                             <div className="w-20 h-1.5 bg-gray-800 rounded-full overflow-hidden border border-gray-700 shadow-inner">
                                 <div className="h-full bg-gradient-to-r from-[#00A7A7] to-[#00FFFF] rounded-full transition-all duration-1000" style={{ width: \`\${dailyRate}%\` }}>
                                     <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                                 </div>
                             </div>
                         </div>
                     </div>`;
    
    lines.splice(homeWidgetStart, homeWidgetEnd - homeWidgetStart, homeWidgetNew);
    console.log("Successfully replaced Home Widget.");
}

// 2. Insert Logic Before "// Dominator Verdict"
const verdictIdx = findIndex('// Dominator Verdict');
if (verdictIdx !== -1) {
    const logicNew = `                const taskClassBreakdown = { theory: 0, questions: 0, revision: 0, mock: 0 };
                const theoryRegex = /theory|read|study|chapter|ncert|notes|video|lec/i;
                const questionsRegex = /pyq|mcq|question|solve|dpp|practice|module|exercise/i;
                const revisionRegex = /revise|revision|review|short/i;
                const mockRegexClass = /mock|test|exam|paper/i;

                rawDaysData.forEach(d => {
                    d.dayTargets.forEach(t => {
                        if (mockRegexClass.test(t.text)) taskClassBreakdown.mock++;
                        else if (questionsRegex.test(t.text)) taskClassBreakdown.questions++;
                        else if (revisionRegex.test(t.text)) taskClassBreakdown.revision++;
                        else if (theoryRegex.test(t.text)) taskClassBreakdown.theory++;
                        else taskClassBreakdown.theory++; // default to theory
                    });
                });

                const calculateAIR = () => {
                    if (totalTargets < 10) return "Keep Logging Data";
                    const score = (weeklyRate * 0.5) + (monthlyRate * 0.3) + (completionRate * 0.2);
                    if (score >= 90) return "AIR 1 - 500";
                    if (score >= 80) return "AIR 500 - 5k";
                    if (score >= 65) return "AIR 5k - 20k";
                    if (score >= 50) return "AIR 20k - 50k";
                    return "AIR > 50k";
                };
                const airPrediction = calculateAIR();`;
    
    lines.splice(verdictIdx, 0, logicNew);
    console.log("Successfully inserted Analyzer Logic.");
}

// 3. Replace Base Stats with AIR Predictor
const baseStatsStart = findIndex('{/* Base Stats */}');
if (baseStatsStart !== -1) {
    // find end of base stats div
    // </div></div></div>
    const baseStatsEnd = baseStatsStart + 11;
    
    const baseStatsNew = `                                     {/* Base Stats */}
                                     <div className="grid grid-cols-2 gap-4 border-t border-[#0AE0D0]/20 pt-4 mb-4">
                                         <div className="text-center">
                                             <div className="text-xl font-black text-white">{totalTargets}</div>
                                             <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Targets</div>
                                         </div>
                                         <div className="text-center border-l border-[#0AE0D0]/20">
                                             <div className="text-xl font-black text-green-400">{completedTargets}</div>
                                             <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Achieved</div>
                                         </div>
                                     </div>

                                     {/* AIR 1 Predictor Component */}
                                     <div className="border-t border-[#0AE0D0]/20 pt-5 mt-2 text-center relative">
                                         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-transparent via-[#00FFFF] to-transparent"></div>
                                         <div className="text-[9px] text-[#A4DFE6] font-bold uppercase tracking-widest mb-1"><i className="fa-solid fa-ranking-star"></i> AI Rank Predictor</div>
                                         <div className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-[#00FFFF] to-blue-500 animate-pulse-soft">
                                             {airPrediction}
                                         </div>
                                         <div className="text-[8px] text-gray-500 uppercase font-bold mt-1">Based on Weekly & Monthly Velocity</div>
                                     </div>
                                 </div>`;
    
    lines.splice(baseStatsStart, baseStatsEnd - baseStatsStart, baseStatsNew);
    console.log("Successfully replaced Base Stats.");
}

// 4. Task Classification Before Dominator's Verdict UI
const verdictUIStart = findIndex("{/* Dominator's Verdict */}");
// Wait, we just inserted Logic before "// Dominator Verdict".
// The UI comment is "{/* Dominator's Verdict */}""
if (verdictUIStart !== -1) {
    const taskClassUI = `                                 {/* Task Classification Breakdown */}
                                 <div className="bg-[#021633] rounded-3xl p-5 border border-[#0AE0D0]/20 shadow-lg mb-6 relative overflow-hidden">
                                     <h3 className="text-[#00FFFF] font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2"><i className="fa-solid fa-layer-group"></i> Task Classification</h3>
                                     <div className="grid grid-cols-2 gap-3">
                                         <div className="bg-[#010B1C]/80 rounded-xl p-3 border border-pink-500/20 text-center">
                                             <div className="text-lg font-black text-pink-400">{taskClassBreakdown.theory}</div>
                                             <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1">Theory / Lec</div>
                                         </div>
                                         <div className="bg-[#010B1C]/80 rounded-xl p-3 border border-yellow-500/20 text-center">
                                             <div className="text-lg font-black text-yellow-400">{taskClassBreakdown.questions}</div>
                                             <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1">PYQ / Practice</div>
                                         </div>
                                         <div className="bg-[#010B1C]/80 rounded-xl p-3 border border-indigo-500/20 text-center">
                                             <div className="text-lg font-black text-indigo-400">{taskClassBreakdown.revision}</div>
                                             <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1">Revision</div>
                                         </div>
                                         <div className="bg-[#010B1C]/80 rounded-xl p-3 border border-cyan-500/20 text-center">
                                             <div className="text-lg font-black text-cyan-400">{taskClassBreakdown.mock}</div>
                                             <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1">Mocks / Tests</div>
                                         </div>
                                     </div>
                                 </div>\n`;
    lines.splice(verdictUIStart, 0, taskClassUI);
    console.log("Successfully inserted Task Classification UI.");
}

// 5. Time Based Rates After 7-Day Momentum
const sevenDayStart = findIndex('{/* 7-Day Momentum */}');
if (sevenDayStart !== -1) {
    const endStr = '{last7Days.length === 0 && <div className="w-full text-center text-xs text-gray-500 flex items-center justify-center h-full">No recent data</div>}';
    let endIdx = lines.findIndex((l, idx) => idx > sevenDayStart && l.includes(endStr));
    if (endIdx !== -1) {
        const insertIdx = endIdx + 3; // +3 to skip the closing divs of 7-Day Momentum
        const timeRatesUI = `
                                 {/* Time-Based Completion Rates */}
                                 <div className="grid grid-cols-3 gap-3 mb-6">
                                     <div className="bg-gradient-to-b from-[#021633] to-[#010B1C] rounded-2xl p-3 border border-blue-500/20 flex flex-col justify-center text-center shadow-lg">
                                         <span className="text-xl font-black text-blue-400">{dailyRate}%</span>
                                         <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider mt-1">Daily</span>
                                     </div>
                                     <div className="bg-gradient-to-b from-[#021633] to-[#010B1C] rounded-2xl p-3 border border-emerald-500/20 flex flex-col justify-center text-center shadow-lg">
                                         <span className="text-xl font-black text-emerald-400">{weeklyRate}%</span>
                                         <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider mt-1">Weekly</span>
                                     </div>
                                     <div className="bg-gradient-to-b from-[#021633] to-[#010B1C] rounded-2xl p-3 border border-purple-500/20 flex flex-col justify-center text-center shadow-lg">
                                         <span className="text-xl font-black text-purple-400">{monthlyRate}%</span>
                                         <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider mt-1">Monthly</span>
                                     </div>
                                 </div>`;
        lines.splice(insertIdx, 0, timeRatesUI);
        console.log("Successfully inserted Time Based Rates.");
    }
}

fs.writeFileSync('c:/Users/risha/ATAXYbot/index.html', lines.join('\n'));
console.log('Done.');
