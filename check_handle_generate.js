const fs = require('fs');
const code = fs.readFileSync('index.html', 'utf8');

const match = code.match(/const handleGenerateTest = [\s\S]*?setActivePracticeChapter\(\{/);
if (match) {
    console.log("handleGenerateTest usage:", match[0]);
}
