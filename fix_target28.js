const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// 1. Add editingTarget state
const stateHookTarget = `const [showDetailedAnalyzer, setShowDetailedAnalyzer] = useState(false);`;
const stateHookReplacement = `const [showDetailedAnalyzer, setShowDetailedAnalyzer] = useState(false);
            const [editingTarget, setEditingTarget] = useState(null);`;

content = content.replace(stateHookTarget, stateHookReplacement);

// 2. Add the Edit Button to the target card
// Target is inside the loop: <div className="flex flex-col items-end justify-between h-full gap-3">
//                         <button onClick={(e) => { e.stopPropagation(); deleteTarget(t.id); }}
const editBtnTarget = `<button onClick={(e) => { e.stopPropagation(); deleteTarget(t.id); }} className="text-gray-500 hover:text-rose-500 hover:bg-rose-500/10 w-8 h-8 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">`;
const editBtnReplacement = `<button onClick={(e) => { e.stopPropagation(); setEditingTarget(t); }} className="text-gray-500 hover:text-blue-500 hover:bg-blue-500/10 w-8 h-8 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                            <i className="fa-solid fa-pen text-sm"></i>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); deleteTarget(t.id); }} className="text-gray-500 hover:text-rose-500 hover:bg-rose-500/10 w-8 h-8 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">`;

content = content.replace(editBtnTarget, editBtnReplacement);

// 3. Add the Edit Modal render block
// Place it just before `{/* Detailed Analyzer Modal */}`
const modalTarget = `{/* Detailed Analyzer Modal */}`;
const editModalComponent = `{/* Edit Target Modal */}
                            {editingTarget && ReactDOM.createPortal(
                                <div className="fixed inset-0 z-[3000000] flex items-center justify-center p-4">
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setEditingTarget(null)}></div>
                                    <div className="bg-[#010714] border border-[#0AE0D0]/30 rounded-2xl p-6 w-full max-w-md relative z-10 shadow-2xl animate-in zoom-in-95 flex flex-col gap-4">
                                        <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                            <i className="fa-solid fa-pen-to-square text-[#0AE0D0]"></i> Edit Target
                                        </h3>
                                        <input type="text" value={editingTarget.text} onChange={e => setEditingTarget({...editingTarget, text: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#0AE0D0] outline-none transition-colors" placeholder="Target description..." />
                                        
                                        <div className="flex gap-3">
                                            <div className="flex-1">
                                                <label className="text-xs text-gray-400 font-bold mb-1 block">Start Time</label>
                                                <input type="time" value={editingTarget.startTime || ''} onChange={e => setEditingTarget({...editingTarget, startTime: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#0AE0D0] outline-none transition-colors" />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-xs text-gray-400 font-bold mb-1 block">End Time</label>
                                                <input type="time" value={editingTarget.endTime || ''} onChange={e => setEditingTarget({...editingTarget, endTime: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#0AE0D0] outline-none transition-colors" />
                                            </div>
                                        </div>

                                        <div className="flex gap-3 justify-end mt-2">
                                            <button onClick={() => setEditingTarget(null)} className="px-5 py-2.5 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
                                            <button onClick={() => {
                                                const u = targetsData[selectedDate].map(t => t.id === editingTarget.id ? editingTarget : t);
                                                setTargetsData({ ...targetsData, [selectedDate]: u });
                                                setEditingTarget(null);
                                            }} className="px-5 py-2.5 bg-[#0AE0D0] text-[#010714] font-black rounded-xl hover:scale-105 active:scale-95 transition-transform shadow-[0_0_15px_rgba(10,224,208,0.4)]">Save Changes</button>
                                        </div>
                                    </div>
                                </div>,
                                document.body
                            )}
                            
                            {/* Detailed Analyzer Modal */}`;

content = content.replace(modalTarget, editModalComponent);

fs.writeFileSync('index.html', content, 'utf8');
console.log("Injected Edit Target modal and state");
