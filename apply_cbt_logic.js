const fs = require('fs');

let code = fs.readFileSync('index.html', 'utf8');

// 1. Generator Update
const genRegex = /if \(type === 'full' \|\| type === 'half'\) \{([\s\S]*?)\} else if \(type === 'dpp'\) \{/m;
const genReplacement = `if (type === 'full' || type === 'half') {
                                    ['Physics', 'Chemistry', 'Botany', 'Zoology'].forEach(subName => {
                                        const subData = availableQuestions.find(s => s.name.toLowerCase().includes(subName.toLowerCase()));
                                        if (!subData) return;
                                        
                                        let subQs = [];
                                        const selectedChapters = customGenConfig.subjects[subName];
                                        
                                        subData.chapters?.forEach(c => {
                                            if (selectedChapters.length === 0 || selectedChapters.includes(c.name)) {
                                                c.topics?.forEach(t => t.questions?.forEach(q => subQs.push({ ...q, topicName: t.name, chapterName: c.name, subjectName: subName })));
                                            }
                                        });
                                        
                                        // Shuffle and pick
                                        subQs.sort(() => Math.random() - 0.5);
                                        
                                        if (type === 'full' && isNeet) {
                                            const subQsSelected = subQs.slice(0, 50);
                                            subQsSelected.forEach((q, idx) => {
                                                q.section = idx < 35 ? 'A' : 'B';
                                                testQuestions.push(q);
                                            });
                                        } else if (type === 'full' && !isNeet) {
                                            testQuestions = [...testQuestions, ...subQs.slice(0, 45)];
                                        } else if (type === 'half') {
                                            testQuestions = [...testQuestions, ...subQs.slice(0, 25)];
                                        }
                                    });
                                } else if (type === 'dpp') {`;

if(code.match(genRegex)) {
    code = code.replace(genRegex, genReplacement);
    console.log("Replaced generator logic");
} else {
    console.log("Failed to match genRegex");
}

const marksRegex = /const newTest = \{[\s\S]*?id: 'test_' \+ Date\.now\(\),[\s\S]*?type: type,[\s\S]*?date: new Date\(\)\.toISOString\(\),[\s\S]*?questions: testQuestions,[\s\S]*?totalMarks: testQuestions\.length \* 4[\s\S]*?\};/m;

const marksReplacement = `let tMarks = 0;
                                if (type === 'full' && isNeet) tMarks = 720;
                                else if (type === 'full' && !isNeet) tMarks = testQuestions.length * 4;
                                else if (type === 'half') tMarks = testQuestions.length * 4;
                                else tMarks = testQuestions.length * 4;

                                const newTest = {
                                    id: 'test_' + Date.now(),
                                    type: type,
                                    date: new Date().toISOString(),
                                    questions: testQuestions,
                                    totalMarks: tMarks,
                                    isNeetPattern: type === 'full' && isNeet
                                };`;

if(code.match(marksRegex)) {
    code = code.replace(marksRegex, marksReplacement);
    console.log("Replaced newTest creation");
} else {
    console.log("Failed to match marksRegex");
}

// 2. Section B enforcement logic
const optionChangeRegex = /<input type="radio" name=\{'q_' \+ currentQuestion\.id\} checked=\{isSelected\} onChange=\{\(\) => \{[\s\S]*?setPracticeAttempts\(prev => \(\{ \.\.\.prev, \[currentQuestion\.id\]: oIdx \}\)\);/m;

const optionChangeReplacement = `<input type="radio" name={'q_' + currentQuestion.id} checked={isSelected} onChange={() => {
                                                                        if (activeGeneratedTest?.isNeetPattern && currentQuestion.section === 'B') {
                                                                            const attemptsObj = practiceAttempts || {};
                                                                            let secBAttempts = 0;
                                                                            displayedQuestions.forEach(q => {
                                                                                if (q.subjectName === currentQuestion.subjectName && q.section === 'B' && attemptsObj[q.id] !== undefined) {
                                                                                    secBAttempts++;
                                                                                }
                                                                            });
                                                                            if (secBAttempts >= 10 && attemptsObj[currentQuestion.id] === undefined) {
                                                                                safeAlert('You can only attempt a maximum of 10 questions in Section B.');
                                                                                return;
                                                                            }
                                                                        }
                                                                        setPracticeAttempts(prev => ({ ...prev, [currentQuestion.id]: oIdx }));`;

if(code.match(optionChangeRegex)) {
    code = code.replace(optionChangeRegex, optionChangeReplacement);
    console.log("Replaced section B check in onChange");
} else {
    console.log("Failed to match optionChangeRegex");
}

// 3. Question Palette Grouping by Section
// Need to find where the question palette is rendered: 
// <div className="grid grid-cols-5 gap-2"> ... {displayedQuestions.map((q, i) => { ...
// The CBT exact UI might have a different structure. Let's write a generic replacement or we might need to modify the UI more carefully.
// Let's just save for now.

fs.writeFileSync('index.html', code);
