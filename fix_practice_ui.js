const fs = require('fs');

let content = fs.readFileSync('c:/Users/risha/ATAXYbot/index.html', 'utf8');

// 1. Fix the Fixed CBT Bottom Bar issue
// Search for CBT Bottom Bar
const bottomBarStartIdx = content.indexOf('{/* CBT Bottom Bar */}');
if (bottomBarStartIdx !== -1) {
    const bottomBarEndStr = '</div>\r\n\r\n                                {/* CBT Palette Slide-over Modal */}';
    let bottomBarEndIdx = content.indexOf(bottomBarEndStr, bottomBarStartIdx);
    
    // try \n instead of \r\n
    if (bottomBarEndIdx === -1) {
        bottomBarEndIdx = content.indexOf('</div>\n\n                                {/* CBT Palette Slide-over Modal */}', bottomBarStartIdx);
    }
    
    if (bottomBarEndIdx !== -1) {
        // We found the block. Let's extract it.
        const bottomBarContent = content.substring(bottomBarStartIdx, bottomBarEndIdx + 6); // include the </div>
        
        // Remove it from current location
        content = content.substring(0, bottomBarStartIdx) + content.substring(bottomBarEndIdx + 6);
        
        // Find the return wrapper
        const returnStart = content.indexOf('return (\r\n                            <div className="pb-32 animate-pop-in relative min-h-screen bg-[#F3F4F6] text-gray-900 font-sans">');
        let actualReturnStart = returnStart;
        if (returnStart === -1) {
            actualReturnStart = content.indexOf('return (\n                            <div className="pb-32 animate-pop-in relative min-h-screen bg-[#F3F4F6] text-gray-900 font-sans">');
        }
        
        if (actualReturnStart !== -1) {
            content = content.substring(0, actualReturnStart) + 'return (\n                            <>\n' + content.substring(actualReturnStart + 'return (\n'.length);
            
            // Find the closing </div> of the renderQuestionsView
            // It should be right before `// --- PRACTICE MENU VIEW ---`
            const practiceMenuStart = content.indexOf('// --- PRACTICE MENU VIEW ---');
            const lastDivBeforeMenu = content.lastIndexOf('</div>', practiceMenuStart);
            
            // We need to find the correct ending </div> of the return block.
            // Wait, the return ends with:
            //                                 )}
            //                             </div>
            //                         );
            const returnEndMatch = content.match(/                                \)}\s*<\/div>\s*\);\s*\}\s*catch/);
            if (returnEndMatch) {
                // Modifying the extracted bottom bar to add fixed positioning constraints so it stays within max-w-md
                const modifiedBottomBar = bottomBarContent.replace(
                    'className="fixed bottom-0 w-full bg-gray-100 border-t border-gray-300 px-2 py-3 z-[45] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] pb-safe"',
                    'className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full md:max-w-screen-xl max-w-md bg-gray-100 border-t border-gray-300 px-2 py-3 z-[45] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] pb-safe"'
                );
                
                content = content.substring(0, returnEndMatch.index) + '\n' + modifiedBottomBar + '\n                            </>\n' + content.substring(returnEndMatch.index + returnEndMatch[0].indexOf(');'));
                console.log('Successfully moved CBT Bottom Bar to Portal/Fragment level!');
            } else {
                console.log('Could not find the end of return statement for renderQuestionsView.');
            }
        } else {
            console.log('Could not find return start for renderQuestionsView.');
        }
    } else {
        console.log('Could not find bottom bar end.');
    }
} else {
    console.log('Could not find CBT Bottom Bar comment.');
}

// 2. Enhance the Bookmark and Add Note UI
const oldUIStartStr = '<div className="flex justify-between items-start mb-3 gap-4">';
const oldUIEndStr = ')}';

