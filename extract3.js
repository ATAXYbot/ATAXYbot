const fs = require('fs');
const code = fs.readFileSync('index.html', 'utf8');

const startIdx = code.indexOf('<div className="bg-white min-h-[100dvh] font-sans text-gray-800 flex flex-col fixed inset-0 z-[100] overflow-hidden">');
const endIdx = code.indexOf('</div>\n                            );\n                        }', startIdx) !== -1 ? code.indexOf('</div>\n                            );\n                        }', startIdx) : code.indexOf('</div>\r\n                            );\r\n                        }', startIdx);

if (startIdx !== -1 && endIdx !== -1) {
    fs.writeFileSync('current_ui2.utf8.txt', code.substring(startIdx, endIdx + 100), 'utf8');
} else {
    fs.writeFileSync('current_ui2.utf8.txt', code.substring(startIdx, startIdx + 8000), 'utf8');
}
