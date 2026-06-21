const fs = require('fs');

let code = fs.readFileSync('c:/Users/risha/ATAXYbot/index.html', 'utf8');

// --- 1. Checking Batch Card Level 1 ---
const oldCheckingBlock = `                                    } else {
                                        return (
                                            <div key={batch.id} onClick={() => setActivePracticeBatch(batch)} className="group relative w-full h-[100px] rounded-[2rem] overflow-hidden cursor-pointer shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out mt-4">
                                                <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 z-0"></div>
                                                <i className="fa-solid fa-vial absolute -right-2 -bottom-2 text-[60px] text-white/5 group-hover:scale-110 transition-all duration-500 z-10"></i>
                                                <div className="relative z-20 h-full flex items-center px-6 gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-gray-700 flex items-center justify-center">
                                                        <i className="fa-solid fa-flask text-gray-300"></i>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-white tracking-tight">{batch.name}</h3>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Standard Track</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }`;

const newCheckingBlock = `                                    } else {
                                        return (
                                            <div key={batch.id} onClick={() => setActivePracticeBatch(batch)} className="group relative w-full h-[100px] rounded-[2.5rem] overflow-hidden cursor-pointer shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] hover:shadow-[0_20px_50px_-10px_rgba(34,197,94,0.4)] hover:-translate-y-2 transition-all duration-500 ease-out mt-4">
                                                {/* Hacker/Laboratory Base */}
                                                <div className="absolute inset-0 bg-[#050505] z-0"></div>
                                                <div className="absolute inset-0 bg-gradient-to-br from-green-900/30 via-transparent to-black z-0"></div>
                                                
                                                {/* Matrix Pattern */}
                                                <div className="absolute inset-0 opacity-[0.15] bg-[url('https://www.transparenttextures.com/patterns/binary-code.png')] mix-blend-overlay z-0"></div>
                                                
                                                {/* Acid/Radioactive Glows */}
                                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-500/20 rounded-full blur-3xl group-hover:bg-green-400/30 transition-all duration-700 z-0"></div>
                                                <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-400/20 transition-all duration-700 z-0"></div>
                                                
                                                {/* Floating Laboratory Icons (Gaming Style) */}
                                                <i className="fa-solid fa-vial-virus absolute -right-4 -bottom-8 text-[100px] text-green-500/5 group-hover:text-green-400/20 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 z-10 drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]"></i>
                                                <i className="fa-solid fa-microscope absolute top-4 right-32 text-3xl text-purple-400/10 group-hover:text-purple-300/30 group-hover:-translate-y-2 transition-all duration-1000 z-10"></i>

                                                {/* Content */}
                                                <div className="relative z-20 h-full flex flex-col justify-center px-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-[#0f172a] border border-green-500/30 flex items-center justify-center shadow-[inset_0_0_15px_rgba(34,197,94,0.2)] group-hover:shadow-[inset_0_0_25px_rgba(34,197,94,0.4)] group-hover:border-green-400 transition-all duration-500">
                                                            <i className="fa-solid fa-flask text-2xl text-green-500 group-hover:text-green-300 group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]"></i>
                                                        </div>
                                                        <div>
                                                            <h3 className="text-2xl font-black text-white tracking-tight drop-shadow-md">{batch.name}</h3>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="px-2 py-0.5 rounded bg-green-900/40 border border-green-500/40 text-[9px] font-black text-green-400 uppercase tracking-widest backdrop-blur-sm">Standard Track</span>
                                                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(34,197,94,1)]"></span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }`;

code = code.replace(oldCheckingBlock, newCheckingBlock);


