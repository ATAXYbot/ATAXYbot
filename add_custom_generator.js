const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// 1. Inject State
const stateInjectionPoint = "const [practiceShowTopicModal, setPracticeShowTopicModal] = useState(false);";
const newStates = `const [practiceShowTopicModal, setPracticeShowTopicModal] = useState(false);
            const [customGeneratorMode, setCustomGeneratorMode] = useState(null); 
            const [customGenConfig, setCustomGenConfig] = useState({ subjects: { Physics: [], Chemistry: [], Botany: [], Zoology: [] }, dppSubject: null, dppChapter: null, dppTopics: [], dppCount: 10 });
            const [generatedTestsHistory, setGeneratedTestsHistory] = useState(() => safeGetJSON('ataxy_generated_tests', []));
            const [activeGeneratedTest, setActiveGeneratedTest] = useState(null);
            const [generatedTestResult, setGeneratedTestResult] = useState(null);

            useEffect(() => {
                setCloudData('ataxy_generated_tests', generatedTestsHistory);
            }, [generatedTestsHistory]);`;

if (!code.includes('const [customGeneratorMode, setCustomGeneratorMode]')) {
    code = code.replace(stateInjectionPoint, newStates);
}

// 2. Inject Custom Generator Dashboard and Flow
// Find the fallback return block: `return (\n                            <div className="pb-24 pt-4 px-5 animate-in fade-in min-h-screen">`
// Wait, the fallback starts around line 8715 after the `if (activePracticeBatch) { if (activePracticeBatch.type === 'jee') { ... } }`
// Let's use a regex or string replacement to hook into `if (activePracticeMode === 'custom')` before that fallback.

const fallbackStartStr = `                        return (
                            <div className="pb-24 pt-4 px-5 animate-in fade-in min-h-screen">
                                <div className="flex items-center gap-3 mb-6">
                                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActivePracticeBatch(null); }}`;