// It occurs inside `return ansIdx !== undefined` NO, it occurs inside the render map.
// Let's use regex to find the specific block
const searchRegex = /<div className="flex justify-between items-start mb-3 gap-4">[\s\S]*?\{currentQuestion\.imageUrl && \(/;

const match = content.match(searchRegex);
if (match) {
    const newUI = `<div className="flex justify-between items-start mb-3 gap-4">
                                                    <div className="text-black text-[15px] md:text-base leading-relaxed font-medium">
                                                        <span className="font-bold mr-2 text-[#00418d]">Q{safeQuestionIndex + 1}.</span> <FormattedText text={currentQuestion.text} className="inline" />
                                                    </div>
                                                </div>
                                                
                                                {/* Enhanced Bookmark and Note Buttons */}
                                                <div className="flex justify-end gap-2 mb-4">
                                                    <button onClick={() => toggleBookmark(currentQuestion.id)} className={\`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-sm border \${bookmarks.includes(currentQuestion.id) ? 'bg-gradient-to-r from-amber-100 to-yellow-50 border-amber-300 text-amber-700 shadow-amber-200/50' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900'} active:scale-95 group\`}>
                                                        <i className={\`fa-\${bookmarks.includes(currentQuestion.id) ? 'solid text-amber-500 scale-110' : 'regular'} fa-bookmark group-hover:scale-110 transition-transform\`}></i> 
                                                        {bookmarks.includes(currentQuestion.id) ? 'Bookmarked' : 'Bookmark'}
                                                    </button>
                                                    
                                                    <button onClick={() => setShowNoteInput(prev => ({ ...prev, [currentQuestion.id]: !prev[currentQuestion.id] }))} className={\`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-sm border \${questionNotes[currentQuestion.id] || showNoteInput[currentQuestion.id] ? 'bg-gradient-to-r from-purple-100 to-indigo-50 border-purple-300 text-purple-700 shadow-purple-200/50' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900'} active:scale-95 group\`}>
                                                        <i className={\`fa-solid fa-pen-to-square \${questionNotes[currentQuestion.id] || showNoteInput[currentQuestion.id] ? 'text-purple-500' : ''} group-hover:rotate-12 transition-transform\`}></i> 
                                                        {questionNotes[currentQuestion.id] ? 'Edit Note' : 'Add Personal Note'}
                                                    </button>
                                                </div>

                                                {(showNoteInput[currentQuestion.id] || questionNotes[currentQuestion.id]) && (
                                                    <div className="glass-panel border border-purple-200/50 dark:border-purple-800/30 p-4 rounded-2xl mb-5 animate-in fade-in slide-in-from-top-2 relative overflow-hidden shadow-lg shadow-purple-500/5">
                                                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-indigo-400/10 rounded-full blur-2xl pointer-events-none"></div>
                                                        <div className="flex justify-between items-center mb-3 relative z-10">
                                                            <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                                                <i className="fa-solid fa-note-sticky text-purple-500"></i> My Personal Note
                                                            </span>
                                                        </div>
                                                        
                                                        {(!showNoteInput[currentQuestion.id] && questionNotes[currentQuestion.id]) ? (
                                                            <div className="relative z-10 bg-white/60 dark:bg-gray-900/40 backdrop-blur-md border border-purple-100 dark:border-purple-900/50 rounded-xl p-4 text-sm text-gray-800 dark:text-gray-200 mb-4 whitespace-pre-wrap font-medium">
                                                                {questionNotes[currentQuestion.id]}
                                                            </div>
                                                        ) : (
                                                            <textarea
                                                                className="w-full text-sm p-4 border border-purple-200 dark:border-purple-800/50 rounded-xl bg-white/80 dark:bg-gray-900/60 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all min-h-[100px] resize-y placeholder-purple-300 dark:placeholder-purple-700 mb-4 relative z-10 shadow-inner font-medium"
                                                                placeholder="Type your secret notes here... (auto-saved securely)"
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
                                                                }} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-xl text-xs font-black transition-colors flex items-center gap-1.5 active:scale-95">
                                                                    <i className="fa-solid fa-trash-can"></i> Delete
                                                                </button>
                                                            )}
                                                            
                                                            {showNoteInput[currentQuestion.id] ? (
                                                                <button onClick={() => setShowNoteInput(prev => ({ ...prev, [currentQuestion.id]: false }))} className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-5 py-2 rounded-xl text-xs font-black transition-all shadow-md shadow-purple-500/30 flex items-center gap-1.5 active:scale-95">
                                                                    <i className="fa-solid fa-check"></i> Save
                                                                </button>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                )}
                                                {currentQuestion.imageUrl && (`;

    content = content.replace(match[0], newUI);
    console.log('Successfully enhanced Bookmark and Note UI!');
} else {
    console.log('Could not find the target string for Note UI replacement.');
}

fs.writeFileSync('c:/Users/risha/ATAXYbot/index.html', content, 'utf8');
console.log('File updated.');
