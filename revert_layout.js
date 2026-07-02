const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// Revert the max-w-md back to md:max-w-screen-xl max-w-md mx-auto
content = content.replace(/max-w-md mx-auto md:border-x border-\[\#0AE0D0\]\/20 md:shadow-\[0_0_50px_rgba\(0,255,255,0\.05\)\]/g, 'md:max-w-screen-xl max-w-md mx-auto');

// Revert ActiveVoiceRoom
content = content.replace(
    'className="fixed inset-0 max-w-md mx-auto md:border-x border-[#0AE0D0]/20 md:shadow-[0_0_50px_rgba(0,255,255,0.1)] z-[2000000] bg-[#010B1C] text-white flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 font-sans"',
    'className="fixed inset-0 z-[2000000] bg-[#010B1C] text-white flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 font-sans"'
);

fs.writeFileSync('index.html', content);
