const fs = require('fs');

const code = fs.readFileSync('c:/Users/risha/ATAXYbot/index.html', 'utf8');
const lines = code.split('\n');

// Find boundaries of renderQuestionsView
const startFn = lines.findIndex(l => l.includes('const renderQuestionsView'));
const endFn = lines.findIndex((l, i) => i > startFn && l.includes('// --- UNIFIED HISTORY VIEWER'));

if (startFn === -1 || endFn === -1) {
    console.error("Could not find boundaries.");
    process.exit(1);
}

// We will extract the inner content of renderQuestionsView, apply targeted string replacements, and write it back.
// It is much safer to just target specific chunks.

let functionBlock = lines.slice(startFn, endFn).join('\n');

// 1. displayedQuestions filtering
const oldDisplayedQuestions = `                        let displayedQuestions = selectedTopic ? allQuestions.filter(q => q.topicName === selectedTopic) : allQuestions;

                        if (questionFilter === 'bookmarked') {`;
                        
const newDisplayedQuestions = `                        let displayedQuestions = selectedTopic ? allQuestions.filter(q => q.topicName === selectedTopic) : allQuestions;
                        
                        if (activeQuestionType && activeQuestionType !== 'All combined') {
                            displayedQuestions = displayedQuestions.filter(q => q.questionType === activeQuestionType);
                        }

                        if (questionFilter === 'bookmarked') {`;

functionBlock = functionBlock.replace(oldDisplayedQuestions, newDisplayedQuestions);


// 2. Topic dropdown in Top-Left of Quiz
const oldHeader = `                                    <div>
                                        <h2 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                                            {safeRenderText(activePracticeChapter?.name || 'Practice Session')}
                                        </h2>
                                        {practiceSelectedTopic && <p className="text-[10px] text-gray-500 font-semibold">{safeRenderText(practiceSelectedTopic)}</p>}
                                    </div>`;

const newHeader = `                                    <div>
                                        <h2 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                                            {safeRenderText(activePracticeChapter?.name || 'Practice Session')}
                                        </h2>
                                        <select 
                                            className="text-[10px] text-gray-500 font-semibold bg-transparent outline-none cursor-pointer max-w-[150px] truncate"
                                            value={practiceSelectedTopic || ''}
                                            onChange={(e) => {
                                                setPracticeSelectedTopic(e.target.value || null);
                                                setCurrentQuestionIndex(0);
                                            }}
                                        >
                                            <option value="">All Topics</option>
                                            {Array.from(new Set(loadedQuestions.map(q => q.topicName))).filter(Boolean).map((top, idx) => (
                                                <option key={idx} value={top}>{safeRenderText(top)}</option>
                                            ))}
                                        </select>
                                    </div>`;

functionBlock = functionBlock.replace(oldHeader, newHeader);


// 3. activePracticeChapter UI replacement
// We replace the entire `if (activePracticeChapter) { ... }` block
const activeChapStart = functionBlock.indexOf('if (activePracticeChapter) {');
const activeSubjStart = functionBlock.indexOf('if (activePracticeSubject) {');

