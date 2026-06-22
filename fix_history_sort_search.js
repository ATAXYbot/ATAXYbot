const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// Add states
if (!code.includes('const [historySortOrder, setHistorySortOrder] = useState')) {
    code = code.replace(/const \[historyFilter, setHistoryFilter\] = useState\('all'\);/, "const [historyFilter, setHistoryFilter] = useState('all');\n            const [historySortOrder, setHistorySortOrder] = useState('newest');\n            const [historySearchQuery, setHistorySearchQuery] = useState('');");
}

// Replace the history map block
const regex = /\{generatedTestsHistory\.filter\(t => historyFilter === 'all' \|\| t\.type === historyFilter\)\.length === 0 \? \(\s*<p className="text-gray-500 text-center py-10">No tests found in this category\.<\/p>\s*\) : generatedTestsHistory\.filter\(t => historyFilter === 'all' \|\| t\.type === historyFilter\)\.map\(test => \(/m;

const replacement = `{(() => {
                                                let filtered = generatedTestsHistory.filter(t => historyFilter === 'all' || t.type === historyFilter);
                                                if (historySearchQuery.trim()) {
                                                    filtered = filtered.filter(t => t.name && t.name.toLowerCase().includes(historySearchQuery.toLowerCase()));
                                                }
                                                filtered.sort((a, b) => {
                                                    const da = new Date(a.date).getTime();
                                                    const db = new Date(b.date).getTime();
                                                    return historySortOrder === 'newest' ? db - da : da - db;
                                                });
                                                if (filtered.length === 0) return <p className="text-gray-500 text-center py-10">No tests found matching your criteria.</p>;
                                                return filtered.map(test => (`;

if (code.match(regex)) {
    code = code.replace(regex, replacement);
    console.log("Successfully replaced the history map block");
} else {
    console.log("Could not find the history map block");
}

// Add the search/sort UI controls
const searchSortUI = `<div className="flex flex-col sm:flex-row gap-3 mb-6">
                                            <div className="flex-1 relative">
                                                <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                                <input type="text" value={historySearchQuery} onChange={e => setHistorySearchQuery(e.target.value)} placeholder="Search test name..." className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl py-3 pl-10 pr-4 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" />
                                            </div>
                                            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 shadow-inner shrink-0">
                                                <button onClick={() => setHistorySortOrder('newest')} className={\`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all \${historySortOrder === 'newest' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500'}\}>Newest</button>
                                                <button onClick={() => setHistorySortOrder('oldest')} className={\`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all \${historySortOrder === 'oldest' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500'}\}>Oldest</button>
                                            </div>
                                        </div>`;

const controlsRegex = /<div className="flex overflow-x-auto gap-2 mb-6 pb-2 no-scrollbar">/;
if (code.match(controlsRegex) && !code.includes('setHistorySortOrder(\'newest\')')) {
    code = code.replace(controlsRegex, searchSortUI + '\n                                        <div className="flex overflow-x-auto gap-2 mb-6 pb-2 no-scrollbar">');
}

fs.writeFileSync('index.html', code);
