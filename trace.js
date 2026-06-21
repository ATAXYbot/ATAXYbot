const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');
let balance = 0;
let fragmentStart = lines.findIndex(l => l.includes('<React.Fragment>'));
let fragmentEnd = lines.findIndex((l, i) => i > fragmentStart && l.includes('</React.Fragment>'));

for(let i = fragmentStart; i <= fragmentEnd; i++) {
    let line = lines[i];
    let openCount = (line.match(/<div(\s|>)/g) || []).length;
    let closeCount = (line.match(/<\/div>/g) || []).length;
    balance += openCount - closeCount;
    if (i >= 8320 && i <= 8335) {
        console.log(`Line ${i + 1}: Bal: ${balance} | ${line.trim()}`);
    }
}
