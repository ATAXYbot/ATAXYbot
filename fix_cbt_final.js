const fs = require('fs');

let code = fs.readFileSync('index.html', 'utf8');

// 1. Update StatusShape
const statusShapeRegex = /const StatusShape = \(\{ status, num, isActive \}\) => \{[\s\S]*?return isActive \? \([\s\S]*?\) : inner;\s*\};/m;
const newStatusShapeStr = `const StatusShape = ({ status, num }) => {
                                if (status === 'not_visited') return <div className="w-[42px] h-[32px] text-black flex items-center justify-center font-normal text-[14px] bg-gradient-to-b from-[#f8f8f8] to-[#dfdfdf] rounded-[3px]" style={{ boxShadow: '0 0 0 1px #a0a0a0 inset, 0 1px 1px rgba(0,0,0,0.1)' }}>{num}</div>;
                                else if (status === 'not_answered') return <div className="w-[42px] h-[32px] bg-[#E85D04] text-white flex items-center justify-center font-normal text-[14px]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 80%, 0 100%)' }}>{num}</div>;
                                else if (status === 'answered') return <div className="w-[42px] h-[32px] bg-[#5CB85C] text-white flex items-center justify-center font-normal text-[14px]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 80%)' }}>{num}</div>;
                                else if (status === 'marked') return <div className="w-[34px] h-[34px] bg-[#5C429A] rounded-full text-white flex items-center justify-center font-normal text-[14px]">{num}</div>;
                                else if (status === 'answered_marked') return <div className="w-[34px] h-[34px] bg-[#5C429A] rounded-full text-white flex items-center justify-center font-normal text-[14px] relative">{num}<div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#5CB85C] rounded-full border border-white"></div></div>;
                                return null;
                            };`;

if (code.match(statusShapeRegex)) {
    code = code.replace(statusShapeRegex, newStatusShapeStr);
}

// 2. Remove isActive from the palette call
const paletteActiveRegex = /const isActive = idx === safeQuestionIndex;\s*return \([\s\S]*?<StatusShape status=\{status\} num=\{idx \+ 1\} isActive=\{isActive\} \/>/gm;
if (code.match(paletteActiveRegex)) {
    code = code.replace(paletteActiveRegex, `return (\n                                                        <div key={q.id} onClick={() => {\n                                                            if (!practiceVisited.includes(currentQuestion?.id)) setPracticeVisited(prev => [...prev, currentQuestion?.id]);\n                                                            setCurrentQuestionIndex(idx);\n                                                        }} className="flex justify-center cursor-pointer mb-1 mr-1">\n                                                            <StatusShape status={status} num={idx + 1} />`);
}

// 3. Update the options click box
const radioOptionsRegex = /<label key=\{oIdx\} className="flex-1 min-w-\[80px\] border-r border-b border-gray-300 p-3 sm:p-4 flex items-center gap-2 cursor-pointer hover:bg-gray-50 bg-white">[\s\S]*?<\/label>/gm;
code = code.replace(radioOptionsRegex, (match) => {
    // We rewrite the entire label block correctly
    return `<div key={oIdx} className="flex-1 min-w-[80px] border-r border-b border-gray-300 p-3 sm:p-4 flex items-center bg-white">
                                                                <label className="flex items-center gap-2 pl-2 cursor-pointer w-max">
                                                                    <input type="radio" name={'q_' + currentQuestion.id} checked={isSelected} onChange={() => {
                                                                        setPracticeAttempts(prev => ({ ...prev, [currentQuestion.id]: oIdx }));
                                                                        if (!practiceVisited.includes(currentQuestion.id)) setPracticeVisited(prev => [...prev, currentQuestion.id]);
                                                                    }} className="w-[18px] h-[18px] cursor-pointer" />
                                                                    <span className="font-normal text-gray-700 text-[14px] sm:text-[15px] pt-0.5">{oIdx + 1} )</span>
                                                                </label>
                                                            </div>`;
});


fs.writeFileSync('index.html', code);
console.log('Shapes and options click area updated successfully.');
