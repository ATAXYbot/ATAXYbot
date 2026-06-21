const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

function safeReplace(oldStr, newStr) {
    if (code.includes(oldStr)) {
        code = code.replace(oldStr, newStr);
    }
}

// 1. Fix chat auto-scroll
safeReplace(
    "chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });", 
    "chatEndRef.current?.scrollIntoView({ behavior: 'instant', block: 'end' });"
);

safeReplace(
    'chatEndRef.current?.scrollIntoView({ behavior: "smooth" });', 
    'chatEndRef.current?.scrollIntoView({ behavior: "instant", block: "end" });'
);

safeReplace(
    'chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });', 
    'chatEndRef.current?.scrollIntoView({ behavior: "instant", block: "end" });'
);

// 2. Modals to portals
safeReplace(
    'const renderAnalyticsModal = () => {\n        if (!showAnalyticsModal) return null;\n\n        return (\n            <div className="fixed inset-0',
    'const renderAnalyticsModal = () => {\n        if (!showAnalyticsModal) return null;\n\n        return ReactDOM.createPortal(\n            <div className="fixed inset-0'
);

const renderAnalyticsModalIdx = code.indexOf('const renderAnalyticsModal = () => {');
if (renderAnalyticsModalIdx !== -1) {
    const returnStart = code.indexOf('return (', renderAnalyticsModalIdx);
    if (returnStart !== -1) {
        code = code.substring(0, returnStart) + 'return ReactDOM.createPortal(' + code.substring(returnStart + 6);
        const modalEnd = code.indexOf('};', returnStart);
        const closingParen = code.lastIndexOf(');', modalEnd);
        code = code.substring(0, closingParen) + ', document.body\n);' + code.substring(closingParen + 2);
    }
}

// 3. Make Target Analyzer subject-agnostic
safeReplace("const phyRegex = /phy|physics|motion|kinematics|thermodynamics/i;", "");
safeReplace("const chemRegex = /chem|chemistry|organic|inorganic|periodic/i;", "");
safeReplace("const bioRegex = /bio|biology|zoology|botany|cell|human/i;", "");
safeReplace("const mockRegex = /mock|test|exam|paper/i;", "");
safeReplace("let subjectsBreakdown = { physics: 0, chemistry: 0, biology: 0, mock: 0, other: 0 };", "let dailyRate = 0; let weeklyRate = 0; let monthlyRate = 0;");

const oldCalcStart = `d.dayTargets.forEach(t => {
                                        if (mockRegex.test(t.text)) subjectsBreakdown.mock++;
                                        else if (phyRegex.test(t.text)) subjectsBreakdown.physics++;
                                        else if (chemRegex.test(t.text)) subjectsBreakdown.chemistry++;
                                        else if (bioRegex.test(t.text)) subjectsBreakdown.biology++;
                                        else subjectsBreakdown.other++;
                                    });`;

safeReplace(oldCalcStart, "");

const streaksCalc = `const yesterdayDate = new Date();`;
const addedCalcStr = `
                // Calculate rates
                const now = new Date();
                const oneDay = 24 * 60 * 60 * 1000;
                let wT = 0, wC = 0, mT = 0, mC = 0, dT = 0, dC = 0;
                
                rawDaysData.forEach(d => {
                    const dDate = new Date(d.dateStr);
                    const diffDays = Math.round(Math.abs((now - dDate) / oneDay));
                    if (diffDays === 0) { dT += d.dayTotal; dC += d.dayDone; }
                    if (diffDays <= 7) { wT += d.dayTotal; wC += d.dayDone; }
                    if (diffDays <= 30) { mT += d.dayTotal; mC += d.dayDone; }
                });
                dailyRate = dT > 0 ? Math.round((dC/dT)*100) : 0;
                weeklyRate = wT > 0 ? Math.round((wC/wT)*100) : 0;
                monthlyRate = mT > 0 ? Math.round((mC/mT)*100) : 0;
                
                const yesterdayDate = new Date();`;

safeReplace(streaksCalc, addedCalcStr);

