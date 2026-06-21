const fs = require('fs');
const content = fs.readFileSync('c:/Users/risha/ATAXYbot/index.html', 'utf8');
const match = content.match(/<script type="text\/babel" data-presets="react-classic" data-type="module">([\s\S]*?)<\/script>/);

if (match) {
    const babelScript = match[1];
    fs.writeFileSync('c:/Users/risha/ATAXYbot/temp.jsx', babelScript, 'utf8');
    console.log('Created temp.jsx');
}
