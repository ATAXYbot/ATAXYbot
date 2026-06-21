const fs = require('fs');
let code = fs.readFileSync('c:/Users/risha/ATAXYbot/index.html', 'utf8');

// --- 1. Chapter Rows ---
const oldChapterRowRight = `<i className={\`fa-solid fa-chevron-right text-xl transition-all duration-300 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 \${isNeet ? 'text-blue-400' : isJee ? 'text-cyan-400' : 'text-white'}\`}></i>
                                            </div>`;

const newChapterRowRight = `<div className="flex items-center gap-4">
                                                    <button onClick={(e) => { e.stopPropagation(); setConfirmClearScope({ type: 'chapter', data: chap }); }} className="w-10 h-10 rounded-xl bg-red-900/30 text-red-400 border border-red-500/30 flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-400 transition-all shadow-[inset_0_0_10px_rgba(239,68,68,0.2)] active:scale-95 z-20 opacity-50 hover:opacity-100 group-hover:opacity-100" title="Clear Chapter Progress"><i className="fa-solid fa-trash-can"></i></button>
                                                    <i className={\`fa-solid fa-chevron-right text-xl transition-all duration-300 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 \${isNeet ? 'text-blue-400' : isJee ? 'text-cyan-400' : 'text-white'}\`}></i>
                                                </div>
                                            </div>`;

code = code.replace(oldChapterRowRight, newChapterRowRight);

// --- 2. Question Type Rows ---
const oldQTypeRowRight = `<div className="flex items-center gap-2">
                                                        <div className={\`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 \${qCount > 0 ? 'bg-white/5 border border-white/10 text-white/50 group-hover:scale-110 ' + (isNeet ? 'group-hover:bg-blue-500 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] group-hover:border-blue-400' : isJee ? 'group-hover:bg-cyan-500 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(6,182,212,0.6)] group-hover:border-cyan-400' : 'group-hover:bg-white group-hover:text-black') : 'bg-white/5 text-white/20 border border-white/5'}\`}>
                                                            <i className="fa-solid fa-play ml-0.5 text-xs"></i>
                                                        </div>
                                                    </div>`;

const newQTypeRowRight = `<div className="flex items-center gap-3">
                                                        {qCount > 0 && (
                                                            <button onClick={(e) => { 
                                                                e.stopPropagation(); 
                                                                let questionsToClear = [];
                                                                if (type === 'All combined') {
                                                                    activePracticeChapter.topics?.forEach(t => t.questions?.forEach(q => questionsToClear.push(q)));
                                                                } else {
                                                                    activePracticeChapter.topics?.forEach(t => t.questions?.forEach(q => {
                                                                        if ((q.questionType || 'Main module (recommended)') === type) questionsToClear.push(q);
                                                                    }));
                                                                }
                                                                setConfirmClearScope({ type: 'topic', data: { name: type, questions: questionsToClear } }); 
                                                            }} className="w-10 h-10 rounded-xl bg-red-900/30 text-red-400 border border-red-500/30 flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-400 transition-all shadow-[inset_0_0_10px_rgba(239,68,68,0.2)] active:scale-95 z-20 opacity-50 hover:opacity-100 group-hover:opacity-100" title="Clear Question Type Progress"><i className="fa-solid fa-trash-can"></i></button>
                                                        )}
                                                        <div className={\`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 \${qCount > 0 ? 'bg-white/5 border border-white/10 text-white/50 group-hover:scale-110 ' + (isNeet ? 'group-hover:bg-blue-500 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] group-hover:border-blue-400' : isJee ? 'group-hover:bg-cyan-500 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(6,182,212,0.6)] group-hover:border-cyan-400' : 'group-hover:bg-white group-hover:text-black') : 'bg-white/5 text-white/20 border border-white/5'}\`}>
                                                            <i className="fa-solid fa-play ml-0.5 text-xs"></i>
                                                        </div>
                                                    </div>`;

code = code.replace(oldQTypeRowRight, newQTypeRowRight);

// --- 3. Subject Rows (Optional, but good for completeness) ---
const oldSubjectRowEnd = `<p className={\`text-[10px] font-black uppercase tracking-widest mt-2 z-10 transition-colors \${isNeet ? 'text-blue-200/50 group-hover:text-blue-200' : isJee ? 'text-cyan-200/50 group-hover:text-cyan-200' : 'text-white/50 group-hover:text-white'}\`}>{sub.chapters?.length || 0} Chapters</p>
                                            </div>`;

const newSubjectRowEnd = `<p className={\`text-[10px] font-black uppercase tracking-widest mt-2 z-10 transition-colors \${isNeet ? 'text-blue-200/50 group-hover:text-blue-200' : isJee ? 'text-cyan-200/50 group-hover:text-cyan-200' : 'text-white/50 group-hover:text-white'}\`}>{sub.chapters?.length || 0} Chapters</p>
                                                <button onClick={(e) => { e.stopPropagation(); setConfirmClearScope({ type: 'subject', data: sub }); }} className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-red-900/30 text-red-400 border border-red-500/30 flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-400 transition-all shadow-[inset_0_0_10px_rgba(239,68,68,0.2)] active:scale-95 z-20 opacity-0 group-hover:opacity-100" title="Clear Subject Progress"><i className="fa-solid fa-trash-can"></i></button>
                                            </div>`;

code = code.replace(oldSubjectRowEnd, newSubjectRowEnd);

fs.writeFileSync('c:/Users/risha/ATAXYbot/index.html', code);
console.log('Row-level delete buttons added successfully!');
