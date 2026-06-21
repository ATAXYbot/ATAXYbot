const fs = require('fs');
const babel = require('@babel/core');

try {
    const content = fs.readFileSync('c:/Users/risha/ATAXYbot/index.html', 'utf8');
    const match = content.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);
    
    if (match) {
        babel.parseSync(match[1], { presets: ['@babel/preset-react'] });
        console.log('Syntax OK');
    } else {
        console.log('Could not find Babel script block.');
    }
} catch (e) {
    console.error('Syntax Error:', e.message);
    // Print the line around the error
    if (e.loc) {
        console.log('Error at line:', e.loc.line, 'column:', e.loc.column);
    }
}
