const fs = require('fs');

let code = fs.readFileSync('index.html', 'utf8');

// 1. Update StatusShape and Palette Grid
const statusShapeStart = code.indexOf('const StatusShape = ({ status, num }) => {');
const getStatusStart = code.indexOf('const getStatus = (qId) => {');

if (statusShapeStart !== -1 && getStatusStart !== -1) {
    const newStatusShapeStr = `const StatusShape = ({ status, num, isActive }) => {
                                let inner = null;
                                if (status === 'not_visited') inner = <div className="w-[38px] h-[35px] bg-[#E2E2E2] border border-gray-400 text-black flex items-center justify-center font-semibold text-[13px] bg-gradient-to-b from-white to-[#E2E2E2] rounded-sm">{num}</div>;
                                else if (status === 'not_answered') inner = <div className="w-[38px] h-[35px] bg-[#E85D04] text-white flex items-center justify-center font-semibold text-[13px]" style={{ clipPath: 'polygon(50% 100%, 100% 75%, 100% 0, 0 0, 0 75%)' }}>{num}</div>;
                                else if (status === 'answered') inner = <div className="w-[38px] h-[35px] bg-[#5CB85C] text-white flex items-center justify-center font-semibold text-[13px]" style={{ clipPath: 'polygon(50% 100%, 100% 75%, 100% 0, 0 0, 0 75%)' }}>{num}</div>;
                                else if (status === 'marked') inner = <div className="w-[38px] h-[35px] bg-[#5C429A] rounded-full text-white flex items-center justify-center font-semibold text-[13px]">{num}</div>;
                                else if (status === 'answered_marked') inner = <div className="w-[38px] h-[35px] bg-[#5C429A] rounded-full text-white flex items-center justify-center font-semibold text-[13px] relative">{num}<div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#5CB85C] rounded-full border border-white"></div></div>;

                                return isActive ? (
                                    <div className="inline-block border-2 border-black rounded-sm">{inner}</div>
                                ) : inner;
                            };
`;
    code = code.substring(0, statusShapeStart) + newStatusShapeStr + code.substring(getStatusStart);
}

// 2. Update Options Rendering
const optionsStartRegex = /<div className="space-y-4 max-w-3xl">/m;
const optionsEndRegex = /<\/div>\s*<\/div>\s*<div className="border-t border-gray-300 bg-white p-3 shrink-0">/m;

const optionsMatch = code.match(optionsStartRegex);
const optionsEndMatch = code.match(optionsEndRegex);

if (optionsMatch && optionsEndMatch) {
    const newOptionsStr = `<div className="grid grid-cols-1 md:grid-cols-2 gap-0 mt-6 border-t border-l border-gray-300 w-full">
                                                    {currentQuestion.options?.map((opt, oIdx) => {
                                                        const isSelected = userAnsIdx === oIdx;
                                                        return (
                                                            <label key={oIdx} className={\`flex border-b border-r border-gray-300 cursor-pointer bg-white \${isSelected ? 'bg-blue-50/20' : 'hover:bg-gray-50'}\`}>
                                                                <div className="w-[45px] shrink-0 flex items-center justify-center border-r border-gray-300 bg-white text-black font-semibold text-[14px] p-2 relative">
                                                                    <input type="radio" name={'q_' + currentQuestion.id} checked={isSelected} onChange={() => {
                                                                        setPracticeAttempts(prev => ({ ...prev, [currentQuestion.id]: oIdx }));
                                                                        if (!practiceVisited.includes(currentQuestion.id)) setPracticeVisited(prev => [...prev, currentQuestion.id]);
                                                                    }} className="absolute opacity-0 w-full h-full cursor-pointer" />
                                                                    {oIdx + 1}.
                                                                </div>
                                                                <div className="flex-1 p-3 flex items-center bg-white text-black text-[15px]">
                                                                    <FormattedText text={opt} />
                                                                </div>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            <div className="border-t border-gray-300 bg-white p-3 shrink-0">`;
    
    const startIdx = optionsMatch.index;
    const endIdx = optionsEndMatch.index + optionsEndMatch[0].length;
    code = code.substring(0, startIdx) + newOptionsStr + code.substring(endIdx);
}

// 3. Update Palette rendering to pass isActive and use flex-wrap
const paletteRegex = /<div className="p-3 overflow-y-auto flex-1 grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 gap-2 content-start bg-blue-50\/50">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\}/m;
const newPalette = `<div className="p-3 overflow-y-auto flex-1 flex flex-wrap gap-1 content-start bg-white">
                                                {displayedQuestions.map((q, idx) => {
                                                    const status = getStatus(q.id);
                                                    const isActive = idx === safeQuestionIndex;
                                                    return (
                                                        <button key={q.id} onClick={() => {
                                                            if (!practiceVisited.includes(currentQuestion?.id)) setPracticeVisited(prev => [...prev, currentQuestion?.id]);
                                                            setCurrentQuestionIndex(idx);
                                                        }} className="flex justify-center cursor-pointer mb-1 mr-1">
                                                            <StatusShape status={status} num={idx + 1} isActive={isActive} />
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }`;
code = code.replace(paletteRegex, newPalette);

// 4. Also fix the Legend rendering to not pass isActive 
// Need to find instances of <StatusShape status="not_visited" num={cntNotVisited} />
// I will just use regex to ensure they are fine (they don't pass isActive, so it defaults to undefined which is false)

fs.writeFileSync('index.html', code);
console.log('Options and palette updated successfully.');
