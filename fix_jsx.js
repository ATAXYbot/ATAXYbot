const fs = require('fs');
let code = fs.readFileSync('c:/Users/risha/ATAXYbot/index.html', 'utf8');

code = code.replace(/<div className="relative z-10">\s*<div className="flex justify-between items-center mb-6">/g, '<div className="flex justify-between items-center mb-6 relative z-10">');
code = code.replace(/<div className="relative z-10">\s*<div className="flex flex-col items-center justify-center min-h-\[60vh\]">/g, '<div className="flex flex-col items-center justify-center min-h-[60vh] relative z-10">');

// For the activePracticeMode === 'practice'
code = code.replace(/<div className="relative z-10">\s*<div className="flex justify-between items-center mb-6 animate-in slide-in-from-top-4">/g, '<div className="flex justify-between items-center mb-6 animate-in slide-in-from-top-4 relative z-10">');

// For activePracticeBatch
code = code.replace(/<div className="relative z-10">\s*<div className="flex justify-between items-center mb-8 animate-in slide-in-from-top-4">/g, '<div className="flex justify-between items-center mb-8 animate-in slide-in-from-top-4 relative z-10">');

fs.writeFileSync('c:/Users/risha/ATAXYbot/index.html', code);
console.log('Fixed unbalanced JSX tags!');
