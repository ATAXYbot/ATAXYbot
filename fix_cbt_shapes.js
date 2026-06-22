const fs = require('fs');

let code = fs.readFileSync('index.html', 'utf8');

// 1. Update StatusShape ClipPaths
const statusShapeRegex = /const StatusShape = \(\{ status, num \}\) => \{[\s\S]*?return null;\s*\};/m;
const newStatusShapeStr = `const StatusShape = ({ status, num }) => {
                                if (status === 'not_visited') return <div className="w-[42px] h-[32px] text-black flex items-center justify-center font-normal text-[14px] bg-gradient-to-b from-[#f8f8f8] to-[#dfdfdf] rounded-[3px]" style={{ boxShadow: '0 0 0 1px #a0a0a0 inset, 0 1px 1px rgba(0,0,0,0.1)' }}>{num}</div>;
                                else if (status === 'not_answered') return <div className="w-[42px] h-[32px] bg-[#E85D04] text-white flex items-center justify-center font-normal text-[14px]" style={{ clipPath: 'polygon(0 0, 100% 0, 80% 100%, 0 100%)' }}>{num}</div>;
                                else if (status === 'answered') return <div className="w-[42px] h-[32px] bg-[#5CB85C] text-white flex items-center justify-center font-normal text-[14px]" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0 100%)' }}>{num}</div>;
                                else if (status === 'marked') return <div className="w-[34px] h-[34px] bg-[#5C429A] rounded-full text-white flex items-center justify-center font-normal text-[14px]">{num}</div>;
                                else if (status === 'answered_marked') return <div className="w-[34px] h-[34px] bg-[#5C429A] rounded-full text-white flex items-center justify-center font-normal text-[14px] relative">{num}<div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#5CB85C] rounded-full border border-white"></div></div>;
                                return null;
                            };`;

if (code.match(statusShapeRegex)) {
    code = code.replace(statusShapeRegex, newStatusShapeStr);
}

// 2. Remove box grid from options
const optionsRegex = /<div className="flex flex-wrap border-t border-l border-gray-300 mt-auto w-full">[\s\S]*?<\/div>\s*<\/div>\s*<div className="border-t border-gray-300 bg-white p-3 shrink-0">/m;
const newOptionsStr = `<div className="flex flex-wrap gap-x-12 gap-y-4 mt-auto w-full pt-4 pb-2 pl-2">
                                                    {(currentQuestion.options || [1, 2, 3, 4]).map((_, oIdx) => {
                                                        const isSelected = userAnsIdx === oIdx;
                                                        return (
                                                            <div key={oIdx} className="flex items-center bg-white">
                                                                <label className="flex items-center gap-2 cursor-pointer w-max">
                                                                    <input type="radio" name={'q_' + currentQuestion.id} checked={isSelected} onChange={() => {
                                                                        setPracticeAttempts(prev => ({ ...prev, [currentQuestion.id]: oIdx }));
                                                                        if (!practiceVisited.includes(currentQuestion.id)) setPracticeVisited(prev => [...prev, currentQuestion.id]);
                                                                    }} className="w-[16px] h-[16px] cursor-pointer" />
                                                                    <span className="font-normal text-gray-700 text-[14px] sm:text-[15px]">{oIdx + 1} )</span>
                                                                </label>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            <div className="border-t border-gray-300 bg-white p-3 shrink-0">`;

if (code.match(optionsRegex)) {
    code = code.replace(optionsRegex, newOptionsStr);
}

fs.writeFileSync('index.html', code);
console.log('Shapes and options grid updated successfully.');