const radarOld = `                                 {/* Subject Radar */}
                                 <div className="grid grid-cols-2 gap-3 mb-6">
                                     <div className="bg-[#010B1C]/80 rounded-2xl p-4 border border-blue-500/20 flex flex-col justify-center text-center relative overflow-hidden">
                                         <i className="fa-solid fa-atom absolute -right-3 -bottom-3 text-5xl text-blue-500/10"></i>
                                         <span className="text-2xl font-black text-blue-400">{subjectsBreakdown.physics}</span>
                                         <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1">Physics Focus</span>
                                     </div>
                                     <div className="bg-[#010B1C]/80 rounded-2xl p-4 border border-emerald-500/20 flex flex-col justify-center text-center relative overflow-hidden">
                                         <i className="fa-solid fa-flask absolute -right-3 -bottom-3 text-5xl text-emerald-500/10"></i>
                                         <span className="text-2xl font-black text-emerald-400">{subjectsBreakdown.chemistry}</span>
                                         <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1">Chem Focus</span>
                                     </div>
                                     <div className="bg-[#010B1C]/80 rounded-2xl p-4 border border-green-500/20 flex flex-col justify-center text-center relative overflow-hidden">
                                         <i className="fa-solid fa-leaf absolute -right-3 -bottom-3 text-5xl text-green-500/10"></i>
                                         <span className="text-2xl font-black text-green-400">{subjectsBreakdown.biology}</span>
                                         <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1">Bio Focus</span>
                                     </div>
                                     <div className="bg-[#010B1C]/80 rounded-2xl p-4 border border-purple-500/20 flex flex-col justify-center text-center relative overflow-hidden">
                                         <i className="fa-solid fa-file-contract absolute -right-3 -bottom-3 text-5xl text-purple-500/10"></i>
                                         <span className="text-2xl font-black text-purple-400">{subjectsBreakdown.mock}</span>
                                         <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1">Mock Focus</span>
                                     </div>
                                 </div>`;

const radarNew = `                                 {/* Time-Based Completion Rates */}
                                 <div className="grid grid-cols-2 gap-3 mb-6">
                                     <div className="bg-[#010B1C]/80 rounded-2xl p-4 border border-blue-500/20 flex flex-col justify-center text-center relative overflow-hidden">
                                         <i className="fa-solid fa-calendar-day absolute -right-3 -bottom-3 text-5xl text-blue-500/10"></i>
                                         <span className="text-2xl font-black text-blue-400">{dailyRate}%</span>
                                         <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1">Daily Completion</span>
                                     </div>
                                     <div className="bg-[#010B1C]/80 rounded-2xl p-4 border border-emerald-500/20 flex flex-col justify-center text-center relative overflow-hidden">
                                         <i className="fa-solid fa-calendar-week absolute -right-3 -bottom-3 text-5xl text-emerald-500/10"></i>
                                         <span className="text-2xl font-black text-emerald-400">{weeklyRate}%</span>
                                         <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1">Weekly Completion</span>
                                     </div>
                                     <div className="bg-[#010B1C]/80 rounded-2xl p-4 border border-purple-500/20 flex flex-col justify-center text-center relative overflow-hidden">
                                         <i className="fa-solid fa-calendar-days absolute -right-3 -bottom-3 text-5xl text-purple-500/10"></i>
                                         <span className="text-2xl font-black text-purple-400">{monthlyRate}%</span>
                                         <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1">Monthly Completion</span>
                                     </div>
                                     <div className="bg-[#010B1C]/80 rounded-2xl p-4 border border-cyan-500/20 flex flex-col justify-center text-center relative overflow-hidden">
                                         <i className="fa-solid fa-chart-line absolute -right-3 -bottom-3 text-5xl text-cyan-500/10"></i>
                                         <span className="text-2xl font-black text-cyan-400">{completionRate}%</span>
                                         <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1">Total Completion</span>
                                     </div>
                                 </div>`;

safeReplace(radarOld, radarNew);

