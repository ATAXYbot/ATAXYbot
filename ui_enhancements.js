const fs = require('fs');

let content = fs.readFileSync('c:/Users/risha/ATAXYbot/index.html', 'utf8');

// --- 1. Move "Add Personal Note" to be below options, and change to grey/white theme ---
const oldNotesUIStart = '{/* Enhanced Bookmark and Note Buttons */}';
const oldNotesUIEndStr = '                                                )}';

let oldNotesUIStartIdx = content.indexOf(oldNotesUIStart);
if (oldNotesUIStartIdx !== -1) {
    // We need to extract the "Add Personal Note" part and move it.
    // The "Bookmark" button can stay at the top.
    
    // First, let's restore the top part to JUST have Bookmark.
    const topButtonsReplacement = `{/* Enhanced Bookmark Button */}
                                                <div className="flex justify-end gap-2 mb-4">
                                                    <button onClick={() => toggleBookmark(currentQuestion.id)} className={\`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-sm border \${bookmarks.includes(currentQuestion.id) ? 'bg-gradient-to-r from-amber-100 to-yellow-50 border-amber-300 text-amber-700 shadow-amber-200/50' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900'} active:scale-95 group\`}>
                                                        <i className={\`fa-\${bookmarks.includes(currentQuestion.id) ? 'solid text-amber-500 scale-110' : 'regular'} fa-bookmark group-hover:scale-110 transition-transform\`}></i> 
                                                        {bookmarks.includes(currentQuestion.id) ? 'Bookmarked' : 'Bookmark'}
                                                    </button>
                                                </div>`;
                                                
    // Replace the whole block of old buttons + note input with just the Bookmark button.
    // To do this, find where the Notes input ends.
    // The old Notes input ends with `)}` right before `{currentQuestion.imageUrl && (`
    const notesInputEndIdx = content.indexOf('{currentQuestion.imageUrl && (', oldNotesUIStartIdx);
    if (notesInputEndIdx !== -1) {
        content = content.substring(0, oldNotesUIStartIdx) + topButtonsReplacement + '\n                                                ' + content.substring(notesInputEndIdx);
        console.log('Successfully removed old Notes UI from top.');
    }
}

// Now insert the new Grey/White Notes UI below the options
const optionsEndStr = '<QuestionAIAssistant q={currentQuestion} attemptIdx={selectedOptionIdx} />';
const optionsEndIdx = content.indexOf(optionsEndStr);

