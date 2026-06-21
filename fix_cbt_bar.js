const fs = require('fs');
let content = fs.readFileSync('c:/Users/risha/ATAXYbot/index.html', 'utf8');

// 1. Move the CBT Bottom Bar outside the animated container
const cbtBarStart = content.indexOf('{/* CBT Bottom Bar */}');
if (cbtBarStart !== -1) {
    const cbtBarEndStr = '</div>\n\n                                {/* CBT Palette Slide-over Modal */}';
    let cbtBarEnd = content.indexOf(cbtBarEndStr, cbtBarStart);
    if (cbtBarEnd === -1) {
        cbtBarEnd = content.indexOf('</div>\r\n\r\n                                {/* CBT Palette Slide-over Modal */}', cbtBarStart);
    }
    
    if (cbtBarEnd !== -1) {
        const fullBarBlock = content.substring(cbtBarStart, cbtBarEnd + 6); // include </div>
        
        // Remove it from its current position
        content = content.substring(0, cbtBarStart) + content.substring(cbtBarEnd + 6);
        
        // Find the return statement start
        const returnStartSearch = 'return (\n                            <div className="pb-32 animate-pop-in relative min-h-screen';
        let returnStart = content.indexOf(returnStartSearch);
        if (returnStart === -1) {
            returnStart = content.indexOf('return (\r\n                            <div className="pb-32 animate-pop-in relative min-h-screen');
        }
        
        // Find the return statement end
        // Let's use the known end context
        const endContextSearch = '                                    </div>\n                                )}\n                            </div>\n                        );\n                    }\n\n                    if (activePracticeSubject) {';
        let returnEnd = content.indexOf(endContextSearch);
        if (returnEnd === -1) {
             const endContextSearchWin = '                                    </div>\r\n                                )}\r\n                            </div>\r\n                        );\r\n                    }\r\n\r\n                    if (activePracticeSubject) {';
             returnEnd = content.indexOf(endContextSearchWin);
        }

        if (returnStart !== -1 && returnEnd !== -1) {
            // Modify the extracted CBT bar to add `left-1/2 -translate-x-1/2` and keep it max-w-md
            let modifiedBar = fullBarBlock.replace(
                'className="fixed bottom-0 w-full bg-gray-100 border-t border-gray-300 px-2 py-3 z-[45] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] pb-safe"',
                'className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full md:max-w-screen-xl max-w-md bg-gray-100 border-t border-gray-300 px-2 py-3 z-[45] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] pb-[env(safe-area-inset-bottom,_12px)]"'
            );

            // Now apply the fragment wrapping
            const beforeReturn = content.substring(0, returnStart + 'return ('.length);
            // wait, we need to add <>\n
            const afterReturn = content.substring(returnStart + 'return ('.length, returnEnd);
            // returnEnd points to `                                    </div>...`
            // Let's find exactly the line with `                        );`
            const closingParenSearch = '                        );';
            const closingParenIdx = content.indexOf(closingParenSearch, returnEnd);
            
            if (closingParenIdx !== -1) {
                 const newReturnBlock = '\n                            <>\n' + content.substring(returnStart + 'return ('.length, closingParenIdx) + '\n' + modifiedBar + '\n                            </>\n' + content.substring(closingParenIdx);
                 content = content.substring(0, returnStart + 'return ('.length) + newReturnBlock;
                 console.log('Successfully fixed CBT bottom bar positioning!');
            } else {
                 console.log('Could not find closing parenthesis for the return.');
            }
        } else {
            console.log('Could not find return start or end.');
            console.log('returnStart:', returnStart);
            console.log('returnEnd:', returnEnd);
        }
    }
}

fs.writeFileSync('c:/Users/risha/ATAXYbot/index.html', content, 'utf8');
