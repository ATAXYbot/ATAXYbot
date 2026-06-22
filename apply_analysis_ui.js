const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const analysisRegex = /if \(generatedTestResult\) \{([\s\S]*?)\n                    if \(activePracticeBatch\) \{/m;

const analysisReplacement = `if (generatedTestResult) {
                        const q = generatedTestResult.questions[analysisQuestionIndex];
                        const userAnsIdx = generatedTestResult.attempts[q.id];
                        const isAns = userAnsIdx !== undefined;
                        const isCorrect = isAns && ['A', 'B', 'C', 'D'][userAnsIdx] === q.correctOption;

                        return (
                            <div className="pb-safe animate-in fade-in bg-gray-50 dark:bg-gray-950 min-h-screen flex flex-col">
                                {/* Header */}
                                <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setGeneratedTestResult(null)} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95"><i className="fa-solid fa-arrow-left"></i></button>
                                        <div>
                                            <h2 className="text-xl font-black text-gray-900 dark:text-white leading-tight">Test Analysis</h2>
                                            <p className="text-xs text-gray-500 font-bold">{generatedTestResult.score} / {generatedTestResult.totalMarks} Marks ({generatedTestResult.accuracy}%)</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setAnalysisQuestionIndex(Math.max(0, analysisQuestionIndex - 1))} disabled={analysisQuestionIndex === 0} className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center disabled:opacity-50 active:scale-95 shadow-sm"><i className="fa-solid fa-chevron-left"></i></button>
                                        <button onClick={() => setAnalysisQuestionIndex(Math.min(generatedTestResult.questions.length - 1, analysisQuestionIndex + 1))} disabled={analysisQuestionIndex === generatedTestResult.questions.length - 1} className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center disabled:opacity-50 active:scale-95 shadow-sm"><i className="fa-solid fa-chevron-right"></i></button>
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-4 gap-6">
                                    {/* Main Question Area */}
                                    <div className="flex-1 space-y-6">
                                        <div className={\`bg-white dark:bg-gray-900 border-2 rounded-2xl p-5 md:p-8 shadow-sm transition-colors \${isAns ? (isCorrect ? 'border-green-400' : 'border-red-400') : 'border-gray-200 dark:border-gray-700'}\`}>
                                            <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-black flex items-center justify-center text-lg shadow-sm">Q{analysisQuestionIndex + 1}</span>
                                                    {q.subjectName && <span className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">{q.subjectName}</span>}
                                                </div>
                                                <span className={\`text-sm font-black px-4 py-1.5 rounded-full shadow-inner \${isAns ? (isCorrect ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200') : 'bg-gray-100 text-gray-600 border border-gray-200'}\`}>
                                                    {isAns ? (isCorrect ? '+4 Marks' : '-1 Mark') : 'Unattempted (0)'}
                                                </span>
                                            </div>
                                            <div className="text-gray-900 dark:text-gray-100 font-medium mb-8 text-lg md:text-xl leading-relaxed">
                                                <FormattedText text={q.question || q.text || q.question_text} />
                                                {q.imageUrl && <div className="mt-6 max-w-full overflow-hidden rounded-xl border border-gray-200 shadow-sm"><img src={q.imageUrl} className="max-w-full h-auto object-contain max-h-[400px]" alt="Question" /></div>}
                                            </div>
                                            <div className="grid grid-cols-1 gap-3 mb-6">
                                                {(q.options || []).map((opt, oIdx) => {
                                                    const optLetter = ['A', 'B', 'C', 'D'][oIdx];
                                                    const isSelected = userAnsIdx === oIdx;
                                                    const isCorrectOpt = optLetter === q.correctOption;
                                                    
                                                    let optClass = "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300";
                                                    if (isCorrectOpt) optClass = "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-200 ring-2 ring-green-500/50 shadow-md transform scale-[1.01]";
                                                    else if (isSelected && !isCorrectOpt) optClass = "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-200 ring-2 ring-red-500/50 shadow-md";
                                                    
                                                    return (
                                                        <div key={oIdx} className={\`border-2 p-4 rounded-xl text-base flex gap-4 transition-all \${optClass}\`}>
                                                            <span className="font-black w-8 h-8 rounded-full bg-white/50 flex items-center justify-center shrink-0 shadow-sm text-sm">{optLetter}</span>
                                                            <div className="pt-1"><FormattedText text={opt} /></div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            {q.explanation && q.explanation.trim().toLowerCase() !== 'no explanation' && (
                                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5 mb-6 shadow-sm">
                                                    <span className="font-black text-blue-800 dark:text-blue-300 block mb-2 text-lg flex items-center gap-2"><i className="fa-solid fa-lightbulb text-yellow-500"></i> Explanation</span>
                                                    <div className="text-base text-blue-900 dark:text-blue-100 leading-relaxed"><FormattedText text={q.explanation} /></div>
                                                </div>
                                            )}
                                            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                                <QuestionAIAssistant q={q} attemptIdx={userAnsIdx} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sidebar Question Palette */}
                                    <div className="w-full lg:w-80 shrink-0 flex flex-col gap-4">
                                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm sticky top-24">
                                            <h3 className="font-black text-lg mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200"><i className="fa-solid fa-grip text-blue-500"></i> Question Palette</h3>
                                            <div className="grid grid-cols-5 gap-2 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                                                {generatedTestResult.questions.map((pq, pIdx) => {
                                                    const pAnsIdx = generatedTestResult.attempts[pq.id];
                                                    const pIsAns = pAnsIdx !== undefined;
                                                    const pIsCorrect = pIsAns && ['A', 'B', 'C', 'D'][pAnsIdx] === pq.correctOption;
                                                    
                                                    let btnClass = "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400";
                                                    if (pIsCorrect) btnClass = "bg-green-100 dark:bg-green-900/40 border-green-500 text-green-700 dark:text-green-300 font-bold shadow-sm";
                                                    else if (pIsAns && !pIsCorrect) btnClass = "bg-red-100 dark:bg-red-900/40 border-red-500 text-red-700 dark:text-red-300 font-bold shadow-sm";
                                                    
                                                    if (pIdx === analysisQuestionIndex) {
                                                        btnClass += " ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900 transform scale-110 z-10";
                                                    }

                                                    return (
                                                        <button key={pq.id} onClick={() => setAnalysisQuestionIndex(pIdx)} className={\`w-10 h-10 rounded-lg border flex items-center justify-center text-xs transition-all \${btnClass}\`}>
                                                            {pIdx + 1}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-green-100 border border-green-500"></div> Correct</div>
                                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-red-100 border border-red-500"></div> Incorrect</div>
                                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-gray-100 border border-gray-200"></div> Skipped</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }
                    if (activePracticeBatch) {`;

if (code.match(analysisRegex)) {
    code = code.replace(analysisRegex, analysisReplacement);
    console.log("Replaced analysis view");
    fs.writeFileSync('index.html', code);
} else {
    console.log("Failed to match analysis Regex");
}
