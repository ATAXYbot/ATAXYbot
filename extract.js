const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const match = html.match(/<script type="text\/babel" data-presets="react-classic" data-type="module">([\s\S]*?)<\/script>/);
if (match) {
    fs.writeFileSync('debug.jsx', match[1], 'utf8');
    console.log("Extracted to debug.jsx");
} else {
    console.log("Could not find script tag");
}