const customGenLogic = `                        if (activePracticeMode === 'custom') {
                            const handleGenerateTest = (type) => {
                                let testQuestions = [];
                                let subjectsToGenerate = [];
                                
                                const availableQuestions = activePracticeBatch?.sourceTable ? (qbankDataByTable[activePracticeBatch.sourceTable] || []) : qbankData;

                                if (type === 'full' || type === 'half') {
                                    const totalQ = type === 'full' ? 180 : 80;
                                    const qPerSub = totalQ / 4;
                                    
                                    ['Physics', 'Chemistry', 'Botany', 'Zoology'].forEach(subName => {
                                        const subData = availableQuestions.find(s => s.name.toLowerCase().includes(subName.toLowerCase()));
                                        if (!subData) return;
                                        
                                        let subQs = [];
                                        const selectedChapters = customGenConfig.subjects[subName];
                                        
                                        subData.chapters?.forEach(c => {
                                            if (selectedChapters.length === 0 || selectedChapters.includes(c.name)) {
                                                c.topics?.forEach(t => t.questions?.forEach(q => subQs.push({ ...q, topicName: t.name, chapterName: c.name, subjectName: subName })));
                                            }
                                        });
                                        
                                        // Shuffle and pick
                                        subQs.sort(() => Math.random() - 0.5);
                                        testQuestions = [...testQuestions, ...subQs.slice(0, qPerSub)];
                                    });
                                } else if (type === 'dpp') {
                                    const subData = availableQuestions.find(s => s.name === customGenConfig.dppSubject);
                                    if (subData) {
                                        const chapData = subData.chapters?.find(c => c.name === customGenConfig.dppChapter);
                                        if (chapData) {
                                            let subQs = [];
                                            chapData.topics?.forEach(t => {
                                                if (customGenConfig.dppTopics.length === 0 || customGenConfig.dppTopics.includes(t.name)) {
                                                    t.questions?.forEach(q => subQs.push({ ...q, topicName: t.name, chapterName: chapData.name, subjectName: subData.name }));
                                                }
                                            });
                                            subQs.sort(() => Math.random() - 0.5);
                                            testQuestions = subQs.slice(0, customGenConfig.dppCount);
                                        }
                                    }
                                }

                                if (testQuestions.length === 0) {
                                    safeAlert('Not enough questions available for the selected criteria.');
                                    return;
                                }

                                const newTest = {
                                    id: 'test_' + Date.now(),
                                    type: type,
                                    date: new Date().toISOString(),
                                    questions: testQuestions,
                                    totalMarks: testQuestions.length * 4
                                };

                                // Launch Test
                                setPracticeAttempts({});
                                setPracticeVisited([]);
                                setPracticeReview([]);
                                setCurrentQuestionIndex(0);
                                setActiveGeneratedTest(newTest);
                                setLoadedQuestions(testQuestions);
                                setActivePracticeChapter({ name: type === 'full' ? 'Full Length Custom Test' : type === 'half' ? 'Half Length Custom Test' : 'Custom DPP', isCustomTest: true });
                            };

                            if (customGeneratorMode === 'history') {
                                return (
                                    <div className="pb-24 pt-4 px-5 animate-in fade-in min-h-screen">
                                        <div className="flex items-center gap-3 mb-6">
                                            <button onClick={() => setCustomGeneratorMode(null)} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300"><i className="fa-solid fa-arrow-left"></i></button>
                                            <h2 className="text-2xl font-black text-gray-900 dark:text-white drop-shadow-md tracking-tight">My Generated Tests</h2>
                                        </div>
                                        <div className="space-y-4">
                                            {generatedTestsHistory.length === 0 ? (
                                                <p className="text-gray-500 text-center py-10">No tests generated yet.</p>
                                            ) : generatedTestsHistory.map(test => (
                                                <div key={test.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl shadow-sm">
                                                    <h3 className="font-bold text-lg">{test.type === 'full' ? 'Full Length Test' : test.type === 'half' ? 'Half Length Test' : 'DPP'}</h3>
                                                    <p className="text-xs text-gray-500 mb-3">{new Date(test.date).toLocaleString()}</p>
                                                    <div className="flex gap-4 mb-4">
                                                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg flex-1 text-center">
                                                            <p className="text-xl font-black text-blue-600">{test.score} / {test.totalMarks}</p>
                                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Score</p>
                                                        </div>
                                                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg flex-1 text-center">
                                                            <p className="text-xl font-black text-green-600">{test.accuracy}%</p>
                                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Accuracy</p>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => {
                                                        setGeneratedTestResult(test);
                                                    }} className="w-full py-2 bg-blue-500 text-white rounded-xl font-bold shadow-sm hover:bg-blue-600 transition-colors">View Detailed Analysis</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }

                            if (customGeneratorMode === 'full' || customGeneratorMode === 'half') {
                                return (
                                    <div className="pb-24 pt-4 px-5 animate-in fade-in min-h-screen">
                                        <div className="flex items-center gap-3 mb-6">
                                            <button onClick={() => setCustomGeneratorMode(null)} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300"><i className="fa-solid fa-arrow-left"></i></button>
                                            <h2 className="text-2xl font-black text-gray-900 dark:text-white drop-shadow-md tracking-tight">{customGeneratorMode === 'full' ? 'Full Length Configuration' : 'Half Length Configuration'}</h2>
                                        </div>
                                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                                            <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">Select specific chapters from each subject to build your custom test, or leave empty to include all chapters.</p>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            {['Physics', 'Chemistry', 'Botany', 'Zoology'].map(sub => {
                                                const subData = (activePracticeBatch?.sourceTable ? (qbankDataByTable[activePracticeBatch.sourceTable] || []) : qbankData).find(s => s.name.toLowerCase().includes(sub.toLowerCase()));
                                                if (!subData) return null;
                                                return (
                                                    <div key={sub} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl shadow-sm">
                                                        <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><i className="fa-solid fa-folder text-blue-500"></i> {sub}</h3>
                                                        <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                                                            {subData.chapters?.map(c => {
                                                                const isChecked = customGenConfig.subjects[sub].includes(c.name);
                                                                return (
                                                                    <label key={c.name} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors">
                                                                        <input type="checkbox" checked={isChecked} onChange={(e) => {
                                                                            setCustomGenConfig(prev => {
                                                                                const newSub = e.target.checked 
                                                                                    ? [...prev.subjects[sub], c.name]
                                                                                    : prev.subjects[sub].filter(n => n !== c.name);
                                                                                return { ...prev, subjects: { ...prev.subjects, [sub]: newSub } };
                                                                            });
                                                                        }} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{safeRenderText(c.name)}</span>
                                                                    </label>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <button onClick={() => handleGenerateTest(customGeneratorMode)} className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-2xl font-black text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all mt-6 active:scale-95">Generate CBT Test</button>
                                    </div>
                                );
                            }

                            if (customGeneratorMode === 'dpp') {
                                const availableSubjects = activePracticeBatch?.sourceTable ? (qbankDataByTable[activePracticeBatch.sourceTable] || []) : qbankData;
                                const subData = availableSubjects.find(s => s.name === customGenConfig.dppSubject);
                                const chapData = subData?.chapters?.find(c => c.name === customGenConfig.dppChapter);

                                return (
                                    <div className="pb-24 pt-4 px-5 animate-in fade-in min-h-screen">
                                        <div className="flex items-center gap-3 mb-6">
                                            <button onClick={() => setCustomGeneratorMode(null)} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300"><i className="fa-solid fa-arrow-left"></i></button>
                                            <h2 className="text-2xl font-black text-gray-900 dark:text-white drop-shadow-md tracking-tight">Generate DPP</h2>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl shadow-sm">
                                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Select Subject</label>
                                                <select className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 outline-none" value={customGenConfig.dppSubject || ''} onChange={e => setCustomGenConfig(prev => ({...prev, dppSubject: e.target.value, dppChapter: null, dppTopics: []}))}>
                                                    <option value="">-- Choose Subject --</option>
                                                    {availableSubjects.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                                                </select>
                                            </div>

                                            {subData && (
                                                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl shadow-sm">
                                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Select Chapter</label>
                                                    <select className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 outline-none" value={customGenConfig.dppChapter || ''} onChange={e => setCustomGenConfig(prev => ({...prev, dppChapter: e.target.value, dppTopics: []}))}>
                                                        <option value="">-- Choose Chapter --</option>
                                                        {subData.chapters?.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                                    </select>
                                                </div>
                                            )}

                                            {chapData && (
                                                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl shadow-sm">
                                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Select Topics (Optional)</label>
                                                    <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                                                        {chapData.topics?.map(t => {
                                                            const isChecked = customGenConfig.dppTopics.includes(t.name);
                                                            return (
                                                                <label key={t.name} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors">
                                                                    <input type="checkbox" checked={isChecked} onChange={(e) => {
                                                                        setCustomGenConfig(prev => {
                                                                            const newTopics = e.target.checked 
                                                                                ? [...prev.dppTopics, t.name]
                                                                                : prev.dppTopics.filter(n => n !== t.name);
                                                                            return { ...prev, dppTopics: newTopics };
                                                                        });
                                                                    }} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{safeRenderText(t.name)}</span>
                                                                </label>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl shadow-sm">
                                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Question Count</label>
                                                <div className="flex gap-3">
                                                    {[10, 20, 30].map(c => (
                                                        <button key={c} onClick={() => setCustomGenConfig(prev => ({...prev, dppCount: c}))} className={\`flex-1 py-3 rounded-xl font-bold border transition-all \${customGenConfig.dppCount === c ? 'bg-blue-100 border-blue-500 text-blue-700 ring-2 ring-blue-500/30' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}\`}>{c}</button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <button disabled={!customGenConfig.dppChapter} onClick={() => handleGenerateTest('dpp')} className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-500 text-white rounded-2xl font-black text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all mt-6 active:scale-95 disabled:opacity-50 disabled:pointer-events-none">Generate DPP</button>
                                    </div>
                                );
                            }

                            return (
                                <div className="pb-24 pt-4 px-5 animate-in fade-in min-h-screen">
                                    <div className="flex items-center gap-3 mb-6">
                                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActivePracticeMode(null); }} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300"><i className="fa-solid fa-arrow-left"></i></button>
                                        <h2 className="text-2xl font-black text-gray-900 dark:text-white drop-shadow-md tracking-tight">Custom Generator</h2>
                                    </div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-gray-500 uppercase tracking-widest text-xs">Create Setup</h3>
                                        <button onClick={() => setCustomGeneratorMode('history')} className="text-blue-500 text-sm font-bold flex items-center gap-1 hover:text-blue-600"><i className="fa-solid fa-clock-rotate-left"></i> My Tests</button>
                                    </div>
                                    <div className="space-y-4">
                                        <div onClick={() => setCustomGeneratorMode('full')} className="backdrop-blur-xl bg-white/5 border border-white/10 p-5 rounded-[1.5rem] flex items-center gap-5 shadow-[0_8px_30px_rgb(0,0,0,0.1)] cursor-pointer transition-all duration-300 group overflow-hidden relative hover:-translate-y-1 hover:border-blue-500/50 hover:bg-blue-50 dark:hover:bg-blue-900/30">
                                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl z-10 shadow-inner transition-all duration-500 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-500/30 text-blue-600 group-hover:bg-blue-500 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(59,130,246,0.6)]"><i className="fa-solid fa-file-contract"></i></div>
                                            <div className="flex-1 relative z-10">
                                                <h3 className="font-black text-xl text-gray-900 dark:text-white transition-colors drop-shadow-sm group-hover:text-blue-600 dark:group-hover:text-blue-300">Full Length Test</h3>
                                                <p className="text-xs text-gray-500 font-bold mt-1">180 Qs • Exact CBT Replica</p>
                                            </div>
                                            <i className="fa-solid fa-chevron-right text-gray-400 group-hover:text-blue-500 transition-colors"></i>
                                        </div>
                                        <div onClick={() => setCustomGeneratorMode('half')} className="backdrop-blur-xl bg-white/5 border border-white/10 p-5 rounded-[1.5rem] flex items-center gap-5 shadow-[0_8px_30px_rgb(0,0,0,0.1)] cursor-pointer transition-all duration-300 group overflow-hidden relative hover:-translate-y-1 hover:border-cyan-500/50 hover:bg-cyan-50 dark:hover:bg-cyan-900/30">
                                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl z-10 shadow-inner transition-all duration-500 bg-cyan-100 dark:bg-cyan-900/30 border border-cyan-200 dark:border-cyan-500/30 text-cyan-600 group-hover:bg-cyan-500 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(6,182,212,0.6)]"><i className="fa-solid fa-file-lines"></i></div>
                                            <div className="flex-1 relative z-10">
                                                <h3 className="font-black text-xl text-gray-900 dark:text-white transition-colors drop-shadow-sm group-hover:text-cyan-600 dark:group-hover:text-cyan-300">Half Length Test</h3>
                                                <p className="text-xs text-gray-500 font-bold mt-1">80 Qs • Quick Practice</p>
                                            </div>
                                            <i className="fa-solid fa-chevron-right text-gray-400 group-hover:text-cyan-500 transition-colors"></i>
                                        </div>
                                        <div onClick={() => setCustomGeneratorMode('dpp')} className="backdrop-blur-xl bg-white/5 border border-white/10 p-5 rounded-[1.5rem] flex items-center gap-5 shadow-[0_8px_30px_rgb(0,0,0,0.1)] cursor-pointer transition-all duration-300 group overflow-hidden relative hover:-translate-y-1 hover:border-purple-500/50 hover:bg-purple-50 dark:hover:bg-purple-900/30">
                                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl z-10 shadow-inner transition-all duration-500 bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-500/30 text-purple-600 group-hover:bg-purple-500 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(168,85,247,0.6)]"><i className="fa-solid fa-layer-group"></i></div>
                                            <div className="flex-1 relative z-10">
                                                <h3 className="font-black text-xl text-gray-900 dark:text-white transition-colors drop-shadow-sm group-hover:text-purple-600 dark:group-hover:text-purple-300">Generate DPP</h3>
                                                <p className="text-xs text-gray-500 font-bold mt-1">10/20/30 Qs • Topic-wise Focus</p>
                                            </div>
                                            <i className="fa-solid fa-chevron-right text-gray-400 group-hover:text-purple-500 transition-colors"></i>
                                        </div>
                                    </div>
                                </div>
                            );
                        }
${fallbackStartStr}`;

