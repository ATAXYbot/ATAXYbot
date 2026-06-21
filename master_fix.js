const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// --- 1. Remove Mastery Streak from Me Tab ---
const streakStart = code.indexOf('<div className="bg-gradient-to-r from-orange-400 via-red-500 to-rose-500');
if (streakStart !== -1 && code.substring(streakStart, streakStart + 300).includes('Mastery Streak')) {
    const streakEnd = code.indexOf('</div>', code.indexOf('animate-pulse-soft', streakStart)) + 6;
    code = code.substring(0, streakStart) + code.substring(streakEnd);
    console.log('Removed Mastery Streak.');
}

// --- 2. Fix Personal Chat Auto-Scroll (VC Tab) ---
const scrollCode = `
                if (chatMessagesEndRef.current) {
                    chatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
                }
`;
const scrollFix = `
                if (chatMessagesEndRef.current) {
                    chatMessagesEndRef.current.scrollIntoView({ behavior: 'instant', block: 'end' });
                }
`;
if (code.includes(scrollCode)) {
    code = code.replace(scrollCode, scrollFix);
    console.log('Fixed chat auto-scroll.');
}

// --- 3. Fix Target Analyzer (Home Tab) ---
// Find the Target Analyzer section.
const targetAnalyzerSection = `
                            {/* Target Analyzer */}
                            <div className="bg-gradient-to-br from-gray-900 to-black dark:from-[#010714] dark:to-[#010B1C] rounded-3xl p-5 shadow-xl border border-gray-800 animate-pop-bounce delay-150 relative overflow-hidden cursor-pointer hover:scale-[1.02] hover:shadow-[0_10px_30px_rgba(0,255,255,0.15)] transition-all duration-300 group" onClick={() => setShowDetailedAnalyzer(true)}>
`;
if (code.includes(targetAnalyzerSection)) {
    // Redesign the target analyzer block inside renderHomeView
    const newTargetAnalyzer = `
                            {/* Target Analyzer */}
                            <div className="bg-gradient-to-br from-gray-900 to-black dark:from-[#010714] dark:to-[#010B1C] rounded-3xl p-6 shadow-xl border border-gray-800 animate-pop-bounce delay-150 relative overflow-hidden cursor-pointer hover:scale-[1.02] hover:shadow-[0_10px_30px_rgba(0,255,255,0.15)] transition-all duration-300 group" onClick={() => setShowDetailedAnalyzer(true)}>
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all"></div>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                                            <i className="fa-solid fa-crosshairs text-xl"></i>
                                        </div>
                                        <div>
                                            <h3 className="text-white font-black text-lg">Target Analyzer</h3>
                                            <p className="text-cyan-400 text-[10px] font-bold tracking-wider uppercase">Exam Readiness</p>
                                        </div>
                                    </div>
                                    <i className="fa-solid fa-arrow-right text-gray-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all"></i>
                                </div>
                                <div className="flex items-end justify-between mt-4">
                                    <div>
                                        <p className="text-gray-400 text-xs mb-1">Overall Completion</p>
                                        <h4 className="text-3xl font-black text-white">{Math.round((Object.keys(safeGetJSON('ataxy_practice_perf', {}) || {}).length / qbankData.reduce((acc, sub) => acc + sub.chapters?.reduce((acc2, chap) => acc2 + chap.topics?.reduce((acc3, top) => acc3 + (top.questions?.length || 0), 0) || 0, 0) || 0, 0)) * 100) || 0}%</h4>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-gray-400">Total Questions</div>
                                        <div className="text-lg font-bold text-cyan-400">{Object.keys(safeGetJSON('ataxy_practice_perf', {}) || {}).length} solved</div>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-800 h-1.5 mt-4 rounded-full overflow-hidden">
                                    <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full" style={{ width: \`\${Math.round((Object.keys(safeGetJSON('ataxy_practice_perf', {}) || {}).length / qbankData.reduce((acc, sub) => acc + sub.chapters?.reduce((acc2, chap) => acc2 + chap.topics?.reduce((acc3, top) => acc3 + (top.questions?.length || 0), 0) || 0, 0) || 0, 0)) * 100) || 0}%\` }}></div>
                                </div>
                            </div>
`;
    // Find the end of the existing Target Analyzer block
    const blockEndStr = `<div className="mt-8">`;
    const blockEndIdx = code.indexOf(blockEndStr, code.indexOf(targetAnalyzerSection));
    code = code.substring(0, code.indexOf(targetAnalyzerSection)) + newTargetAnalyzer + '\n' + code.substring(blockEndIdx);
    console.log('Redesigned Target Analyzer block in Home.');
}

