const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const regex = /<div className="bg-gray-50 dark:bg-gray-800\/50 p-3 rounded-xl flex-1 text-center border border-gray-100 dark:border-gray-800">[\s\S]*?<\/div>\s*<div className="bg-gray-50 dark:bg-gray-800\/50 p-3 rounded-xl flex-1 text-center border border-gray-100 dark:border-gray-800">[\s\S]*?<\/div>/;

const replacement = `<div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded-xl flex-1 text-center border border-gray-100 dark:border-gray-800">
                                                            <div className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">Score</div>
                                                            <div className="text-xl font-black text-gray-800 dark:text-gray-200">{test.score || 0} <span className="text-xs text-gray-400 font-bold">/ {test.totalMarks}</span></div>
                                                        </div>
                                                        <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded-xl flex-1 text-center border border-gray-100 dark:border-gray-800">
                                                            <div className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">Accuracy</div>
                                                            <div className="text-xl font-black text-gray-800 dark:text-gray-200">{test.accuracy ? Math.round(test.accuracy) : 0}%</div>
                                                        </div>
                                                        {test.config && (
                                                            <div onClick={() => setSyllabusTest(test)} className="bg-purple-50 dark:bg-purple-900/30 p-2 rounded-xl flex-1 text-center border border-purple-100 dark:border-purple-800 cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors flex flex-col justify-center items-center">
                                                                <i className="fa-solid fa-list text-purple-500 mb-1"></i>
                                                                <div className="text-purple-600 dark:text-purple-300 text-[10px] font-bold uppercase tracking-widest">Syllabus</div>
                                                            </div>
                                                        )}`;

if (code.match(regex)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('index.html', code);
    console.log('Successfully updated history card');
} else {
    console.log('Regex still not matching');
}
