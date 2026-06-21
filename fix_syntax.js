const fs = require('fs');

let content = fs.readFileSync('c:/Users/risha/ATAXYbot/index.html', 'utf8');

const targetStr = `                                                        <div className="mt-4">
                                                            
                                                        
                                                        </div>
<QuestionAIAssistant q={currentQuestion} attemptIdx={selectedOptionIdx} />
                                                        </div>
                                                    </div>
                                                )}`;

const replacementStr = `                                                        <div className="mt-4">
                                                            <QuestionAIAssistant q={currentQuestion} attemptIdx={selectedOptionIdx} />
                                                        </div>
                                                    </div>
                                                )}`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replacementStr);
    fs.writeFileSync('c:/Users/risha/ATAXYbot/index.html', content, 'utf8');
    console.log('Fixed syntax error!');
} else {
    // try removing the exact block matching what we see in the file
    const searchRegex = /<div className="mt-4">\s*<\/div>\s*<QuestionAIAssistant q=\{currentQuestion\} attemptIdx=\{selectedOptionIdx\} \/>\s*<\/div>\s*<\/div>\s*\)\}/;
    if (searchRegex.test(content)) {
        content = content.replace(searchRegex, `<div className="mt-4">
                                                            <QuestionAIAssistant q={currentQuestion} attemptIdx={selectedOptionIdx} />
                                                        </div>
                                                    </div>
                                                )}`);
        fs.writeFileSync('c:/Users/risha/ATAXYbot/index.html', content, 'utf8');
        console.log('Fixed syntax error via regex!');
    } else {
        console.log('Could not find the exact syntax error block.');
    }
}
