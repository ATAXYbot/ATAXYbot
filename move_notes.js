const fs = require('fs');

let content = fs.readFileSync('c:/Users/risha/ATAXYbot/index.html', 'utf8');

// The block to extract
const noteStartStr = '{/* White/Grey Personal Notes UI */}';
const noteEndStr = '<QuestionAIAssistant q={currentQuestion} attemptIdx={selectedOptionIdx} />';

const noteStartIdx = content.indexOf(noteStartStr);
const noteEndIdx = content.indexOf(noteEndStr, noteStartIdx);

if (noteStartIdx !== -1 && noteEndIdx !== -1) {
    // Extract the note block
    // Notice that there is a `<div className="mt-4">` just before {/* White/Grey Personal Notes UI */} and we need to be careful
    // Wait, let's look at the original code:
    // 8259:                                                         <div className="mt-4">
    // 8260:                                                             
    // 8261:                                                         {/* White/Grey Personal Notes UI */}
    // ...
    // 8309:                                                         </div>
    // 8310: <QuestionAIAssistant
    
    // We can just extract from {/* White/Grey Personal Notes UI */} up to `</div>\n<QuestionAIAssistant`
    // Let's use regex to be safe.
    
    const extractionRegex = /\{\/\* White\/Grey Personal Notes UI \*\/\}[\s\S]*?(?=\s*<\/div>\s*<QuestionAIAssistant)/;
    const match = content.match(extractionRegex);
    
    if (match) {
        let noteUI = match[0];
        
        // Remove it from its current place
        content = content.replace(extractionRegex, '');
        
        // Enhance the UI (remove black, use soft blue/indigo or premium grey, glass effects)
        noteUI = noteUI.replace('bg-gray-800 hover:bg-gray-900', 'bg-[#00418d] hover:bg-[#003370]'); // Save button to theme blue
        noteUI = noteUI.replace('text-gray-800', 'text-gray-700'); // softer text
        noteUI = noteUI.replace('text-black', 'text-gray-800'); // softer text
        noteUI = noteUI.replace('bg-gray-50', 'bg-slate-50/80 backdrop-blur-md'); // glass effect
        noteUI = noteUI.replace('border-gray-200', 'border-slate-200/60');
        noteUI = noteUI.replace('shadow-sm', 'shadow-md shadow-slate-200/40');
        noteUI = noteUI.replace('ring-gray-300', 'ring-blue-500/30');
        noteUI = noteUI.replace('focus:border-gray-400', 'focus:border-blue-400');
        
        // Modify the title to look more premium
        noteUI = noteUI.replace('text-sm font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest', 'text-[13px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-[0.15em]');
        noteUI = noteUI.replace('fa-book-open text-gray-400', 'fa-pen-nib text-blue-500');

        // Insert it BEFORE `isAnswered && (`
        // Let's find `                                                {isAnswered && (`
        const isAnsweredStr = '                                                {isAnswered && (';
        const isAnsweredIdx = content.indexOf(isAnsweredStr);
        
        if (isAnsweredIdx !== -1) {
            content = content.substring(0, isAnsweredIdx) + noteUI + '\n' + content.substring(isAnsweredIdx);
            console.log('Successfully moved and enhanced Personal Notes UI!');
        } else {
            console.log('Could not find isAnswered && (');
        }
    } else {
        console.log('Could not match extraction regex.');
    }
} else {
    console.log('Could not find Note UI block limits.');
}

fs.writeFileSync('c:/Users/risha/ATAXYbot/index.html', content, 'utf8');
