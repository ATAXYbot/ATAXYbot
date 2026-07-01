const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// 1. Inject computation variables before the return
const returnRegex = /\s*\};\s*return \(\s*<div className="fixed inset-0 z-\[3000000\] bg-gray-50\/95 dark:bg-gray-950\/95 backdrop-blur-xl/;

const calculationCode = `                  };
                  
                  // Compute Dashboard Metrics
                  const allDatesList = Object.keys(targetsData);
                  let dailyTotal = 0, dailyDone = 0;
                  let weeklyTotal = 0, weeklyDone = 0;
                  let monthlyTotal = 0, monthlyDone = 0;
                  let overallTotal = 0, overallDone = 0;
                  
                  const todayDateObj = new Date();
                  todayDateObj.setHours(0,0,0,0);
                  
                  allDatesList.forEach(d => {
                      const dObj = new Date(d);
                      dObj.setHours(0,0,0,0);
                      const diffTime = todayDateObj - dObj;
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      
                      const targets = targetsData[d];
                      const tTotal = targets.length;
                      const tDone = targets.filter(t => t.done).length;
                      
                      overallTotal += tTotal;
                      overallDone += tDone;
                      
                      if (d === todayStr) {
                          dailyTotal += tTotal;
                          dailyDone += tDone;
                      }
                      if (diffDays >= 0 && diffDays < 7) {
                          weeklyTotal += tTotal;
                          weeklyDone += tDone;
                      }
                      if (diffDays >= 0 && diffDays < 30) {
                          monthlyTotal += tTotal;
                          monthlyDone += tDone;
                      }
                  });
                  
                  const dRate = dailyTotal > 0 ? Math.round((dailyDone/dailyTotal)*100) : 0;
                  const wRate = weeklyTotal > 0 ? Math.round((weeklyDone/weeklyTotal)*100) : 0;
                  const mRate = monthlyTotal > 0 ? Math.round((monthlyDone/monthlyTotal)*100) : 0;
                  const oRate = overallTotal > 0 ? Math.round((overallDone/overallTotal)*100) : 0;
                  
                  return (
                      <div className="fixed inset-0 z-[3000000] bg-gray-50/95 dark:bg-gray-950/95 backdrop-blur-xl`;

if (returnRegex.test(content)) {
    content = content.replace(returnRegex, calculationCode);
    console.log("Injected calculations.");
} else {
    console.log("Could not find the return statement to inject calculations.");
}

// 2. Inject UI into the scrollable area
const scrollableAreaRegex = /<div className="flex-1 overflow-y-auto p-4 pb-\[180px\]">\s*<div className="space-y-6">/;

const dashboardUI = `<div className="flex-1 overflow-y-auto p-4 pb-[180px]">
                              
                              {/* Analytics Dashboard Grid */}
                              <div className="grid grid-cols-2 gap-3 mb-6">
                                  {[{label: 'Daily', rate: dRate, color: 'text-[#0AE0D0]', bg: 'bg-[#0AE0D0]'}, {label: 'Weekly', rate: wRate, color: 'text-blue-400', bg: 'bg-blue-400'}, {label: 'Monthly', rate: mRate, color: 'text-indigo-400', bg: 'bg-indigo-400'}, {label: 'Overall', rate: oRate, color: 'text-purple-400', bg: 'bg-purple-400'}].map((item, idx) => (
                                      <div key={idx} className="bg-gradient-to-br from-[#021633] to-[#010B1C] rounded-2xl p-4 border border-blue-900/50 shadow-sm relative overflow-hidden group hover:border-blue-700 transition-colors">
                                          <div className={\`absolute -right-4 -bottom-4 w-16 h-16 \${item.bg}/10 rounded-full blur-xl pointer-events-none transition-colors group-hover:scale-150 duration-500\`}></div>
                                          <div className="flex flex-col relative z-10">
                                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center justify-between">
                                                  {item.label}
                                                  <i className="fa-solid fa-chart-line opacity-50"></i>
                                              </span>
                                              <span className={\`text-2xl font-black \${item.color} mt-2 drop-shadow-md\`}>{item.rate}%</span>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                              
                              <div className="space-y-6">`;

if (scrollableAreaRegex.test(content)) {
    content = content.replace(scrollableAreaRegex, dashboardUI);
    console.log("Injected Dashboard UI.");
} else {
    console.log("Could not find the scrollable area to inject UI.");
}

fs.writeFileSync('index.html', content, 'utf8');
