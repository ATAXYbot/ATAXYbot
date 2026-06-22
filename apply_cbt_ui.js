const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// Inject states
const injectStateRegex = /const \[customGeneratorMode, setCustomGeneratorMode\] = useState\(null\);/;
if(code.match(injectStateRegex)) {
    code = code.replace(injectStateRegex, `const [customGeneratorMode, setCustomGeneratorMode] = useState(null);
            const [historyFilter, setHistoryFilter] = useState('all');
            const [analysisQuestionIndex, setAnalysisQuestionIndex] = useState(0);`);
    console.log('Injected new states');
} else {
    console.log('Could not find injection point');
}

// History Mode Replacements
const histRegex = /if \(customGeneratorMode === 'history'\) \{([\s\S]*?)if \(customGeneratorMode === 'full' \|\| customGeneratorMode === 'half'\) \{/m;

const histReplacement = `if (customGeneratorMode === 'history') {
                                return (
                                    <div className="pb-24 pt-4 px-5 animate-in fade-in min-h-screen">
                                        <div className="flex items-center gap-3 mb-6">
                                            <button onClick={() => setCustomGeneratorMode(null)} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300"><i className="fa-solid fa-arrow-left"></i></button>
                                            <h2 className="text-2xl font-black text-gray-900 dark:text-white drop-shadow-md tracking-tight">My Generated Tests</h2>
                                        </div>
                                        <div className="flex overflow-x-auto gap-2 mb-6 pb-2 no-scrollbar">
                                            {['all', 'full', 'half', 'dpp'].map(f => (
                                                <button key={f} onClick={() => setHistoryFilter(f)} className={\`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors \${historyFilter === f ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800'}\`}>
                                                    {f === 'all' ? 'All Tests' : f === 'full' ? 'Full Length' : f === 'half' ? 'Half Length' : 'DPPs'}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="space-y-4">
                                            {generatedTestsHistory.filter(t => historyFilter === 'all' || t.type === historyFilter).length === 0 ? (
                                                <p className="text-gray-500 text-center py-10">No tests found in this category.</p>
                                            ) : generatedTestsHistory.filter(t => historyFilter === 'all' || t.type === historyFilter).map(test => (
                                                <div key={test.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                                                    {test.isNeetPattern && <div className="absolute -right-4 -top-4 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 text-[10px] font-black py-4 px-6 rotate-45">EXACT NEET</div>}
                                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 pr-10 truncate">{test.name || (test.type === 'full' ? 'Full Length Test' : test.type === 'half' ? 'Half Length Test' : 'Custom DPP')}</h3>
                                                    <p className="text-xs font-semibold text-gray-500 mb-4 flex items-center gap-3">
                                                        <span className="flex items-center gap-1"><i className="fa-regular fa-calendar"></i> {new Date(test.date).toLocaleDateString([], {day: 'numeric', month: 'short', year: 'numeric'})}</span>
                                                        <span className="flex items-center gap-1"><i className="fa-regular fa-clock"></i> {new Date(test.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                    </p>
                                                    <div className="flex gap-3 mb-5">
                                                        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl flex-1 text-center border border-gray-100 dark:border-gray-800">
                                                            <p className="text-2xl font-black text-blue-600">{test.score} <span className="text-sm font-normal text-gray-400">/ {test.totalMarks}</span></p>
                                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Score</p>
                                                        </div>
                                                        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl flex-1 text-center border border-gray-100 dark:border-gray-800">
                                                            <p className="text-2xl font-black text-green-600">{test.accuracy}%</p>
                                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Accuracy</p>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <button onClick={() => {
                                                            // Reattempt logic
                                                            setPracticeAttempts({});
                                                            setPracticeVisited([]);
                                                            setPracticeReview([]);
                                                            setCurrentQuestionIndex(0);
                                                            setActiveGeneratedTest(test);
                                                            setLoadedQuestions(test.questions);
                                                            setActivePracticeChapter({ name: test.name || "Reattempted Test", isCustomTest: true });
                                                            setShowQuiz(true);
                                                        }} className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-bold shadow-sm transition-colors text-sm"><i className="fa-solid fa-rotate-right mr-1"></i> Reattempt</button>
                                                        <button onClick={() => {
                                                            setGeneratedTestResult(test);
                                                            setAnalysisQuestionIndex(0);
                                                        }} className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold shadow-[0_4px_14px_rgba(59,130,246,0.4)] transition-colors text-sm">Analysis <i className="fa-solid fa-arrow-right ml-1"></i></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }

                            if (customGeneratorMode === 'full' || customGeneratorMode === 'half') {`;

if(code.match(histRegex)) {
    code = code.replace(histRegex, histReplacement);
    console.log("Replaced History UI");
} else {
    console.log("Failed to match History UI");
}

fs.writeFileSync('index.html', code);
