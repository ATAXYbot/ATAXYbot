const fs = require('fs');
let content = fs.readFileSync('c:/Users/risha/ATAXYbot/index.html', 'utf8');

// 1. Remove Mastery Streak
const streakStartStr = '                            {/* Mastery Streak */}\r\n';
const streakEndStr = '                            {/* Performance Overview Grid */}';

const streakStartIdx = content.indexOf(streakStartStr);
const streakEndIdx = content.indexOf(streakEndStr);

if (streakStartIdx !== -1 && streakEndIdx !== -1) {
    content = content.substring(0, streakStartIdx) + content.substring(streakEndIdx);
} else {
    // try \n instead of \r\n
    const altStartIdx = content.indexOf('                            {/* Mastery Streak */}\n');
    if (altStartIdx !== -1 && streakEndIdx !== -1) {
        content = content.substring(0, altStartIdx) + content.substring(streakEndIdx);
    } else {
        console.log('WARNING: Mastery Streak not found!');
    }
}

// 2. Expand Performance Grid
const gridStartStr = '                            <div className="grid grid-cols-2 gap-4 mb-8">\r\n';
const gridEndStr = '                            {/* Detailed Analytics Block */}';

const gridStartIdx = content.indexOf(gridStartStr);
const gridEndIdx = content.indexOf(gridEndStr);

