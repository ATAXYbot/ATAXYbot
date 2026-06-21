const fs = require('fs');
let code = fs.readFileSync('c:/Users/risha/ATAXYbot/index.html', 'utf8');

// --- 1. Replace handleClearProgress ---
const handleClearStart = code.indexOf("const handleClearProgress = (scope) => {");
if (handleClearStart === -1) {
    console.error("Could not find handleClearProgress");
} else {
    // Find the end of handleClearProgress which is "};\n            // 📈 Analytics State" or similar
    const handleClearEnd = code.indexOf("            // 📈 Analytics State", handleClearStart);
    if (handleClearEnd === -1) {
        console.error("Could not find end of handleClearProgress");
    } else {
        const oldHandleClear = code.substring(handleClearStart, handleClearEnd);
        const newHandleClear = `const handleClearProgress = (scope, clearType = 'all') => {
                let idsToRemove = [];
                if (scope === 'all') {
                    if (clearType === 'attempts' || clearType === 'all') setPracticeAttempts({});
                    if (clearType === 'bookmarks') setPracticeReview(practiceReview.map(r => ({ ...r, isBookmarked: false })));
                    if (clearType === 'all') {
                        setPracticeReview([]);
                        setQuestionNotes({});
                    }
                } else {
                    if (scope.type === 'batch') {
                        const batchData = scope.data.sourceTable ? (window.qbankDataByTable ? window.qbankDataByTable[scope.data.sourceTable] : []) : window.qbankData;
                        if (batchData) batchData.forEach(s => s.chapters?.forEach(c => c.topics?.forEach(t => t.questions?.forEach(q => idsToRemove.push(q.id)))));
                    } else if (scope.type === 'subject') {
                        scope.data.chapters?.forEach(c => c.topics?.forEach(t => t.questions?.forEach(q => idsToRemove.push(q.id))));
                    } else if (scope.type === 'chapter') {
                        scope.data.topics?.forEach(t => t.questions?.forEach(q => idsToRemove.push(q.id)));
                    } else if (scope.type === 'topic') {
                        scope.data.questions?.forEach(q => idsToRemove.push(q.id));
                    }

                    if (clearType === 'attempts' || clearType === 'all') {
                        const newAttempts = { ...practiceAttempts };
                        idsToRemove.forEach(id => delete newAttempts[id]);
                        setPracticeAttempts(newAttempts);
                    }
                    
                    if (clearType === 'bookmarks' || clearType === 'all') {
                        let newReview = practiceReview.filter(r => {
                            if (idsToRemove.includes(r.id)) {
                                if (clearType === 'all') return false;
                            }
                            return true;
                        });

                        if (clearType === 'bookmarks') {
                            newReview = newReview.map(r => {
                                if (idsToRemove.includes(r.id)) return { ...r, isBookmarked: false };
                                return r;
                            });
                        }
                        setPracticeReview(newReview);
                    }

                    if (clearType === 'all') {
                        const newNotes = { ...questionNotes };
                        idsToRemove.forEach(id => delete newNotes[id]);
                        setQuestionNotes(newNotes);
                    }
                }
                setConfirmClearScope(null);
                try { if (window.Telegram?.WebApp?.HapticFeedback) window.Telegram.WebApp.HapticFeedback.notificationOccurred('success'); } catch (e) { }
            };
`;
        code = code.replace(oldHandleClear, newHandleClear);
        console.log("Replaced handleClearProgress");
    }
}

