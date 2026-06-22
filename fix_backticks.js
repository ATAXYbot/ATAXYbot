const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const regex1 = /className=\{\`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all \$\{historySortOrder === 'newest' \? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500'\}\}>Newest<\/button>/;
const replacement1 = `className={\`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all \${historySortOrder === 'newest' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500'}\`}>Newest</button>`;

const regex2 = /className=\{\`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all \$\{historySortOrder === 'oldest' \? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500'\}\}>Oldest<\/button>/;
const replacement2 = `className={\`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all \${historySortOrder === 'oldest' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500'}\`}>Oldest</button>`;

if (code.match(regex1)) {
    code = code.replace(regex1, replacement1);
    console.log("Fixed Newest button");
}
if (code.match(regex2)) {
    code = code.replace(regex2, replacement2);
    console.log("Fixed Oldest button");
}

fs.writeFileSync('index.html', code);
