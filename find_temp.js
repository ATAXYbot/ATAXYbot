const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');
const layoutIndex = lines.findIndex(l => l.includes('grid-cols-3') && l.includes('pt-8 px-4'));
if (layoutIndex !== -1) {
    console.log('Layout index:', layoutIndex);
    console.log(lines.slice(layoutIndex - 2, layoutIndex + 10).join('\n'));
} else {
    console.log('Not found');
}
