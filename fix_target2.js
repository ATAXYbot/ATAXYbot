const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

// 1. Fix the floating bar pointer events / unclickable issue
// The z-index is missing on the floating bar, and it is inside an absolute container without z-index.
// Let's add z-50 and pointer-events-auto to the Add Target Floating Bar
content = content.replace(/className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent dark:from-gray-950 dark:via-gray-950 pt-12 pb-\[max\(1rem,env\(safe-area-inset-bottom\)\)\]"/, 'className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent dark:from-gray-950 dark:via-gray-950 pt-12 pb-[max(1rem,env(safe-area-inset-bottom))] z-[50]"');

// 2. Change Target Portal to Blue Theme
// Replace cyan and teal hex colors in TargetPortalOverlay with blue equivalents
content = content.replace(/from-\[#00A7A7\] to-cyan-700/g, 'from-blue-600 to-indigo-800');
content = content.replace(/shadow-cyan-500\/20/g, 'shadow-blue-500/20');
content = content.replace(/shadow-cyan-500\/30/g, 'shadow-blue-500/30');
content = content.replace(/text-cyan-500/g, 'text-blue-500');
content = content.replace(/bg-\[#00A7A7\]/g, 'bg-blue-600');
content = content.replace(/ring-cyan-200/g, 'ring-blue-200');
content = content.replace(/dark:ring-cyan-900/g, 'dark:ring-blue-900');
content = content.replace(/focus:border-\[#00A7A7\]/g, 'focus:border-blue-500');
content = content.replace(/to-cyan-500/g, 'to-blue-500');
content = content.replace(/hover:from-cyan-600 hover:to-cyan-400/g, 'hover:from-blue-600 hover:to-blue-400');

// 3. Change Character Tutorial from Green to Blue
// The handleNext button in CinematicDemoEngine
const tutorialButtonPattern = /from-\[#84cc16\] to-\[#65a30d\] hover:from-\[#a3e635\] hover:to-\[#84cc16\](.*?)shadow-\[0_4px_0_#4d7c0f\](.*?)border-\[#a3e635\]/g;
content = content.replace(tutorialButtonPattern, 'from-[#3b82f6] to-[#2563eb] hover:from-[#60a5fa] hover:to-[#3b82f6]$1shadow-[0_4px_0_#1d4ed8]$2border-[#60a5fa]');

// If there are other green things in the tutorial, let's also change them if possible
// But wait, the user said "reminders should be of blue theme instead of green".
// Where are reminders? Maybe sweetalert or toast notifications?
// Search for green sweetalert buttons
content = content.replace(/confirmButtonColor: '#00a651'/g, "confirmButtonColor: '#2563eb'");
content = content.replace(/confirmButtonColor: '#00a651'/g, "confirmButtonColor: '#2563eb'");

fs.writeFileSync('index.html', content, 'utf8');
console.log("Fixes applied.");
