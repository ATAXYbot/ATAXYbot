const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const targetRegex = /const newTest = \{[\s\S]*?isNeetPattern: type === 'full' && isNeet\s*\};\s*\/\/\s*Launch Test\s*setPracticeAttempts\(\{\}\);\s*setPracticeVisited\(\[\]\);\s*setPracticeReview\(\[\]\);\s*setCurrentQuestionIndex\(0\);\s*setActiveGeneratedTest\(newTest\);\s*setLoadedQuestions\(testQuestions\);\s*const dateName = new Date\(\)\.toLocaleString\(\[\], \{year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'\}\);\s*const finalTestName = customGenConfig\.testName && customGenConfig\.testName\.trim\(\) !== '' \? customGenConfig\.testName : \(\(type === 'full' \? 'Full Length Test' : type === 'half' \? 'Half Length Test' : 'Custom DPP'\) \+ ' - ' \+ dateName\);\s*setActivePracticeChapter\(\{ name: finalTestName, isCustomTest: true \}\);/m;

const replacement = `const dateName = new Date().toLocaleString([], {year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'});
                                const finalTestName = customGenConfig.testName && customGenConfig.testName.trim() !== '' ? customGenConfig.testName : ((type === 'full' ? 'Full Length Test' : type === 'half' ? 'Half Length Test' : 'Custom DPP') + ' - ' + dateName);

                                const newTest = {
                                    id: 'test_' + Date.now(),
                                    type: type,
                                    date: new Date().toISOString(),
                                    questions: testQuestions,
                                    totalMarks: tMarks,
                                    isNeetPattern: type === 'full' && isNeet,
                                    name: finalTestName,
                                    config: customGenConfig
                                };

                                // Launch Test
                                setPracticeAttempts({});
                                setPracticeVisited([]);
                                setPracticeReview([]);
                                setCurrentQuestionIndex(0);
                                setActiveGeneratedTest(newTest);
                                setLoadedQuestions(testQuestions);
                                setActivePracticeChapter({ name: finalTestName, isCustomTest: true });`;

if (code.match(targetRegex)) {
    code = code.replace(targetRegex, replacement);
    fs.writeFileSync('index.html', code);
    console.log('Successfully updated newTest with name and config');
} else {
    console.log('Could not find target regex');
}