const homeWidgetOld = `                     <div onClick={() => setShowDetailedAnalyzer(true)} className="bg-gradient-to-br from-gray-900 to-black dark:from-[#010714] dark:to-[#010B1C] rounded-3xl p-5 shadow-xl border border-gray-800 animate-pop-bounce delay-150 relative overflow-hidden cursor-pointer hover:scale-[1.02] hover:shadow-[0_10px_30px_rgba(0,255,255,0.15)] transition-all duration-300 group">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FFFF] rounded-full mix-blend-screen filter blur-[80px] opacity-10 animate-pulse pointer-events-none group-hover:opacity-20 transition-opacity"></div>
                         
                         <div className="flex justify-between items-center mb-5 relative z-10">
                             <h3 className="font-black text-white text-lg flex items-center gap-2 tracking-wide"><i className="fa-solid fa-chart-pie text-[#00FFFF]"></i> Target Analyzer</h3>
                             <div className=\`bg-gradient-to-r \${consistencyColor} px-3 py-1 rounded-full text-white text-[10px] font-black uppercase tracking-widest shadow-md\`}>
                                 {consistencyScore}
                             </div>
                         </div>
                         
                         <div className="grid grid-cols-3 gap-3 mb-5 relative z-10">
                             <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-center justify-center text-center backdrop-blur-sm group-hover:bg-white/10 transition-colors">
                                 <i className="fa-solid fa-bullseye text-[#A4DFE6] mb-1.5 text-lg"></i>
                                 <span className="text-2xl font-black text-white leading-none">{totalTargets}</span>
                                 <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1">Total Set</span>
                             </div>
                             <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-center justify-center text-center backdrop-blur-sm group-hover:bg-white/10 transition-colors">
                                 <i className="fa-solid fa-check-double text-green-400 mb-1.5 text-lg"></i>
                                 <span className="text-2xl font-black text-white leading-none">{completedTargets}</span>
                                 <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1">Achieved</span>
                             </div>
                             <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-center justify-center text-center backdrop-blur-sm group-hover:bg-white/10 transition-colors">
                                 <i className="fa-solid fa-calendar-day text-blue-400 mb-1.5 text-lg"></i>
                                 <span className="text-2xl font-black text-white leading-none">{productiveDays}</span>
                                 <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1">Prod. Days</span>
                             </div>
                         </div>
                         
                         <div className="w-full bg-gray-800/50 h-2.5 rounded-full overflow-hidden relative z-10 border border-gray-700/50">
                             <div className="bg-gradient-to-r from-cyan-400 to-blue-600 h-full rounded-full transition-all duration-1000 relative" style={{ width: \`\${completionRate}%\` }}>
                                 <div className="absolute top-0 right-0 bottom-0 w-8 bg-white/20 filter blur-[2px] animate-shimmer"></div>
                             </div>
                         </div>
                         <div className="text-right mt-1.5 relative z-10">
                             <span className="text-[10px] text-cyan-400 font-bold tracking-widest uppercase">Completion Rate: {completionRate}%</span>
                         </div>
                     </div>`;

const homeWidgetNew = `                     <div onClick={() => setShowDetailedAnalyzer(true)} className="bg-gradient-to-br from-gray-900 to-black dark:from-[#010714] dark:to-[#010B1C] rounded-2xl p-4 shadow-xl border border-gray-800 animate-pop-bounce delay-150 relative overflow-hidden cursor-pointer hover:scale-[1.02] hover:shadow-[0_10px_30px_rgba(0,255,255,0.15)] transition-all duration-300 group">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FFFF] rounded-full mix-blend-screen filter blur-[80px] opacity-10 animate-pulse pointer-events-none group-hover:opacity-20 transition-opacity"></div>
                         
                         <div className="flex justify-between items-center mb-3 relative z-10">
                             <h3 className="font-black text-white text-base flex items-center gap-2 tracking-wide"><i className="fa-solid fa-chart-pie text-[#00FFFF]"></i> Target Analyzer</h3>
                             <div className=\`bg-gradient-to-r \${consistencyColor} px-2 py-0.5 rounded-full text-white text-[9px] font-black uppercase tracking-widest shadow-md\`}>
                                 {consistencyScore}
                             </div>
                         </div>
                         
                         <div className="flex justify-between items-end relative z-10 mb-3">
                             <div>
                                 <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">Overall Completion</div>
                                 <div className="text-3xl font-black text-white font-mono">{completionRate}%</div>
                             </div>
                             <div className="text-right">
                                 <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Targets Met</div>
                                 <div className="text-lg font-bold text-[#00FFFF]"><span className="text-white">{completedTargets}</span> / {totalTargets}</div>
                             </div>
                         </div>
                         
                         <div className="w-full bg-gray-800/50 h-2 rounded-full overflow-hidden relative z-10 border border-gray-700/50">
                             <div className="bg-gradient-to-r from-[#00FFFF] to-blue-600 h-full rounded-full transition-all duration-1000 relative" style={{ width: \`\${completionRate}%\` }}>
                                 <div className="absolute top-0 right-0 bottom-0 w-8 bg-white/20 filter blur-[2px] animate-[shimmer_2s_infinite]"></div>
                             </div>
                         </div>
                     </div>`;

safeReplace(homeWidgetOld, homeWidgetNew);

safeReplace("useState('Physics')", "useState('All')");

fs.writeFileSync('index.html', code);
console.log('Perfect fix complete.');
