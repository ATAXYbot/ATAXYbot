const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

code = code.replace(/chatEndRef\.current\?\.scrollIntoView\(\{ behavior: ['"]smooth['"] \}\)/g, "chatEndRef.current?.scrollIntoView({ behavior: 'instant', block: 'end' })");
code = code.replace(/chatEndRef\.current\?\.scrollIntoView\(\{ behavior: ['"]smooth['"], block: ['"]nearest['"] \}\)/g, "chatEndRef.current?.scrollIntoView({ behavior: 'instant', block: 'end' })");

fs.writeFileSync('index.html', code);
console.log('Scroll fixed');
