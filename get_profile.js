const fs = require('fs');
let lines = fs.readFileSync('index.html', 'utf8').split('\n');
const startIndex = lines.findIndex(l => l.includes("currentTab === 'profile'"));
console.log(lines.slice(startIndex - 2, startIndex + 30).map((l, i) => (startIndex - 2 + i) + ': ' + l).join('\n'));