if (gridStartIdx !== -1 && gridEndIdx !== -1) {
    const newGrid = `                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-800/60 flex flex-col justify-center items-center text-center cursor-pointer group active:scale-95 transition-all relative overflow-hidden" onClick={() => setHistoryViewType('correct')}>
                                    <div className="absolute -inset-2 bg-gradient-to-br from-emerald-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl blur-xl"></div>
                                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/20 border border-emerald-100 dark:border-emerald-800 text-emerald-500 dark:text-emerald-400 rounded-2xl flex items-center justify-center text-3xl mb-3 shadow-sm group-hover:scale-110 transition-transform duration-300 transform rotate-3 group-hover:rotate-0"><i className="fa-solid fa-bullseye"></i></div>
                                    <h4 className="font-black text-gray-900 dark:text-white text-3xl tracking-tight">{accuracy}<span className="text-xl text-emerald-500">%</span></h4>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mt-1 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full">{totalCorrect}/{totalAttempted} Correct</p>
                                </div>
                                <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-800/60 flex flex-col justify-center items-center text-center cursor-pointer group active:scale-95 transition-all relative overflow-hidden" onClick={() => setHistoryViewType('bookmarks')}>
                                    <div className="absolute -inset-2 bg-gradient-to-br from-amber-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl blur-xl"></div>
                                    <div className="w-16 h-16 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/20 border border-amber-100 dark:border-amber-800 text-amber-500 dark:text-amber-400 rounded-2xl flex items-center justify-center text-3xl mb-3 shadow-sm group-hover:scale-110 transition-transform duration-300 transform -rotate-3 group-hover:rotate-0"><i className="fa-solid fa-bookmark"></i></div>
                                    <h4 className="font-black text-gray-900 dark:text-white text-3xl tracking-tight">{bookmarks.length}</h4>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mt-1 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full">Bookmarked</p>
                                </div>
                                <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-800/60 flex flex-col justify-center items-center text-center cursor-pointer group active:scale-95 transition-all relative overflow-hidden" onClick={() => setHistoryViewType('incorrect')}>
                                    <div className="absolute -inset-2 bg-gradient-to-br from-red-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl blur-xl"></div>
                                    <div className="w-16 h-16 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/20 border border-red-100 dark:border-red-800 text-red-500 dark:text-red-400 rounded-2xl flex items-center justify-center text-3xl mb-3 shadow-sm group-hover:scale-110 transition-transform duration-300 transform rotate-3 group-hover:rotate-0"><i className="fa-solid fa-xmark"></i></div>
                                    <h4 className="font-black text-gray-900 dark:text-white text-3xl tracking-tight">{totalIncorrect}</h4>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mt-1 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full">Incorrect</p>
                                </div>
                                <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-800/60 flex flex-col justify-center items-center text-center cursor-pointer group active:scale-95 transition-all relative overflow-hidden" onClick={() => setHistoryViewType('notes')}>
                                    <div className="absolute -inset-2 bg-gradient-to-br from-purple-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl blur-xl"></div>
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/20 border border-purple-100 dark:border-purple-800 text-purple-500 dark:text-purple-400 rounded-2xl flex items-center justify-center text-3xl mb-3 shadow-sm group-hover:scale-110 transition-transform duration-300 transform -rotate-3 group-hover:rotate-0"><i className="fa-solid fa-pen-to-square"></i></div>
                                    <h4 className="font-black text-gray-900 dark:text-white text-3xl tracking-tight">{Object.keys(questionNotes || {}).length}</h4>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mt-1 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full">Notes</p>
                                </div>
                            </div>

\r\n`;
    content = content.substring(0, gridStartIdx) + newGrid + content.substring(gridEndIdx);
} else {
    // try without \r\n
    const altGridStartIdx = content.indexOf('                            <div className="grid grid-cols-2 gap-4 mb-8">\n');
    if (altGridStartIdx !== -1 && gridEndIdx !== -1) {
        const newGrid = `                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-800/60 flex flex-col justify-center items-center text-center cursor-pointer group active:scale-95 transition-all relative overflow-hidden" onClick={() => setHistoryViewType('correct')}>
                                    <div className="absolute -inset-2 bg-gradient-to-br from-emerald-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl blur-xl"></div>
                                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/20 border border-emerald-100 dark:border-emerald-800 text-emerald-500 dark:text-emerald-400 rounded-2xl flex items-center justify-center text-3xl mb-3 shadow-sm group-hover:scale-110 transition-transform duration-300 transform rotate-3 group-hover:rotate-0"><i className="fa-solid fa-bullseye"></i></div>
                                    <h4 className="font-black text-gray-900 dark:text-white text-3xl tracking-tight">{accuracy}<span className="text-xl text-emerald-500">%</span></h4>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mt-1 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full">{totalCorrect}/{totalAttempted} Correct</p>
                                </div>
                                <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-800/60 flex flex-col justify-center items-center text-center cursor-pointer group active:scale-95 transition-all relative overflow-hidden" onClick={() => setHistoryViewType('bookmarks')}>
                                    <div className="absolute -inset-2 bg-gradient-to-br from-amber-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl blur-xl"></div>
                                    <div className="w-16 h-16 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/20 border border-amber-100 dark:border-amber-800 text-amber-500 dark:text-amber-400 rounded-2xl flex items-center justify-center text-3xl mb-3 shadow-sm group-hover:scale-110 transition-transform duration-300 transform -rotate-3 group-hover:rotate-0"><i className="fa-solid fa-bookmark"></i></div>
                                    <h4 className="font-black text-gray-900 dark:text-white text-3xl tracking-tight">{bookmarks.length}</h4>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mt-1 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full">Bookmarked</p>
                                </div>
                                <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-800/60 flex flex-col justify-center items-center text-center cursor-pointer group active:scale-95 transition-all relative overflow-hidden" onClick={() => setHistoryViewType('incorrect')}>
                                    <div className="absolute -inset-2 bg-gradient-to-br from-red-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl blur-xl"></div>
                                    <div className="w-16 h-16 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/20 border border-red-100 dark:border-red-800 text-red-500 dark:text-red-400 rounded-2xl flex items-center justify-center text-3xl mb-3 shadow-sm group-hover:scale-110 transition-transform duration-300 transform rotate-3 group-hover:rotate-0"><i className="fa-solid fa-xmark"></i></div>
                                    <h4 className="font-black text-gray-900 dark:text-white text-3xl tracking-tight">{totalIncorrect}</h4>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mt-1 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full">Incorrect</p>
                                </div>
                                <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-800/60 flex flex-col justify-center items-center text-center cursor-pointer group active:scale-95 transition-all relative overflow-hidden" onClick={() => setHistoryViewType('notes')}>
                                    <div className="absolute -inset-2 bg-gradient-to-br from-purple-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl blur-xl"></div>
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/20 border border-purple-100 dark:border-purple-800 text-purple-500 dark:text-purple-400 rounded-2xl flex items-center justify-center text-3xl mb-3 shadow-sm group-hover:scale-110 transition-transform duration-300 transform -rotate-3 group-hover:rotate-0"><i className="fa-solid fa-pen-to-square"></i></div>
                                    <h4 className="font-black text-gray-900 dark:text-white text-3xl tracking-tight">{Object.keys(questionNotes || {}).length}</h4>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mt-1 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full">Notes</p>
                                </div>
                            </div>\n\n`;
        content = content.substring(0, altGridStartIdx) + newGrid + content.substring(gridEndIdx);
    } else {
        console.log('WARNING: Grid not found!');
    }
}

