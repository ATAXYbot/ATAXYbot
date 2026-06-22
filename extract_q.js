const fs = require('fs');
const code = fs.readFileSync('index.html', 'utf8');
const searchStr = 'Question {safeQuestionIndex + 1}:';
const idx = code.indexOf(searchStr);
if (idx !== -1) {
    console.log(code.substring(Math.max(0, idx - 200), idx + 3000));
} else {
    console.log('Not found');
}