if (optionsEndIdx !== -1) {
    const greyWhiteNotesUI = `
                                                        {/* White/Grey Personal Notes UI */}
                                                        <div className="mt-6 mb-2">
                                                            <div className="flex justify-between items-center mb-3">
                                                                <h4 className="text-sm font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest flex items-center gap-2">
                                                                    <i className="fa-solid fa-book-open text-gray-400"></i> My Personal Notes
                                                                </h4>
                                                                <button onClick={() => setShowNoteInput(prev => ({ ...prev, [currentQuestion.id]: !prev[currentQuestion.id] }))} className={\`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm border \${questionNotes[currentQuestion.id] || showNoteInput[currentQuestion.id] ? 'bg-gray-100 border-gray-300 text-gray-800 dark:bg-gray-800 dark:border-gray-600 dark:text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800'} active:scale-95\`}>
                                                                    <i className={\`fa-solid fa-pen-to-square \${questionNotes[currentQuestion.id] ? 'text-gray-800 dark:text-white' : ''}\`}></i> 
                                                                    {questionNotes[currentQuestion.id] ? 'Edit Note' : 'Add Note'}
                                                                </button>
                                                            </div>

                                                            {(showNoteInput[currentQuestion.id] || questionNotes[currentQuestion.id]) && (
                                                                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700/50 p-4 rounded-2xl animate-in fade-in slide-in-from-top-2 relative overflow-hidden shadow-sm">
                                                                    {(!showNoteInput[currentQuestion.id] && questionNotes[currentQuestion.id]) ? (
                                                                        <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl p-4 text-sm text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap font-medium leading-relaxed">
                                                                            {questionNotes[currentQuestion.id]}
                                                                        </div>
                                                                    ) : (
                                                                        <textarea
                                                                            className="w-full text-sm p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/80 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all min-h-[100px] resize-y placeholder-gray-400 dark:placeholder-gray-500 mb-3 relative z-10 font-medium"
                                                                            placeholder="Type your personal notes here... (auto-saved)"
                                                                            value={questionNotes[currentQuestion.id] || ''}
                                                                            onChange={(e) => setQuestionNotes(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                                                                            autoFocus
                                                                        ></textarea>
                                                                    )}
                                                                    
                                                                    <div className="flex justify-end gap-3 relative z-10">
                                                                        {questionNotes[currentQuestion.id] && (
                                                                            <button onClick={() => {
                                                                                const newNotes = { ...questionNotes };
                                                                                delete newNotes[currentQuestion.id];
                                                                                setQuestionNotes(newNotes);
                                                                                setShowNoteInput(prev => ({ ...prev, [currentQuestion.id]: false }));
                                                                            }} className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 active:scale-95">
                                                                                <i className="fa-solid fa-trash-can"></i> Delete
                                                                            </button>
                                                                        )}
                                                                        
                                                                        {showNoteInput[currentQuestion.id] ? (
                                                                            <button onClick={() => setShowNoteInput(prev => ({ ...prev, [currentQuestion.id]: false }))} className="bg-gray-800 hover:bg-gray-900 dark:bg-gray-100 dark:hover:bg-white text-white dark:text-gray-900 px-5 py-2 rounded-xl text-xs font-black transition-all shadow-sm flex items-center gap-1.5 active:scale-95">
                                                                                <i className="fa-solid fa-check"></i> Save
                                                                            </button>
                                                                        ) : null}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
`;
    // Insert before <QuestionAIAssistant ...
    content = content.substring(0, optionsEndIdx) + greyWhiteNotesUI + content.substring(optionsEndIdx);
    console.log('Successfully added Grey/White Notes UI below options.');
}

// --- 2. Update Question Palette Colors and Layout ---
// Update legend
const legendOld = `<div className="flex items-center gap-1.5 w-[48%]"><div className="w-5 h-5 flex items-center justify-center bg-[#fce8e6] border border-[#c5221f] text-[#c5221f] rounded-bl-[10px] rounded-br-[4px] rounded-t-[4px] text-[10px] shadow-sm">2</div> Not Answered</div>
                                                <div className="flex items-center gap-1.5 w-[48%]"><div className="w-5 h-5 flex items-center justify-center bg-[#e6f4ea] border border-[#1e7e34] text-[#1e7e34] rounded-tl-[10px] rounded-tr-[4px] rounded-b-[4px] text-[10px] shadow-sm">3</div> Answered</div>`;
const legendNew = `<div className="flex items-center gap-1.5 w-[48%]"><div className="w-5 h-5 flex items-center justify-center bg-amber-50 border border-amber-400 text-amber-600 rounded-md text-[10px] shadow-sm">2</div> Visited</div>
                                                <div className="flex items-center gap-1.5 w-[48%]"><div className="w-5 h-5 flex items-center justify-center bg-emerald-50 border border-emerald-500 text-emerald-600 rounded-md ring-1 ring-emerald-500/20 text-[10px] shadow-sm"><i className="fa-solid fa-check text-[8px]"></i></div> Correct</div>
                                                <div className="flex items-center gap-1.5 w-[48%]"><div className="w-5 h-5 flex items-center justify-center bg-rose-50 border border-rose-500 text-rose-600 rounded-md ring-1 ring-rose-500/20 text-[10px] shadow-sm"><i className="fa-solid fa-xmark text-[8px]"></i></div> Incorrect</div>`;
if (content.includes('bg-[#fce8e6] border-[#c5221f]')) {
    content = content.replace(legendOld, legendNew);
    console.log('Palette Legend updated.');
}