if (!code.includes("if (activePracticeMode === 'custom') {")) {
    code = code.replace(fallbackStartStr, customGenLogic);
}

// 3. Inject Submit Button & Results Analysis
// Let's modify the CBT bottom bar logic.
// Locate: `<button onClick={handlePrevious} disabled={safeQuestionIndex === 0}`
// Right around there we want to replace `Save & Next >>` logic to check if `activeGeneratedTest` is set and it's the last question.

const saveAndNextStr = `                                            <button onClick={() => {
                                                if (currentQuestion && practiceReview.includes(currentQuestion.id)) setPracticeReview(prev => prev.filter(id => id !== currentQuestion.id));
                                                handleNext();
                                            }} disabled={safeQuestionIndex >= displayedQuestions.length - 1} className="flex-1 md:flex-none bg-[#1ea020] border border-[#187f1a] text-white hover:bg-[#187f1a] disabled:opacity-50 text-[10px] sm:text-xs font-semibold px-4 sm:px-6 py-2.5 rounded-sm shadow-sm transition-colors uppercase tracking-wide active:scale-95">
                                                Save & Next &gt;&gt;
                                            </button>`;

const newSaveAndNextStr = `                                            <button onClick={() => {
                                                if (currentQuestion && practiceReview.includes(currentQuestion.id)) setPracticeReview(prev => prev.filter(id => id !== currentQuestion.id));
                                                handleNext();
                                            }} disabled={safeQuestionIndex >= displayedQuestions.length - 1 && !activeGeneratedTest} className={\`flex-1 md:flex-none \${safeQuestionIndex >= displayedQuestions.length - 1 && activeGeneratedTest ? 'bg-red-600 border border-red-700 hover:bg-red-700 text-white' : 'bg-[#1ea020] border border-[#187f1a] text-white hover:bg-[#187f1a]'} disabled:opacity-50 text-[10px] sm:text-xs font-semibold px-4 sm:px-6 py-2.5 rounded-sm shadow-sm transition-colors uppercase tracking-wide active:scale-95\`}>
                                                {safeQuestionIndex >= displayedQuestions.length - 1 && activeGeneratedTest ? 'Submit Test' : 'Save & Next >>'}
                                            </button>`;

