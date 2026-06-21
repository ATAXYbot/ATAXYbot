const fs = require('fs');
let code = fs.readFileSync('temp_theme.js', 'utf8');

// Inject variables at the top
const variables = `                    const isNeet = activePracticeBatch?.type === 'neet';
                    const isJee = activePracticeBatch?.type === 'jee';
                    const themeText = isNeet ? 'text-[#00a651]' : isJee ? 'text-[#00418d]' : 'text-gray-800 dark:text-gray-200';
                    const themeBg = isNeet ? 'bg-[#00a651]' : isJee ? 'bg-[#00418d]' : 'bg-gray-800';
                    const themeBorder = isNeet ? 'border-[#00a651]' : isJee ? 'border-[#00418d]' : 'border-gray-800';
                    const themeHoverBorder = isNeet ? 'hover:border-[#00a651] dark:hover:border-[#00a651]' : isJee ? 'hover:border-[#00418d] dark:hover:border-[#00418d]' : 'hover:border-gray-400 dark:hover:border-gray-500';
                    const themeHoverText = isNeet ? 'group-hover:text-[#00a651]' : isJee ? 'group-hover:text-[#00418d]' : 'group-hover:text-gray-600 dark:group-hover:text-gray-300';
                    const themeGroupHoverBg = isNeet ? 'group-hover:bg-[#00a651]' : isJee ? 'group-hover:bg-[#00418d]' : 'group-hover:bg-gray-700';
                    const themeLightBg = isNeet ? 'bg-green-50 dark:bg-green-900/20' : isJee ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-gray-900/20';
                    const themeLightBorder = isNeet ? 'border-green-200 dark:border-green-800' : isJee ? 'border-blue-200 dark:border-blue-800' : 'border-gray-200 dark:border-gray-800';
                    const themeRing = isNeet ? 'ring-[#00a651]' : isJee ? 'ring-[#00418d]' : 'ring-gray-800';
                    const themeIcon = isNeet ? 'fa-stethoscope' : isJee ? 'fa-microchip' : 'fa-book';
                    const themeActiveBg = isNeet ? 'bg-[#008c44]' : isJee ? 'bg-[#002f6c]' : 'bg-gray-900';
`;

code = code.replace('try {', 'try {\n' + variables);

// --- Replacements for Question Type / Chapter / Subject ---
// Heading
code = code.replace(
    /className="font-semibold text-\[#00a651\] mb-3 uppercase tracking-wider text-xs bg-green-50 dark:bg-green-900\/20 border border-green-200 dark:border-green-800 inline-block px-2 py-1 rounded-md"/g,
    'className={`font-semibold ${themeText} mb-3 uppercase tracking-wider text-xs ${themeLightBg} border ${themeLightBorder} inline-block px-2 py-1 rounded-md`}'
);

