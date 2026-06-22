const fs = require('fs');
const code = fs.readFileSync('index.html', 'utf8');

// Find loadedQuestions usage
const match = code.match(/.{0,150}loadedQuestions.{0,150}/g);
if (match) {
    console.log("loadedQuestions usage:", match.slice(0, 5).join('\n---\n'));
}

// Find normal question rendering
const qMatch = code.match(/text=\{currentQuestion\.[a-zA-Z]+\}/g);
if (qMatch) {
    console.log("currentQuestion prop usage:", [...new Set(qMatch)]);
}
