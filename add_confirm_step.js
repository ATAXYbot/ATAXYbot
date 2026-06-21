const fs = require('fs');
let code = fs.readFileSync('c:/Users/risha/ATAXYbot/index.html', 'utf8');

// 1. Add `pendingClearAction` state
const stateInjectionFind = `const [confirmClearScope, setConfirmClearScope] = useState(null);`;
const stateInjectionReplace = `const [confirmClearScope, setConfirmClearScope] = useState(null);
            const [pendingClearAction, setPendingClearAction] = useState(null);`;

if (code.includes(stateInjectionFind) && !code.includes('setPendingClearAction')) {
    code = code.replace(stateInjectionFind, stateInjectionReplace);
}

// 2. Replace the modal content
const modalStart = code.indexOf("{confirmClearScope && (");
const modalEnd = code.indexOf("<GlobalDialog />", modalStart);

if (modalStart !== -1 && modalEnd !== -1) {
    const newModal = `{confirmClearScope && (
                            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999999] flex items-center justify-center p-4 animate-in fade-in" onClick={() => { setConfirmClearScope(null); setPendingClearAction(null); }}>
                                <div className="bg-[#0b0f19] border border-cyan-900/30 rounded-[2rem] p-6 w-full max-w-sm text-center shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden relative" onClick={e => e.stopPropagation()}>
                                    <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-transparent to-red-900/10 pointer-events-none"></div>
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>
                                    
                                    <div className="w-16 h-16 bg-red-900/30 text-red-500 rounded-2xl mx-auto flex items-center justify-center text-3xl mb-4 border border-red-500/30 shadow-inner relative z-10">
                                        <i className="fa-solid fa-dumpster-fire"></i>
                                    </div>
                                    
                                    {!pendingClearAction ? (
                                        <>
                                            <h3 className="text-2xl font-black text-white mb-2 relative z-10 drop-shadow-md">Clear Data</h3>
                                            <p className="text-xs text-gray-400 mb-6 font-bold relative z-10">
                                                Select what you want to delete for {confirmClearScope === 'all' ? 'everything' : confirmClearScope.type === 'batch' ? 'this track' : 'this ' + confirmClearScope.type}.
                                            </p>
                                            
                                            <div className="space-y-3 relative z-10">
                                                <button onClick={() => setPendingClearAction('attempts')} className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 text-white font-bold rounded-xl transition-colors flex items-center justify-between px-4 group">
                                                    <span><i className="fa-solid fa-rotate-left mr-2 text-cyan-400 group-hover:scale-110 transition-transform"></i> Clear Attempts</span>
                                                    <i className="fa-solid fa-chevron-right text-gray-600 text-xs"></i>
                                                </button>
                                                <button onClick={() => setPendingClearAction('bookmarks')} className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 text-white font-bold rounded-xl transition-colors flex items-center justify-between px-4 group">
                                                    <span><i className="fa-solid fa-bookmark mr-2 text-yellow-400 group-hover:scale-110 transition-transform"></i> Clear Bookmarks</span>
                                                    <i className="fa-solid fa-chevron-right text-gray-600 text-xs"></i>
                                                </button>
                                                <button onClick={() => setPendingClearAction('all')} className="w-full py-3 bg-red-900/30 hover:bg-red-500 border border-red-500/30 hover:border-red-400 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] flex items-center justify-between px-4 group">
                                                    <span><i className="fa-solid fa-trash-can mr-2 group-hover:scale-110 transition-transform"></i> Delete All Data</span>
                                                    <i className="fa-solid fa-chevron-right text-white/50 text-xs"></i>
                                                </button>
                                            </div>
                                            
                                            <button onClick={() => { setConfirmClearScope(null); setPendingClearAction(null); }} className="w-full mt-4 py-3 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white font-bold rounded-xl transition-colors relative z-10">Cancel</button>
                                        </>
                                    ) : (
                                        <>
                                            <h3 className="text-2xl font-black text-white mb-2 relative z-10 drop-shadow-md">Are you absolutely sure?</h3>
                                            <p className="text-sm text-red-300 mb-6 font-bold relative z-10">
                                                This will {pendingClearAction === 'attempts' ? 'clear all attempt history' : pendingClearAction === 'bookmarks' ? 'remove all bookmarks' : 'permanently delete all data'} for {confirmClearScope === 'all' ? 'everything' : confirmClearScope.type === 'batch' ? 'this track' : 'this ' + confirmClearScope.type}. This action cannot be undone!
                                            </p>
                                            
                                            <div className="flex gap-3 relative z-10">
                                                <button onClick={() => setPendingClearAction(null)} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors">Go Back</button>
                                                <button onClick={() => { handleClearProgress(confirmClearScope, pendingClearAction); setPendingClearAction(null); }} className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-colors shadow-[0_0_15px_rgba(239,68,68,0.4)]">Yes, {pendingClearAction === 'attempts' ? 'Clear' : pendingClearAction === 'bookmarks' ? 'Clear' : 'Delete'}</button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        `;
    code = code.substring(0, modalStart) + newModal + code.substring(modalEnd);
}

// 3. Fix JEE Back Button
const jeeHeaderStart = code.indexOf("if (activePracticeBatch.type === 'jee') {");
if (jeeHeaderStart !== -1) {
    const jeeReturnEnd = code.indexOf(");", jeeHeaderStart);
    if (jeeReturnEnd !== -1) {
        let jeeBlock = code.substring(jeeHeaderStart, jeeReturnEnd + 2);
        jeeBlock = jeeBlock.replace(
            '<button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActivePracticeBatch(null); }} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300">',
            '<button onClick={handleBack} className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 text-white/70 hover:text-white hover:bg-white/20 flex items-center justify-center backdrop-blur-md shadow-inner transition-all active:scale-95">'
        );
        code = code.substring(0, jeeHeaderStart) + jeeBlock + code.substring(jeeReturnEnd + 2);
    }
}

fs.writeFileSync('c:/Users/risha/ATAXYbot/index.html', code);
console.log('Confirmation step added and JEE back button fixed!');
