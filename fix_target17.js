const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const oldGridRegex = /\{\/\* Analytics Dashboard Grid \*\/\}\s*<div className="grid grid-cols-2 gap-3 mb-6">[\s\S]*?<\/div>\s*<\/div>\s*\)\)\}\s*<\/div>/;

const newCompactDashboard = `{/* Compact Analytics Dashboard */}
                              <div className="bg-gradient-to-br from-[#021633] to-[#010B1C] border border-[#0AE0D0]/20 rounded-[1.5rem] p-3 mb-5 flex justify-between items-center shadow-lg relative overflow-hidden">
                                  <div className="absolute inset-0 bg-[#0AE0D0]/5 pointer-events-none"></div>
                                  
                                  {[
                                      {label: 'Daily', rate: dRate, strokeColor: '#0AE0D0', shadowColor: 'rgba(10,224,208,0.5)'}, 
                                      {label: 'Weekly', rate: wRate, strokeColor: '#60A5FA', shadowColor: 'rgba(96,165,250,0.5)'}, 
                                      {label: 'Monthly', rate: mRate, strokeColor: '#818CF8', shadowColor: 'rgba(129,140,248,0.5)'}, 
                                      {label: 'Overall', rate: oRate, strokeColor: '#C084FC', shadowColor: 'rgba(192,132,252,0.5)'}
                                  ].map((item, idx) => (
                                      <div key={idx} className="flex flex-col items-center gap-1 z-10">
                                          <div className="w-[42px] h-[42px] relative shrink-0">
                                              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                                  <path className="stroke-blue-950" strokeWidth="4" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                                  <path style={{ stroke: item.strokeColor, filter: \`drop-shadow(0px 0px 3px \${item.shadowColor})\` }} strokeDasharray={\`\${item.rate}, 100\`} strokeWidth="4" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                              </svg>
                                              <div className="absolute inset-0 flex items-center justify-center flex-col">
                                                  <span className="text-[9px] font-black text-white">{item.rate}%</span>
                                              </div>
                                          </div>
                                          <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">{item.label}</span>
                                      </div>
                                  ))}
                              </div>`;

if (oldGridRegex.test(content)) {
    content = content.replace(oldGridRegex, newCompactDashboard);
    console.log("Updated Analytics Dashboard to compact circular theme.");
} else {
    console.log("Could not find the Analytics Dashboard block to replace.");
}

fs.writeFileSync('index.html', content, 'utf8');