// --- 4. Deep Analytics Subject-Agnostic Modal & Portals ---
// Find renderAnalyticsModal
const analyticsModalStart = code.indexOf('const renderAnalyticsModal = () => {');
const analyticsModalEnd = code.indexOf('// --- PROFILE & PERFORMANCE ---');

if (analyticsModalStart !== -1 && analyticsModalEnd !== -1) {
    const dynamicModal = `
            const renderAnalyticsModal = () => {
                if (!showAnalyticsModal) return null;

                const perf = safeGetJSON('ataxy_practice_perf', null) || {};

                // 1. Group Data Dynamically
                let totalAttempted = 0;
                let totalCorrect = 0;

                const subjectStats = {};
                const chapterStats = {};
                const colors = ['text-blue-500', 'text-purple-500', 'text-orange-500', 'text-emerald-500', 'text-pink-500', 'text-cyan-500'];

                qbankData.forEach((sub, idx) => {
                    const group = sub.name;
                    if (!subjectStats[group]) {
                        subjectStats[group] = { attempted: 0, correct: 0, colorClass: colors[idx % colors.length] };
                    }

                    sub.chapters?.forEach(chap => {
                        chap.topics?.forEach(top => top.questions?.forEach(q => {
                            if (perf[q.id] !== undefined) {
                                if (!chapterStats[chap.name]) {
                                    chapterStats[chap.name] = { subjectGroup: group, attempted: 0, correct: 0 };
                                }
                                totalAttempted++;
                                subjectStats[group].attempted++;
                                chapterStats[chap.name].attempted++;
                                if (perf[q.id] === q.correct || ['A', 'B', 'C', 'D'][perf[q.id]] === q.correctOption) {
                                    totalCorrect++;
                                    subjectStats[group].correct++;
                                    chapterStats[chap.name].correct++;
                                }
                            }
                        }));
                    });
                });

                const getAccuracy = (group) => {
                    const s = subjectStats[group];
                    if (!s || s.attempted === 0) return 0;
                    return Math.round((s.correct / s.attempted) * 100);
                };

                const overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

                const activeChapters = Object.keys(chapterStats)
                    .map(name => ({ name, ...chapterStats[name] }))
                    .filter(c => activeAnalysisTab === 'All' || c.subjectGroup === activeAnalysisTab)
                    .sort((a, b) => b.attempted - a.attempted);

                const chapterQuestions = [];
                if (expandedAnalysisChapter) {
                    qbankData.forEach(sub => {
                        sub.chapters?.forEach(chap => {
                            if (chap.name === expandedAnalysisChapter) {
                                chap.topics?.forEach(top => {
                                    top.questions?.forEach(q => {
                                        chapterQuestions.push({ ...q, topicName: top.name });
                                    });
                                });
                            }
                        });
                    });
                }

                const filteredChapterQuestions = chapterQuestions.filter(q => {
                    const isAns = perf[q.id] !== undefined;
                    const isCorrect = isAns && (perf[q.id] === q.correct || ['A', 'B', 'C', 'D'][perf[q.id]] === q.correctOption);

                    if (analysisChapterFilters.topic && q.topicName !== analysisChapterFilters.topic) return false;
                    if (analysisChapterFilters.incorrect && (!isAns || isCorrect)) return false;
                    if (analysisChapterFilters.bookmarked && !bookmarks.includes(q.id)) return false;
                    if (analysisChapterFilters.notes && !questionNotes[q.id]) return false;

                    return true;
                });

                return ReactDOM.createPortal(
                    <div className="fixed inset-0 pt-[max(env(safe-area-inset-top),_16px)] z-[200000] bg-gray-50/95 dark:bg-black/95 backdrop-blur-md flex flex-col animate-slide-up overflow-hidden w-full mx-auto" style={{ zIndex: 200000 }}>
                        {/* HEADER */}
                        <div className="flex items-center justify-between p-4 md:p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 z-10 sticky top-0">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setShowAnalyticsModal(false)} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center text-gray-700 dark:text-gray-300 active:scale-90">
                                    <i className="fa-solid fa-arrow-left"></i>
                                </button>
                                <h2 className="font-bold text-xl text-gray-900 dark:text-white flex items-center gap-2 tracking-tight">
                                    <i className="fa-solid fa-chart-pie text-blue-500"></i> Deep Analytics
                                </h2>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 space-y-6">
                            {/* OVERALL ACCURACY (CORE FEATURE) */}
                            <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-800/80 text-center relative overflow-hidden mb-6">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
                                <h3 className="font-black text-xl text-gray-900 dark:text-white mb-1 tracking-wide">
                                    Overall Accuracy: <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">{overallAccuracy}%</span>
                                </h3>
                                <p className="text-[10px] text-gray-500 mb-6 uppercase tracking-widest font-semibold">Based on universal question practice</p>

                                <div className="flex justify-around items-center flex-wrap gap-4">
                                    {Object.keys(subjectStats).filter(k => subjectStats[k].attempted > 0).map(group => (
                                        <CircularRing key={group} score={getAccuracy(group)} max={100} colorClass={subjectStats[group].colorClass} label={group} />
                                    ))}
                                    {Object.keys(subjectStats).filter(k => subjectStats[k].attempted > 0).length === 0 && (
                                        <div className="text-gray-400 text-sm italic py-4 w-full">Solve questions to see subject accuracies.</div>
                                    )}
                                </div>
                            </div>

                            {/* SUBJECT TABS & CHAPTER-WISE TABLE */}
                            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800/80 overflow-hidden flex flex-col">
                                {/* Pill Tabs */}
                                <div className="flex p-2 bg-gray-50 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800/80">
                                    {Object.keys(subjectStats).filter(k => subjectStats[k].attempted > 0).map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveAnalysisTab(tab)}
                                            className={\`flex-1 py-3 px-2 text-sm font-bold border-b-2 transition-all truncate \${activeAnalysisTab === tab ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-300'}\`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>

                                {/* Data Table */}
                                <div className="overflow-x-auto w-full">
                                    <table className="w-full text-left border-collapse min-w-[340px]">
                                        <thead>
                                            <tr className="bg-gray-50/50 dark:bg-gray-800/20 text-[9px] uppercase tracking-widest text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800/80">
                                                <th className="p-3 font-bold">Chapter</th>
                                                <th className="p-3 font-bold text-center">Attempted Qs</th>
                                                <th className="p-3 font-bold text-center min-w-[80px]">Correct %</th>
                                                <th className="p-3 font-bold text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {activeChapters.map((chap, idx) => {
                                                const chapterAcc = chap.attempted > 0 ? Math.round((chap.correct / chap.attempted) * 100) : 0;
                                                const isWeak = chapterAcc < 40;
                                                const isExpanded = expandedAnalysisChapter === chap.name;

                                                return (
                                                    <React.Fragment key={idx}>
                                                        <tr
                                                            onClick={() => {
                                                                if (isExpanded) {
                                                                    setExpandedAnalysisChapter(null);
                                                                } else {
                                                                    setExpandedAnalysisChapter(chap.name);
                                                                    setAnalysisChapterFilters({ topic: '', incorrect: false, bookmarked: false, notes: false });
                                                                }
                                                                try { if (window.Telegram?.WebApp?.HapticFeedback) window.Telegram.WebApp.HapticFeedback.impactOccurred('light'); } catch (e) { }
                                                            }}
                                                            className={\`border-b border-gray-100 dark:border-gray-800/60 last:border-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors \${isWeak ? 'bg-red-50/30 dark:bg-red-900/10' : ''} \${isExpanded ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}\`}
                                                        >
                                                            <td className={\`p-3 text-[11px] font-semibold \${isWeak ? 'text-red-500 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'} max-w-[120px] truncate\`} title={chap.name}>
                                                                {chap.name} {isExpanded ? <i className="fa-solid fa-chevron-up text-[9px] ml-1 text-gray-400"></i> : <i className="fa-solid fa-chevron-down text-[9px] ml-1 text-gray-400"></i>}
                                                            </td>
                                                            <td className="p-3 text-[11px] text-center font-bold text-gray-600 dark:text-gray-400">
                                                                {chap.attempted}
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="flex items-center justify-center gap-1.5">
                                                                    <span className={\`text-[10px] font-black \${isWeak ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}\`}>{chapterAcc}%</span>
                                                                    <div className="w-10 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shrink-0">
                                                                        <div className={\`h-full rounded-full transition-all duration-1000 \${isWeak ? 'bg-red-500' : chapterAcc >= 75 ? 'bg-green-500' : 'bg-yellow-500'}\`} style={{ width: \`\${chapterAcc}%\` }}></div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                                                                <button onClick={() => handleGenerateDPP(chap.name)} className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white px-3 py-1.5 rounded-lg text-[9px] font-bold transition-all shadow-sm active:scale-95 whitespace-nowrap border border-indigo-400/50">
                                                                    GEN DPP
                                                                </button>
                                                            </td>
                                                        </tr>
                                                        {isExpanded && (
                                                            <tr className="bg-gray-50/50 dark:bg-gray-800/20 border-b border-gray-100 dark:border-gray-800/80">
                                                                <td colSpan="4" className="p-3">
                                                                    <div className="animate-in slide-in-from-top-2 flex flex-col gap-3">
                                                                        {/* Filters */}
                                                                        <div className="flex flex-wrap gap-2">
                                                                            <select
                                                                                value={analysisChapterFilters.topic}
                                                                                onChange={e => setAnalysisChapterFilters(prev => ({ ...prev, topic: e.target.value }))}
                                                                                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-[10px] font-bold px-2 py-1.5 text-gray-700 dark:text-gray-300 outline-none"
                                                                            >
                                                                                <option value="">All Topics</option>
                                                                                {[...new Set(chapterQuestions.map(q => q.topicName))].map(t => <option key={t} value={t}>{t}</option>)}
                                                                            </select>

                                                                            <button
                                                                                onClick={() => setAnalysisChapterFilters(prev => ({ ...prev, incorrect: !prev.incorrect }))}
                                                                                className={\`text-[10px] font-bold px-2 py-1.5 rounded-md border transition-colors \${analysisChapterFilters.incorrect ? 'bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}\`}
                                                                            >
                                                                                Incorrect
                                                                            </button>
                                                                            <button
                                                                                onClick={() => setAnalysisChapterFilters(prev => ({ ...prev, bookmarked: !prev.bookmarked }))}
                                                                                className={\`text-[10px] font-bold px-2 py-1.5 rounded-md border transition-colors \${analysisChapterFilters.bookmarked ? 'bg-yellow-100 dark:bg-yellow-900/40 border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-400' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}\`}
                                                                            >
                                                                                Bookmarked
                                                                            </button>
                                                                            <button
                                                                                onClick={() => setAnalysisChapterFilters(prev => ({ ...prev, notes: !prev.notes }))}
                                                                                className={\`text-[10px] font-bold px-2 py-1.5 rounded-md border transition-colors \${analysisChapterFilters.notes ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}\`}
                                                                            >
                                                                                Notes
                                                                            </button>
                                                                        </div>

                                                                        {/* Questions List */}
                                                                        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 pb-2">
                                                                            {filteredChapterQuestions.length === 0 ? (
                                                                                <p className="text-center text-[10px] text-gray-500 py-6 italic bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">No questions match your filters.</p>
                                                                            ) : (
                                                                                filteredChapterQuestions.map(q => {
                                                                                    const isExpandedHistory = activeHistoryId === q.id;
                                                                                    return (
                                                                                        <div key={q.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                                                                                            <div className="p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" onClick={() => setActiveHistoryId(isExpandedHistory ? null : q.id)}>
                                                                                                <div className="flex flex-col gap-1.5 w-full pr-3">
                                                                                                    <div className="flex items-center gap-2">
                                                                                                        <span className="text-[9px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider truncate max-w-[150px]">{q.topicName}</span>
                                                                                                        {bookmarks.includes(q.id) && <i className="fa-solid fa-bookmark text-[9px] text-yellow-500"></i>}
                                                                                                        {questionNotes[q.id] && <i className="fa-solid fa-pen-to-square text-[9px] text-blue-500"></i>}
                                                                                                        {perf[q.id] !== undefined && (
                                                                                                            (perf[q.id] === q.correct || ['A', 'B', 'C', 'D'][perf[q.id]] === q.correctOption)
                                                                                                                ? <i className="fa-solid fa-check-circle text-[9px] text-green-500"></i>
                                                                                                                : <i className="fa-solid fa-times-circle text-[9px] text-red-500"></i>
                                                                                                        )}
                                                                                                    </div>
                                                                                                    <div className="text-[11px] text-gray-800 dark:text-gray-200 line-clamp-2 leading-snug">
                                                                                                        <FormattedText text={q.text} className="inline" />
                                                                                                    </div>
                                                                                                </div>
                                                                                                <i className={\`fa-solid fa-chevron-\${isExpandedHistory ? 'up' : 'down'} text-gray-400 text-[10px] shrink-0 w-4 h-4 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full\`}></i>
                                                                                            </div>
                                                                                            {isExpandedHistory && renderExpandedQuestionDetails(q)}
                                                                                        </div>
                                                                                    )
                                                                                })
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                );
                                            })}
                                            {activeChapters.length === 0 && (
                                                <tr>
                                                    <td colSpan="4" className="text-center p-8 text-xs text-gray-400 italic bg-gray-50/30 dark:bg-gray-900/30">
                                                        <i className="fa-solid fa-folder-open mb-2 text-2xl text-gray-300 dark:text-gray-700 block"></i>
                                                        No questions attempted in {activeAnalysisTab} yet.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </div>
                    </div>,
                    document.body
                );
            };

`;
    code = code.substring(0, analyticsModalStart) + dynamicModal + code.substring(analyticsModalEnd);
    console.log('Replaced renderAnalyticsModal with subject-agnostic design and Portal root.');
}

// Ensure Detailed Analyzer is wrapped in createPortal
const targetAnalyzerModalStart = code.indexOf('const renderDetailedAnalyzerModal = () => {');
const detailedModalRegex = /return \(\s*<div className=\"fixed inset-0[^>]*z-\[200000\][^>]*>/;
if (targetAnalyzerModalStart !== -1) {
    const end = code.indexOf('// --- TARGET ANALYZER WIDGET ---', targetAnalyzerModalStart);
    if (end !== -1) {
        let block = code.substring(targetAnalyzerModalStart, end);
        block = block.replace(/return \(\s*<div className=\"fixed inset-0/g, 'return ReactDOM.createPortal(\\n<div className="fixed inset-0');
        block = block.replace(/<\/div>\s*\);\s*};/g, '</div>,\ndocument.body\n);\n};');
        code = code.substring(0, targetAnalyzerModalStart) + block + code.substring(end);
        console.log('Wrapped renderDetailedAnalyzerModal in createPortal.');
    }
}

fs.writeFileSync('index.html', code);
console.log('Master fixes applied successfully.');
