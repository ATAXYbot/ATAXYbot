import sys

def fix_html():
    with open('c:/Users/risha/ATAXYbot/index.html', 'r', encoding='utf-8') as f:
        code = f.read()
    
    # We need to find the block:
    #                         }
    #                     
    #                         if (activePracticeMode === 'custom') {
    # It might have varying whitespace.
    
    import re
    
    # Pattern to match the end of the JEE block and the start of the custom mode block
    pattern = re.compile(r'(</p>\s*</div>\s*</div>\s*\);\s*})\s*(if\s*\(activePracticeMode\s*===\s*\'custom\'\)\s*\{)')
    
    match = pattern.search(code)
    if match:
        print("Match found!")
        # We replace it with:
        # } else if (activePracticeBatch.type === 'others') { return <SatheeRenderer/> }
        # if (activePracticeMode === 'custom') {
        
        satheeUiCode = """
                        } else if (activePracticeBatch.type === 'others') {
                            return (
                                <div className="pb-24 pt-4 px-5 animate-in fade-in min-h-screen flex flex-col">
                                    <div className="flex items-center gap-3 mb-6 relative z-10">
                                        <button onClick={(e) => { 
                                            e.preventDefault(); 
                                            e.stopPropagation(); 
                                            if (activeSatheeContent) setActiveSatheeContent(null);
                                            else if (activeSatheeChapter) setActiveSatheeChapter(null);
                                            else if (activeSatheeSubject) setActiveSatheeSubject(null);
                                            else if (activeSatheeBatch) setActiveSatheeBatch(null);
                                            else if (activeSatheeExam) setActiveSatheeExam(null);
                                            else setActivePracticeBatch(null); 
                                        }} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300"><i className="fa-solid fa-arrow-left"></i></button>
                                        <h2 className="text-2xl font-black text-white drop-shadow-md tracking-tight">
                                            {activeSatheeChapter ? activeSatheeChapter.name : activeSatheeSubject ? activeSatheeSubject.name : activeSatheeBatch ? activeSatheeBatch.name : activeSatheeExam ? activeSatheeExam.name : 'All Exams (SATHEE)'}
                                        </h2>
                                    </div>
                                    
                                    {!activeSatheeExam && (
                                        <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
                                            {SATHEE_DATA.exams.map(exam => (
                                                <div key={exam.id} onClick={() => setActiveSatheeExam(exam)} className="backdrop-blur-xl bg-white/5 border border-white/10 p-5 rounded-[1.5rem] flex flex-col items-center gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.2)] cursor-pointer transition-all duration-300 group hover:-translate-y-2 hover:border-yellow-500/50 hover:bg-yellow-900/20 hover:shadow-[0_15px_40px_rgba(251,191,36,0.3)]">
                                                    <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shadow-inner group-hover:bg-yellow-500/20 group-hover:border-yellow-400/50 transition-all duration-300">
                                                        <i className={`fa-solid ${exam.icon} text-3xl text-gray-300 group-hover:text-yellow-400 group-hover:scale-110 transition-all duration-300`}></i>
                                                    </div>
                                                    <h3 className="font-black text-lg text-white text-center group-hover:text-yellow-300">{exam.name}</h3>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {activeSatheeExam && !activeSatheeBatch && (
                                        <div className="space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
                                            {activeSatheeExam.batches.map(batch => (
                                                <div key={batch.id} onClick={() => setActiveSatheeBatch(batch)} className={`backdrop-blur-xl bg-white/5 border border-white/10 p-5 rounded-[1.5rem] flex items-center gap-5 shadow-[0_8px_30px_rgb(0,0,0,0.2)] cursor-pointer transition-all duration-300 group hover:-translate-y-1 hover:border-${batch.color}-500/50 hover:bg-${batch.color}-900/30`}>
                                                    <div className={`w-14 h-14 rounded-2xl bg-${batch.color}-900/30 border border-${batch.color}-500/30 flex items-center justify-center shadow-inner group-hover:bg-${batch.color}-500 transition-all duration-500`}>
                                                        <i className={`fa-solid ${batch.icon} text-2xl text-${batch.color}-300 group-hover:text-white`}></i>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className={`font-black text-xl text-white group-hover:text-${batch.color}-300 transition-colors`}>{batch.name}</h3>
                                                        <span className={`inline-block mt-1 px-2 py-0.5 rounded bg-${batch.color}-500/20 border border-${batch.color}-500/30 text-[10px] font-bold text-${batch.color}-200`}>{batch.medium}</span>
                                                    </div>
                                                    <i className={`fa-solid fa-chevron-right text-gray-400 group-hover:text-${batch.color}-400 transition-all group-hover:translate-x-1`}></i>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {activeSatheeBatch && !activeSatheeSubject && (() => {
                                        const subjects = SATHEE_DATA.subjects[activeSatheeBatch.id] || SATHEE_DATA.subjects['default'];
                                        return (
                                            <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
                                                {subjects.map(sub => (
                                                    <div key={sub.id} onClick={() => setActiveSatheeSubject(sub)} className="backdrop-blur-xl bg-white/5 border border-white/10 p-4 rounded-3xl flex flex-col items-center text-center gap-3 cursor-pointer transition-all duration-300 group hover:-translate-y-1 hover:border-indigo-500/50 hover:bg-indigo-900/20">
                                                        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-indigo-500/30 transition-colors">
                                                            <i className={`fa-solid ${sub.icon} text-xl text-gray-300 group-hover:text-indigo-300`}></i>
                                                        </div>
                                                        <h4 className="font-bold text-sm text-gray-200 group-hover:text-white">{sub.name}</h4>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })()}

                                    {activeSatheeSubject && !activeSatheeChapter && (() => {
                                        const chapters = SATHEE_DATA.chapters[activeSatheeSubject.id] || SATHEE_DATA.chapters['default'];
                                        return (
                                            <div className="space-y-3 animate-in slide-in-from-bottom-4 fade-in duration-500">
                                                {chapters.map((chap, idx) => (
                                                    <div key={chap.id} onClick={() => setActiveSatheeChapter(chap)} className="backdrop-blur-xl bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4 cursor-pointer group hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                                                        <div className="w-10 h-10 rounded-lg bg-gray-800/50 border border-gray-700 flex items-center justify-center font-black text-gray-400 group-hover:text-white group-hover:border-gray-500 transition-colors">
                                                            {idx + 1}
                                                        </div>
                                                        <h4 className="flex-1 font-bold text-gray-200 group-hover:text-white">{chap.name}</h4>
                                                        <i className="fa-solid fa-chevron-right text-gray-500 group-hover:text-white transition-transform group-hover:translate-x-1"></i>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })()}

                                    {activeSatheeChapter && (() => {
                                        const contents = SATHEE_DATA.content[activeSatheeChapter.id] || SATHEE_DATA.content['default'];
                                        const videos = contents.filter(c => c.type === 'video');
                                        const dpps = contents.filter(c => c.type === 'dpp');
                                        return (
                                            <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
                                                {activeSatheeContent ? (
                                                    <div className="w-full h-[60vh] rounded-3xl overflow-hidden border border-white/20 shadow-2xl relative bg-black">
                                                        <div className="absolute inset-0 flex items-center justify-center z-0">
                                                            <div className="animate-spin w-8 h-8 border-4 border-gray-600 border-t-white rounded-full"></div>
                                                        </div>
                                                        <iframe src={activeSatheeContent.url} className="w-full h-full relative z-10 border-0" allowFullScreen></iframe>
                                                        <button onClick={() => setActiveSatheeContent(null)} className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/50 hover:bg-red-500 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-colors border border-white/20">
                                                            <i className="fa-solid fa-xmark"></i>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div>
                                                            <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2"><i className="fa-solid fa-play-circle text-red-500"></i> Video Lectures</h3>
                                                            <div className="grid grid-cols-1 gap-3">
                                                                {videos.map(vid => (
                                                                    <div key={vid.id} onClick={() => setActiveSatheeContent(vid)} className="bg-white/5 border border-white/10 p-3 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-white/10 transition-all group">
                                                                        <div className="w-24 h-16 bg-gray-800 rounded-xl relative overflow-hidden group-hover:ring-2 ring-red-500 transition-all">
                                                                            <img src="https://sathee.iitk.ac.in/images/home/home-banner/en/jee-toppers.png" className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
                                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                                <i className="fa-solid fa-play text-white/80 group-hover:text-white drop-shadow-lg text-lg"></i>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <h4 className="font-bold text-gray-200 group-hover:text-white">{vid.name}</h4>
                                                                            <p className="text-xs text-gray-400 mt-1">Source: SATHEE Portal</p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2"><i className="fa-solid fa-file-pdf text-blue-500"></i> Practice DPPs</h3>
                                                            <div className="grid grid-cols-1 gap-3">
                                                                {dpps.map(dpp => (
                                                                    <div key={dpp.id} onClick={() => setActiveSatheeContent(dpp)} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-white/10 transition-all group">
                                                                        <div className="w-12 h-12 bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors border border-blue-500/30">
                                                                            <i className="fa-solid fa-file-lines text-xl"></i>
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <h4 className="font-bold text-gray-200 group-hover:text-white">{dpp.name}</h4>
                                                                            <p className="text-xs text-gray-400 mt-1">Interactive Quiz & PDF</p>
                                                                        </div>
                                                                        <i className="fa-solid fa-arrow-up-right-from-square text-gray-500 group-hover:text-white"></i>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>
                            );
                        }
"""
        
        replacement = match.group(1) + satheeUiCode + "\n                        " + match.group(2)
        code = code[:match.start()] + replacement + code[match.end():]
        
        # We also need to remove the incorrectly injected code from the FIRST pass
        # The first pass injected:
        # } else if (activePracticeBatch.type === 'others') {
        # ...
        # } else {
        #     return (
        #         <div className="pb-24 pt-4 px-5 animate-in fade-in min-h-screen">
        
        # Let's search and remove the bad block.
        bad_block_start = code.find("} else if (activePracticeBatch.type === 'others') {")
        if bad_block_start != -1:
            # wait, the bad block might be the one we JUST added?
            # No, because the regex above injects it around 9540. The bad one was injected around line 9900.
            # So let's check for the second occurrence.
            
            # Find all occurrences
            occurrences = [m.start() for m in re.finditer(r"\} else if \(activePracticeBatch\.type === 'others'\) \{", code)]
            
            if len(occurrences) > 1:
                # The first occurrence is the one we just added.
                # The second occurrence is the bad one.
                bad_start = occurrences[1]
                # It ends with:
                # } else {
                #     return (
                #         <div className="pb-24 pt-4 px-5 animate-in fade-in min-h-screen">
                
                bad_end_pattern = re.compile(r'\} else \{\s*return \(\s*<div className="pb-24 pt-4 px-5 animate-in fade-in min-h-screen">')
                match_end = bad_end_pattern.search(code, bad_start)
                if match_end:
                    print("Found bad block end!")
                    code = code[:bad_start] + "} else {" + code[match_end.start() + 8:]
        
        with open('c:/Users/risha/ATAXYbot/index.html', 'w', encoding='utf-8') as f:
            f.write(code)
        
        print("Success!")
    else:
        print("Could not find the target block.")

fix_html()
