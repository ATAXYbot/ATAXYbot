const fs = require('fs');
let content = fs.readFileSync('c:/Users/risha/ATAXYbot/index.html', 'utf8');
const lines = content.split('\n');

const toInsert = `                                                            )}
                                                        </div>

                                                {isAnswered && (
                                                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-sm mt-6 animate-in fade-in slide-in-from-top-2">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <i className={\`fa-solid \${isCorrect ? 'fa-circle-check text-[#1e7e34]' : 'fa-circle-xmark text-[#c5221f]'} text-lg\`}></i>
                                                            <span className={\`font-bold text-sm \${isCorrect ? 'text-[#1e7e34]' : 'text-[#c5221f]'}\`}>
                                                                {isCorrect ? 'Correct Answer' : 'Incorrect Answer'}
                                                            </span>
                                                        </div>
                                                        {currentQuestion.explanation && currentQuestion.explanation.trim().toLowerCase() !== 'no explanation' && (
                                                            <div className="text-sm text-gray-700 mt-2 bg-white p-3 border border-gray-200 rounded-sm">
                                                                <span className="font-semibold text-black">Explanation:</span> <FormattedText text={currentQuestion.explanation} />
                                                            </div>
                                                        )}`;

// Find exactly the place
for (let i = 8350; i < 8370; i++) {
    if (lines[i] && lines[i].includes(')}') && lines[i+1] && lines[i+1].includes('</div>') && lines[i+2] && lines[i+2].includes(')}')) {
        // We found the buggy block
        lines.splice(i, 2, ...toInsert.split('\n'));
        break;
    }
}

fs.writeFileSync('c:/Users/risha/ATAXYbot/index.html', lines.join('\n'));
