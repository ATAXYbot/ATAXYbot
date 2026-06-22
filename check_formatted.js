const fs = require('fs');
const code = fs.readFileSync('index.html', 'utf8');

const match = code.match(/.{0,100}\<FormattedText text=\{currentQuestion.{0,50}/g);
if (match) {
    console.log("FormattedText usage:", [...new Set(match)].join('\n---\n'));
}