if (activeChapStart !== -1 && activeSubjStart !== -1) {
    const oldChapBlock = functionBlock.slice(activeChapStart, activeSubjStart);
    const newChapBlock = `                    if (activePracticeChapter) {
                        const questionTypesSet = new Set();
                        activePracticeChapter.topics?.forEach(t => t.questions?.forEach(q => questionTypesSet.add(q.questionType || 'Main module (recommended)')));
                        const availableTypes = Array.from(questionTypesSet);
                        if (!availableTypes.includes('All combined')) availableTypes.unshift('All combined');

                        return (
                            <div className="pb-24 pt-4 px-5 animate-in fade-in min-h-screen">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-3">
                                        <button onClick={handleBack} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"><i className="fa-solid fa-arrow-left"></i></button>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">{safeRenderText(activePracticeChapter.name)}</h2>
                                    </div>
                                    <button onClick={() => setConfirmClearScope({ type: 'chapter', data: activePracticeChapter })} className="shrink-0 w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors" title="Clear Chapter Progress"><i className="fa-solid fa-trash-can"></i></button>
                                </div>

                                <h3 className="font-semibold text-[#00a651] mb-3 uppercase tracking-wider text-xs bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 inline-block px-2 py-1 rounded-md">Select Question Type</h3>

                                <div className="space-y-3">
                                    {availableTypes.map((type, i) => {
                                        let qCount = 0;
                                        if (type === 'All combined') {
                                            activePracticeChapter.topics?.forEach(t => qCount += t.questions?.length || 0);
                                        } else {
                                            activePracticeChapter.topics?.forEach(t => t.questions?.forEach(q => {
                                                if ((q.questionType || 'Main module (recommended)') === type) qCount++;
                                            }));
                                        }

                                        return (
                                            <div key={i} onClick={() => { if (qCount > 0) { setActiveQuestionType(type); setPracticeSelectedTopic(null); setCurrentQuestionIndex(0); setShowQuiz(true); } }} className={\`bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex justify-between items-center shadow-sm transition-all group \${qCount > 0 ? 'cursor-pointer hover:border-[#00a651] dark:hover:border-[#00a651]' : 'opacity-60'}\`}>
                                                <div className="flex-1 mr-4">
                                                    <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200 group-hover:text-[#00a651] transition-colors">{type}</h4>
                                                    <p className="text-[10px] font-semibold text-gray-500 mt-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 inline-block px-2 py-0.5 rounded-sm">{qCount} Qs</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className={\`w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-400 \${qCount > 0 ? 'group-hover:bg-[#00a651] group-hover:text-white' : ''} transition-colors flex items-center justify-center shrink-0\`}>
                                                        <i className="fa-solid fa-play ml-0.5 text-xs"></i>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    }

`;
    functionBlock = functionBlock.replace(oldChapBlock, newChapBlock);
}

// 4. activePracticeFile -> activePracticeMode = 'practice'
const activeFileStart = functionBlock.indexOf('if (activePracticeFile) {');
const activeBatchStart = functionBlock.indexOf('if (activePracticeBatch) {');

if (activeFileStart !== -1 && activeBatchStart !== -1) {
    const oldFileBlock = functionBlock.slice(activeFileStart, activeBatchStart);
    const newFileBlock = `                    if (activePracticeMode === 'practice') {
                        return (
                            <div className="pb-24 pt-4 px-5 animate-in fade-in min-h-screen">
                                <div className="flex items-center gap-3 mb-6">
                                    <button onClick={handleBack} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300"><i className="fa-solid fa-arrow-left"></i></button>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{activePracticeBatch?.name || 'Practice Modules'}</h2>
                                </div>

                                {qbankError && (
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-5 shadow-sm text-sm text-red-800 dark:text-red-200">
                                        <div className="font-bold flex items-center gap-2 mb-2">
                                            <i className="fa-solid fa-cloud"></i> Network Issue
                                        </div>
                                        <p className="mb-2 opacity-90">{qbankError}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    {(() => {
                                        const activeData = activePracticeBatch && activePracticeBatch.sourceTable
                                            ? (qbankDataByTable[activePracticeBatch.sourceTable] || [])
                                            : qbankData;
                                        return activeData.length > 0 ? activeData.map(sub => (
                                            <div key={sub.id} onClick={() => setActivePracticeSubject(sub)} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-md cursor-pointer hover:border-[#00a651] dark:hover:border-[#00a651] active:scale-[0.98] transition-all duration-300 flex flex-col items-center justify-center text-center group">
                                                <span className="text-4xl mb-3 group-hover:-translate-y-1 transition-transform duration-300">{sub.icon}</span>
                                                <h3 className="font-bold text-gray-800 dark:text-gray-200 mt-2 group-hover:text-[#00a651] transition-colors">{safeRenderText(sub.name)}</h3>
                                                <p className="text-[10px] text-gray-500 mt-1">{sub.chapters?.length || 0} Chapters</p>
                                            </div>
                                        )) : (
                                            <p className="text-sm text-gray-500 text-center col-span-2 py-8">Loading subjects...</p>
                                        );
                                    })()}
                                </div>
                            </div>
                        );
                    }

                    if (activePracticeMode === 'tests' || activePracticeMode === 'custom') {
                        return (
                            <div className="pb-24 pt-4 px-5 animate-in fade-in min-h-screen flex flex-col">
                                <div className="flex items-center gap-3 mb-6">
                                    <button onClick={handleBack} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300"><i className="fa-solid fa-arrow-left"></i></button>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{activePracticeMode === 'tests' ? 'Tests' : 'Custom Generator'}</h2>
                                </div>
                                <div className="flex-1 flex flex-col items-center justify-center text-center -mt-20">
                                    <div className="w-24 h-24 bg-purple-500/10 rounded-full flex items-center justify-center mb-4 border border-purple-500/30">
                                        <i className="fa-solid fa-hammer text-4xl text-purple-500"></i>
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Under Construction</h3>
                                    <p className="text-sm text-gray-500 max-w-[250px] mx-auto">This feature will be updated later. Stay tuned!</p>
                                </div>
                            </div>
                        );
                    }

`;
    functionBlock = functionBlock.replace(oldFileBlock, newFileBlock);
}

