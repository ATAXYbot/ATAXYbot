const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const targetRegex = /<button onClick=\{\(\) => \{ setConfirmClearScope\(\{ type: 'chapter', data: activePracticeChapter \}\); \}\} className="text-red-500 text-sm font-bold hover:bg-red-50 px-3 py-1 rounded-sm transition-colors border border-red-200">Quit Test<\/button>/g;

const replacementStr = `<button onClick={() => { 
    if (activePracticeChapter?.isCustomTest) {
        if(window.confirm('Are you sure you want to quit this test? Your progress will not be saved.')) {
            setShowQuiz(false);
            setActivePracticeChapter(null);
            setActiveGeneratedTest(null);
            setCustomGeneratorMode('history');
        }
    } else {
        setConfirmClearScope({ type: 'chapter', data: activePracticeChapter }); 
    }
}} className="text-red-500 text-sm font-bold hover:bg-red-50 px-3 py-1 rounded-sm transition-colors border border-red-200">Quit Test</button>`;

if(code.match(targetRegex)) {
    code = code.replace(targetRegex, replacementStr);
    fs.writeFileSync('index.html', code);
    console.log('Successfully patched Quit Test button');
} else {
    console.log('Target string not found');
}
