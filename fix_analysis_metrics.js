const fs = require('fs');

let code = fs.readFileSync('index.html', 'utf8');

const regex = /<div className="flex-1 bg-white\/10 rounded-2xl p-4 backdrop-blur-md border border-white\/20">\s*<p className="text-\[10px\] uppercase tracking-widest text-blue-200 font-bold mb-1">Accuracy<\/p>\s*<p className="text-3xl font-black">\{generatedTestResult\.accuracy\}%<\/p>\s*<\/div>\s*<\/div>\s*<\/div>/m;

const newContent = `<div className="flex-1 bg-white/10 rounded-2xl p-4 backdrop-blur-md border border-white/20">
                                                <p className="text-[10px] uppercase tracking-widest text-blue-200 font-bold mb-1">Accuracy</p>
                                                <p className="text-3xl font-black">{generatedTestResult.accuracy}%</p>
                                            </div>
                                        </div>
                                        
                                        {/* Detailed Metrics */}
                                        <div className="grid grid-cols-3 gap-2 mt-4 relative z-10">
                                            <div className="bg-green-500/20 rounded-xl p-3 border border-green-400/30 text-center">
                                                <p className="text-xs text-green-100 font-bold mb-1">Correct</p>
                                                <p className="text-xl font-black text-green-50">{generatedTestResult.questions.filter(q => generatedTestResult.attempts[q.id] !== undefined && ['A','B','C','D'][generatedTestResult.attempts[q.id]] === q.correctOption).length}</p>
                                            </div>
                                            <div className="bg-red-500/20 rounded-xl p-3 border border-red-400/30 text-center">
                                                <p className="text-xs text-red-100 font-bold mb-1">Incorrect</p>
                                                <p className="text-xl font-black text-red-50">{generatedTestResult.questions.filter(q => generatedTestResult.attempts[q.id] !== undefined && ['A','B','C','D'][generatedTestResult.attempts[q.id]] !== q.correctOption).length}</p>
                                            </div>
                                            <div className="bg-white/10 rounded-xl p-3 border border-white/20 text-center">
                                                <p className="text-xs text-gray-200 font-bold mb-1">Skipped</p>
                                                <p className="text-xl font-black text-white">{generatedTestResult.questions.filter(q => generatedTestResult.attempts[q.id] === undefined).length}</p>
                                            </div>
                                        </div>
                                    </div>`;

if (code.match(regex)) {
    code = code.replace(regex, newContent);
    fs.writeFileSync('index.html', code);
    console.log('Added detailed metrics to analysis page.');
} else {
    console.log('Regex did not match.');
}