if (!code.includes("Submit Test")) {
    // Wait, replacing the button string is not enough, because `handleNext()` just goes to next question and doesn't submit.
    // I need to hook into `handleNext`. Let's just create a wrapper function for `handleNext` or modify the `onClick` directly.
    const customSaveAndNext = `                                            <button onClick={() => {
                                                if (currentQuestion && practiceReview.includes(currentQuestion.id)) setPracticeReview(prev => prev.filter(id => id !== currentQuestion.id));
                                                if (safeQuestionIndex >= displayedQuestions.length - 1 && activeGeneratedTest) {
                                                    // Calculate Score
                                                    let score = 0;
                                                    let correctCnt = 0;
                                                    displayedQuestions.forEach(q => {
                                                        const userAnsIdx = attempts[q.id];
                                                        if (userAnsIdx !== undefined) {
                                                            const isCorr = ['A', 'B', 'C', 'D'][userAnsIdx] === q.correctOption;
                                                            if (isCorr) { score += 4; correctCnt++; } else { score -= 1; }
                                                        }
                                                    });
                                                    const finalResult = { ...activeGeneratedTest, score, accuracy: Math.round((correctCnt / displayedQuestions.length) * 100) || 0, attempts: { ...attempts } };
                                                    setGeneratedTestsHistory(prev => [finalResult, ...prev]);
                                                    setGeneratedTestResult(finalResult);
                                                    setActiveGeneratedTest(null);
                                                    setActivePracticeChapter(null); // Close CBT
                                                    setCustomGeneratorMode('history');
                                                    safeAlert('Test Submitted Successfully! View your detailed analysis.');
                                                } else {
                                                    handleNext();
                                                }
                                            }} disabled={safeQuestionIndex >= displayedQuestions.length - 1 && !activeGeneratedTest} className={\`flex-1 md:flex-none \${safeQuestionIndex >= displayedQuestions.length - 1 && activeGeneratedTest ? 'bg-red-600 border border-red-700 hover:bg-red-700 text-white' : 'bg-[#1ea020] border border-[#187f1a] text-white hover:bg-[#187f1a]'} disabled:opacity-50 text-[10px] sm:text-xs font-semibold px-4 sm:px-6 py-2.5 rounded-sm shadow-sm transition-colors uppercase tracking-wide active:scale-95\`}>
                                                {safeQuestionIndex >= displayedQuestions.length - 1 && activeGeneratedTest ? 'Submit Test' : 'Save & Next >>'}
                                            </button>`;
                                            
    code = code.replace(saveAndNextStr, customSaveAndNext);
}

