const fs = require('fs');
let code = fs.readFileSync('c:/Users/risha/ATAXYbot/index.html', 'utf8');

// --- 1. Update `handleClearProgress` function ---
const oldHandleClearFunc = `            const handleClearProgress = (scope) => {
                if (scope === 'all') {
                    setPracticeAttempts({});
                } else {
                    const newAttempts = { ...practiceAttempts };
                    let idsToRemove = [];

                    if (scope.type === 'subject') {
                        scope.data.chapters?.forEach(c => c.topics?.forEach(t => t.questions?.forEach(q => idsToRemove.push(q.id))));
                    } else if (scope.type === 'chapter') {
                        scope.data.topics?.forEach(t => t.questions?.forEach(q => idsToRemove.push(q.id)));
                    } else if (scope.type === 'topic') {
                        scope.data.questions?.forEach(q => idsToRemove.push(q.id));
                    }

                    idsToRemove.forEach(id => {
                        delete newAttempts[id];
                    });
                    setPracticeAttempts(newAttempts);
                }
                setConfirmClearScope(null);
                try { if (window.Telegram?.WebApp?.HapticFeedback) window.Telegram.WebApp.HapticFeedback.notificationOccurred('success'); } catch (e) { }
            };`;

const newHandleClearFunc = `            const handleClearProgress = (scope, clearType = 'all') => {
                let idsToRemove = [];
                if (scope === 'all') {
                    // Handled implicitly by getting all questions, but let's clear the entire object directly for 'all'
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
            };`;

code = code.replace(oldHandleClearFunc, newHandleClearFunc);


// --- 2. Update the Confirmation Modal ---
const oldModal = `{confirmClearScope && (
                            <div className="fixed inset-0 bg-black/60 z-[999999] flex items-center justify-center p-4 animate-in fade-in" onClick={() => setConfirmClearScope(null)}>
                                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-xs text-center shadow-2xl border border-gray-200 dark:border-gray-800" onClick={e => e.stopPropagation()}>
                                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full mx-auto flex items-center justify-center text-3xl mb-4">
                                        <i className="fa-solid fa-triangle-exclamation"></i>
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Are you sure?</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                        Are you sure you want to clear {confirmClearScope === 'all' ? 'all' : 'these'} attempted questions? It will delete your data and analysis whatever you attempted.
                                    </p>
                                    <div className="flex gap-3">
                                        <button onClick={() => setConfirmClearScope(null)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold rounded-xl transition-colors">No</button>
                                        <button onClick={() => handleClearProgress(confirmClearScope)} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-500/30">Yes, Clear</button>
                                    </div>
                                </div>
                            </div>
                        )}`;

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
                        )}`;

code = code.replace(oldModal, newModal);


// --- 3. Replace the plain trash cans with Gaming Trash Cans and add missing ones ---
const plainTrashIcon = `shrink-0 w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors`;
const gamingTrashIcon = `shrink-0 w-10 h-10 rounded-xl bg-red-900/30 text-red-400 border border-red-500/30 flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-400 transition-all shadow-[inset_0_0_10px_rgba(239,68,68,0.2)] active:scale-95`;

code = code.replace(new RegExp(plainTrashIcon, 'g'), gamingTrashIcon);

// Find the Batch Mode view (Level 2) where we need to add the trash can:
const batchHeaderFind = `<div className="flex items-center gap-3 mb-6 relative z-10">
                                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActivePracticeBatch(null); }} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300"><i className="fa-solid fa-arrow-left"></i></button>
                                        <h2 className="text-2xl font-black text-white drop-shadow-md tracking-tight">{safeRenderText(activePracticeBatch.name)}</h2>
                                    </div>`;

const batchHeaderReplace = `<div className="flex justify-between items-center mb-6 relative z-10">
                                        <div className="flex items-center gap-3">
                                            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActivePracticeBatch(null); }} className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 text-white/70 hover:text-white hover:bg-white/20 flex items-center justify-center backdrop-blur-md shadow-inner transition-all active:scale-95"><i className="fa-solid fa-arrow-left"></i></button>
                                            <h2 className="text-2xl font-black text-white drop-shadow-md tracking-tight">{safeRenderText(activePracticeBatch.name)}</h2>
                                        </div>
                                        <button onClick={() => setConfirmClearScope({ type: 'batch', data: activePracticeBatch })} className="shrink-0 w-10 h-10 rounded-xl bg-red-900/30 text-red-400 border border-red-500/30 flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-400 transition-all shadow-[inset_0_0_10px_rgba(239,68,68,0.2)] active:scale-95" title="Clear Track Progress"><i className="fa-solid fa-trash-can"></i></button>
                                    </div>`;
code = code.replace(batchHeaderFind, batchHeaderReplace);

// Also update the fallback Level 2 (where mode is already selected but wait, mode selection view is above)
// Look for `<div className="flex items-center gap-3 mb-6">` that has `activePracticeBatch?.name || 'Practice Modules'`
const modeHeaderFind = `<div className="flex items-center gap-3 mb-6">
                                    <button onClick={handleBack} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300"><i className="fa-solid fa-arrow-left"></i></button>
                                    <h2 className="text-2xl font-black text-white drop-shadow-md tracking-tight">{activePracticeBatch?.name || 'Practice Modules'}</h2>
                                </div>`;

const modeHeaderReplace = `<div className="flex justify-between items-center mb-6 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <button onClick={handleBack} className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 text-white/70 hover:text-white hover:bg-white/20 flex items-center justify-center backdrop-blur-md shadow-inner transition-all active:scale-95"><i className="fa-solid fa-arrow-left"></i></button>
                                        <h2 className="text-2xl font-black text-white drop-shadow-md tracking-tight">{activePracticeBatch?.name || 'Practice Modules'}</h2>
                                    </div>
                                    {activePracticeBatch && (
                                        <button onClick={() => setConfirmClearScope({ type: 'batch', data: activePracticeBatch })} className="shrink-0 w-10 h-10 rounded-xl bg-red-900/30 text-red-400 border border-red-500/30 flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-400 transition-all shadow-[inset_0_0_10px_rgba(239,68,68,0.2)] active:scale-95" title="Clear Track Progress"><i className="fa-solid fa-trash-can"></i></button>
                                    )}
                                </div>`;
code = code.replace(modeHeaderFind, modeHeaderReplace);

fs.writeFileSync('c:/Users/risha/ATAXYbot/index.html', code);
console.log('Advanced Data Wipe Modal injected successfully!');
