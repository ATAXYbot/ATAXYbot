const fs = require('fs');
let content = fs.readFileSync('c:/Users/risha/ATAXYbot/index.html', 'utf8');

const targetStr = `                                    </div>
                                )}
                            </div>
                        );
                    }

                    if (activePracticeSubject) {`;

const targetStrWin = `                                    </div>\r\n                                )}\r\n                            </div>\r\n                        );\r\n                    }\r\n\r\n                    if (activePracticeSubject) {`;

const insertText = `                                {/* CBT Bottom Bar */}
                                <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full md:max-w-screen-xl max-w-md bg-gray-100 border-t border-gray-300 px-2 py-3 z-[45] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] pb-[env(safe-area-inset-bottom,_12px)]">
                                    <div className="max-w-4xl mx-auto flex flex-wrap gap-2 justify-between items-center">
                                        <div className="flex gap-2 flex-1 md:flex-none">
                                            <button onClick={() => handleClear(currentQuestion?.id)} className="flex-1 md:flex-none bg-white border border-gray-400 text-gray-800 hover:bg-gray-50 text-[10px] sm:text-xs font-semibold px-2 sm:px-4 py-2.5 rounded-sm shadow-sm transition-colors uppercase tracking-wide active:scale-95">
                                                Clear<span className="hidden sm:inline"> Response</span>
                                            </button>
                                            <button onClick={() => {
                                                if (currentQuestion) setPracticeReview(prev => prev.includes(currentQuestion.id) ? prev : [...prev, currentQuestion.id]);
                                                handleNext();
                                            }} className="flex-1 md:flex-none bg-orange-500 border border-orange-600 text-white hover:bg-orange-600 text-[10px] sm:text-xs font-semibold px-2 sm:px-4 py-2.5 rounded-sm shadow-sm transition-colors uppercase tracking-wide active:scale-95">
                                                Review & Next
                                            </button>
                                        </div>
                                        <div className="flex gap-2 flex-1 md:flex-none justify-end mt-2 md:mt-0 w-full md:w-auto">
                                            <button onClick={handlePrevious} disabled={safeQuestionIndex === 0} className="flex-1 md:flex-none bg-white border border-gray-400 text-gray-800 hover:bg-gray-50 disabled:opacity-50 text-[10px] sm:text-xs font-semibold px-3 sm:px-4 py-2.5 rounded-sm shadow-sm transition-colors uppercase tracking-wide active:scale-95">
                                                &lt;&lt; Back
                                            </button>
                                            <button onClick={() => {
                                                if (currentQuestion && practiceReview.includes(currentQuestion.id)) setPracticeReview(prev => prev.filter(id => id !== currentQuestion.id));
                                                handleNext();
                                            }} disabled={safeQuestionIndex >= displayedQuestions.length - 1} className="flex-1 md:flex-none bg-[#1ea020] border border-[#187f1a] text-white hover:bg-[#187f1a] disabled:opacity-50 text-[10px] sm:text-xs font-semibold px-4 sm:px-6 py-2.5 rounded-sm shadow-sm transition-colors uppercase tracking-wide active:scale-95">
                                                Save & Next &gt;&gt;
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>`;

let replaced = false;

if (content.indexOf(targetStr) !== -1) {
    // We need to change the opening <div className="pb-32..."> to be wrapped in <> and then close it properly
    // First, find the return
    const returnStartStr = 'return (\n                            <div className="pb-32 animate-pop-in relative min-h-screen bg-[#F3F4F6] text-gray-900 font-sans">';
    if (content.indexOf(returnStartStr) !== -1) {
        content = content.replace(returnStartStr, 'return (\n                            <>\n                            <div className="pb-32 animate-pop-in relative min-h-screen bg-[#F3F4F6] text-gray-900 font-sans">');
        
        content = content.replace(targetStr, `                                    </div>
                                )}
                            </div>
${insertText}
                        );
                    }

                    if (activePracticeSubject) {`);
        replaced = true;
    }
} else if (content.indexOf(targetStrWin) !== -1) {
    const returnStartStrWin = 'return (\r\n                            <div className="pb-32 animate-pop-in relative min-h-screen bg-[#F3F4F6] text-gray-900 font-sans">';
    if (content.indexOf(returnStartStrWin) !== -1) {
        content = content.replace(returnStartStrWin, 'return (\r\n                            <>\r\n                            <div className="pb-32 animate-pop-in relative min-h-screen bg-[#F3F4F6] text-gray-900 font-sans">');
        
        content = content.replace(targetStrWin, `                                    </div>\r\n                                )}\r\n                            </div>\r\n${insertText}\r\n                        );\r\n                    }\r\n\r\n                    if (activePracticeSubject) {`);
        replaced = true;
    }
}

if (replaced) {
    fs.writeFileSync('c:/Users/risha/ATAXYbot/index.html', content, 'utf8');
    console.log('Successfully injected CBT Bottom bar outside of the animated div!');
} else {
    console.log('Target strings not found.');
}
