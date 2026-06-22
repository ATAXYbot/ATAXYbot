const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const regex = /<button onClick=\{\(\) => \{\s*setGeneratedTestResult\(test\);\s*setAnalysisQuestionIndex\(0\);\s*\}\} className="w-full py-2\.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold shadow-\[0_4px_14px_rgba\(59,130,246,0\.4\)\] transition-colors text-sm">Analysis <i className="fa-solid fa-arrow-right ml-1"><\/i><\/button>\s*<\/div>\s*<\/div>\s*\)\)\}/m;

if(code.match(regex)) {
    code = code.replace(regex, `<button onClick={() => {
                                                            setGeneratedTestResult(test);
                                                            setAnalysisQuestionIndex(0);
                                                        }} className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold shadow-[0_4px_14px_rgba(59,130,246,0.4)] transition-colors text-sm">Analysis <i className="fa-solid fa-arrow-right ml-1"></i></button>
                                                    </div>
                                                </div>
                                            ))})()}`);
    fs.writeFileSync('index.html', code);
    console.log('Fixed IIFE closing');
} else {
    console.log('Regex failed for IIFE');
}
