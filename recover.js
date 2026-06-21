const fs = require('fs');
let code = fs.readFileSync('c:/Users/risha/ATAXYbot/index.html', 'utf8');

// Replace all instances of literally "\\n" with an actual newline "\n"
code = code.replace(/\\n/g, '\n');

fs.writeFileSync('c:/Users/risha/ATAXYbot/index.html', code);
console.log("File recovered.");
