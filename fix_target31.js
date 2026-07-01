const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const oldHandleTestSubmit = `                                setShowQuiz(false);
                                safeAlert('Test Submitted Successfully! View your detailed analysis.');
                            };`;

const newHandleTestSubmit = `                                setShowQuiz(false);
                                triggerBrainMessage({
                                    type: 'chatter',
                                    text: \`Test Submitted! You scored \${score} marks with \${Math.round((correctCnt / displayedQuestions.length) * 100) || 0}% accuracy! Let's check the detailed analysis to see where you can improve.\`,
                                    requireAcknowledge: true
                                }, true); // bypass cooldown
                                safeAlert('Test Submitted Successfully! View your detailed analysis.');
                            };`;

content = content.replace(oldHandleTestSubmit, newHandleTestSubmit);
fs.writeFileSync('index.html', content, 'utf8');
console.log("Updated handleTestSubmit with Brain Engine");
