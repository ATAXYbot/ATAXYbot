const fs = require('fs');

let code = fs.readFileSync('index.html', 'utf8');

// 1. Inject Test Name Text Input for Custom Generator
const customGenStateStr = `const [customGenConfig, setCustomGenConfig] = useState({ subjects: { Physics: [], Chemistry: [], Botany: [], Zoology: [] }, dppSubject: null, dppChapter: null, dppTopics: [], dppCount: 10 });`;
const newCustomGenStateStr = `const [customGenConfig, setCustomGenConfig] = useState({ subjects: { Physics: [], Chemistry: [], Botany: [], Zoology: [] }, dppSubject: null, dppChapter: null, dppTopics: [], dppCount: 10, testName: '' });`;

if (code.includes(customGenStateStr)) {
    code = code.replace(customGenStateStr, newCustomGenStateStr);
}

// 2. Add Test Name Input inside the "Full" and "Half" configuration render block
const fullHalfRenderStr = `                                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                                            <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">Select specific chapters from each subject to build your custom test, or leave empty to include all chapters.</p>
                                        </div>`;
const newFullHalfRenderStr = `                                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                                            <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">Select specific chapters from each subject to build your custom test, or leave empty to include all chapters.</p>
                                        </div>
                                        <div className="mb-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl shadow-sm">
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Custom Test Name (Optional)</label>
                                            <input type="text" value={customGenConfig.testName || ''} onChange={e => setCustomGenConfig(prev => ({...prev, testName: e.target.value}))} placeholder="e.g., My Target Sunday Test" className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500" />
                                        </div>`;

if (code.includes(fullHalfRenderStr) && !code.includes("Custom Test Name (Optional)")) {
    code = code.replace(fullHalfRenderStr, newFullHalfRenderStr);
}

// 3. Add Test Name Input inside the "DPP" configuration render block
const dppRenderStr = `                                            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl shadow-sm">
                                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Select Subject</label>`;
const newDppRenderStr = `                                            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl shadow-sm">
                                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Custom DPP Name (Optional)</label>
                                                <input type="text" value={customGenConfig.testName || ''} onChange={e => setCustomGenConfig(prev => ({...prev, testName: e.target.value}))} placeholder="e.g., Physics Mechanics DPP" className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 outline-none focus:ring-2 focus:ring-purple-500" />
                                            </div>
                                            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl shadow-sm">
                                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Select Subject</label>`;

if (code.includes(dppRenderStr) && !code.includes("Custom DPP Name (Optional)")) {
    code = code.replace(dppRenderStr, newDppRenderStr);
}

// 4. Update handleGenerateTest to use customGenConfig.testName
const setActivePracticeStr = `const dateName = new Date().toLocaleString([], {year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'});
                                setActivePracticeChapter({ name: (type === 'full' ? 'Full Length Test' : type === 'half' ? 'Half Length Test' : 'Custom DPP') + ' - ' + dateName, isCustomTest: true });
                                setShowQuiz(true);`;
const newSetActivePracticeStr = `const dateName = new Date().toLocaleString([], {year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'});
                                const finalTestName = customGenConfig.testName && customGenConfig.testName.trim() !== '' ? customGenConfig.testName : ((type === 'full' ? 'Full Length Test' : type === 'half' ? 'Half Length Test' : 'Custom DPP') + ' - ' + dateName);
                                setActivePracticeChapter({ name: finalTestName, isCustomTest: true });
                                setShowQuiz(true);`;

if (code.includes(setActivePracticeStr)) {
    code = code.replace(setActivePracticeStr, newSetActivePracticeStr);
}


// 5. Inject NTA CBT UI Block
const ntaInjectionPoint = `if (activePracticeChapter) {`;

