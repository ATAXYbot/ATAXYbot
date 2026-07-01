const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// 1. Fix Edit button visibility on mobile
const editBtnRegex = /className="text-gray-500 hover:text-blue-500 hover:bg-blue-500\/10 w-8 h-8 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"/g;
const editBtnReplacement = 'className="text-blue-500 md:text-gray-500 hover:text-blue-500 hover:bg-blue-500/10 w-8 h-8 rounded-full flex items-center justify-center transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"';
content = content.replace(editBtnRegex, editBtnReplacement);

// 2. Add time slots to the NEW target form in the Target Portal
// Let's find the new target form
const newTargetStateRegex = /const \[newTarget, setNewTarget\] = useState\(''\);/;
const newTargetStateReplacement = `const [newTarget, setNewTarget] = useState('');\n            const [newTargetStartTime, setNewTargetStartTime] = useState('');\n            const [newTargetEndTime, setNewTargetEndTime] = useState('');`;
content = content.replace(newTargetStateRegex, newTargetStateReplacement);

const newTargetFormRegex = /<input type="text" value=\{newTarget\} onChange=\{\(e\) => setNewTarget\(e\.target\.value\)\} placeholder="What's your target for today\?" className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 font-bold focus:outline-none px-2" \/>/;
const newTargetFormReplacement = `<div className="flex flex-col w-full gap-2">
                                        <input type="text" value={newTarget} onChange={(e) => setNewTarget(e.target.value)} placeholder="What's your target for today?" className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 font-bold focus:outline-none px-2" />
                                        <div className="flex gap-2 px-2">
                                            <div className="flex-1">
                                                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Start Time (Optional)</label>
                                                <input type="time" value={newTargetStartTime} onChange={(e) => setNewTargetStartTime(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-xs text-gray-800 dark:text-gray-200 focus:outline-none" />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">End Time (Optional)</label>
                                                <input type="time" value={newTargetEndTime} onChange={(e) => setNewTargetEndTime(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-xs text-gray-800 dark:text-gray-200 focus:outline-none" />
                                            </div>
                                        </div>
                                    </div>`;
content = content.replace(newTargetFormRegex, newTargetFormReplacement);

// Fix the target creation logic to use the new time slots
const addTargetLogicRegex = /const newTargetObj = \{ id: Date\.now\(\), text: newTarget, done: false \};/;
const addTargetLogicReplacement = `const newTargetObj = { id: Date.now(), text: newTarget, done: false, startTime: newTargetStartTime || null, endTime: newTargetEndTime || null };\n                                setNewTargetStartTime('');\n                                setNewTargetEndTime('');`;
content = content.replace(addTargetLogicRegex, addTargetLogicReplacement);

// 3. Fix the continuous nagging by persisting lastEmptyNagTime
const persistNagRegex = /const lastEmptyNag = studyPartnerState\.lastEmptyNagTime \|\| 0;/;
const persistNagReplacement = `const lastEmptyNag = parseInt(localStorage.getItem('ataxy_last_empty_nag') || '0', 10);`;
content = content.replace(persistNagRegex, persistNagReplacement);

const saveNagRegex = /setStudyPartnerState\(prev => \(\{ \.\.\.prev, lastEmptyNagTime: Date\.now\(\) \}\)\);/g;
const saveNagReplacement = `localStorage.setItem('ataxy_last_empty_nag', Date.now().toString()); setStudyPartnerState(prev => ({ ...prev, lastEmptyNagTime: Date.now() }));`;
content = content.replace(saveNagRegex, saveNagReplacement);


fs.writeFileSync('index.html', content, 'utf8');
console.log("Fixed mobile visibility, added inline target time slots, and persisted nag time.");
