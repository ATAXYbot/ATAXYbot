const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

function extractFunc(name) {
    const startMarker = `const ${name} = () => {`;
    let startIdx = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(startMarker)) {
            startIdx = i;
            break;
        }
    }
    if (startIdx === -1) return null;
    
    let b = 0;
    let started = false;
    let endIdx = -1;
    for (let i = startIdx; i < lines.length; i++) {
        b += lines[i].split('{').length - 1;
        b -= lines[i].split('}').length - 1;
        if (lines[i].includes('{')) started = true;
        if (started && b === 0) {
            endIdx = i;
            break;
        }
    }
    return { start: startIdx, end: endIdx, content: lines.slice(startIdx, endIdx + 1).join('\n') };
}

const ar = extractFunc('renderActiveRoom');
if (ar) fs.writeFileSync('temp_ar.txt', ar.content);

const dash = extractFunc('renderDashboard');
if (dash) fs.writeFileSync('temp_dash.txt', dash.content);

console.log("Done. AR:", !!ar, "Dash:", !!dash);
