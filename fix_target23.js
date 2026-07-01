const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// 1. Outer div & Style
const outerRegex = /<div className="fixed inset-0 z-\[4000000\] animate-in fade-in zoom-in-95 flex flex-col bg-white dark:bg-gray-950 md:max-w-screen-xl max-w-md mx-auto shadow-2xl">/;
if (outerRegex.test(content)) {
    content = content.replace(outerRegex, `<div className="fixed inset-0 z-[4000000] flex flex-col bg-white dark:bg-gray-950 h-[100dvh] w-full md:max-w-screen-xl max-w-md mx-auto shadow-2xl animate-in fade-in zoom-in-95">\n                        <style>{\`div.fixed.bottom-0.w-full.md\\\\:max-w-screen-xl.max-w-md.glass-panel { display: none !important; } body { overflow: hidden !important; }\`}</style>`);
    console.log("Updated Outer div.");
}

// 2. Top bar
const topBarRegex = /<div className="fixed top-0 pt-safe-top w-full md:max-w-screen-xl max-w-md bg-white\/80 dark:bg-gray-950\/80 backdrop-blur-md px-4 py-3 flex items-center justify-between z-20 border-b border-gray-200\/50 dark:border-gray-800\/50">/;
if (topBarRegex.test(content)) {
    content = content.replace(topBarRegex, `<div className="flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md shrink-0 pt-[calc(16px+max(env(safe-area-inset-top),_24px))] z-10 border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm">`);
    console.log("Updated Top bar.");
}

// 3. Chat messages area
const chatAreaRegex = /<div className="flex-1 overflow-y-auto p-4 space-y-6 pt-\[80px\]">/;
if (chatAreaRegex.test(content)) {
    content = content.replace(chatAreaRegex, `<div className="flex-1 overflow-y-auto p-4 space-y-6 pb-4">`);
    console.log("Updated Chat area.");
}

// 4. Bottom input container
// The exact string we saw was:
// <div className="fixed bottom-[calc(72px+var(--safe-bottom))] w-full md:max-w-screen-xl max-w-md bg-gradient-to-t from-white via-white to-transparent dark:from-gray-950 dark:via-gray-950 px-4 pb-4 pt-12 z-20 pointer-events-none">
//                         <div className="pointer-events-auto">
// Let's use a regex to match both divs regardless of spacing
const bottomContainerRegex = /<div className="fixed bottom-\[calc\(72px\+var\(--safe-bottom\)\)\] w-full md:max-w-screen-xl max-w-md bg-gradient-to-t from-white via-white to-transparent dark:from-gray-950 dark:via-gray-950 px-4 pb-4 pt-12 z-20 pointer-events-none">\s*<div className="pointer-events-auto">/;
if (bottomContainerRegex.test(content)) {
    content = content.replace(bottomContainerRegex, `<div className="shrink-0 p-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">`);
    console.log("Updated Bottom container.");
}

// 5. Fix extra closing div
// Since we removed `<div className="pointer-events-auto">`, we must remove one `</div>`.
// The end of the component looks like:
//                                 </button>
//                             </form>
//                         </div>
//                     </div>
//                 </div>, document.body
//             );
const closingRegex = /                                <\/button>\n                            <\/form>\n                        <\/div>\n                    <\/div>\n                <\/div>, document\.body\n            \);/s;
if (closingRegex.test(content)) {
    content = content.replace(closingRegex, `                                </button>\n                            </form>\n                        </div>\n                </div>, document.body\n            );`);
    console.log("Updated closing divs.");
} else {
    console.log("Failed closing divs. Let's try flexible regex.");
    const flexClose = /<\/button>\s*<\/form>\s*<\/div>\s*<\/div>\s*<\/div>, document\.body\s*\);/;
    if (flexClose.test(content)) {
        content = content.replace(flexClose, `</button>\n                            </form>\n                    </div>\n                </div>, document.body\n            );`);
        console.log("Updated closing divs via flexible regex.");
    }
}

fs.writeFileSync('index.html', content, 'utf8');
