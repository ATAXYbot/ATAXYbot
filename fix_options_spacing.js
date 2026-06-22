const fs = require('fs');

let code = fs.readFileSync('index.html', 'utf8');

const regex = /<div className="flex flex-wrap gap-x-12 gap-y-4 mt-auto w-full pt-4 pb-2 pl-2">[\s\S]*?<\/div>\s*<\/div>\s*<div className="border-t border-gray-300 bg-white p-3 shrink-0">/m;

const newOptionsStr = `<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-auto w-full pt-8 pb-4 pl-2 pr-4">
                                                    {(currentQuestion.options || [1, 2, 3, 4]).map((_, oIdx) => {
                                                        const isSelected = userAnsIdx === oIdx;
                                                        return (
                                                            <div key={oIdx} className="flex items-center bg-white">
                                                                <label className="flex items-center gap-3 cursor-pointer w-max">
                                                                    <input type="radio" name={'q_' + currentQuestion.id} checked={isSelected} onChange={() => {
                                                                        setPracticeAttempts(prev => ({ ...prev, [currentQuestion.id]: oIdx }));
                                                                        if (!practiceVisited.includes(currentQuestion.id)) setPracticeVisited(prev => [...prev, currentQuestion.id]);
                                                                    }} className="w-[18px] h-[18px] cursor-pointer" />
                                                                    <span className="font-normal text-gray-700 text-[15px] sm:text-[16px]">{oIdx + 1} )</span>
                                                                </label>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            <div className="border-t border-gray-300 bg-white p-3 shrink-0">`;

if (code.match(regex)) {
    code = code.replace(regex, newOptionsStr);
    fs.writeFileSync('index.html', code);
    console.log('Options spacing fixed using grid.');
} else {
    console.log('Regex did not match.');
}
