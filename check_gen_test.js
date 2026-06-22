const fs = require('fs');
const code = fs.readFileSync('index.html', 'utf8');

const match = code.match(/.{0,200}activeGeneratedTest.{0,200}/g);
if (match) {
    console.log("activeGeneratedTest usage:", match.slice(0, 10).join('\n---\n'));
}
