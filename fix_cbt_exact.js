const fs = require('fs');

let code = fs.readFileSync('index.html', 'utf8');

// 1. Fix the question text missing issue
const formattedTextPattern = /<FormattedText text=\{currentQuestion\.question\} \/>/g;
if (code.match(formattedTextPattern)) {
    code = code.replace(formattedTextPattern, '<FormattedText text={currentQuestion?.question || currentQuestion?.text || currentQuestion?.question_text} />');
}

// 2. Exact Replica UI adjustments
// A. Top bar design
const topBarRegex = /<div className="flex items-center gap-4">\s*<div className="w-16 h-16 bg-gray-300 flex items-center justify-center shadow-inner overflow-hidden shrink-0">[\s\S]*?<button onClick=\{\(\) => \{ setConfirmClearScope/m;
const newTopBar = `<div className="flex items-center gap-4 relative w-full">
                                            <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none hidden md:block">
                                                <svg width="200" height="100" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg"><path d="M0,100 L200,0 M50,100 L200,20 M100,100 L200,40" stroke="#000" strokeWidth="2" fill="none"/></svg>
                                            </div>
                                            <div className="w-[85px] h-[95px] bg-white border-2 border-gray-400 flex items-center justify-center overflow-hidden shrink-0">
                                                {tgUser?.photo_url ? <img src={tgUser.photo_url} className="w-full h-full object-cover" /> : <i className="fa-solid fa-user text-5xl text-gray-500"></i>}
                                            </div>
                                            <div className="text-xs sm:text-[13px] grid grid-cols-[max-content_1fr] gap-x-2 gap-y-1">
                                                <span className="text-gray-700">Candidate Name</span><span className="font-bold text-[#E85D04]">: {safeRenderText(tgUser?.first_name ? (tgUser.first_name + (tgUser.last_name ? ' ' + tgUser.last_name : '')) : 'Student')}</span>
                                                <span className="text-gray-700">Exam Name</span><span className="font-bold text-[#E85D04]">: {isNeet ? 'NEET' : 'JEE'}</span>
                                                <span className="text-gray-700">Test Name</span><span className="font-bold text-[#E85D04]">: {activePracticeChapter.name}</span>
                                                <span className="text-gray-700">Remaining Time</span><span className="font-bold text-white bg-[#ff0000] px-2 py-0.5 rounded-full inline-block w-max text-xs tracking-wider shadow-sm">: <PracticeTimer active={true} questionId={currentQuestion?.id} isAnswered={isAnswered} /></span>
                                            </div>
                                        </div>
                                        <button onClick={() => { setConfirmClearScope`;
code = code.replace(topBarRegex, newTopBar);

// B. Splitter Arrow
const splitterRegex = /<div className="w-full lg:w-\[320px\] bg-\[#E8F0F8\] flex flex-col shrink-0 lg:h-full max-h-\[40vh\] lg:max-h-none border-t lg:border-t-0 border-gray-300 overflow-hidden">/m;
const newSplitter = `<div className="w-full lg:w-[320px] bg-white flex flex-col shrink-0 lg:h-full max-h-[40vh] lg:max-h-none border-t lg:border-t-0 border-gray-300 overflow-hidden relative">
                                            <div className="absolute -left-6 top-[20%] w-6 h-10 bg-black text-white flex items-center justify-center cursor-pointer rounded-l-md hidden lg:flex z-50">
                                                <i className="fa-solid fa-chevron-right text-xs"></i>
                                            </div>`;
code = code.replace(splitterRegex, newSplitter);

// C. Right panel Legend dashed border
const legendRegex = /<div className="p-3 bg-white border-b border-gray-300 grid grid-cols-2 gap-y-3 gap-x-2 text-\[11px\] sm:text-xs text-gray-700 shrink-0">/m;
const newLegend = `<div className="p-3 m-2 bg-white border-2 border-dashed border-gray-500 grid grid-cols-2 gap-y-3 gap-x-2 text-[11px] sm:text-[12px] text-gray-700 shrink-0 relative">`;
code = code.replace(legendRegex, newLegend);

// D. Bottom action buttons match picture exact layout
const bottomActionsRegex = /<div className="border-t border-gray-300 bg-white p-2 shrink-0">[\s\S]*?<div className="bg-gray-100 border-t border-gray-300 px-3 py-2 flex justify-between shrink-0">/m;
const newBottomActions = `<div className="border-t border-gray-300 bg-white p-3 shrink-0">
                                                <div className="flex gap-1 mb-3">
                                                    <button onClick={() => {
                                                        if (practiceReview.includes(currentQuestion?.id)) setPracticeReview(prev => prev.filter(id => id !== currentQuestion?.id));
                                                        handleNext();
                                                    }} className="bg-[#5CB85C] hover:bg-[#4cae4c] text-white text-[12px] font-bold px-4 py-2 uppercase border border-[#4cae4c]">Save & Next</button>
                                                    <button onClick={() => handleClear(currentQuestion?.id)} className="bg-white hover:bg-gray-100 text-black text-[12px] font-bold px-4 py-2 uppercase border border-gray-300">Clear</button>
                                                    <button onClick={() => {
                                                        if (!practiceReview.includes(currentQuestion?.id)) setPracticeReview(prev => [...prev, currentQuestion?.id]);
                                                        handleNext();
                                                    }} className="bg-[#F0AD4E] hover:bg-[#eea236] text-white text-[12px] font-bold px-4 py-2 uppercase border border-[#eea236]">Save & Mark For Review</button>
                                                    <button onClick={() => {
                                                        if (!practiceReview.includes(currentQuestion?.id)) setPracticeReview(prev => [...prev, currentQuestion?.id]);
                                                        handleNext();
                                                    }} className="bg-[#337AB7] hover:bg-[#286090] text-white text-[12px] font-bold px-4 py-2 uppercase border border-[#2e6da4]">Mark For Review & Next</button>
                                                </div>
                                            </div>
                                            <div className="bg-gray-100 border-t border-gray-300 px-4 py-3 flex justify-between shrink-0">`;
code = code.replace(bottomActionsRegex, newBottomActions);

// E. "Next >>" and "<< Back" styling
const navBtnsRegex = /<button onClick=\{handlePrevious\} disabled=\{safeQuestionIndex === 0\} className="bg-white hover:bg-gray-50 border border-gray-400 text-gray-700 text-\[11px\] sm:text-xs font-bold px-4 py-1\.5 rounded-sm shadow-sm disabled:opacity-50 active:scale-95">&lt;&lt; Back<\/button>\s*<button onClick=\{handleNext\} disabled=\{safeQuestionIndex >= displayedQuestions\.length - 1\} className="bg-white hover:bg-gray-50 border border-gray-400 text-gray-700 text-\[11px\] sm:text-xs font-bold px-4 py-1\.5 rounded-sm shadow-sm disabled:opacity-50 active:scale-95">Next &gt;&gt;<\/button>/m;
const newNavBtns = `<button onClick={handlePrevious} disabled={safeQuestionIndex === 0} className="bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 text-[12px] font-bold px-4 py-2 shadow-sm disabled:opacity-50">&lt;&lt; BACK</button>
                                                    <button onClick={handleNext} disabled={safeQuestionIndex >= displayedQuestions.length - 1} className="bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 text-[12px] font-bold px-4 py-2 shadow-sm disabled:opacity-50">NEXT &gt;&gt;</button>`;
code = code.replace(navBtnsRegex, newNavBtns);

fs.writeFileSync('index.html', code);
console.log('UI updated successfully.');