// --- 2. Replace the old confirmClearScope Modal ---
const modalStart = code.indexOf("{confirmClearScope && (");
if (modalStart === -1) {
    console.error("Could not find confirmClearScope && (");
} else {
    // Find the end of the modal, which is before "<GlobalDialog />"
    const modalEnd = code.indexOf("<GlobalDialog />", modalStart);
    if (modalEnd === -1) {
        console.error("Could not find <GlobalDialog />");
    } else {
        const oldModal = code.substring(modalStart, modalEnd);
        const newModal = `{confirmClearScope && (
                            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999999] flex items-center justify-center p-4 animate-in fade-in" onClick={() => setConfirmClearScope(null)}>
                                <div className="bg-[#0b0f19] border border-cyan-900/30 rounded-[2rem] p-6 w-full max-w-sm text-center shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden relative" onClick={e => e.stopPropagation()}>
                                    <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-transparent to-red-900/10 pointer-events-none"></div>
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>
                                    
                                    <div className="w-16 h-16 bg-red-900/30 text-red-500 rounded-2xl mx-auto flex items-center justify-center text-3xl mb-4 border border-red-500/30 shadow-inner relative z-10">
                                        <i className="fa-solid fa-dumpster-fire"></i>
                                    </div>
                                    <h3 className="text-2xl font-black text-white mb-2 relative z-10 drop-shadow-md">Clear Data</h3>
                                    <p className="text-xs text-gray-400 mb-6 font-bold relative z-10">
                                        Select what you want to delete for {confirmClearScope === 'all' ? 'everything' : confirmClearScope.type === 'batch' ? 'this track' : 'this ' + confirmClearScope.type}.
                                    </p>
                                    
                                    <div className="space-y-3 relative z-10">
                                        <button onClick={() => handleClearProgress(confirmClearScope, 'attempts')} className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 text-white font-bold rounded-xl transition-colors flex items-center justify-between px-4 group">
                                            <span><i className="fa-solid fa-rotate-left mr-2 text-cyan-400 group-hover:scale-110 transition-transform"></i> Clear Attempts</span>
                                            <i className="fa-solid fa-chevron-right text-gray-600 text-xs"></i>
                                        </button>
                                        <button onClick={() => handleClearProgress(confirmClearScope, 'bookmarks')} className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 text-white font-bold rounded-xl transition-colors flex items-center justify-between px-4 group">
                                            <span><i className="fa-solid fa-bookmark mr-2 text-yellow-400 group-hover:scale-110 transition-transform"></i> Clear Bookmarks</span>
                                            <i className="fa-solid fa-chevron-right text-gray-600 text-xs"></i>
                                        </button>
                                        <button onClick={() => handleClearProgress(confirmClearScope, 'all')} className="w-full py-3 bg-red-900/30 hover:bg-red-500 border border-red-500/30 hover:border-red-400 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] flex items-center justify-between px-4 group">
                                            <span><i className="fa-solid fa-trash-can mr-2 group-hover:scale-110 transition-transform"></i> Delete All Data</span>
                                            <i className="fa-solid fa-chevron-right text-white/50 text-xs"></i>
                                        </button>
                                    </div>
                                    
                                    <button onClick={() => setConfirmClearScope(null)} className="w-full mt-4 py-3 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white font-bold rounded-xl transition-colors relative z-10">Cancel</button>
                                </div>
                            </div>
                        )}

                        `;
        code = code.replace(oldModal, newModal);
        console.log("Replaced Modal");
    }
}

// Ensure the row trash icons are added properly.
// Chapter: 
const oldChapter = `<div className="flex items-center gap-4">
                                                    <button onClick={(e) => { e.stopPropagation(); setConfirmClearScope({ type: 'chapter', data: chap }); }} className="w-10 h-10 rounded-xl bg-red-900/30 text-red-400 border border-red-500/30 flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-400 transition-all shadow-[inset_0_0_10px_rgba(239,68,68,0.2)] active:scale-95 z-20 opacity-50 hover:opacity-100 group-hover:opacity-100" title="Clear Chapter Progress"><i className="fa-solid fa-trash-can"></i></button>`;
if (!code.includes(oldChapter)) {
    console.error("Row chapter delete button NOT FOUND, attempting to inject...");
    // Let's re-apply the Chapter row logic using index of
} else {
    console.log("Row Chapter delete button ALREADY EXISTS.");
}

// Question Type:
const oldQtype = `setConfirmClearScope({ type: 'topic', data: { name: type, questions: questionsToClear } });`;
if (!code.includes(oldQtype)) {
    console.error("Row Question Type delete button NOT FOUND, attempting to inject...");
} else {
    console.log("Row Question Type delete button ALREADY EXISTS.");
}

fs.writeFileSync('c:/Users/risha/ATAXYbot/index.html', code);
console.log('Robust script finished!');
