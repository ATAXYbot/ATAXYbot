const fs = require('fs');
let code = fs.readFileSync('c:/Users/risha/ATAXYbot/index.html', 'utf8');

const targetStr = "{batch.type === 'jee' ? 'Launching Soon' : `${batch.files.length} Modules Available`}";
const newStr = "{batch.type === 'jee' ? 'Future Engineer Track' : batch.type === 'neet' ? 'Future Doctor Track' : 'Standard Practice Track'}";

code = code.replace(targetStr, newStr);

fs.writeFileSync('c:/Users/risha/ATAXYbot/index.html', code);
console.log('Replaced thematic string!');
