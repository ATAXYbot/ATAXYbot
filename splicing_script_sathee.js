const fs = require('fs');
let code = fs.readFileSync('c:/Users/risha/ATAXYbot/index.html', 'utf-8');

// 1. Inject SATHEE_DATA
const satheeDataCode = `
const SATHEE_DATA = {
    exams: [
        {
            id: 'exam_ssc', name: 'SSC', icon: 'fa-building-columns',
            batches: [
                { id: 'batch_ssc_cgl', name: 'SSC CGL Target Batch', medium: 'Hindi Medium', icon: 'fa-bullseye', color: 'blue' },
                { id: 'batch_ssc_chsl', name: 'SSC CHSL Foundation', medium: 'English Medium', icon: 'fa-layer-group', color: 'indigo' }
            ]
        },
        {
            id: 'exam_cuet', name: 'CUET', icon: 'fa-graduation-cap',
            batches: [
                { id: 'batch_cuet_ug', name: 'CUET UG Science', medium: 'English Medium', icon: 'fa-atom', color: 'purple' },
                { id: 'batch_cuet_arts', name: 'CUET UG Arts', medium: 'Hindi Medium', icon: 'fa-palette', color: 'pink' }
            ]
        },
        {
            id: 'exam_clat', name: 'CLAT', icon: 'fa-scale-balanced',
            batches: [
                { id: 'batch_clat_1', name: 'CLAT Conqueror', medium: 'English Medium', icon: 'fa-gavel', color: 'yellow' }
            ]
        },
        {
            id: 'exam_icar', name: 'ICAR', icon: 'fa-seedling',
            batches: [
                { id: 'batch_icar_1', name: 'ICAR Agri-Achiever', medium: 'Hindi Medium', icon: 'fa-leaf', color: 'green' }
            ]
        },
        {
            id: 'exam_upsc', name: 'UPSC', icon: 'fa-landmark',
            batches: [
                { id: 'batch_upsc_1', name: 'UPSC IAS Pre Foundation', medium: 'English Medium', icon: 'fa-book-open-reader', color: 'orange' }
            ]
        }
    ],
    subjects: {
        'batch_ssc_cgl': [
            { id: 'sub_maths', name: 'Quantitative Aptitude', icon: 'fa-calculator' },
            { id: 'sub_reasoning', name: 'Reasoning', icon: 'fa-brain' },
            { id: 'sub_english', name: 'English', icon: 'fa-spell-check' },
            { id: 'sub_ga', name: 'General Awareness', icon: 'fa-globe' }
        ],
        'batch_ssc_chsl': [
            { id: 'sub_maths_chsl', name: 'Mathematics', icon: 'fa-calculator' },
            { id: 'sub_english_chsl', name: 'English Language', icon: 'fa-spell-check' }
        ],
        'batch_cuet_ug': [
            { id: 'sub_phy', name: 'Physics', icon: 'fa-atom' },
            { id: 'sub_chem', name: 'Chemistry', icon: 'fa-flask' },
            { id: 'sub_math', name: 'Mathematics', icon: 'fa-square-root-variable' }
        ],
        'default': [
            { id: 'sub_gen1', name: 'General Subject 1', icon: 'fa-book' },
            { id: 'sub_gen2', name: 'General Subject 2', icon: 'fa-book-open' }
        ]
    },
    chapters: {
        'sub_maths': [
            { id: 'chap_num', name: 'Number System' },
            { id: 'chap_pct', name: 'Percentages' },
            { id: 'chap_alg', name: 'Algebra' }
        ],
        'sub_reasoning': [
            { id: 'chap_syl', name: 'Syllogism' },
            { id: 'chap_blood', name: 'Blood Relations' }
        ],
        'default': [
            { id: 'chap_def1', name: 'Chapter 1: Introduction' },
            { id: 'chap_def2', name: 'Chapter 2: Advanced Topics' }
        ]
    },
    content: {
        'chap_num': [
            { id: 'lec_1', type: 'video', name: 'Lec 01: Number System Basics', url: 'https://sathee.iitk.ac.in/' },
            { id: 'lec_2', type: 'video', name: 'Lec 02: Divisibility Rules', url: 'https://sathee.iitk.ac.in/' },
            { id: 'dpp_1', type: 'dpp', name: 'DPP 01: Number System Questions', url: 'https://sathee.iitk.ac.in/' }
        ],
        'default': [
            { id: 'lec_def1', type: 'video', name: 'Lecture 1', url: 'https://sathee.iitk.ac.in/' },
            { id: 'lec_def2', type: 'video', name: 'Lecture 2', url: 'https://sathee.iitk.ac.in/' },
            { id: 'dpp_def1', type: 'dpp', name: 'DPP 1', url: 'https://sathee.iitk.ac.in/' }
        ]
    }
};
`;

