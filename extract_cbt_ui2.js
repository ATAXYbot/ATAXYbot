const fs = require('fs');
const code = fs.readFileSync('index.html', 'utf8');

const startIdx = code.indexOf('<div className="bg-white min-h-[100dvh] font-sans text-gray-800 flex flex-col fixed inset-0 z-[100] overflow-hidden">');
if (startIdx !== -1) {
    console.log(code.substring(startIdx, startIdx + 8000));
} else {
    console.log("Start not found");
}
