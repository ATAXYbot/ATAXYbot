const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// 1. Outer div & Style
const outerStr = `<div className="fixed inset-0 z-[4000000] animate-in fade-in zoom-in-95 flex flex-col bg-white dark:bg-gray-950 md:max-w-screen-xl max-w-md mx-auto shadow-2xl">`;
const outerReplace = `<div className="fixed inset-0 z-[4000000] flex flex-col bg-white dark:bg-gray-950 h-[100dvh] w-full md:max-w-screen-xl max-w-md mx-auto shadow-2xl animate-in fade-in zoom-in-95">\n                        <style>{\`div.fixed.bottom-0.w-full.md\\\\:max-w-screen-xl.max-w-md.glass-panel { display: none !important; } body { overflow: hidden !important; }\`}</style>`;

if (content.includes(outerStr)) {
    content = content.replace(outerStr, outerReplace);
    console.log("Updated Outer div.");
} else {
    console.log("Failed Outer div.");
}

// 2. Top bar
const topBarStr = `<div className="fixed top-0 pt-safe-top w-full md:max-w-screen-xl max-w-md bg-white/80 dark:bg-gray-950/80 backdrop-blur-md px-4 py-3 flex items-center justify-between z-20 border-b border-gray-200/50 dark:border-gray-800/50">`;
const topBarReplace = `<div className="flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md shrink-0 pt-[calc(16px+max(env(safe-area-inset-top),_24px))] z-10 border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm">`;

if (content.includes(topBarStr)) {
    content = content.replace(topBarStr, topBarReplace);
    console.log("Updated Top bar.");
} else {
    console.log("Failed Top bar.");
}

// 3. Chat messages area
const chatAreaStr = `<div className="flex-1 overflow-y-auto p-4 space-y-6 pt-[80px]">`;
const chatAreaReplace = `<div className="flex-1 overflow-y-auto p-4 space-y-6 pb-4">`;

if (content.includes(chatAreaStr)) {
    content = content.replace(chatAreaStr, chatAreaReplace);
    console.log("Updated Chat area.");
} else {
    console.log("Failed Chat area.");
}

// 4. Bottom input container
const bottomContainerStr = `<div className="fixed bottom-[calc(72px+var(--safe-bottom))] w-full md:max-w-screen-xl max-w-md bg-gradient-to-t from-white via-white to-transparent dark:from-gray-950 dark:via-gray-950 px-4 pb-4 pt-12 z-20 pointer-events-none">
                        <div className="pointer-events-auto">`;
const bottomContainerReplace = `<div className="shrink-0 p-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">`;

if (content.includes(bottomContainerStr)) {
    content = content.replace(bottomContainerStr, bottomContainerReplace);
    console.log("Updated Bottom container.");
} else {
    console.log("Failed Bottom container.");
}

// 5. Fix extra closing div
const closingStr = `                            </form>
                        </div>
                    </div>
                </div>, document.body`;
const closingReplace = `                            </form>
                    </div>
                </div>, document.body`;

if (content.includes(closingStr)) {
    content = content.replace(closingStr, closingReplace);
    console.log("Updated closing divs.");
} else {
    console.log("Failed closing divs.");
}

fs.writeFileSync('index.html', content, 'utf8');