// --- 2. Deep Gaming UI in renderQuestionsView ---
// First, update the main container background
const oldContainer = `<div className="pb-24 pt-4 px-5 animate-in fade-in min-h-screen">`;
const newContainer = `<div className={\`pb-24 pt-4 px-5 animate-in fade-in min-h-screen relative overflow-hidden \${isNeet ? 'bg-[#001122]' : isJee ? 'bg-[#050B14]' : 'bg-[#0a0a0a]'}\`}>
                                    {/* Ambient background glows */}
                                    <div className={\`fixed top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 pointer-events-none \${isNeet ? 'bg-blue-600' : isJee ? 'bg-cyan-600' : 'bg-green-600'}\`}></div>
                                    <div className={\`fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[100px] opacity-20 pointer-events-none \${isNeet ? 'bg-teal-600' : isJee ? 'bg-purple-600' : 'bg-green-600'}\`}></div>
                                    <div className="relative z-10">`;

code = code.replace(oldContainer, newContainer);

// We need to add `</div>` at the end of the `if (!showQuiz) { return (...) }` block before the Quiz starts.
// But wait, the return is `return ( <div ...> ... </div> );`.
// So we just replace `</div>\n                                    </div>\n                                );\n                            }\n\n                            return (` with adding an extra `</div>` inside.
const oldReturnClose = `                                </div>
                            );
                        }

                        return (
                            <div className="pb-32 animate-pop-in relative min-h-screen bg-[#F3F4F6] text-gray-900 font-sans">`;

const newReturnClose = `                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div className="pb-32 animate-pop-in relative min-h-screen bg-[#F3F4F6] text-gray-900 font-sans">`;

code = code.replace(oldReturnClose, newReturnClose);


// Now replace specific component stylings inside `if (!showQuiz)`

// Header text colors inside deep view
code = code.replace(
    /<h2 className="text-xl font-bold text-gray-900 dark:text-white/g,
    '<h2 className="text-2xl font-black text-white drop-shadow-md tracking-tight'
);

// Back button styling
code = code.replace(
    /className="w-8 h-8 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"/g,
    'className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all backdrop-blur-md shadow-inner active:scale-95 text-white/70 hover:text-white ${isNeet ? \'bg-blue-900/30 border border-blue-500/30 hover:bg-blue-800/50\' : isJee ? \'bg-cyan-900/30 border border-cyan-500/30 hover:bg-cyan-800/50\' : \'bg-white/10 border border-white/20 hover:bg-white/20\'}`}'
);

