const fs = require('fs');

const replacement = `                                                        {/* Premium White/Grey Personal Notes UI */}
                                                        <div className="mt-8 mb-4">
                                                            <div className="flex justify-between items-center mb-4">
                                                                <h4 className="text-[15px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2.5">
                                                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shadow-inner shadow-blue-200/50">
                                                                        <i className="fa-solid fa-pen-nib text-[#00418d] text-sm"></i>
                                                                    </div>
                                                                    My Personal Notes
                                                                </h4>
                                                                {!(showNoteInput[currentQuestion.id] || questionNotes[currentQuestion.id]) && (
                                                                    <button 
                                                                        onClick={() => setShowNoteInput(prev => ({ ...prev, [currentQuestion.id]: true }))} 
                                                                        className="group relative px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:text-[#00418d] hover:border-blue-200 shadow-sm hover:shadow-md hover:shadow-blue-100 active:scale-95 overflow-hidden"
                                                                    >
                                                                        <div className="absolute inset-0 bg-blue-50/50 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                                                                        <i className="fa-solid fa-plus relative z-10 group-hover:rotate-90 transition-transform duration-300"></i> 
                                                                        <span className="relative z-10">Add Note</span>
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {(showNoteInput[currentQuestion.id] || questionNotes[currentQuestion.id]) && (
                                                                <div className="bg-white border border-slate-200 p-5 rounded-3xl animate-in fade-in zoom-in-95 duration-300 ease-out relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
                                                                    {/* Subtle Top Gradient Accent */}
                                                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00418d] via-blue-400 to-[#00a651] opacity-80"></div>
                                                                    
                                                                    {(!showNoteInput[currentQuestion.id] && questionNotes[currentQuestion.id]) ? (
                                                                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-[15px] text-slate-700 mb-4 whitespace-pre-wrap font-medium leading-relaxed shadow-inner">
                                                                            {questionNotes[currentQuestion.id]}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="relative mb-4 group">
                                                                            <textarea
                                                                                className="w-full text-[15px] p-5 border-2 border-slate-100 rounded-2xl bg-white text-slate-800 focus:outline-none focus:border-[#00418d] focus:ring-4 focus:ring-[#00418d]/10 transition-all min-h-[120px] resize-y placeholder-slate-400 font-medium shadow-sm z-10 relative"
                                                                                placeholder="Type your brilliant thoughts here... (auto-saved)"
                                                                                value={questionNotes[currentQuestion.id] || ''}
                                                                                onChange={(e) => setQuestionNotes(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                                                                                autoFocus
                                                                            ></textarea>
                                                                            {/* Glowing effect on focus */}
                                                                            <div className="absolute inset-0 rounded-2xl bg-[#00418d] opacity-0 group-focus-within:opacity-[0.03] blur-xl transition-opacity duration-500 pointer-events-none"></div>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    <div className="flex justify-end gap-3 relative z-10">
                                                                        {questionNotes[currentQuestion.id] && (
                                                                            <button 
                                                                                onClick={() => {
                                                                                    const newNotes = { ...questionNotes };
                                                                                    delete newNotes[currentQuestion.id];
                                                                                    setQuestionNotes(newNotes);
                                                                                    setShowNoteInput(prev => ({ ...prev, [currentQuestion.id]: false }));
                                                                                }} 
                                                                                className="text-slate-500 hover:text-red-500 hover:bg-red-50 px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 active:scale-95 border border-transparent hover:border-red-100"
                                                                            >
                                                                                <i className="fa-solid fa-trash-can"></i> Delete
                                                                            </button>
                                                                        )}
                                                                        
                                                                        {showNoteInput[currentQuestion.id] ? (
                                                                            <button 
                                                                                onClick={() => setShowNoteInput(prev => ({ ...prev, [currentQuestion.id]: false }))} 
                                                                                className="bg-[#00418d] hover:bg-[#003370] text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-[0_4px_14px_0_rgba(0,65,141,0.39)] hover:shadow-[0_6px_20px_rgba(0,65,141,0.23)] hover:-translate-y-0.5 flex items-center gap-2 active:scale-95"
                                                                            >
                                                                                <i className="fa-solid fa-check"></i> Save Note
                                                                            </button>
                                                                        ) : (
                                                                            <button 
                                                                                onClick={() => setShowNoteInput(prev => ({ ...prev, [currentQuestion.id]: true }))} 
                                                                                className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-[0_4px_14px_0_rgba(15,23,42,0.39)] hover:shadow-[0_6px_20px_rgba(15,23,42,0.23)] hover:-translate-y-0.5 flex items-center gap-2 active:scale-95"
                                                                            >
                                                                                <i className="fa-solid fa-pen-to-square"></i> Edit Note
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>`;

let content = fs.readFileSync('c:/Users/risha/ATAXYbot/index.html', 'utf8');
const lines = content.split('\n');

// Verify we are replacing the correct lines
if (lines[8245].includes('White/Grey Personal Notes UI') && lines[8292].includes(')}')) {
    const newLines = replacement.split('\n');
    lines.splice(8245, 48, ...newLines);
    fs.writeFileSync('c:/Users/risha/ATAXYbot/index.html', lines.join('\n'));
    console.log('Successfully replaced lines!');
} else {
    console.log('Error: Target lines did not match what was expected. Check index.html lines 8245 and 8292.');
    console.log('Line 8245:', lines[8245]);
    console.log('Line 8292:', lines[8292]);
}