code = code.replace(
    /const \{ useState, useRef, useEffect, useMemo \} = React;/,
    "const { useState, useRef, useEffect, useMemo } = React;\n" + satheeDataCode
);

// 2. Inject states
const stateCode = `
            const [activeSatheeExam, setActiveSatheeExam] = useState(null);
            const [activeSatheeBatch, setActiveSatheeBatch] = useState(null);
            const [activeSatheeSubject, setActiveSatheeSubject] = useState(null);
            const [activeSatheeChapter, setActiveSatheeChapter] = useState(null);
            const [activeSatheeContent, setActiveSatheeContent] = useState(null);
`;
code = code.replace(
    /const \[activePracticeBatch, setActivePracticeBatch\] = useState\(null\);/,
    "const [activePracticeBatch, setActivePracticeBatch] = useState(null);\n" + stateCode
);

// 3. Inject PRACTICE_BATCHES Others option
code = code.replace(
    /\{ id: 'pb_checking', name: 'Checking', type: 'checking', sourceTable: 'Raceee_testttingg_checkinggg', files: \[\{ id: 'pf_race', name: 'Race' \}\] \}/,
    `{ id: 'pb_checking', name: 'Checking', type: 'checking', sourceTable: 'Raceee_testttingg_checkinggg', files: [{ id: 'pf_race', name: 'Race' }] },\n                        { id: 'pb_others', name: 'Others', type: 'others', sourceTable: null, files: [] }`
);

// 4. Inject Others Card Renderer
const othersCardCode = `
                                    } else if (batch.type === 'others') {
                                        return (
                                            <div key={batch.id} onClick={() => { setActivePracticeBatch(batch); setActiveSatheeExam(null); setActiveSatheeBatch(null); setActiveSatheeSubject(null); setActiveSatheeChapter(null); setActiveSatheeContent(null); }} className="group relative w-full h-[180px] rounded-[2.5rem] overflow-hidden cursor-pointer shadow-[0_10px_40px_-10px_rgba(251,191,36,0.5)] hover:shadow-[0_20px_50px_-10px_rgba(251,191,36,0.7)] hover:-translate-y-2 transition-all duration-500 ease-out mt-4">
                                                {/* Premium Gold/Amber Base */}
                                                <div className="absolute inset-0 bg-gradient-to-br from-[#f59e0b] via-[#d97706] to-[#92400e] z-0"></div>
                                                
                                                {/* Pattern */}
                                                <div className="absolute inset-0 opacity-[0.08] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay z-0"></div>
                                                
                                                {/* Glowing Orbs */}
                                                <div className="absolute -top-20 -right-20 w-64 h-64 bg-yellow-300/30 rounded-full blur-3xl group-hover:bg-yellow-200/40 transition-all duration-700 z-0"></div>
                                                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-400/30 rounded-full blur-2xl group-hover:bg-orange-300/40 transition-all duration-700 z-0"></div>
                                                
                                                {/* Floating Icons */}
                                                <i className="fa-solid fa-graduation-cap absolute -right-4 -bottom-4 text-[120px] text-white/5 group-hover:text-yellow-100/10 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700 z-10 drop-shadow-2xl"></i>
                                                <i className="fa-solid fa-book-open absolute top-6 right-24 text-3xl text-yellow-100/20 group-hover:text-white/30 group-hover:-translate-y-4 transition-all duration-1000 z-10"></i>
                                                <i className="fa-solid fa-globe absolute bottom-8 right-32 text-4xl text-orange-200/10 group-hover:text-orange-200/20 group-hover:-translate-x-4 transition-all duration-1000 z-10"></i>
                                                
                                                {/* Content */}
                                                <div className="relative z-20 h-full flex flex-col justify-center px-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner group-hover:bg-white/20 transition-all duration-500">
                                                            <i className="fa-solid fa-layer-group text-2xl text-yellow-100 group-hover:text-white group-hover:scale-110 transition-transform duration-500"></i>
                                                        </div>
                                                        <div>
                                                            <h3 className="text-3xl font-black text-white tracking-tight drop-shadow-md">Others</h3>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="px-2 py-0.5 rounded bg-yellow-500/20 border border-yellow-400/30 text-[10px] font-black text-yellow-100 uppercase tracking-widest backdrop-blur-sm">SSC, CUET, CLAT & More</span>
                                                                <span className="w-1.5 h-1.5 rounded-full bg-orange-200 animate-pulse shadow-[0_0_8px_rgba(253,230,138,0.8)]"></span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    } else if (batch.type === 'checking') {
`;
code = code.replace(
    /\} else if \(batch\.type === 'checking'\) \{/,
    othersCardCode
);