// 4. Detailed Analysis View Injection
// We can hook right at the beginning of `function App() { ... return ( ... )` or before the main `return (` of the `if (activePracticeMode === 'custom')` 
// Let's inject it into the `if (activePracticeMode === 'custom')` block itself at the top, since it is a full screen overlay.
// Actually, `if (generatedTestResult)` should render the analysis overlay. We can put it right below `if (activePracticeBatch) {`

const analysisOverlayStart = `                    if (activePracticeBatch) {`;
const analysisOverlayHtml = `                    if (generatedTestResult) {
                        return (
                            <div className="pb-safe animate-in fade-in bg-gray-50 dark:bg-gray-950 min-h-screen">
                                {/* Header */}
                                <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setGeneratedTestResult(null)} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center transition-colors active:scale-95"><i className="fa-solid fa-arrow-left"></i></button>
                                        <h2 className="text-xl font-black text-gray-900 dark:text-white">Test Analysis</h2>
                                    </div>
                                </div>
                                <div className="p-5 max-w-4xl mx-auto space-y-6">
                                    {/* Stats Card */}
                                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                                        <i className="fa-solid fa-chart-pie absolute -right-4 -bottom-4 text-[120px] text-white/10 rotate-12"></i>
                                        <h3 className="text-xl font-black mb-6 relative z-10">{generatedTestResult.type === 'full' ? 'Full Length' : generatedTestResult.type === 'half' ? 'Half Length' : 'Custom DPP'} Result</h3>
                                        <div className="flex gap-4 relative z-10">
                                            <div className="flex-1 bg-white/10 rounded-2xl p-4 backdrop-blur-md border border-white/20">
                                                <p className="text-[10px] uppercase tracking-widest text-blue-200 font-bold mb-1">Total Score</p>
                                                <p className="text-3xl font-black">{generatedTestResult.score} <span className="text-sm font-normal opacity-70">/ {generatedTestResult.totalMarks}</span></p>
                                            </div>
                                            <div className="flex-1 bg-white/10 rounded-2xl p-4 backdrop-blur-md border border-white/20">
                                                <p className="text-[10px] uppercase tracking-widest text-blue-200 font-bold mb-1">Accuracy</p>
                                                <p className="text-3xl font-black">{generatedTestResult.accuracy}%</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Detailed Questions */}
                                    <div>
                                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4"><i className="fa-solid fa-list-check text-blue-500 mr-2"></i> Question Breakdown</h3>
                                        <div className="space-y-4">
                                            {generatedTestResult.questions.map((q, idx) => {
                                                const userAnsIdx = generatedTestResult.attempts[q.id];
                                                const isAns = userAnsIdx !== undefined;
                                                const isCorrect = isAns && ['A', 'B', 'C', 'D'][userAnsIdx] === q.correctOption;
                                                
                                                return (
                                                    <div key={q.id} className={\`bg-white dark:bg-gray-900 border rounded-2xl p-5 shadow-sm \${isAns ? (isCorrect ? 'border-green-300' : 'border-red-300') : 'border-gray-200'}\`}>
                                                        <div className="flex justify-between items-start mb-3">
                                                            <span className="font-bold text-gray-500">Q{idx + 1}.</span>
                                                            <span className={\`text-xs font-bold px-2 py-1 rounded-md \${isAns ? (isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700') : 'bg-gray-100 text-gray-600'}\`}>
                                                                {isAns ? (isCorrect ? '+4 Marks' : '-1 Mark') : 'Unattempted (0)'}
                                                            </span>
                                                        </div>
                                                        <div className="text-gray-900 dark:text-gray-100 font-medium mb-4"><FormattedText text={q.question} /></div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                                                            {q.options.map((opt, oIdx) => {
                                                                const optLetter = ['A', 'B', 'C', 'D'][oIdx];
                                                                const isSelected = userAnsIdx === oIdx;
                                                                const isCorrectOpt = optLetter === q.correctOption;
                                                                
                                                                let optClass = "bg-gray-50 border-gray-200 text-gray-700";
                                                                if (isCorrectOpt) optClass = "bg-green-50 border-green-500 text-green-700 ring-1 ring-green-500";
                                                                else if (isSelected && !isCorrectOpt) optClass = "bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500";
                                                                
                                                                return (
                                                                    <div key={oIdx} className={\`border p-3 rounded-xl text-sm flex gap-3 \${optClass}\`}>
                                                                        <span className="font-bold">{optLetter}.</span>
                                                                        <div><FormattedText text={opt} /></div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                        {q.explanation && q.explanation.trim().toLowerCase() !== 'no explanation' && (
                                                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-4">
                                                                <span className="font-bold text-blue-800 dark:text-blue-300 block mb-1">Explanation:</span>
                                                                <div className="text-sm text-blue-900 dark:text-blue-100"><FormattedText text={q.explanation} /></div>
                                                            </div>
                                                        )}
                                                        <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                                                            <QuestionAIAssistant q={q} attemptIdx={userAnsIdx} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }
${analysisOverlayStart}`;

if (!code.includes("if (generatedTestResult) {")) {
    code = code.replace(analysisOverlayStart, analysisOverlayHtml);
}

fs.writeFileSync('index.html', code);
console.log('Injected custom generator code successfully.');
