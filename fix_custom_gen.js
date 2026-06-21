const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const target1 = `setActivePracticeChapter({ name: type === 'full' ? 'Full Length Custom Test' : type === 'half' ? 'Half Length Custom Test' : 'Custom DPP', isCustomTest: true });`;
const replace1 = `setActivePracticeChapter({ name: type === 'full' ? 'Full Length Custom Test' : type === 'half' ? 'Half Length Custom Test' : 'Custom DPP', isCustomTest: true });
                                setShowQuiz(true);`;

code = code.replace(target1, replace1);

const target2 = `<p className="text-xs text-gray-500 mb-3">{new Date(test.date).toLocaleString()}</p>`;
const replace2 = `<p className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-2"><span className="flex items-center gap-1"><i className="fa-regular fa-calendar"></i> {new Date(test.date).toLocaleDateString()}</span><span className="flex items-center gap-1"><i className="fa-regular fa-clock"></i> {new Date(test.date).toLocaleTimeString()}</span></p>`;

code = code.replace(target2, replace2);

fs.writeFileSync('index.html', code);
console.log('Fixed skip question type and improved date/time display.');
