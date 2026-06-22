const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// 1. Add state
if (!code.includes('const [showScoreSummary, setShowScoreSummary]')) {
    code = code.replace(/const \[generatedTestResult, setGeneratedTestResult\] = useState\(null\);/, "const [generatedTestResult, setGeneratedTestResult] = useState(null);\n            const [showScoreSummary, setShowScoreSummary] = useState(false);");
}

// 2. Submit button
const submitRegex = /setGeneratedTestResult\(finalResult\);\s*setGeneratedTestsHistory\(prev => \[finalResult, \.\.\.prev\]\);/;
if (code.match(submitRegex)) {
    code = code.replace(submitRegex, "setGeneratedTestResult(finalResult);\n                                                        setShowScoreSummary(true);\n                                                        setGeneratedTestsHistory(prev => [finalResult, ...prev]);");
}

// 3. History card Analysis button
const analysisBtnRegex = /setGeneratedTestResult\(test\);\s*setAnalysisQuestionIndex\(0\);/;
if (code.match(analysisBtnRegex)) {
    code = code.replace(analysisBtnRegex, "setGeneratedTestResult(test);\n                                                            setShowScoreSummary(true);\n                                                            setAnalysisQuestionIndex(0);");
}

// 4. Inject summary view into generatedTestResult
const analysisBlockRegex = /if \(generatedTestResult\) \{\s*const q = generatedTestResult\.questions\[analysisQuestionIndex\];/m;
const summaryView = `if (generatedTestResult) {
                        if (showScoreSummary) {
                            const stats = generatedTestResult.stats || (() => {
                                let c = 0, ic = 0, u = 0;
                                generatedTestResult.questions.forEach(q => {
                                    const ans = generatedTestResult.attempts[q.id];
                                    if (ans !== undefined) {
                                        if (['A', 'B', 'C', 'D'][ans] === q.correctOption) c++;
                                        else ic++;
                                    } else { u++; }
                                });
                                return { correct: c, incorrect: ic, unattempted: u };
                            })();

                            return (
                                <div className="pb-24 pt-4 px-5 animate-in fade-in min-h-[80vh] flex items-center justify-center">
                                    <div className="bg-white dark:bg-gray-900 rounded-[2rem] w-full max-w-md p-8 shadow-2xl border border-gray-100 dark:border-gray-800 text-center relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-500 to-purple-600 opacity-20"></div>
                                        <button onClick={() => { setShowScoreSummary(false); setGeneratedTestResult(null); }} className="absolute top-4 left-4 w-10 h-10 bg-white/50 dark:bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-black transition-colors z-10"><i className="fa-solid fa-arrow-left"></i></button>
                                        
                                        <div className="relative z-10">
                                            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg mb-6">
                                                <i className="fa-solid fa-trophy text-4xl text-white"></i>
                                            </div>
                                            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Test Score</h2>
                                            <p className="text-gray-500 font-bold mb-8">{generatedTestResult.name || 'Custom Test'}</p>
                                            
                                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 mb-8 border border-gray-100 dark:border-gray-800 shadow-inner">
                                                <div className="flex justify-between items-end mb-4 border-b border-gray-200 dark:border-gray-700 pb-4">
                                                    <div className="text-left">
                                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Score</div>
                                                        <div className="text-4xl font-black text-gray-900 dark:text-white">{generatedTestResult.score || 0}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Out of</div>
                                                        <div className="text-xl font-bold text-gray-500">{generatedTestResult.totalMarks}</div>
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                                        <div className="text-green-500 mb-1"><i className="fa-solid fa-check-circle"></i></div>
                                                        <div className="text-xl font-black text-gray-800 dark:text-gray-200">{stats.correct}</div>
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Correct</div>
                                                    </div>
                                                    <div className="bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                                        <div className="text-red-500 mb-1"><i className="fa-solid fa-times-circle"></i></div>
                                                        <div className="text-xl font-black text-gray-800 dark:text-gray-200">{stats.incorrect}</div>
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Incorrect</div>
                                                    </div>
                                                    <div className="bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                                        <div className="text-blue-500 mb-1"><i className="fa-solid fa-pen-to-square"></i></div>
                                                        <div className="text-xl font-black text-gray-800 dark:text-gray-200">{stats.correct + stats.incorrect}</div>
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Attempted</div>
                                                    </div>
                                                    <div className="bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                                        <div className="text-gray-400 mb-1"><i className="fa-solid fa-minus-circle"></i></div>
                                                        <div className="text-xl font-black text-gray-800 dark:text-gray-200">{stats.unattempted}</div>
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Unattempted</div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <button onClick={() => setShowScoreSummary(false)} className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-black text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95">Detailed Analysis <i className="fa-solid fa-arrow-right ml-2"></i></button>
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        const q = generatedTestResult.questions[analysisQuestionIndex];`;

if (code.match(analysisBlockRegex) && !code.includes('if (showScoreSummary) {')) {
    code = code.replace(analysisBlockRegex, summaryView);
}

// 5. Change Analysis view back button
const analysisBackBtn = /<button onClick=\{\(\) => setGeneratedTestResult\(null\)\} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95">/;
if (code.match(analysisBackBtn)) {
    code = code.replace(analysisBackBtn, '<button onClick={() => setShowScoreSummary(true)} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95">');
}

fs.writeFileSync('index.html', code);
console.log('Fixed Score Summary');
