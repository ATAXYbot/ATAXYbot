const fs = require('fs');

let code = fs.readFileSync('index.html', 'utf8');

const regex = /<div className="text-black text-\[15px\] sm:text-\[16px\] leading-relaxed font-medium mb-6">[\s\S]*?<FormattedText text=\{currentQuestion\?.question \|\| currentQuestion\?.text \|\| currentQuestion\?.question_text\} \/>[\s\S]*?\{currentQuestion\.imageUrl && <div className="mt-4 max-w-full overflow-hidden rounded-md border border-gray-200"><img src=\{currentQuestion\.imageUrl\} className="max-w-full h-auto object-contain max-h-\[400px\]" alt="Question" \/><\/div>\}[\s\S]*?<\/div>\s*<div className="grid grid-cols-1 md:grid-cols-2 gap-0 mt-6 border-t border-l border-gray-300 w-full">[\s\S]*?<\/div>\s*<\/div>\s*<div className="border-t border-gray-300 bg-white p-3 shrink-0">/m;

const newContent = `<div className="text-black text-[15px] sm:text-[16px] leading-relaxed font-medium mb-8">
                                                    <FormattedText text={currentQuestion?.question || currentQuestion?.text || currentQuestion?.question_text} />
                                                    {currentQuestion.imageUrl && <div className="mt-4 max-w-full overflow-hidden rounded-md border border-gray-200"><img src={currentQuestion.imageUrl} className="max-w-full h-auto object-contain max-h-[400px]" alt="Question" /></div>}
                                                    
                                                    {currentQuestion.options && currentQuestion.options.length > 0 && (
                                                        <div className="mt-8 flex flex-col gap-5 text-[15px]">
                                                            {currentQuestion.options.map((opt, oIdx) => (
                                                                <div key={oIdx} className="flex gap-2">
                                                                    <span className="font-semibold text-gray-700 shrink-0">{oIdx + 1}.</span>
                                                                    <div><FormattedText text={opt} /></div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="flex flex-wrap border-t border-l border-gray-300 mt-auto w-full">
                                                    {(currentQuestion.options || [1, 2, 3, 4]).map((_, oIdx) => {
                                                        const isSelected = userAnsIdx === oIdx;
                                                        return (
                                                            <label key={oIdx} className="flex-1 min-w-[80px] border-r border-b border-gray-300 p-3 sm:p-4 flex items-center gap-2 cursor-pointer hover:bg-gray-50 bg-white">
                                                                <input type="radio" name={'q_' + currentQuestion.id} checked={isSelected} onChange={() => {
                                                                    setPracticeAttempts(prev => ({ ...prev, [currentQuestion.id]: oIdx }));
                                                                    if (!practiceVisited.includes(currentQuestion.id)) setPracticeVisited(prev => [...prev, currentQuestion.id]);
                                                                }} className="w-[18px] h-[18px] cursor-pointer" />
                                                                <span className="font-semibold text-gray-700 text-[14px] sm:text-[15px] pt-0.5">{oIdx + 1} )</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            <div className="border-t border-gray-300 bg-white p-3 shrink-0">`;

if (code.match(regex)) {
    code = code.replace(regex, newContent);
    fs.writeFileSync('index.html', code);
    console.log('Successfully updated the options logic and layout to replicate NTA.');
} else {
    console.log('Regex did not match.');
}
