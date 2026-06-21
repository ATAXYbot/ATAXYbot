const fs = require('fs');

let code = fs.readFileSync('index.html', 'utf8');

// The deep analytics modal
const analyticsModalStart = code.indexOf('const renderAnalyticsModal = () => {');
if (analyticsModalStart !== -1) {
    let blockStart = code.indexOf('return (', analyticsModalStart);
    if (blockStart !== -1 && blockStart < code.indexOf('// --- PROFILE & PERFORMANCE ---', analyticsModalStart)) {
        // Find the "return ("
        const startToReplace = code.indexOf('return (', analyticsModalStart);
        const fixedInsetStr = '<div className="fixed inset-0';
        const fixedInsetPos = code.indexOf(fixedInsetStr, startToReplace);
        if (fixedInsetPos !== -1 && fixedInsetPos - startToReplace < 200) {
            code = code.substring(0, startToReplace) + 'return ReactDOM.createPortal(\n' + code.substring(startToReplace + 8);
            
            // find the end of the modal (it ends right before `};`)
            const endOfFunc = code.indexOf('};', startToReplace);
            const lastDiv = code.lastIndexOf('</div>', endOfFunc);
            const closingParen = code.lastIndexOf(');', endOfFunc);
            
            if (closingParen !== -1 && closingParen > lastDiv) {
                code = code.substring(0, closingParen) + ', document.body\n);' + code.substring(closingParen + 2);
            }
        }
    }
}

// The Target Analyzer detailed modal
const detailedAnalyzerStart = code.indexOf('const renderDetailedAnalyzerModal = () => {');
if (detailedAnalyzerStart !== -1) {
    const startToReplace = code.indexOf('return (', detailedAnalyzerStart);
    if (startToReplace !== -1) {
        code = code.substring(0, startToReplace) + 'return ReactDOM.createPortal(\n' + code.substring(startToReplace + 8);
        
        const endOfFunc = code.indexOf('};', startToReplace);
        const closingParen = code.lastIndexOf(');', endOfFunc);
        if (closingParen !== -1) {
            code = code.substring(0, closingParen) + ', document.body\n);' + code.substring(closingParen + 2);
        }
    }
}

fs.writeFileSync('index.html', code);
console.log('Modals wrapped in createPortal');
