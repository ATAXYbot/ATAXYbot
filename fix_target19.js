const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const mentorReturnEndRegex = / {16}<\/div>\n {12}\);\n {8}\};\n\n\n\n {8}\/\/ ==========================================\n {8}\/\/ ⏱️ PRACTICE SESSION TIMER/s;

if (mentorReturnEndRegex.test(content)) {
    content = content.replace(mentorReturnEndRegex, `                </div>, document.body
            );
        };



        // ==========================================
        // ⏱️ PRACTICE SESSION TIMER`);
    console.log("Updated AIMentorView return end.");
} else {
    console.log("Could not find AIMentorView return end.");
}

fs.writeFileSync('index.html', content, 'utf8');