// Subheaders (Select Question Type, Chapter Selection)
code = code.replace(
    /className=\{\`font-semibold \$\{themeText\} mb-3 uppercase tracking-wider text-xs \$\{themeLightBg\} border \$\{themeLightBorder\} inline-block px-2 py-1 rounded-md\`\}/g,
    'className={`font-black text-xs uppercase tracking-widest mb-4 inline-block px-3 py-1.5 rounded-lg border backdrop-blur-sm shadow-[0_0_15px_rgba(0,0,0,0.5)] ${isNeet ? \'text-blue-300 bg-blue-900/40 border-blue-500/30\' : isJee ? \'text-cyan-300 bg-cyan-900/40 border-cyan-500/30\' : \'text-white bg-white/10 border-white/20\'}`}'
);

// Level 5: Question Type Items
const oldQTypeDiv = /className=\{\`bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex justify-between items-center shadow-sm transition-all group \$\{qCount > 0 \? 'cursor-pointer ' \+ themeHoverBorder : 'opacity-60'\}\`\}/g;
const newQTypeDiv = 'className={`backdrop-blur-xl bg-white/5 border border-white/10 p-5 rounded-[1.5rem] flex justify-between items-center shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-300 group relative overflow-hidden ${qCount > 0 ? \'cursor-pointer hover:-translate-y-1 \' + (isNeet ? \'hover:border-blue-500/50 hover:bg-blue-900/30 hover:shadow-[0_15px_40px_rgba(0,65,141,0.5)]\' : isJee ? \'hover:border-cyan-500/50 hover:bg-cyan-900/30 hover:shadow-[0_15px_40px_rgba(6,182,212,0.3)]\' : \'hover:border-white/30 hover:bg-white/10\') : \'opacity-50 grayscale\'}`}';
code = code.replace(oldQTypeDiv, newQTypeDiv);

// Question Type text
code = code.replace(
    /<h4 className=\{\`font-semibold text-sm text-gray-800 dark:text-gray-200 \$\{themeHoverText\} transition-colors\`\}>/g,
    '<h4 className={`font-black text-lg text-white transition-colors drop-shadow-sm ${isNeet ? \'group-hover:text-blue-300\' : isJee ? \'group-hover:text-cyan-300\' : \'group-hover:text-gray-300\'}`}>'
);
// Question Type Tag
code = code.replace(
    /className="text-\[10px\] font-semibold text-gray-500 mt-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 inline-block px-2 py-0\.5 rounded-sm"/g,
    'className={`text-[10px] font-black uppercase tracking-widest mt-2 inline-block px-2.5 py-1 rounded-md border backdrop-blur-sm ${isNeet ? \'text-blue-200 bg-blue-900/30 border-blue-500/20 group-hover:bg-blue-500/20\' : isJee ? \'text-cyan-200 bg-cyan-900/30 border-cyan-500/20 group-hover:bg-cyan-500/20\' : \'text-gray-300 bg-white/5 border-white/10\'}`}'
);
// Question Type Icon
code = code.replace(
    /className=\{\`w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-400 \$\{qCount > 0 \? themeGroupHoverBg \+ ' group-hover:text-white' : ''\} transition-colors flex items-center justify-center shrink-0\`\}/g,
    'className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 ${qCount > 0 ? \'bg-white/5 border border-white/10 text-white/50 group-hover:scale-110 \' + (isNeet ? \'group-hover:bg-blue-500 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] group-hover:border-blue-400\' : isJee ? \'group-hover:bg-cyan-500 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(6,182,212,0.6)] group-hover:border-cyan-400\' : \'group-hover:bg-white group-hover:text-black\') : \'bg-white/5 text-white/20 border border-white/5\'}`}'
);


// Level 4: Chapter Selection Items
const oldChapterDiv = /className=\{\`bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex justify-between items-center shadow-sm cursor-pointer \$\{themeHoverBorder\} transition-all group\`\}/g;
const newChapterDiv = 'className={`backdrop-blur-xl bg-white/5 border border-white/10 p-5 rounded-[1.5rem] flex justify-between items-center shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-300 group relative overflow-hidden cursor-pointer hover:-translate-y-1 ${isNeet ? \'hover:border-blue-500/50 hover:bg-blue-900/30 hover:shadow-[0_15px_40px_rgba(0,65,141,0.5)]\' : isJee ? \'hover:border-cyan-500/50 hover:bg-cyan-900/30 hover:shadow-[0_15px_40px_rgba(6,182,212,0.3)]\' : \'hover:border-white/30 hover:bg-white/10\'}`}'
code = code.replace(oldChapterDiv, newChapterDiv);

// Chapter Text
code = code.replace(
    /<h4 className=\{\`font-semibold text-sm text-gray-800 dark:text-gray-200 \$\{themeHoverText\} transition-colors\`\}>/g,
    '<h4 className={`font-black text-lg text-white transition-colors drop-shadow-sm ${isNeet ? \'group-hover:text-blue-300\' : isJee ? \'group-hover:text-cyan-300\' : \'group-hover:text-gray-300\'}`}>'
);
// Chapter Chevron
code = code.replace(
    /<i className=\{\`fa-solid fa-chevron-right text-gray-400 \$\{themeHoverText\} transition-colors\`\}><\/i>/g,
    '<i className={`fa-solid fa-chevron-right text-xl transition-all duration-300 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 ${isNeet ? \'text-blue-400\' : isJee ? \'text-cyan-400\' : \'text-white\'}`}></i>'
);


// Level 3: Subject Cards
const oldSubDiv = /className=\{\`bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-md cursor-pointer \$\{themeHoverBorder\} active:scale-\[0\.98\] transition-all duration-300 flex flex-col items-center justify-center text-center group relative overflow-hidden\`\}/g;
const newSubDiv = 'className={`backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.3)] cursor-pointer active:scale-[0.98] transition-all duration-500 flex flex-col items-center justify-center text-center group relative overflow-hidden hover:-translate-y-2 ${isNeet ? \'hover:border-blue-500/50 hover:bg-blue-900/30 hover:shadow-[0_20px_50px_rgba(0,65,141,0.5)]\' : isJee ? \'hover:border-cyan-500/50 hover:bg-cyan-900/30 hover:shadow-[0_20px_50px_rgba(6,182,212,0.4)]\' : \'hover:border-white/30 hover:bg-white/10\'}`}'
code = code.replace(oldSubDiv, newSubDiv);

// Subject Watermark Icon
code = code.replace(
    /<i className=\{\`fa-solid \$\{themeIcon\} absolute -right-6 -bottom-6 text-\[80px\] opacity-5 group-hover:opacity-10 transition-opacity\`\}><\/i>/g,
    '<i className={`fa-solid ${themeIcon} absolute -right-6 -bottom-6 text-[100px] text-white/5 transition-all duration-700 group-hover:rotate-12 group-hover:scale-110 ${isNeet ? \'group-hover:text-blue-400/10\' : isJee ? \'group-hover:text-cyan-400/10\' : \'\'}`}></i>'
);
// Subject Main Icon
code = code.replace(
    /<span className="text-4xl mb-3 group-hover:-translate-y-1 transition-transform duration-300 z-10">\{sub\.icon\}<\/span>/g,
    '<div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-4xl mb-4 z-10 transition-all duration-500 shadow-inner ${isNeet ? \'bg-blue-900/30 text-blue-200 border border-blue-500/20 group-hover:bg-blue-500/20 group-hover:border-blue-400/50 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]\' : isJee ? \'bg-cyan-900/30 text-cyan-200 border border-cyan-500/20 group-hover:bg-cyan-500/20 group-hover:border-cyan-400/50 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]\' : \'bg-white/10 text-white border border-white/20 group-hover:scale-110\'}`}>{sub.icon}</div>'
);
// Subject Title
code = code.replace(
    /<h3 className=\{\`font-bold text-gray-800 dark:text-gray-200 mt-2 z-10 \$\{themeHoverText\} transition-colors\`\}>/g,
    '<h3 className={`font-black text-2xl text-white mt-2 z-10 transition-colors drop-shadow-md ${isNeet ? \'group-hover:text-blue-300\' : isJee ? \'group-hover:text-cyan-300\' : \'group-hover:text-white\'}`}>'
);
// Subject Tag
code = code.replace(
    /<p className="text-\[10px\] text-gray-500 mt-1">\{sub\.chapters\?\.length \|\| 0\} Chapters<\/p>/g,
    '<p className={`text-[10px] font-black uppercase tracking-widest mt-2 z-10 transition-colors ${isNeet ? \'text-blue-200/50 group-hover:text-blue-200\' : isJee ? \'text-cyan-200/50 group-hover:text-cyan-200\' : \'text-white/50 group-hover:text-white\'}`}>{sub.chapters?.length || 0} Chapters</p>'
);


// Level 2: Mode Selection Items
const oldModeDiv = /className=\{\`bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center gap-4 shadow-sm cursor-pointer \$\{themeHoverBorder\} transition-all group overflow-hidden relative\`\}/g;
const newModeDiv = 'className={`backdrop-blur-xl bg-white/5 border border-white/10 p-5 rounded-[1.5rem] flex items-center gap-5 shadow-[0_8px_30px_rgb(0,0,0,0.2)] cursor-pointer transition-all duration-300 group overflow-hidden relative hover:-translate-y-1 ${isNeet ? \'hover:border-blue-500/50 hover:bg-blue-900/30 hover:shadow-[0_15px_40px_rgba(0,65,141,0.5)]\' : isJee ? \'hover:border-cyan-500/50 hover:bg-cyan-900/30 hover:shadow-[0_15px_40px_rgba(6,182,212,0.3)]\' : \'hover:border-white/30 hover:bg-white/10\'}`}'
code = code.replace(oldModeDiv, newModeDiv);

const oldModeTestsDiv = /className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center gap-4 shadow-sm cursor-pointer hover:border-purple-500 dark:hover:border-purple-500 transition-all group"/g;
const newModeTestsDiv = 'className={`backdrop-blur-xl bg-white/5 border border-white/10 p-5 rounded-[1.5rem] flex items-center gap-5 shadow-[0_8px_30px_rgb(0,0,0,0.2)] cursor-pointer transition-all duration-300 group overflow-hidden relative hover:-translate-y-1 hover:border-purple-500/50 hover:bg-purple-900/30 hover:shadow-[0_15px_40px_rgba(168,85,247,0.3)]`}'
code = code.replace(oldModeTestsDiv, newModeTestsDiv);

const oldModeCustDiv = /className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center gap-4 shadow-sm cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-all group"/g;
const newModeCustDiv = 'className={`backdrop-blur-xl bg-white/5 border border-white/10 p-5 rounded-[1.5rem] flex items-center gap-5 shadow-[0_8px_30px_rgb(0,0,0,0.2)] cursor-pointer transition-all duration-300 group overflow-hidden relative hover:-translate-y-1 hover:border-blue-500/50 hover:bg-blue-900/30 hover:shadow-[0_15px_40px_rgba(59,130,246,0.3)]`}'
code = code.replace(oldModeCustDiv, newModeCustDiv);

// Mode Icon Blocks
code = code.replace(
    /<div className=\{\`w-12 h-12 rounded-xl \$\{themeLightBg\} border \$\{themeLightBorder\} \$\{themeText\} flex items-center justify-center text-xl z-10\`\}/g,
    '<div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl z-10 shadow-inner transition-all duration-500 ${isNeet ? \'bg-blue-900/30 border border-blue-500/30 text-blue-300 group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-400 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.6)]\' : isJee ? \'bg-cyan-900/30 border border-cyan-500/30 text-cyan-300 group-hover:bg-cyan-500 group-hover:text-white group-hover:border-cyan-400 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.6)]\' : \'bg-white/10 border border-white/20 text-white\'}`}'
);
code = code.replace(
    /<div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900\/20 border border-purple-200 dark:border-purple-800 text-purple-500 flex items-center justify-center text-xl"/g,
    '<div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl z-10 shadow-inner transition-all duration-500 bg-purple-900/30 border border-purple-500/30 text-purple-300 group-hover:bg-purple-500 group-hover:text-white group-hover:border-purple-400 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.6)]"'
);
code = code.replace(
    /<div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900\/20 border border-blue-200 dark:border-blue-800 text-blue-500 flex items-center justify-center text-xl"/g,
    '<div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl z-10 shadow-inner transition-all duration-500 bg-blue-900/30 border border-blue-500/30 text-blue-300 group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-400 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.6)]"'
);

// Mode Titles
code = code.replace(
    /<h3 className=\{\`font-bold text-lg text-gray-800 dark:text-gray-200 \$\{themeHoverText\} transition-colors z-10 relative\`\}>Practice Modules<\/h3>/g,
    '<h3 className={`font-black text-xl text-white transition-colors drop-shadow-md z-10 relative ${isNeet ? \'group-hover:text-blue-300\' : isJee ? \'group-hover:text-cyan-300\' : \'group-hover:text-white\'}`}>Practice Modules</h3>'
);
code = code.replace(
    /<h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 group-hover:text-purple-500 transition-colors">Tests<\/h3>/g,
    '<h3 className="font-black text-xl text-white transition-colors drop-shadow-md group-hover:text-purple-300">Tests</h3>'
);
code = code.replace(
    /<h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 group-hover:text-blue-500 transition-colors">Custom Generator<\/h3>/g,
    '<h3 className="font-black text-xl text-white transition-colors drop-shadow-md group-hover:text-blue-300">Custom Generator</h3>'
);
// Mode Descriptions
code = code.replace(
    /<p className="text-xs text-gray-500 font-medium">/g,
    '<p className="text-xs text-gray-400 font-bold mt-1">'
);


fs.writeFileSync('c:/Users/risha/ATAXYbot/index.html', code);
console.log('Deep Gaming Theme injected successfully!');
