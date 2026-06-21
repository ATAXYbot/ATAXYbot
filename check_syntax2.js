const fs = require('fs');
const babel = require('@babel/core');

try {
    const content = fs.readFileSync('c:/Users/risha/ATAXYbot/index.html', 'utf8');
    const match = content.match(/<script type="text\/babel" data-presets="react-classic" data-type="module">([\s\S]*?)<\/script>/);
    
    if (match) {
        babel.parseSync(match[1], { presets: ['@babel/preset-react'] });
        console.log('Syntax OK');
    } else {
        console.log('Could not find Babel script block.');
    }
} catch (e) {
    console.error('Syntax Error:', e.message);
    if (e.loc) {
        console.log('Error at line:', e.loc.line, 'column:', e.loc.column);
        
        // Print the surrounding code
        const lines = content.match(/<script type="text\/babel" data-presets="react-classic" data-type="module">([\s\S]*?)<\/script>/)[1].split('\n');
        const errLine = e.loc.line - 1;
        for (let i = Math.max(0, errLine - 5); i <= Math.min(lines.length - 1, errLine + 5); i++) {
            console.log(`${i+1}: ${lines[i]}`);
        }
    }
}
