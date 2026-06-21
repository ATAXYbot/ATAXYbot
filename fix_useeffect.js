const fs = require('fs');

let code = fs.readFileSync('index.html', 'utf8');

const targetStr = `            useEffect(() => {
                if (!activePracticeChapter) {
                    setLoadedQuestions([]);
                    setCurrentQuestionIndex(0);
                    return;
                }`;

const newStr = `            useEffect(() => {
                if (!activePracticeChapter) {
                    setLoadedQuestions([]);
                    setCurrentQuestionIndex(0);
                    return;
                }
                if (activePracticeChapter.isCustomTest) {
                    return;
                }`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, newStr);
    fs.writeFileSync('index.html', code);
    console.log('Fixed useEffect overriding loadedQuestions for custom tests.');
} else {
    console.log('Target string not found.');
}
