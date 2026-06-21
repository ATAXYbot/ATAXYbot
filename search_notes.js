const fs = require('fs');
const lines = fs.readFileSync('c:/Users/risha/ATAXYbot/index.html', 'utf8').split('\n');
lines.forEach((l, i) => {
    if (l.toLowerCase().includes('personal note')) {
        console.log(`${i+1}: ${l.trim().substring(0, 150)}`);
    }
});
