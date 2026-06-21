const fs = require('fs');
let lines = fs.readFileSync('c:/Users/risha/ATAXYbot/index.html', 'utf8').split('\n');

const newCode = `            let t = text;

            t = t.replace(/\\\\n/g, '\\n');

            t = t.replace(/\\*\\*(.+?)\\*\\*/g, '<strong class="text-blue-600 dark:text-blue-400">$1</strong>');
            t = t.replace(/__(.+?)__/g, '<strong class="text-blue-600 dark:text-blue-400">$1</strong>');
            t = t.replace(/\\*(.+?)\\*/g, '<em>$1</em>');
            t = t.replace(/\`([^\`]+)\`/g, '<code class="bg-gray-100 dark:bg-gray-800 text-pink-500 px-1 py-0.5 rounded text-xs border border-gray-200 dark:border-gray-700">$1</code>');
            t = t.replace(/### (.*)/g, '<h3 class="text-sm font-bold mt-2 mb-1 text-gray-800 dark:text-gray-100">$1</h3>');
            t = t.replace(/## (.*)/g, '<h2 class="text-base font-bold mt-2 mb-1 text-gray-800 dark:text-gray-100">$1</h2>');
            t = t.replace(/# (.*)/g, '<h1 class="text-lg font-bold mt-2 mb-1 text-gray-800 dark:text-gray-100">$1</h1>');

            t = t.replace(/\\n/g, '<br/>');`;

// Splice it in.
lines.splice(939, 16, ...newCode.split('\n'));
fs.writeFileSync('c:/Users/risha/ATAXYbot/index.html', lines.join('\n'));
console.log("Fixed regex.");
