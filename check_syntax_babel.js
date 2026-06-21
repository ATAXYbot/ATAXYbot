const fs = require('fs');
const babel = require('@babel/core');

const content = fs.readFileSync('c:/Users/risha/ATAXYbot/index.html', 'utf8');
const scriptMatch = content.match(/<script type="text\/babel"[^>]*>([\s\S]*?)<\/script>/);

if (scriptMatch) {
    const code = scriptMatch[1];
    try {
        babel.parseSync(code, {
            presets: ['@babel/preset-react'],
            filename: 'temp.jsx'
        });
        console.log("Syntax is OK!");
    } catch (e) {
        console.error("Syntax Error: " + e.message);
    }
} else {
    console.log("No babel script found.");
}