// Update loop logic
const loopLogicOldRegex = /let shapeClass = "bg-white border-gray-400 text-gray-800 rounded-sm";[\s\S]*?return \(/;
const loopLogicMatch = content.match(loopLogicOldRegex);
if (loopLogicMatch) {
    const loopLogicNew = `const isCorrectAns = isAns && ['A', 'B', 'C', 'D'][attempts[q.id]] === q.correctOption;

                                                        let shapeClass = "bg-white border-gray-300 text-gray-700 rounded-md shadow-sm"; // Not visited
                                                        if (isAns && isCorrectAns) {
                                                            shapeClass = "bg-emerald-50 border-emerald-500 text-emerald-600 rounded-md ring-1 ring-emerald-500/30 font-black shadow-sm";
                                                        } else if (isAns && !isCorrectAns) {
                                                            shapeClass = "bg-rose-50 border-rose-500 text-rose-600 rounded-md ring-1 ring-rose-500/30 font-black shadow-sm";
                                                        } else if (practiceVisited.includes(q.id)) {
                                                            shapeClass = "bg-amber-50 border-amber-400 text-amber-700 rounded-md shadow-sm";
                                                        }
                                                        
                                                        if (isRev) {
                                                            shapeClass += " !bg-purple-100 !border-purple-500 !text-purple-700 !rounded-full";
                                                        }

                                                        return (`;
    content = content.replace(loopLogicOldRegex, loopLogicNew);
    console.log('Palette loop logic updated.');
}

// Mobile Palette Layout (Half screen right side)
const paletteContainerOld = 'className="fixed inset-0 bg-black/60 z-[99999] flex flex-col justify-end md:justify-center md:items-end animate-in fade-in"';
const paletteContainerNew = 'className="fixed inset-0 bg-black/60 z-[99999] flex flex-col justify-center items-end animate-in fade-in"';
content = content.replace(paletteContainerOld, paletteContainerNew);

const paletteDrawerOld = 'className="bg-[#f0f4f7] h-[80vh] md:h-full w-full md:w-[380px] shadow-2xl pb-safe flex flex-col border-l border-gray-300 transform transition-transform"';
const paletteDrawerNew = 'className="bg-[#f0f4f7] dark:bg-gray-900 h-full w-[80vw] sm:w-[380px] shadow-2xl pb-safe flex flex-col border-l border-gray-300 dark:border-gray-800 transform transition-transform animate-in slide-in-from-right"';
content = content.replace(paletteDrawerOld, paletteDrawerNew);

// --- 3. View Explanation bug in History Modal ---
const viewExpBugRegex = /\{q\.explanation && \(/g;
// Replace all instances of `{q.explanation && (` with `{q.explanation && q.explanation.trim().toLowerCase() !== 'no explanation' && (`
content = content.replace(viewExpBugRegex, "{q.explanation && q.explanation.trim().toLowerCase() !== 'no explanation' && (");
console.log('Fixed explanation bug.');

// --- 4. Enhance History Viewer UI ---
const historyModalOld = 'bg-gray-50 dark:bg-gray-950 flex flex-col animate-slide-up duration-300 md:max-w-screen-xl max-w-md mx-auto shadow-[0_-10px_40px_rgba(0,0,0,0.2)]';
const historyModalNew = 'bg-white/95 dark:bg-gray-950/95 backdrop-blur-2xl flex flex-col animate-slide-up duration-300 md:max-w-screen-xl max-w-md mx-auto shadow-[0_-20px_50px_rgba(0,0,0,0.3)] border-t border-gray-200 dark:border-gray-800';
content = content.replace(historyModalOld, historyModalNew);

// Top header of history modal
const historyHeaderRegex = /<div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0 shadow-sm">/g;
const historyHeaderNew = '<div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 shrink-0 relative overflow-hidden"><div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-2xl"></div>';
content = content.replace(historyHeaderRegex, historyHeaderNew);

fs.writeFileSync('c:/Users/risha/ATAXYbot/index.html', content, 'utf8');