// 5. activePracticeBatch UI Replacement (Modes instead of Files)
// And fix JEE Bank back button by using e.preventDefault() and e.stopPropagation() and directly calling setActivePracticeBatch(null)
const activeBatchEnd = functionBlock.indexOf('const PRACTICE_BATCHES = [');

if (activeBatchStart !== -1 && activeBatchEnd !== -1) {
    const oldBatchBlock = functionBlock.slice(activeBatchStart, activeBatchEnd);
    const newBatchBlock = `                    if (activePracticeBatch) {
                        if (activePracticeBatch.type === 'jee') {
                            return (
                                <div className="pb-24 pt-4 px-5 animate-in fade-in min-h-screen flex flex-col">
                                    <div className="flex items-center gap-3 mb-6">
                                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActivePracticeBatch(null); }} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300"><i className="fa-solid fa-arrow-left"></i></button>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{safeRenderText(activePracticeBatch.name)}</h2>
                                    </div>
                                    <div className="flex-1 flex flex-col items-center justify-center text-center -mt-20">
                                        <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 animate-pulse-soft border border-blue-500/30">
                                            <i className="fa-solid fa-rocket text-4xl text-blue-500 animate-pop-bounce delay-150"></i>
                                        </div>
                                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Coming Soon!</h3>
                                        <p className="text-sm text-gray-500 max-w-[250px] mx-auto">We are working hard to bring you the best JEE questions. Stay tuned!</p>
                                    </div>
                                </div>
                            );
                        }
                    
                        return (
                            <div className="pb-24 pt-4 px-5 animate-in fade-in min-h-screen">
                                <div className="flex items-center gap-3 mb-6">
                                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActivePracticeBatch(null); }} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300"><i className="fa-solid fa-arrow-left"></i></button>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{safeRenderText(activePracticeBatch.name)}</h2>
                                </div>
                                <div className="space-y-3">
                                    <div onClick={() => setActivePracticeMode('practice')} className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center gap-4 shadow-sm cursor-pointer hover:border-[#00a651] dark:hover:border-[#00a651] transition-all group">
                                        <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-[#00a651] flex items-center justify-center text-xl"><i className="fa-solid fa-book-open"></i></div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 group-hover:text-[#00a651] transition-colors">Practice Modules</h3>
                                            <p className="text-xs text-gray-500 font-medium">Chapter-wise structured practice</p>
                                        </div>
                                        <i className="fa-solid fa-chevron-right text-gray-400 group-hover:text-[#00a651] transition-colors"></i>
                                    </div>
                                    <div onClick={() => setActivePracticeMode('tests')} className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center gap-4 shadow-sm cursor-pointer hover:border-purple-500 dark:hover:border-purple-500 transition-all group">
                                        <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 text-purple-500 flex items-center justify-center text-xl"><i className="fa-solid fa-stopwatch"></i></div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 group-hover:text-purple-500 transition-colors">Tests</h3>
                                            <p className="text-xs text-gray-500 font-medium">Full-length & part syllabus tests</p>
                                        </div>
                                        <i className="fa-solid fa-chevron-right text-gray-400 group-hover:text-purple-500 transition-colors"></i>
                                    </div>
                                    <div onClick={() => setActivePracticeMode('custom')} className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center gap-4 shadow-sm cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-all group">
                                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-500 flex items-center justify-center text-xl"><i className="fa-solid fa-wand-magic-sparkles"></i></div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 group-hover:text-blue-500 transition-colors">Custom Generator</h3>
                                            <p className="text-xs text-gray-500 font-medium">Create personalized practice sets</p>
                                        </div>
                                        <i className="fa-solid fa-chevron-right text-gray-400 group-hover:text-blue-500 transition-colors"></i>
                                    </div>
                                </div>
                            </div>
                        );
                    }

`;
    functionBlock = functionBlock.replace(oldBatchBlock, newBatchBlock);
}

lines.splice(startFn, endFn - startFn, ...functionBlock.split('\n'));
fs.writeFileSync('c:/Users/risha/ATAXYbot/index.html', lines.join('\n'));
console.log('Successfully updated renderQuestionsView.');
