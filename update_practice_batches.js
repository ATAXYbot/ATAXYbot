const fs = require('fs');

let code = fs.readFileSync('c:/Users/risha/ATAXYbot/index.html', 'utf8');

const oldTarget = `                    if (activePracticeBatch) {
                        return (
                            <div className="pb-24 pt-4 px-5 animate-in fade-in min-h-screen">
                                <div className="flex items-center gap-3 mb-6">
                                    <button onClick={handleBack} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300"><i className="fa-solid fa-arrow-left"></i></button>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{safeRenderText(activePracticeBatch.name)}</h2>
                                </div>
                                <div className="space-y-3">
                                    {activePracticeBatch.files.map((file, i) => (
                                        <div key={i} onClick={() => setActivePracticeFile(file)} className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center gap-4 shadow-sm cursor-pointer hover:border-[#00a651] dark:hover:border-[#00a651] transition-all group">
                                            <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-[#00a651] flex items-center justify-center text-lg"><i className="fa-solid fa-file-alt"></i></div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-base text-gray-800 dark:text-gray-200 group-hover:text-[#00a651] transition-colors">{safeRenderText(file.name)}</h3>
                                                <p className="text-xs text-gray-500">Practice Module</p>
                                            </div>
                                            <i className="fa-solid fa-chevron-right text-gray-400 group-hover:text-[#00a651] transition-colors"></i>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    }

                    const PRACTICE_BATCHES = [
                        { id: 'pb_allen', name: 'LN modules', type: 'ln', sourceTable: 'Raceee_testttingg_checkinggg', files: [{ id: 'pf_race', name: 'Race' }] },
                        { id: 'pb_pw', name: 'Bablu Dablu modules', type: 'pw', sourceTable: 'questions', files: [{ id: 'pf_dpp', name: 'DPP' }] },
                        { id: 'pb_basic_math', name: 'Basic Math & Vectors', type: 'custom', sourceTable: 'basic_mathmatics_&_vector', files: [{ id: 'pf_basic_math_1', name: 'Module 1' }] }
                    ];

                    return (
                        <div className="pb-24 pt-6 px-5 animate-in fade-in min-h-screen">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <AtaxyLogo className="w-10 h-10 rounded-full shadow-md border border-gray-200" />
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-wider">ATAXY BANK</h2>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {PRACTICE_BATCHES.map(batch => (
                                    <div key={batch.id} onClick={() => setActivePracticeBatch(batch)} className={\`p-6 rounded-3xl cursor-pointer hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 relative overflow-hidden \${batch.type === 'ln' ? 'bg-gradient-to-br from-[#00a651] to-[#008c44] border border-[#008c44]/50 shadow-[0_8px_20px_rgba(0,166,81,0.3)] text-white' : 'bg-gradient-to-br from-gray-900 to-black dark:from-gray-800 dark:to-gray-950 border border-gray-800 shadow-[0_8px_20px_rgba(0,0,0,0.2)] text-white'}\`}>
                                        <div className="relative z-10">
                                            <h3 className="text-xl font-black mb-1 text-white">{batch.name}</h3>
                                            <p className={\`text-xs font-medium \${batch.type === 'ln' ? 'text-green-100' : 'text-gray-400'}\`}>{batch.files.length} Modules Available</p>
                                        </div>
                                        <i className={\`fa-solid \${batch.type === 'ln' ? 'fa-book text-green-800/30' : 'fa-layer-group text-white/5'} absolute -right-4 -bottom-4 text-6xl\`}></i>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );`;

