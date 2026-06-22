import sys
import re

file_path = "c:\\Users\\risha\\ATAXYbot\\index.html"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Insert the topicAnalysis computation inside showScoreSummary block
target_1 = r'(                            const stats = generatedTestResult\.stats \|\| \(\(\) => \{[\s\S]*?return \{ correct: c, incorrect: ic, unattempted: u \};\n                            \}\)\(\);)'

replacement_1 = r"""\1

                            const topicAnalysis = (() => {
                                const analysis = {};
                                generatedTestResult.questions.forEach(q => {
                                    const chap = q.chapterName || 'Unknown Chapter';
                                    const top = q.topicName || 'Unknown Topic';
                                    if (!analysis[chap]) analysis[chap] = { name: chap, total: 0, correct: 0, incorrect: 0, unattempted: 0, topics: {} };
                                    if (!analysis[chap].topics[top]) analysis[chap].topics[top] = { name: top, total: 0, correct: 0, incorrect: 0, unattempted: 0 };
                                    
                                    analysis[chap].total++;
                                    analysis[chap].topics[top].total++;
                                    
                                    const ans = (generatedTestResult.attempts || {})[q.id];
                                    if (ans !== undefined) {
                                        if (['A', 'B', 'C', 'D'][ans] === q.correctOption) {
                                            analysis[chap].correct++;
                                            analysis[chap].topics[top].correct++;
                                        } else {
                                            analysis[chap].incorrect++;
                                            analysis[chap].topics[top].incorrect++;
                                        }
                                    } else {
                                        analysis[chap].unattempted++;
                                        analysis[chap].topics[top].unattempted++;
                                    }
                                });
                                return Object.values(analysis).map(c => ({ ...c, topics: Object.values(c.topics) }));
                            })();"""

# 2. Insert the UI block before the Detailed Analysis button
target_2 = r'(                                            <button onClick=\{[\s\S]*?Detailed Analysis <i className="fa-solid fa-arrow-right ml-2"></i></button>)'

replacement_2 = r"""                                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm mb-6 text-left overflow-hidden">
                                                <div className="p-3 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700 font-black text-gray-800 dark:text-gray-200 text-sm">
                                                    <i className="fa-solid fa-chart-pie text-blue-500 mr-2"></i> Topic-wise Breakdown
                                                </div>
                                                <div className="max-h-56 overflow-y-auto custom-scrollbar">
                                                    {topicAnalysis.map((chap, i) => (
                                                        <details key={i} className="group border-b border-gray-100 dark:border-gray-700 last:border-0">
                                                            <summary className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors list-none">
                                                                <div className="flex-1 pr-3">
                                                                    <div className="font-bold text-[13px] text-gray-800 dark:text-gray-200 leading-tight">{chap.name}</div>
                                                                    <div className="text-[10px] text-gray-500 mt-1 font-semibold flex gap-2">
                                                                        <span className="text-green-600">{chap.correct} Correct</span> &bull; 
                                                                        <span className="text-red-500">{chap.incorrect} Wrong</span> &bull; 
                                                                        <span className="text-gray-400">{chap.unattempted} Skip</span>
                                                                    </div>
                                                                </div>
                                                                <div className="shrink-0 text-gray-400 group-open:rotate-180 transition-transform">
                                                                    <i className="fa-solid fa-chevron-down text-xs"></i>
                                                                </div>
                                                            </summary>
                                                            <div className="bg-gray-50/50 dark:bg-gray-800/30 px-3 pb-3">
                                                                <div className="space-y-1.5 mt-1">
                                                                    {chap.topics.map((top, j) => (
                                                                        <div key={j} className="flex justify-between items-center bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                                                                            <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 truncate pr-2" title={top.name}>{top.name}</span>
                                                                            <div className="flex gap-1 shrink-0">
                                                                                <span className="w-4 h-4 flex items-center justify-center bg-green-100 text-green-700 rounded text-[9px] font-bold" title="Correct">{top.correct}</span>
                                                                                <span className="w-4 h-4 flex items-center justify-center bg-red-100 text-red-700 rounded text-[9px] font-bold" title="Incorrect">{top.incorrect}</span>
                                                                                <span className="w-4 h-4 flex items-center justify-center bg-gray-100 text-gray-600 rounded text-[9px] font-bold" title="Unattempted">{top.unattempted}</span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </details>
                                                    ))}
                                                </div>
                                            </div>
\1"""

if re.search(target_1, content):
    content = re.sub(target_1, replacement_1, content, count=1)
else:
    print("Could not find target_1")
    sys.exit(1)

if re.search(target_2, content):
    content = re.sub(target_2, replacement_2, content, count=1)
else:
    print("Could not find target_2")
    sys.exit(1)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Topic analysis breakdown inserted successfully!")
