const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

// 1. Fix the input typing losing focus
// Change component declaration to function declaration
content = content.replace('const TargetPortalOverlay = () => {', 'const renderTargetPortalOverlay = () => {');

// Replace component call with function call
content = content.replace('<TargetPortalOverlay />', '{renderTargetPortalOverlay()}');

// 2. Enhance the Set Target button
const oldButtonPattern = /<button onClick=\{\(\) => setShowTargetPortal\(true\)\} className="mt-3 bg-white\/20 hover:bg-white\/30 text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-2 transition-colors border border-white\/20 shadow-lg active:scale-95">\s*<i className="fa-solid fa-bullseye"><\/i> Set Target Portal\s*<\/button>/;

const newButton = `<button onClick={() => setShowTargetPortal(true)} className="mt-5 w-full max-w-[280px] bg-gradient-to-r from-cyan-400/30 to-blue-500/30 hover:from-cyan-400/40 hover:to-blue-500/40 border border-white/40 dark:border-white/20 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,167,167,0.25)] text-white text-sm font-black py-3.5 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 active:scale-95 relative overflow-hidden group">
                                        <div className="absolute inset-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_3s_infinite]"></div>
                                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                        <i className="fa-solid fa-crosshairs text-lg relative z-10 group-hover:rotate-90 transition-transform duration-500 shadow-sm"></i> 
                                        <span className="tracking-wider relative z-10 drop-shadow-md">SET TARGET PORTAL</span>
                                    </button>`;

if (oldButtonPattern.test(content)) {
    content = content.replace(oldButtonPattern, newButton);
    console.log("Replaced button successfully.");
} else {
    console.log("Could not find old button pattern.");
}

fs.writeFileSync('index.html', content, 'utf8');
console.log("Fixes applied.");
