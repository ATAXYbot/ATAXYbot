const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const targetStr = `                </div>
            );
        };



        // ==========================================
        // ⏱️ PRACTICE SESSION TIMER`;

const replaceStr = `                </div>, document.body
            );
        };



        // ==========================================
        // ⏱️ PRACTICE SESSION TIMER`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replaceStr);
    console.log("Success string replace");
} else {
    // try line by line matching
    const regex = /<\/div>\s*\);\s*\};\s*\/\/ ==========================================\s*\/\/ ⏱️ PRACTICE SESSION TIMER/;
    if (regex.test(content)) {
        content = content.replace(regex, `</div>, document.body\n            );\n        };\n\n\n\n        // ==========================================\n        // ⏱️ PRACTICE SESSION TIMER`);
        console.log("Success regex replace");
    } else {
        console.log("Failed to find anything");
    }
}

fs.writeFileSync('index.html', content, 'utf8');
