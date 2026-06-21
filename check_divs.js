const fs = require('fs');

const content = fs.readFileSync('c:/Users/risha/ATAXYbot/index.html', 'utf8');

const lines = content.split('\n');
let divDepth = 0;
for (let i = 8186; i <= 8313; i++) {
    const line = lines[i];
    const opens = (line.match(/<div/g) || []).length;
    const closes = (line.match(/<\/div>/g) || []).length;
    divDepth += opens - closes;
    if (opens !== 0 || closes !== 0) {
        console.log(`Line ${i + 1}: +${opens} -${closes} => Depth: ${divDepth}`);
    }
}
console.log('Final div depth in ternary:', divDepth);
