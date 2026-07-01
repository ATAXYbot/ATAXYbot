const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// 1. Radar Sweep Shine for "Set Targets" Button
const oldShine = `{/* Continuous Glass Shine Effect */}
                                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0)_100%)] bg-[length:200%_100%] animate-[shimmer_3s_infinite] pointer-events-none"></div>`;

const newShine = `{/* Radar Sweep Shine Effect */}
                                <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[2.5rem]">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] aspect-square bg-[conic-gradient(from_0deg,transparent_0_310deg,rgba(10,224,208,0.4)_360deg)] animate-[spin_3s_linear_infinite]"></div>
                                </div>`;

if (content.includes(oldShine)) {
    content = content.replace(oldShine, newShine);
    console.log("Updated Set Targets button to Radar Sweep Shine.");
} else {
    console.log("Could not find the old shimmer shine in Set Targets button.");
}

// 2. Enhance the Today's Progress Circular Widget to continually highlight/pulse
const oldWidgetRegex = /<div className="bg-gradient-to-r from-blue-900\/40 to-indigo-900\/40 border border-blue-500\/30 rounded-2xl p-4 mb-6 flex items-center gap-4 relative overflow-hidden group shadow-lg">[\s\S]*?<svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">[\s\S]*?<\/svg>[\s\S]*?<div className="absolute inset-0 flex items-center justify-center flex-col">[\s\S]*?<span className="text-\[13px\] font-black text-white drop-shadow-md">\{todayRate\}%<\/span>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<div className="flex-1 relative z-10">[\s\S]*?<h4 className="text-white font-black text-sm tracking-wide">Today's Progress<\/h4>[\s\S]*?<p className="text-\[10px\] text-blue-200\/70 font-bold uppercase tracking-wider mt-1">\{todayDone\} out of \{todayTotal\} Targets Completed<\/p>[\s\S]*?<\/div>[\s\S]*?<\/div>/;

const newWidget = `<div className="bg-gradient-to-br from-[#021633] to-[#010B1C] border-2 border-[#0AE0D0]/50 rounded-[2rem] p-5 mb-8 flex items-center gap-5 relative overflow-hidden group shadow-[0_0_20px_rgba(10,224,208,0.25)] hover:shadow-[0_0_30px_rgba(10,224,208,0.4)] transition-all duration-300 transform hover:-translate-y-1">
                                        <div className="absolute inset-0 bg-[#0AE0D0]/5 animate-[pulse_2s_ease-in-out_infinite] pointer-events-none"></div>
                                        <div className="absolute -right-6 -top-6 w-32 h-32 bg-[#0AE0D0]/20 rounded-full blur-[40px] pointer-events-none transition-colors duration-700"></div>
                                        
                                        <div className="w-20 h-20 relative shrink-0">
                                            <div className="absolute inset-0 rounded-full border-2 border-[#0AE0D0]/50 animate-ping opacity-50 pointer-events-none"></div>
                                            <div className="absolute inset-0 rounded-full bg-[#0AE0D0]/20 blur-xl animate-pulse pointer-events-none"></div>
                                            <svg className="w-full h-full transform -rotate-90 relative z-10" viewBox="0 0 36 36">
                                                <path className="stroke-gray-800" strokeWidth="4" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                                <path className="stroke-[#0AE0D0] animate-[drawCircle_1.5s_ease-out_forwards] drop-shadow-[0_0_10px_rgba(10,224,208,0.8)]" strokeDasharray={\`\${todayRate}, 100\`} strokeWidth="4" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center flex-col z-20">
                                                <span className="text-base font-black text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">{todayRate}%</span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex-1 relative z-10">
                                            <h4 className="text-white font-black text-lg tracking-wide group-hover:text-[#0AE0D0] transition-colors">Today's Progress</h4>
                                            <p className="text-xs text-blue-200/80 font-bold uppercase tracking-wider mt-1">{todayDone} <span className="text-gray-500 mx-1">out of</span> {todayTotal} Targets</p>
                                            <div className="mt-2 text-[10px] font-black text-[#0AE0D0] uppercase tracking-widest bg-[#0AE0D0]/10 px-2.5 py-1 rounded-md inline-block border border-[#0AE0D0]/30 animate-pulse">
                                                Complete them all!
                                            </div>
                                        </div>
                                    </div>`;

if (oldWidgetRegex.test(content)) {
    content = content.replace(oldWidgetRegex, newWidget);
    console.log("Updated Today's Progress Widget with highlighting animations.");
} else {
    console.log("Could not find the Today's Progress Widget.");
}

fs.writeFileSync('index.html', content, 'utf8');
