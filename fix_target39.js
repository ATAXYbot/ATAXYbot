const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// 1. Fix the small Target list Edit button (Home Tab)
const smallEditTarget = `className="text-blue-500 md:text-gray-500 hover:text-blue-500 hover:bg-blue-500/10 w-8 h-8 rounded-full flex items-center justify-center transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"`;
const smallEditReplacement = `className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 w-8 h-8 rounded-full flex items-center justify-center transition-all opacity-100"`;
content = content.replace(new RegExp(smallEditTarget.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), smallEditReplacement);

// 2. Add the missing Edit button to the LARGE Target Portal list
// Look for the delete button in the large portal
const deleteBtnTarget = `<button onClick={() => {
                                                                const updated = group.targets.filter(x => x.id !== t.id);
                                                                setTargetsData({ ...targetsData, [group.date]: updated });
                                                            }} className="w-8 h-8 rounded-full text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-colors shrink-0">
                                                                <i className="fa-solid fa-trash text-xs"></i>
                                                            </button>`;

const newActionButtons = `<div className="flex items-center gap-1 shrink-0">
                                                                <button onClick={(e) => { e.stopPropagation(); setEditingTarget({ ...t, _date: group.date }); }} className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 w-8 h-8 rounded-full flex items-center justify-center transition-all opacity-100">
                                                                    <i className="fa-solid fa-pen text-xs"></i>
                                                                </button>
                                                                <button onClick={() => {
                                                                    const updated = group.targets.filter(x => x.id !== t.id);
                                                                    setTargetsData({ ...targetsData, [group.date]: updated });
                                                                }} className="w-8 h-8 rounded-full text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-colors">
                                                                    <i className="fa-solid fa-trash text-xs"></i>
                                                                </button>
                                                            </div>`;

// If it hasn't been replaced yet
if (content.includes(deleteBtnTarget)) {
    content = content.replace(deleteBtnTarget, newActionButtons);
} else {
    // try a more generic replacement just in case spaces are slightly off
    const parts = content.split('const updated = group.targets.filter(x => x.id !== t.id);');
    if (parts.length > 1) {
        // we found it. let's rebuild it manually.
        console.log("Using fallback replacement logic");
        // We will just do a targeted regex to find the button block
        const regex = /<button onClick=\{\(\) => \{\s*const updated = group\.targets\.filter\(x => x\.id !== t\.id\);\s*setTargetsData\(\{ \.\.\.targetsData, \[group\.date\]: updated \}\);\s*\}\} className="[^"]*">\s*<i className="fa-solid fa-trash[^>]*><\/i>\s*<\/button>/g;
        content = content.replace(regex, newActionButtons);
    }
}

fs.writeFileSync('index.html', content, 'utf8');
console.log("Fixed Edit buttons to be ALWAYS visible and injected them correctly into large portal");
