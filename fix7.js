const fs = require('fs');

let modalCode = fs.readFileSync('analytics_modal_orig.js', 'utf8');

const dynamicLogic = `
                // 1. Group Data Dynamically
                let totalAttempted = 0;
                let totalCorrect = 0;

                const subjectStats = {};
                const chapterStats = {};
                const colors = ['text-blue-500', 'text-purple-500', 'text-orange-500', 'text-emerald-500', 'text-pink-500', 'text-cyan-500'];

                qbankData.forEach((sub, idx) => {
                    const group = sub.name;
                    if (!subjectStats[group]) {
                        subjectStats[group] = { attempted: 0, correct: 0, colorClass: colors[idx % colors.length] };
                    }

                    sub.chapters?.forEach(chap => {
                        chap.topics?.forEach(top => top.questions?.forEach(q => {
                            if (perf[q.id] !== undefined) {
                                if (!chapterStats[chap.name]) {
                                    chapterStats[chap.name] = { subjectGroup: group, attempted: 0, correct: 0 };
                                }
                                totalAttempted++;
                                subjectStats[group].attempted++;
                                chapterStats[chap.name].attempted++;
                                if (perf[q.id] === q.correct || ['A', 'B', 'C', 'D'][perf[q.id]] === q.correctOption) {
                                    totalCorrect++;
                                    subjectStats[group].correct++;
                                    chapterStats[chap.name].correct++;
                                }
                            }
                        }));
                    });
                });

                const getAccuracy = (group) => {
                    const s = subjectStats[group];
                    if (!s || s.attempted === 0) return 0;
                    return Math.round((s.correct / s.attempted) * 100);
                };

                const overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
`;

const oldGroupLogicStart = modalCode.indexOf('// 1. Group Data into Subjects & Chapters');
const oldGroupLogicEnd = modalCode.indexOf('return ReactDOM.createPortal(');
modalCode = modalCode.slice(0, oldGroupLogicStart) + dynamicLogic + '\n                ' + modalCode.slice(oldGroupLogicEnd);

const oldRingsStart = modalCode.indexOf('{/* SCORE PREDICTION (CORE FEATURE) */}');
const oldRingsEndMarker = '{/* SUBJECT TABS & CHAPTER-WISE TABLE */}';
const oldRingsEnd = modalCode.indexOf(oldRingsEndMarker);

const newRings = `{/* OVERALL ACCURACY (CORE FEATURE) */}
                            <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-800/80 text-center relative overflow-hidden mb-6">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
                                <h3 className="font-black text-xl text-gray-900 dark:text-white mb-1 tracking-wide">
                                    Overall Accuracy: <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">{overallAccuracy}%</span>
                                </h3>
                                <p className="text-[10px] text-gray-500 mb-6 uppercase tracking-widest font-semibold">Based on universal question practice</p>

                                <div className="flex justify-around items-center flex-wrap gap-4">
                                    {Object.keys(subjectStats).filter(k => subjectStats[k].attempted > 0).map(group => (
                                        <CircularRing key={group} score={getAccuracy(group)} max={100} colorClass={subjectStats[group].colorClass} label={group} />
                                    ))}
                                    {Object.keys(subjectStats).filter(k => subjectStats[k].attempted > 0).length === 0 && (
                                        <div className="text-gray-400 text-sm italic py-4 w-full">Solve questions to see subject accuracies.</div>
                                    )}
                                </div>
                            </div>

                            `;
modalCode = modalCode.slice(0, oldRingsStart) + newRings + modalCode.slice(oldRingsEnd);

const oldTabsStart = modalCode.indexOf('{[');
const oldTabsEnd = modalCode.indexOf('</div>', oldTabsStart);
const newTabs = `{Object.keys(subjectStats).filter(k => subjectStats[k].attempted > 0).map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => handleTabClick(tab)}
                                            className={\`flex-1 py-2.5 text-xs font-bold rounded-full transition-all duration-300 \${activeAnalysisTab === tab ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm border border-gray-200 dark:border-gray-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border border-transparent'}\`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                `;
modalCode = modalCode.slice(0, oldTabsStart) + newTabs + modalCode.slice(oldTabsEnd);

let indexCode = fs.readFileSync('index.html', 'utf8');
const indexStart = indexCode.indexOf('const renderAnalyticsModal = () => {');
const indexEnd = indexCode.indexOf('// --- PROFILE & PERFORMANCE ---');
indexCode = indexCode.slice(0, indexStart) + modalCode + '\n            ' + indexCode.slice(indexEnd);
fs.writeFileSync('index.html', indexCode);
console.log('Fixed index.html!');
