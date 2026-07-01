const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const targetStr = '<h3 className="font-black text-white text-xl flex items-center gap-2 tracking-wide"><i className="fa-solid fa-fire-flame-curved text-orange-500"></i> Daily Targets</h3>';
const newStr = '<h3 className="font-black text-white text-xl flex items-center gap-2 tracking-wide"><i className="fa-solid fa-fire-flame-curved text-orange-500"></i> Today\'s Targets</h3>';

if (content.includes(targetStr)) {
    content = content.replace(targetStr, newStr);
    console.log("Replaced Daily Targets with Today's Targets.");
} else {
    console.log("Could not find string.");
}

fs.writeFileSync('index.html', content, 'utf8');
