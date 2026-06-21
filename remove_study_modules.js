const fs = require('fs');

let lines = fs.readFileSync('c:/Users/risha/ATAXYbot/index.html', 'utf8').split('\n');

const studyModuleIndex = lines.findIndex(l => l.includes('Study Modules') && l.includes('<h3 className="font-bold text-gray-800'));

if (studyModuleIndex !== -1) {
    // Look for the end of the "grid grid-cols-2" div that follows it
    // Wait, the grid contains 2 divs inside, and then it closes.
    // Let's count the lines exactly or search for the next closing div.
    
    // We know the structure:
    // <h3 ...>Study Modules</h3>
    // <div className="grid grid-cols-2 ...">
    //    <div ...>...</div>
    //    <div ...>...</div>
    // </div>
    
    let endIndex = -1;
    let openDivs = 0;
    let foundGrid = false;
    
    for (let i = studyModuleIndex + 1; i < lines.length; i++) {
        if (lines[i].includes('className="grid grid-cols-2 gap-4 mb-6')) {
            foundGrid = true;
        }
        
        if (foundGrid) {
            openDivs += (lines[i].match(/<div/g) || []).length;
            openDivs -= (lines[i].match(/<\/div>/g) || []).length;
            
            if (openDivs === 0) {
                endIndex = i;
                break;
            }
        }
    }
    
    if (endIndex !== -1) {
        // Splice from studyModuleIndex to endIndex (inclusive)
        const removed = lines.splice(studyModuleIndex, endIndex - studyModuleIndex + 1);
        console.log("Removed " + removed.length + " lines.");
        fs.writeFileSync('c:/Users/risha/ATAXYbot/index.html', lines.join('\n'));
        console.log("Study Modules removed successfully.");
    } else {
        console.log("Could not find the end of the grid.");
    }
} else {
    console.log("Study Modules not found.");
}