const newTarget = `                    if (activePracticeBatch) {
                        if (activePracticeBatch.type === 'jee') {
                            return (
                                <div className="pb-24 pt-4 px-5 animate-in fade-in min-h-screen flex flex-col">
                                    <div className="flex items-center gap-3 mb-6">
                                        <button onClick={handleBack} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300"><i className="fa-solid fa-arrow-left"></i></button>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{safeRenderText(activePracticeBatch.name)}</h2>
                                    </div>
                                    <div className="flex-1 flex flex-col items-center justify-center text-center -mt-20">
                                        <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 animate-pulse-soft border border-blue-500/30">
                                            <i className="fa-solid fa-rocket text-4xl text-blue-500 animate-pop-bounce delay-150"></i>
                                        </div>
                                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Coming Soon!</h3>
                                        <p className="text-sm text-gray-500 max-w-[250px] mx-auto">We are working hard to bring you the best JEE questions. Stay tuned!</p>
                                    </div>
                                </div>
                            );
                        }
                    
                        return (
                            <div className="pb-24 pt-4 px-5 animate-in fade-in min-h-screen">
                                <div className="flex items-center gap-3 mb-6">
                                    <button onClick={handleBack} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300"><i className="fa-solid fa-arrow-left"></i></button>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{safeRenderText(activePracticeBatch.name)}</h2>
                                </div>
                                <div className="space-y-3">
                                    {activePracticeBatch.files.map((file, i) => (
                                        <div key={i} onClick={() => setActivePracticeFile(file)} className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center gap-4 shadow-sm cursor-pointer hover:border-[#00a651] dark:hover:border-[#00a651] transition-all group">
                                            <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-[#00a651] flex items-center justify-center text-lg"><i className="fa-solid fa-file-alt"></i></div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-base text-gray-800 dark:text-gray-200 group-hover:text-[#00a651] transition-colors">{safeRenderText(file.name)}</h3>
                                                <p className="text-xs text-gray-500">Practice Module</p>
                                            </div>
                                            <i className="fa-solid fa-chevron-right text-gray-400 group-hover:text-[#00a651] transition-colors"></i>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    }

                    const PRACTICE_BATCHES = [
                        { id: 'pb_neet_bank', name: 'NEET Bank', type: 'neet', sourceTable: 'basic_mathmatics_&_vector', files: [{ id: 'pf_basic_math_1', name: 'Basic Math' }] },
                        { id: 'pb_jee_bank', name: 'JEE Bank', type: 'jee', sourceTable: 'coming_soon', files: [] },
                        { id: 'pb_checking', name: 'Checking', type: 'checking', sourceTable: 'Raceee_testttingg_checkinggg', files: [{ id: 'pf_race', name: 'Race' }] }
                    ];

                    return (
                        <div className="pb-24 pt-6 px-5 animate-in fade-in min-h-screen">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <AtaxyLogo className="w-10 h-10 rounded-full shadow-md border border-gray-200" />
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-wider">ATAXY BANK</h2>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {PRACTICE_BATCHES.map(batch => {
                                    let bgClass = '';
                                    let iconClass = '';
                                    let iconName = '';
                                    
                                    if (batch.type === 'neet') {
                                        bgClass = 'bg-gradient-to-br from-[#00a651] to-[#008c44] border border-[#008c44]/50 shadow-[0_8px_20px_rgba(0,166,81,0.3)] text-white';
                                        iconClass = 'text-green-800/30';
                                        iconName = 'fa-stethoscope';
                                    } else if (batch.type === 'jee') {
                                        bgClass = 'bg-gradient-to-br from-[#00418d] to-[#002f6c] border border-[#00418d]/50 shadow-[0_8px_20px_rgba(0,65,141,0.3)] text-white';
                                        iconClass = 'text-blue-900/40';
                                        iconName = 'fa-microchip';
                                    } else {
                                        bgClass = 'bg-gradient-to-br from-gray-900 to-black dark:from-gray-800 dark:to-gray-950 border border-gray-800 shadow-[0_8px_20px_rgba(0,0,0,0.2)] text-white';
                                        iconClass = 'text-white/5';
                                        iconName = 'fa-vial';
                                    }

                                    return (
                                        <div key={batch.id} onClick={() => setActivePracticeBatch(batch)} className={\`p-6 rounded-3xl cursor-pointer hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 relative overflow-hidden \${bgClass}\`}>
                                            <div className="relative z-10">
                                                <h3 className="text-xl font-black mb-1 text-white">{batch.name}</h3>
                                                <p className={\`text-xs font-medium \${batch.type === 'jee' ? 'text-blue-200' : batch.type === 'neet' ? 'text-green-100' : 'text-gray-400'}\`}>
                                                    {batch.type === 'jee' ? 'Launching Soon' : \`\${batch.files.length} Modules Available\`}
                                                </p>
                                            </div>
                                            <i className={\`fa-solid \${iconName} \${iconClass} absolute -right-4 -bottom-4 text-6xl\`}></i>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );`;

if (code.includes(oldTarget)) {
    fs.writeFileSync('c:/Users/risha/ATAXYbot/index.html', code.replace(oldTarget, newTarget));
    console.log("Success");
} else {
    console.log("Failed to find exact string match. Writing debug output.");
    // Optional: could split and verify where mismatch is.
}