// 3. Add notes to filter logic
content = content.replace(
    "else if (historyViewType === 'incorrect' && isAns && !isCorrect) include = true;",
    "else if (historyViewType === 'incorrect' && isAns && !isCorrect) include = true;\n                                else if (historyViewType === 'notes' && questionNotes[q.id]) include = true;"
);

// 4. Add notes to config object
content = content.replace(
    /incorrect:\s*{\s*title:\s*'Mistakes to Review'[\s\S]*?}/,
    `incorrect: {
                        title: 'Mistakes to Review', icon: 'fa-times-circle', emptyMsg: 'Amazing! No mistakes found.',
                        headerText: 'text-red-600 dark:text-red-500', badgeBg: 'bg-red-100 dark:bg-red-900/30', badgeText: 'text-red-800 dark:text-red-500', focusRing: 'focus:ring-red-500', borderIcon: 'border-red-200', tagBg: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    },
                    notes: {
                        title: 'Personal Notes', icon: 'fa-pen-to-square', emptyMsg: 'No personal notes found.',
                        headerText: 'text-purple-600 dark:text-purple-500', badgeBg: 'bg-purple-100 dark:bg-purple-900/30', badgeText: 'text-purple-800 dark:text-purple-500', focusRing: 'focus:ring-purple-500', borderIcon: 'border-purple-200', tagBg: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                    }`
);

// 5. Wrap history viewer in createPortal
// Search for "return (" then search for "const renderAnalyticsModal = () => {" within renderHistoryViewer
const renderHistoryViewerStart = content.indexOf('const renderHistoryViewer = () => {');
const analyticsModalStart = content.indexOf('const renderAnalyticsModal = () => {');

let historyViewerContent = content.substring(renderHistoryViewerStart, analyticsModalStart);

historyViewerContent = historyViewerContent.replace(
    /return \(\s*<div className="fixed inset-x-0 bottom-0 top-\[max\(env\(safe-area-inset-top\),_24px\)\] z-\[2000000\]/,
    'return ReactDOM.createPortal(\n                    <div className="fixed inset-x-0 bottom-0 top-[max(env(safe-area-inset-top),_24px)] z-[2000000]'
);

// Find the last </div> before the end of the history viewer content and replace with </div>, document.body
const lastDivIdx = historyViewerContent.lastIndexOf('</div>\n                );\n            };');
if (lastDivIdx !== -1) {
    historyViewerContent = historyViewerContent.substring(0, lastDivIdx) + '</div>, document.body\n                );\n            };' + historyViewerContent.substring(lastDivIdx + '</div>\n                );\n            };'.length);
} else {
    const altLastDivIdx = historyViewerContent.lastIndexOf('</div>\r\n                );\r\n            };');
    if (altLastDivIdx !== -1) {
        historyViewerContent = historyViewerContent.substring(0, altLastDivIdx) + '</div>, document.body\r\n                );\r\n            };' + historyViewerContent.substring(altLastDivIdx + '</div>\r\n                );\r\n            };'.length);
    } else {
        console.log('WARNING: Could not find closing div for history viewer portal.');
    }
}

content = content.substring(0, renderHistoryViewerStart) + historyViewerContent + content.substring(analyticsModalStart);

fs.writeFileSync('c:/Users/risha/ATAXYbot/index.html', content, 'utf8');
console.log('All updates applied!');
