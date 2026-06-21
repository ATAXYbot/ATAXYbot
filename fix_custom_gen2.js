const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const target1 = `setActivePracticeChapter({ name: type === 'full' ? 'Full Length Custom Test' : type === 'half' ? 'Half Length Custom Test' : 'Custom DPP', isCustomTest: true });`;
const replace1 = `const dateName = new Date().toLocaleString([], {year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'});
                                setActivePracticeChapter({ name: (type === 'full' ? 'Full Length Test' : type === 'half' ? 'Half Length Test' : 'Custom DPP') + ' - ' + dateName, isCustomTest: true });`;

code = code.replace(target1, replace1);

fs.writeFileSync('index.html', code);
console.log('Fixed test name to include date and time.');
