const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const streakBlock = `                        <div className="bg-gradient-to-r from-orange-400 via-red-500 to-rose-500 dark:from-slate-900 dark:to-slate-800 dark:border dark:border-orange-500/30 rounded-3xl p-6 text-white shadow-[0_10px_25px_rgba(249,115,22,0.3)] dark:shadow-[0_0_20px_rgba(249,115,22,0.15)] flex items-center justify-between mb-8 animate-pop-bounce delay-200 hover:scale-[1.02] transition-transform">
                            <div>
                                <h4 className="font-black text-xl flex items-center gap-2 dark:text-orange-400"><i className="fa-solid fa-fire text-yellow-200 dark:text-orange-500"></i> {studyStreak.count} Day Mastery Streak!</h4>
                                <p className="text-sm text-white/90 dark:text-gray-300 font-medium mt-1">Keep practicing every day to maintain your streak.</p>
                            </div>
                            <i className="fa-solid fa-bolt text-5xl opacity-20 dark:text-orange-500 dark:opacity-30 animate-pulse-soft"></i>
                        </div>`;

code = code.replace(streakBlock, '');
fs.writeFileSync('index.html', code);
console.log('Streak block removed');
