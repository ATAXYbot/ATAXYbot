const fs = require('fs');

let code = fs.readFileSync('index.html', 'utf8');

const regex = /const finalResult = \{ \.\.\.activeGeneratedTest, score, accuracy: Math\.round\(\(correctCnt \/ displayedQuestions\.length\) \* 100\) \|\| 0, attempts: \{ \.\.\.attempts \} \};/;

const newContent = `const finalResult = { ...activeGeneratedTest, score, accuracy: Math.round((correctCnt / displayedQuestions.length) * 100) || 0, attempts: { ...attempts }, questions: displayedQuestions };`;

if (code.match(regex)) {
    code = code.replace(regex, newContent);
    fs.writeFileSync('index.html', code);
    console.log('Test submission now includes displayedQuestions.');
} else {
    console.log('Regex did not match.');
}
