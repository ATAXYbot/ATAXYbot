const fs = require('fs');

// 1. Read original Quiz UI from temp_view.js
const tempLines = fs.readFileSync('temp_view.js', 'utf8').split('\n');
const startQuiz = tempLines.findIndex(l => l.includes('const selectedTopic = practiceSelectedTopic;'));
const endQuiz = tempLines.findIndex((l, i) => i > startQuiz && l.includes('if (activePracticeSubject) {'));

let quizBlock = tempLines.slice(startQuiz, endQuiz - 1).join('\n'); // -1 to exclude the closing '}' of activePracticeChapter if it's there. Actually, let's just slice it exactly.

// Wait, the original structure was:
/*
if (activePracticeChapter) {
    if (!showQuiz) {
        ...
    }
    const selectedTopic = ...
    ...
    return ( ... );
}
*/
// So quizBlock starts with `const selectedTopic` and ends right before the closing `}` of `if (activePracticeChapter) {`

quizBlock = tempLines.slice(startQuiz, endQuiz).join('\n');
// We must remove the very last closing brace `}` from quizBlock because it belongs to `if (activePracticeChapter)`? Wait, `endQuiz` is the index of `if (activePracticeSubject)`. So `tempLines[endQuiz-1]` is probably `}`.
if (quizBlock.trim().endsWith('}')) {
    quizBlock = quizBlock.substring(0, quizBlock.lastIndexOf('}'));
}

// 2. Modify Quiz UI with new features
const oldFilter = `let displayedQuestions = selectedTopic ? allQuestions.filter(q => q.topicName === selectedTopic) : allQuestions;

                        if (questionFilter === 'bookmarked') {`;
const newFilter = `let displayedQuestions = selectedTopic ? allQuestions.filter(q => q.topicName === selectedTopic) : allQuestions;

                        if (activeQuestionType && activeQuestionType !== 'All combined') {
                            displayedQuestions = displayedQuestions.filter(q => q.questionType === activeQuestionType);
                        }

                        if (questionFilter === 'bookmarked') {`;
quizBlock = quizBlock.replace(oldFilter, newFilter);

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
quizBlock = quizBlock.replace(oldHeader, newHeader);


// 3. Inject it back into index.html
let indexCode = fs.readFileSync('c:/Users/risha/ATAXYbot/index.html', 'utf8');

// I need to find the new `if (activePracticeChapter) {` block
// and wrap its return statement in `if (!showQuiz) { ... }`
// and append the quizBlock before the closing `}`

const searchStr = `                    if (activePracticeChapter) {
                        const questionTypesSet = new Set();`;

const replacementIdx = indexCode.indexOf(searchStr);
if (replacementIdx === -1) {
    console.error('Could not find activePracticeChapter block in index.html');
    process.exit(1);
}

// The block ends right before `if (activePracticeSubject) {`
const endSearchStr = `if (activePracticeSubject) {`;
const endReplacementIdx = indexCode.indexOf(endSearchStr, replacementIdx);

const currentBlock = indexCode.slice(replacementIdx, endReplacementIdx);

// Wrap the current block's body in `if (!showQuiz) {`
// The current body is from `const questionTypesSet = new Set();` to `return ( ... ); }` (closing brace of activePracticeChapter)
// Actually, it's easier to manually construct the final string:

const finalBlock = `                    if (activePracticeChapter) {
                        if (!showQuiz) {
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

${quizBlock}
                    }

                    `;

indexCode = indexCode.replace(currentBlock, finalBlock);
fs.writeFileSync('c:/Users/risha/ATAXYbot/index.html', indexCode);
console.log('Successfully restored quiz block!');
