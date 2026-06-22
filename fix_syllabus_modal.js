const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

if (!code.includes('const [syllabusTest, setSyllabusTest]')) {
    code = code.replace(/const \[historyFilter, setHistoryFilter\] = useState\('all'\);/, "const [historyFilter, setHistoryFilter] = useState('all');\n            const [syllabusTest, setSyllabusTest] = useState(null);");
}

const targetRegex = /<div className="bg-gray-50 dark:bg-gray-800\/50 p-3 rounded-xl flex-1 text-center border border-gray-100 dark:border-gray-800">\s*<div className="text-gray-400 text-\[10px\] font-bold uppercase tracking-widest mb-1">Score<\/div>\s*<div className="text-2xl font-black text-gray-800 dark:text-gray-200">\{test\.score \|\| 0\} <span className="text-sm text-gray-400 font-bold">\/ \{test\.totalMarks\}<\/span><\/div>\s*<\/div>\s*<div className="bg-gray-50 dark:bg-gray-800\/50 p-3 rounded-xl flex-1 text-center border border-gray-100 dark:border-gray-800">\s*<div className="text-gray-400 text-\[10px\] font-bold uppercase tracking-widest mb-1">Accuracy<\/div>\s*<div className="text-2xl font-black text-gray-800 dark:text-gray-200">\{test\.accuracy \? Math\.round\(test\.accuracy\) : 0\}%<\/div>\s*<\/div>/m;

const replacement = `<div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded-xl flex-1 text-center border border-gray-100 dark:border-gray-800">
                                                            <div className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">Score</div>
                                                            <div className="text-xl font-black text-gray-800 dark:text-gray-200">{test.score || 0} <span className="text-xs text-gray-400 font-bold">/ {test.totalMarks}</span></div>
                                                        </div>
                                                        <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded-xl flex-1 text-center border border-gray-100 dark:border-gray-800">
                                                            <div className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">Accuracy</div>
                                                            <div className="text-xl font-black text-gray-800 dark:text-gray-200">{test.accuracy ? Math.round(test.accuracy) : 0}%</div>
                                                        </div>
                                                        {test.config && (
                                                            <div onClick={() => setSyllabusTest(test)} className="bg-purple-50 dark:bg-purple-900/30 p-2 rounded-xl flex-1 text-center border border-purple-100 dark:border-purple-800 cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors flex flex-col justify-center items-center">
                                                                <i className="fa-solid fa-list text-purple-500 mb-1"></i>
                                                                <div className="text-purple-600 dark:text-purple-300 text-[10px] font-bold uppercase tracking-widest">Syllabus</div>
                                                            </div>
                                                        )}`;

if (code.match(targetRegex)) {
    code = code.replace(targetRegex, replacement);
    console.log('Replaced history card buttons');
} else {
    console.log('Could not find history card buttons');
}

const modalBlock = `{syllabusTest && (
                                            <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 animate-in fade-in" onClick={() => setSyllabusTest(null)}>
                                                <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                                                    <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                                                        <div>
                                                            <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight">Test Syllabus</h3>
                                                            <p className="text-xs text-gray-500 font-bold mt-1">{syllabusTest.name || 'Custom Test'}</p>
                                                        </div>
                                                        <button onClick={() => setSyllabusTest(null)} className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center hover:bg-gray-300 transition-colors"><i className="fa-solid fa-xmark"></i></button>
                                                    </div>
                                                    <div className="p-6 overflow-y-auto custom-scrollbar">
                                                        {syllabusTest.type === 'dpp' ? (
                                                            <div className="space-y-4">
                                                                <div>
                                                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Subject</div>
                                                                    <div className="font-bold text-gray-900 dark:text-white text-lg">{syllabusTest.config.dppSubject}</div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Chapter</div>
                                                                    <div className="font-bold text-gray-900 dark:text-white">{syllabusTest.config.dppChapter}</div>
                                                                </div>
                                                                {syllabusTest.config.dppTopics?.length > 0 && (
                                                                    <div>
                                                                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Selected Topics</div>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {syllabusTest.config.dppTopics.map((t, idx) => (
                                                                                <span key={idx} className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1.5 rounded-lg text-sm font-bold border border-purple-200 dark:border-purple-800/50">{t}</span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-6">
                                                                {Object.entries(syllabusTest.config?.subjects || {}).map(([sub, chaps]) => (
                                                                    <div key={sub} className="bg-gray-50 dark:bg-gray-800/30 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                                                                        <h4 className="font-black text-lg text-gray-900 dark:text-white mb-3 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div>{sub}</h4>
                                                                        {chaps.length === 0 ? (
                                                                            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg text-sm font-bold border border-blue-200 dark:border-blue-800/50">All Chapters</span>
                                                                        ) : (
                                                                            <div className="flex flex-wrap gap-2">
                                                                                {chaps.map((c, idx) => (
                                                                                    <span key={idx} className="bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg text-sm font-bold border border-gray-200 dark:border-gray-700">{c}</span>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}`;

if (!code.includes('syllabusTest && (')) {
    code = code.replace(/<div className="flex overflow-x-auto gap-2 mb-6 pb-2 no-scrollbar">/, modalBlock + '\n                                        <div className="flex overflow-x-auto gap-2 mb-6 pb-2 no-scrollbar">');
}

fs.writeFileSync('index.html', code);
console.log('Fixed syllabus modal');
