const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// 1. Add Edit button to the big Target Portal list
const targetPortalListTarget = `<button onClick={() => {
                                                                  const updated = group.targets.filter(x => x.id !== t.id);
                                                                  setTargetsData({ ...targetsData, [group.date]: updated });
                                                              }} className="w-8 h-8 rounded-full text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-colors shrink-0">
                                                                  <i className="fa-solid fa-trash text-xs"></i>
                                                              </button>`;
const targetPortalListReplacement = `<div className="flex items-center gap-1 shrink-0">
                                                                  <button onClick={(e) => { e.stopPropagation(); setEditingTarget({ ...t, _date: group.date }); }} className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 w-8 h-8 rounded-full flex items-center justify-center transition-all">
                                                                      <i className="fa-solid fa-pen text-xs"></i>
                                                                  </button>
                                                                  <button onClick={() => {
                                                                      const updated = group.targets.filter(x => x.id !== t.id);
                                                                      setTargetsData({ ...targetsData, [group.date]: updated });
                                                                  }} className="w-8 h-8 rounded-full text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-colors">
                                                                      <i className="fa-solid fa-trash text-xs"></i>
                                                                  </button>
                                                              </div>`;

content = content.replace(new RegExp(targetPortalListTarget.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), targetPortalListReplacement);

// 2. Fix the Edit Target Modal save logic to use _date
const saveLogicTarget = `const u = targetsData[selectedDate].map(t => t.id === editingTarget.id ? editingTarget : t);
                                                setTargetsData({ ...targetsData, [selectedDate]: u });
                                                setEditingTarget(null);`;
const saveLogicReplacement = `const tDate = editingTarget._date || selectedDate || todayStr;
                                                const currentList = targetsData[tDate] || [];
                                                const u = currentList.map(t => t.id === editingTarget.id ? editingTarget : t);
                                                setTargetsData({ ...targetsData, [tDate]: u });
                                                setEditingTarget(null);`;

content = content.replace(saveLogicTarget, saveLogicReplacement);

// 3. Make sure the small Target List Edit button also sets _date
const smallEditTarget = `<button onClick={(e) => { e.stopPropagation(); setEditingTarget(t); }}`;
const smallEditReplacement = `<button onClick={(e) => { e.stopPropagation(); setEditingTarget({ ...t, _date: todayStr }); }}`;
content = content.replace(new RegExp(smallEditTarget.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), smallEditReplacement);


fs.writeFileSync('index.html', content, 'utf8');
console.log("Added edit buttons into Target Portal list and fixed modal save logic");
