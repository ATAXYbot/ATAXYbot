const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');
const lines = content.split('\n');

const linesToChangeTo7xl = [1144, 1145, 1596, 1597, 4011, 4782, 4809, 6502, 6870, 6912, 6956, 8280, 8309, 9105, 9136];
const linesToChangeTo4xl = [7796, 8557, 8739];

for (let i = 0; i < lines.length; i++) {
    if (linesToChangeTo7xl.includes(i)) {
        lines[i] = lines[i].replace(/max-w-md/g, 'max-w-7xl');
        lines[i] = lines[i].replace(/\$\{showQuiz && currentTab === 'practice' \? 'w-full max-w-7xl' : 'max-w-md'\}/g, 'w-full max-w-7xl');
        lines[i] = lines[i].replace(/\$\{showQuiz && currentTab === 'practice' \? 'max-w-7xl' : 'max-w-md'\}/g, 'max-w-7xl');
    }
    if (linesToChangeTo4xl.includes(i)) {
        lines[i] = lines[i].replace(/max-w-md/g, 'max-w-4xl');
    }
}

fs.writeFileSync('index.html', lines.join('\n'));
console.log('Replacements complete');