// Card logic (hover border)
code = code.replace(
    /className={`bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex justify-between items-center shadow-sm transition-all group \${qCount > 0 \? 'cursor-pointer hover:border-\[#00a651\] dark:hover:border-\[#00a651\]' : 'opacity-60'}`}/g,
    'className={`bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex justify-between items-center shadow-sm transition-all group ${qCount > 0 ? \'cursor-pointer \' + themeHoverBorder : \'opacity-60\'}`}'
);
code = code.replace(
    /className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex justify-between items-center shadow-sm cursor-pointer hover:border-\[#00a651\] dark:hover:border-\[#00a651\] transition-all group"/g,
    'className={`bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex justify-between items-center shadow-sm cursor-pointer ${themeHoverBorder} transition-all group`}'
);
code = code.replace(
    /className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-md cursor-pointer hover:border-\[#00a651\] dark:hover:border-\[#00a651\] active:scale-\[0\.98\] transition-all duration-300 flex flex-col items-center justify-center text-center group"/g,
    'className={`bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-md cursor-pointer ${themeHoverBorder} active:scale-[0.98] transition-all duration-300 flex flex-col items-center justify-center text-center group relative overflow-hidden`}'
);

// Text hover inside card
code = code.replace(
    /className="font-semibold text-sm text-gray-800 dark:text-gray-200 group-hover:text-\[#00a651\] transition-colors"/g,
    'className={`font-semibold text-sm text-gray-800 dark:text-gray-200 ${themeHoverText} transition-colors`}'
);
code = code.replace(
    /className="font-bold text-gray-800 dark:text-gray-200 mt-2 group-hover:text-\[#00a651\] transition-colors"/g,
    'className={`font-bold text-gray-800 dark:text-gray-200 mt-2 z-10 ${themeHoverText} transition-colors`}'
);

// Icon background inside card (Question Type Play icon)
code = code.replace(
    /className={`w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-400 \${qCount > 0 \? 'group-hover:bg-\[#00a651\] group-hover:text-white' : ''} transition-colors flex items-center justify-center shrink-0`}/g,
    'className={`w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-400 ${qCount > 0 ? themeGroupHoverBg + \' group-hover:text-white\' : \'\'} transition-colors flex items-center justify-center shrink-0`}'
);

// Chevron icon hover
code = code.replace(
    /className="fa-solid fa-chevron-right text-gray-400 group-hover:text-\[#00a651\] transition-colors"/g,
    'className={`fa-solid fa-chevron-right text-gray-400 ${themeHoverText} transition-colors`}'
);

// Subject icons bg addition (Watermark)
code = code.replace(
    /<span className="text-4xl mb-3 group-hover:-translate-y-1 transition-transform duration-300">{sub\.icon}<\/span>/g,
    `<span className="text-4xl mb-3 group-hover:-translate-y-1 transition-transform duration-300 z-10">{sub.icon}</span>\n<i className={\`fa-solid \${themeIcon} absolute -right-6 -bottom-6 text-[80px] opacity-5 group-hover:opacity-10 transition-opacity\`}></i>`
);

// Practice Modes Selectors "Practice Modules"
code = code.replace(
    /className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center gap-4 shadow-sm cursor-pointer hover:border-\[#00a651\] dark:hover:border-\[#00a651\] transition-all group"/g,
    'className={`bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center gap-4 shadow-sm cursor-pointer ${themeHoverBorder} transition-all group overflow-hidden relative`}'
);
code = code.replace(
    /className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900\/20 border border-green-200 dark:border-green-800 text-\[#00a651\] flex items-center justify-center text-xl"/g,
    'className={`w-12 h-12 rounded-xl ${themeLightBg} border ${themeLightBorder} ${themeText} flex items-center justify-center text-xl z-10`}'
);
code = code.replace(
    /className="font-bold text-lg text-gray-800 dark:text-gray-200 group-hover:text-\[#00a651\] transition-colors"/g,
    'className={`font-bold text-lg text-gray-800 dark:text-gray-200 ${themeHoverText} transition-colors z-10 relative`}'
);
code = code.replace(
    /<div className="flex-1">/g,
    '<div className="flex-1 relative z-10">'
);
code = code.replace(
    /div onClick=\{\(\) => setActivePracticeMode\('practice'\)\}([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/,
    match => match.replace('</div>\n                                    </div>\n                                </div>', '</div>\n                                        <i className={`fa-solid ${themeIcon} absolute -right-4 -bottom-4 text-6xl opacity-5 group-hover:scale-110 transition-transform`}></i>\n                                    </div>\n                                </div>')
);


// --- Replacements for Quiz UI ---
// Quiz Header Bg
code = code.replace(
    /className="px-4 py-3 flex items-center justify-between bg-\[#00418d\] text-white shadow-md relative z-20"/g,
    'className={`px-4 py-3 flex items-center justify-between ${themeBg} text-white shadow-md relative z-20`}'
);

// Quiz Options Border/Ring
code = code.replace(
    /btnClass = "bg-\[#00418d\] border-\[#00418d\] text-white ring-2 ring-\[#00418d\] ring-offset-2 z-10";/g,
    'btnClass = `${themeBg} ${themeBorder} text-white ring-2 ${themeRing} ring-offset-2 z-10`;'
);
// Quiz Option Ring when activePracticeIndex
code = code.replace(
    /safeQuestionIndex === qIdx \? 'ring-2 ring-\[#00418d\] ring-offset-1' : ''/g,
    'safeQuestionIndex === qIdx ? `ring-2 ${themeRing} ring-offset-1` : \'\''
);

// Quiz Filters buttons active
code = code.replace(
    /bg-\[#00418d\] text-white border-\[#00418d\]/g,
    '${themeBg} text-white ${themeBorder}'
);

// Quiz clear filter button
code = code.replace(
    /className="bg-\[#00418d\] text-white font-semibold text-sm px-4 py-2 rounded-sm mt-2 transition-colors hover:bg-blue-800"/g,
    'className={`text-white font-semibold text-sm px-4 py-2 rounded-sm mt-2 transition-colors ${themeBg} ${themeHoverBorder}`}'
);

// Palette Button
code = code.replace(
    /className="ml-2 bg-\[#00418d\] text-white px-3 py-1\.5 rounded-sm text-xs font-bold shrink-0 shadow-sm active:scale-95 transition-transform"/g,
    'className={`ml-2 ${themeBg} text-white px-3 py-1.5 rounded-sm text-xs font-bold shrink-0 shadow-sm active:scale-95 transition-transform`}'
);

// Palette Header
code = code.replace(
    /className="bg-\[#00418d\] text-white p-3 flex justify-between items-center shadow-md z-10 shrink-0"/g,
    'className={`${themeBg} text-white p-3 flex justify-between items-center shadow-md z-10 shrink-0`}'
);

// Topic Dropdown Theming (Enhanced Select UI)
// We add a nice wrapper around the select.
const oldSelect = `<select
                                            value={practiceSelectedTopic || ""}
                                            onChange={(e) => {
                                                setPracticeSelectedTopic(e.target.value || null);
                                                setCurrentQuestionIndex(0);
                                            }}
                                            className="border border-gray-300 rounded-sm text-xs font-semibold px-2 py-1.5 bg-gray-50 text-gray-800 outline-none hover:border-[#00418d] focus:border-[#00418d] max-w-[140px] md:max-w-[200px] shrink-0 cursor-pointer transition-colors"
                                        >
                                            <option value="">All Topics</option>
                                            {activePracticeChapter.topics?.map((top, i) => (
                                                <option key={i} value={top.name}>{top.name}</option>
                                            ))}
                                        </select>`;

const newSelect = `<div className={\`relative flex items-center border rounded-sm transition-all \${practiceSelectedTopic ? themeBorder + ' ' + themeLightBg : 'border-gray-300 bg-white hover:border-gray-400'}\`}>
                                            <div className={\`absolute left-2 \${practiceSelectedTopic ? themeText : 'text-gray-400'} pointer-events-none\`}>
                                                <i className="fa-solid fa-filter text-[10px]"></i>
                                            </div>
                                            <select
                                                value={practiceSelectedTopic || ""}
                                                onChange={(e) => {
                                                    setPracticeSelectedTopic(e.target.value || null);
                                                    setCurrentQuestionIndex(0);
                                                }}
                                                className={\`appearance-none pl-6 pr-6 py-1.5 text-xs font-bold outline-none cursor-pointer w-[140px] md:w-[180px] bg-transparent truncate \${practiceSelectedTopic ? themeText : 'text-gray-600'}\`}
                                            >
                                                <option value="">All Topics</option>
                                                {activePracticeChapter.topics?.map((top, i) => (
                                                    <option key={i} value={top.name}>{top.name}</option>
                                                ))}
                                            </select>
                                            <div className={\`absolute right-2 \${practiceSelectedTopic ? themeText : 'text-gray-400'} pointer-events-none\`}>
                                                <i className="fa-solid fa-chevron-down text-[10px]"></i>
                                            </div>
                                        </div>`;

code = code.replace(oldSelect, newSelect);


// Finally, let's read index.html, slice out renderQuestionsView, and inject our themed one.
const indexCode = fs.readFileSync('c:/Users/risha/ATAXYbot/index.html', 'utf8');
const lines = indexCode.split('\n');

const startFn = lines.findIndex(l => l.includes('const renderQuestionsView = () => {'));
const endFn = lines.findIndex((l, i) => i > startFn && l.includes('// --- UNIFIED HISTORY VIEWER'));

lines.splice(startFn, endFn - startFn, code);

fs.writeFileSync('c:/Users/risha/ATAXYbot/index.html', lines.join('\n'));
console.log('Theming applied!');