const ntaBlockStr = `if (activePracticeChapter) {
                        if (activePracticeChapter.isCustomTest) {
                            const selectedTopic = practiceSelectedTopic; 
                            let displayedQuestions = loadedQuestions; 
                            
                            if (!displayedQuestions || displayedQuestions.length === 0) return <div className="text-white text-center p-10">Loading test...</div>;

                            const safeQuestionIndex = Math.min(currentQuestionIndex, Math.max(0, displayedQuestions.length - 1));
                            const currentQuestion = displayedQuestions[safeQuestionIndex] || {};
                            const attempts = practiceAttempts || {};
                            const isAnswered = attempts[currentQuestion.id] !== undefined;
                            const userAnsIdx = attempts[currentQuestion.id];

                            const StatusShape = ({ status, num }) => {
                                if (status === 'not_visited') return <div className="w-8 h-8 md:w-10 md:h-10 bg-[#E2E2E2] border border-gray-400 text-gray-700 flex items-center justify-center font-bold text-xs md:text-sm shadow-sm">{num}</div>;
                                if (status === 'not_answered') return <div className="w-8 h-8 md:w-10 md:h-10 bg-[#E85D04] text-white flex items-center justify-center font-bold text-xs md:text-sm shadow-sm" style={{ clipPath: 'polygon(50% 100%, 100% 80%, 100% 0, 0 0, 0 80%)' }}>{num}</div>;
                                if (status === 'answered') return <div className="w-8 h-8 md:w-10 md:h-10 bg-[#2D9A44] text-white flex items-center justify-center font-bold text-xs md:text-sm shadow-sm" style={{ clipPath: 'polygon(50% 100%, 100% 80%, 100% 0, 0 0, 0 80%)' }}>{num}</div>;
                                if (status === 'marked') return <div className="w-8 h-8 md:w-10 md:h-10 bg-[#5C429A] rounded-full text-white flex items-center justify-center font-bold text-xs md:text-sm shadow-sm">{num}</div>;
                                if (status === 'answered_marked') return <div className="w-8 h-8 md:w-10 md:h-10 bg-[#5C429A] rounded-full text-white flex items-center justify-center font-bold text-xs md:text-sm shadow-sm relative">{num}<div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#2D9A44] rounded-full border border-white"></div></div>;
                            };

                            const getStatus = (qId) => {
                                const visited = practiceVisited.includes(qId);
                                const ans = attempts[qId] !== undefined;
                                const marked = practiceReview.includes(qId);
                                if (!visited && !ans && !marked) return 'not_visited';
                                if (ans && !marked) return 'answered';
                                if (visited && !ans && !marked) return 'not_answered';
                                if (!ans && marked) return 'marked';
                                if (ans && marked) return 'answered_marked';
                                return 'not_visited';
                            };
                            
                            let cntNotVisited = 0, cntNotAnswered = 0, cntAnswered = 0, cntMarked = 0, cntAnsMarked = 0;
                            displayedQuestions.forEach(q => {
                                const s = getStatus(q.id);
                                if (s === 'not_visited') cntNotVisited++;
                                if (s === 'not_answered') cntNotAnswered++;
                                if (s === 'answered') cntAnswered++;
                                if (s === 'marked') cntMarked++;
                                if (s === 'answered_marked') cntAnsMarked++;
                            });

                            const handleClear = (qId) => {
                                setPracticeAttempts(prev => { const next = { ...prev }; delete next[qId]; return next; });
                            };

                            const handleNext = () => {
                                if (!practiceVisited.includes(currentQuestion.id)) setPracticeVisited(prev => [...prev, currentQuestion.id]);
                                if (safeQuestionIndex < displayedQuestions.length - 1) setCurrentQuestionIndex(safeQuestionIndex + 1);
                            };
                            
                            const handlePrevious = () => {
                                if (!practiceVisited.includes(currentQuestion.id)) setPracticeVisited(prev => [...prev, currentQuestion.id]);
                                if (safeQuestionIndex > 0) setCurrentQuestionIndex(safeQuestionIndex - 1);
                            };

                            return (
                                <div className="bg-white min-h-[100dvh] font-sans text-gray-800 flex flex-col fixed inset-0 z-[100] overflow-hidden">
                                    <div className="bg-gray-100 border-b border-gray-300 px-4 py-2 flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm shrink-0 gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-gray-300 flex items-center justify-center shadow-inner overflow-hidden shrink-0">
                                                {userProfile?.profile_image_url ? <img src={userProfile.profile_image_url} className="w-full h-full object-cover" /> : <i className="fa-solid fa-user text-3xl text-gray-400"></i>}
                                            </div>
                                            <div className="text-xs sm:text-sm grid grid-cols-[max-content_1fr] gap-x-2 gap-y-0.5">
                                                <span className="text-gray-500 font-semibold">Candidate Name</span><span className="font-bold text-[#E85D04]">: {safeRenderText(userProfile?.full_name || 'Student')}</span>
                                                <span className="text-gray-500 font-semibold">Exam Name</span><span className="font-bold text-[#E85D04]">: {isNeet ? 'NEET' : 'JEE'}</span>
                                                <span className="text-gray-500 font-semibold">Test Name</span><span className="font-bold text-[#E85D04]">: {activePracticeChapter.name}</span>
                                                <span className="text-gray-500 font-semibold">Remaining Time</span><span className="font-bold text-white bg-red-600 px-1.5 py-px rounded-sm inline-block w-max text-xs">: <PracticeTimer active={true} questionId={currentQuestion?.id} isAnswered={isAnswered} /></span>
                                            </div>
                                        </div>
                                        <button onClick={() => { setConfirmClearScope({ type: 'chapter', data: activePracticeChapter }); }} className="text-red-500 text-sm font-bold hover:bg-red-50 px-3 py-1 rounded-sm transition-colors border border-red-200">Quit Test</button>
                                    </div>

                                    <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                                        <div className="flex-1 flex flex-col border-r border-gray-300 relative bg-white min-w-0">
                                            <div className="flex justify-between items-center bg-white border-b-2 border-gray-300 px-4 py-2 shrink-0">
                                                <h2 className="text-lg font-bold text-gray-800">Question {safeQuestionIndex + 1}:</h2>
                                                <i className="fa-solid fa-circle-down text-blue-600 text-xl"></i>
                                            </div>
                                            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8" data-qa-card>
                                                <div className="text-black text-[15px] sm:text-[16px] leading-relaxed font-medium mb-6">
                                                    <FormattedText text={currentQuestion.question} />
                                                    {currentQuestion.imageUrl && <div className="mt-4 max-w-full overflow-hidden rounded-md border border-gray-200"><img src={currentQuestion.imageUrl} className="max-w-full h-auto object-contain max-h-[400px]" alt="Question" /></div>}
                                                </div>
                                                <div className="space-y-4 max-w-3xl">
                                                    {currentQuestion.options?.map((opt, oIdx) => {
                                                        const isSelected = userAnsIdx === oIdx;
                                                        return (
                                                            <label key={oIdx} className="flex items-start gap-3 cursor-pointer group">
                                                                <div className="mt-1 flex items-center justify-center shrink-0 relative">
                                                                    <input type="radio" name={'q_' + currentQuestion.id} checked={isSelected} onChange={() => {
                                                                        setPracticeAttempts(prev => ({ ...prev, [currentQuestion.id]: oIdx }));
                                                                        if (!practiceVisited.includes(currentQuestion.id)) setPracticeVisited(prev => [...prev, currentQuestion.id]);
                                                                    }} className="w-5 h-5 text-[#2D9A44] focus:ring-[#2D9A44] border-gray-400" />
                                                                </div>
                                                                <div className="flex gap-2 text-black text-[15px] group-hover:text-gray-900">
                                                                    <span className="font-bold shrink-0">{oIdx + 1}.</span>
                                                                    <div><FormattedText text={opt} /></div>
                                                                </div>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            <div className="border-t border-gray-300 bg-white p-2 shrink-0">
                                                <div className="flex flex-wrap gap-2 justify-between">
                                                    <div className="flex gap-2 flex-wrap">
                                                        <button onClick={() => {
                                                            if (practiceReview.includes(currentQuestion.id)) setPracticeReview(prev => prev.filter(id => id !== currentQuestion.id));
                                                            handleNext();
                                                        }} className="bg-[#2D9A44] hover:bg-[#258239] text-white text-[11px] sm:text-xs font-bold px-3 py-2 rounded-sm uppercase shadow-sm active:scale-95">Save & Next</button>
                                                        <button onClick={() => handleClear(currentQuestion?.id)} className="bg-white hover:bg-gray-50 border border-gray-400 text-gray-700 text-[11px] sm:text-xs font-bold px-3 py-2 rounded-sm uppercase shadow-sm active:scale-95">Clear</button>
                                                        <button onClick={() => {
                                                            if (!practiceReview.includes(currentQuestion.id)) setPracticeReview(prev => [...prev, currentQuestion.id]);
                                                            handleNext();
                                                        }} className="bg-[#E85D04] hover:bg-[#d05303] text-white text-[11px] sm:text-xs font-bold px-3 py-2 rounded-sm uppercase shadow-sm active:scale-95">Save & Mark For Review</button>
                                                    </div>
                                                    <button onClick={() => {
                                                        if (!practiceReview.includes(currentQuestion.id)) setPracticeReview(prev => [...prev, currentQuestion.id]);
                                                        handleNext();
                                                    }} className="bg-[#2B548E] hover:bg-[#20406e] text-white text-[11px] sm:text-xs font-bold px-3 py-2 rounded-sm uppercase shadow-sm w-full sm:w-auto mt-2 sm:mt-0 active:scale-95">Mark For Review & Next</button>
                                                </div>
                                            </div>
                                            <div className="bg-gray-100 border-t border-gray-300 px-3 py-2 flex justify-between shrink-0">
                                                <div className="flex gap-2">
                                                    <button onClick={handlePrevious} disabled={safeQuestionIndex === 0} className="bg-white hover:bg-gray-50 border border-gray-400 text-gray-700 text-[11px] sm:text-xs font-bold px-4 py-1.5 rounded-sm shadow-sm disabled:opacity-50 active:scale-95">&lt;&lt; Back</button>
                                                    <button onClick={handleNext} disabled={safeQuestionIndex >= displayedQuestions.length - 1} className="bg-white hover:bg-gray-50 border border-gray-400 text-gray-700 text-[11px] sm:text-xs font-bold px-4 py-1.5 rounded-sm shadow-sm disabled:opacity-50 active:scale-95">Next &gt;&gt;</button>
                                                </div>
                                                <button onClick={() => {
                                                    let score = 0;
                                                    let correctCnt = 0;
                                                    displayedQuestions.forEach(q => {
                                                        const ansIdx = attempts[q.id];
                                                        if (ansIdx !== undefined) {
                                                            const isCorr = ['A', 'B', 'C', 'D'][ansIdx] === q.correctOption;
                                                            if (isCorr) { score += 4; correctCnt++; } else { score -= 1; }
                                                        }
                                                    });
                                                    const finalResult = { ...activeGeneratedTest, score, accuracy: Math.round((correctCnt / displayedQuestions.length) * 100) || 0, attempts: { ...attempts } };
                                                    setGeneratedTestsHistory(prev => [finalResult, ...prev]);
                                                    setGeneratedTestResult(finalResult);
                                                    setActiveGeneratedTest(null);
                                                    setActivePracticeChapter(null); 
                                                    setCustomGeneratorMode('history');
                                                    safeAlert('Test Submitted Successfully! View your detailed analysis.');
                                                }} className="bg-[#4caf50] hover:bg-[#43a047] text-white text-[11px] sm:text-xs font-bold px-6 py-1.5 rounded-sm shadow-sm uppercase tracking-wider active:scale-95">Submit</button>
                                            </div>
                                        </div>

                                        <div className="w-full lg:w-[320px] bg-[#E8F0F8] flex flex-col shrink-0 lg:h-full max-h-[40vh] lg:max-h-none border-t lg:border-t-0 border-gray-300 overflow-hidden">
                                            <div className="p-3 bg-white border-b border-gray-300 grid grid-cols-2 gap-y-3 gap-x-2 text-[11px] sm:text-xs text-gray-700 shrink-0">
                                                <div className="flex items-center gap-2"><StatusShape status="not_visited" num={cntNotVisited} /> <span>Not Visited</span></div>
                                                <div className="flex items-center gap-2"><StatusShape status="not_answered" num={cntNotAnswered} /> <span>Not Answered</span></div>
                                                <div className="flex items-center gap-2"><StatusShape status="answered" num={cntAnswered} /> <span>Answered</span></div>
                                                <div className="flex items-center gap-2"><StatusShape status="marked" num={cntMarked} /> <span>Marked for Review</span></div>
                                                <div className="flex items-start gap-2 col-span-2 mt-1">
                                                    <div className="shrink-0"><StatusShape status="answered_marked" num={cntAnsMarked} /></div>
                                                    <span className="leading-tight">Answered & Marked for Review (will be considered for evaluation)</span>
                                                </div>
                                            </div>
                                            <div className="bg-[#5C7FA5] text-white font-bold px-3 py-1.5 text-xs uppercase shrink-0">Choose a Question</div>
                                            <div className="p-3 overflow-y-auto flex-1 grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 gap-2 content-start bg-blue-50/50">
                                                {displayedQuestions.map((q, idx) => {
                                                    const status = getStatus(q.id);
                                                    return (
                                                        <button key={q.id} onClick={() => {
                                                            if (!practiceVisited.includes(currentQuestion.id)) setPracticeVisited(prev => [...prev, currentQuestion.id]);
                                                            setCurrentQuestionIndex(idx);
                                                        }} className="flex justify-center hover:scale-105 transition-transform active:scale-95 cursor-pointer">
                                                            <StatusShape status={status} num={idx + 1} />
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }`;

if (!code.includes("bg-[#E8F0F8]")) {
    code = code.replace(ntaInjectionPoint, ntaBlockStr);
}

fs.writeFileSync('index.html', code);
console.log('Injected NTA CBT Mode successfully.');