// 5. Inject SATHEE UI inside activePracticeBatch
const satheeUiCode = `
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
                                                        <i className={\`fa-solid \${exam.icon} text-3xl text-gray-300 group-hover:text-yellow-400 group-hover:scale-110 transition-all duration-300\`}></i>
                                                    </div>
                                                    <h3 className="font-black text-lg text-white text-center group-hover:text-yellow-300">{exam.name}</h3>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {activeSatheeExam && !activeSatheeBatch && (
                                        <div className="space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
                                            {activeSatheeExam.batches.map(batch => (
                                                <div key={batch.id} onClick={() => setActiveSatheeBatch(batch)} className={\`backdrop-blur-xl bg-white/5 border border-white/10 p-5 rounded-[1.5rem] flex items-center gap-5 shadow-[0_8px_30px_rgb(0,0,0,0.2)] cursor-pointer transition-all duration-300 group hover:-translate-y-1 hover:border-\${batch.color}-500/50 hover:bg-\${batch.color}-900/30\`}>
                                                    <div className={\`w-14 h-14 rounded-2xl bg-\${batch.color}-900/30 border border-\${batch.color}-500/30 flex items-center justify-center shadow-inner group-hover:bg-\${batch.color}-500 transition-all duration-500\`}>
                                                        <i className={\`fa-solid \${batch.icon} text-2xl text-\${batch.color}-300 group-hover:text-white\`}></i>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className={\`font-black text-xl text-white group-hover:text-\${batch.color}-300 transition-colors\`}>{batch.name}</h3>
                                                        <span className={\`inline-block mt-1 px-2 py-0.5 rounded bg-\${batch.color}-500/20 border border-\${batch.color}-500/30 text-[10px] font-bold text-\${batch.color}-200\`}>{batch.medium}</span>
                                                    </div>
                                                    <i className={\`fa-solid fa-chevron-right text-gray-400 group-hover:text-\${batch.color}-400 transition-all group-hover:translate-x-1\`}></i>
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
                                                            <i className={\`fa-solid \${sub.icon} text-xl text-gray-300 group-hover:text-indigo-300\`}></i>
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
                        } else {
`;
code = code.replace(
    /\} else \{\n[ \t]*return \(\n[ \t]*<div className="pb-24 pt-4 px-5 animate-in fade-in min-h-screen">/,
    satheeUiCode + "\n                            return (\n                                <div className=\"pb-24 pt-4 px-5 animate-in fade-in min-h-screen\">"
);


fs.writeFileSync('c:/Users/risha/ATAXYbot/index.html', code);
console.log('done');