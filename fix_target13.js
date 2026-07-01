const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// 1. Rename Set Target to Set Targets in the Standalone Portal Button
content = content.replace(
    '<h3 className="text-white font-black text-xl tracking-wide group-hover:text-[#0AE0D0] transition-colors">Set Target</h3>', 
    '<h3 className="text-white font-black text-xl tracking-wide group-hover:text-[#0AE0D0] transition-colors">Set Targets</h3>'
);

// 2. Enhance the Glass Shine Effect to match the Hello Student continuous shimmer
const oldShine = '{/* Intense Glass Shine Effect */}\n                                <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.2),transparent)] -translate-x-full group-hover:translate-x-full transition-transform duration-[1200ms] pointer-events-none"></div>';

const newShine = `{/* Continuous Glass Shine Effect */}
                                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0)_100%)] bg-[length:200%_100%] animate-[shimmer_3s_infinite] pointer-events-none"></div>`;

if (content.includes(oldShine)) {
    content = content.replace(oldShine, newShine);
    console.log("Updated glass shine to continuous shimmer.");
} else {
    // Try regex if exact spacing failed
    const shineRegex = /\{\/\* Intense Glass Shine Effect \*\/\}\s*<div className="absolute inset-0 bg-\[linear-gradient\(110deg,transparent,rgba\(255,255,255,0\.2\),transparent\)\] -translate-x-full group-hover:translate-x-full transition-transform duration-\[1200ms\] pointer-events-none"><\/div>/;
    if (shineRegex.test(content)) {
        content = content.replace(shineRegex, newShine);
        console.log("Updated glass shine to continuous shimmer (via regex).");
    } else {
        console.log("Could not find the glass shine block to replace.");
    }
}

fs.writeFileSync('index.html', content, 'utf8');
