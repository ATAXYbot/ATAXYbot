const fs = require('fs');
let lines = fs.readFileSync('c:/Users/risha/ATAXYbot/index.html', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('CBT Palette Slide-over Modal')) {
        // We know we need to inject a </div> BEFORE line 8315 (which is right before line 8316 empty line).
        // Let's just find the `)}` that precedes CBT Palette Slide-over Modal
        let j = i - 1;
        while (j > 0 && !lines[j].includes(')}')) {
            j--;
        }
        if (lines[j].includes(')}')) {
            // j is line 8314. We need to inject a `</div>` right above it!
            // Wait, is it right above `)}`?
            // Line 8312: </div>
            // Line 8313: </div>
            // Line 8314: )}
            // Let's inject a </div> right after line 8313!
            lines.splice(j, 0, '                                            </div>');
            console.log('Injected </div> at line', j + 1);
            break;
        }
    }
}

fs.writeFileSync('c:/Users/risha/ATAXYbot/index.html', lines.join('\n'), 'utf8');
