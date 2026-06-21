const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

function safeReplace(oldStr, newStr) {
    if (code.includes(oldStr)) {
        code = code.replace(oldStr, newStr);
        console.log('Replaced:', oldStr.substring(0, 30) + '...');
    } else {
        console.log('NOT FOUND:', oldStr.substring(0, 30) + '...');
    }
}

// 1. Fix chat auto-scroll
safeReplace(
    "chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });", 
    "chatEndRef.current?.scrollIntoView({ behavior: 'instant', block: 'end' });"
);

safeReplace(
    'chatEndRef.current?.scrollIntoView({ behavior: "smooth" });', 
    'chatEndRef.current?.scrollIntoView({ behavior: "instant", block: "end" });'
);

safeReplace(
    'chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });', 
    'chatEndRef.current?.scrollIntoView({ behavior: "instant", block: "end" });'
);

// 2. Modals to portals
safeReplace(
    'const renderAnalyticsModal = () => {\\n        if (!showAnalyticsModal) return null;\\n\\n        return (\\n            <div className="fixed inset-0',
    'const renderAnalyticsModal = () => {\\n        if (!showAnalyticsModal) return null;\\n\\n        return ReactDOM.createPortal(\\n            <div className="fixed inset-0'
);

// We need to use regex for the modal end since it's hard to match perfectly.
// Let's do it manually via split/join or careful indexOf
const renderAnalyticsModalIdx = code.indexOf('const renderAnalyticsModal = () => {');
if (renderAnalyticsModalIdx !== -1) {
    const returnStart = code.indexOf('return (', renderAnalyticsModalIdx);
    if (returnStart !== -1) {
        code = code.substring(0, returnStart) + 'return ReactDOM.createPortal(' + code.substring(returnStart + 6);
        const modalEnd = code.indexOf('};', returnStart);
        const closingParen = code.lastIndexOf(');', modalEnd);
        code = code.substring(0, closingParen) + ', document.body\n);' + code.substring(closingParen + 2);
    }
}

// 3. Make the Target Analyzer subject-agnostic
// I will just do line-by-line replacement to be completely safe.
const lines = code.split('\\n');

let inTargetAnalyzer = false;
let inSubjectRadar = false;

for (let i = 0; i < lines.length; i++) {
    const l = lines[i];

    // Remove old subject regexes
    if (l.includes('const phyRegex = /phy|physics')) lines[i] = '';
    if (l.includes('const chemRegex = /chem|chemistry')) lines[i] = '';
    if (l.includes('const bioRegex = /bio|biology')) lines[i] = '';
    if (l.includes('const mockRegex = /mock|test')) lines[i] = '';

    if (l.includes('let subjectsBreakdown = { physics: 0, chemistry: 0, biology: 0, mock: 0, other: 0 };')) {
        lines[i] = '                let dailyRate = 0; let weeklyRate = 0; let monthlyRate = 0;';
    }

    if (l.includes('if (mockRegex.test(t.text)) subjectsBreakdown.mock++;')) lines[i] = '';
    if (l.includes('else if (phyRegex.test(t.text)) subjectsBreakdown.physics++;')) lines[i] = '';
    if (l.includes('else if (chemRegex.test(t.text)) subjectsBreakdown.chemistry++;')) lines[i] = '';
    if (l.includes('else if (bioRegex.test(t.text)) subjectsBreakdown.biology++;')) lines[i] = '';
    if (l.includes('else subjectsBreakdown.other++;')) lines[i] = '';

    if (l.includes('const yesterdayDate = new Date();')) {
        // Insert daily/weekly/monthly calculation
        lines[i] = `
                const now = new Date();
                const oneDay = 24 * 60 * 60 * 1000;
                let wT = 0, wC = 0, mT = 0, mC = 0, dT = 0, dC = 0;
                
                rawDaysData.forEach(d => {
                    const dDate = new Date(d.dateStr);
                    const diffDays = Math.round(Math.abs((now - dDate) / oneDay));
                    if (diffDays === 0) { dT += d.dayTotal; dC += d.dayDone; }
                    if (diffDays <= 7) { wT += d.dayTotal; wC += d.dayDone; }
                    if (diffDays <= 30) { mT += d.dayTotal; mC += d.dayDone; }
                });
                dailyRate = dT > 0 ? Math.round((dC/dT)*100) : 0;
                weeklyRate = wT > 0 ? Math.round((wC/wT)*100) : 0;
                monthlyRate = mT > 0 ? Math.round((mC/mT)*100) : 0;
                
                const yesterdayDate = new Date();`;
    }

    // Replace Subject Radar in Detailed Analyzer Modal
    if (l.includes('{/* Subject Radar */}')) {
        inSubjectRadar = true;
        lines[i] = `                                 {/* Time-Based Completion Rates */}
                                 <div className="grid grid-cols-2 gap-3 mb-6">
                                     <div className="bg-[#010B1C]/80 rounded-2xl p-4 border border-blue-500/20 flex flex-col justify-center text-center relative overflow-hidden">
                                         <i className="fa-solid fa-calendar-day absolute -right-3 -bottom-3 text-5xl text-blue-500/10"></i>
                                         <span className="text-2xl font-black text-blue-400">{dailyRate}%</span>
                                         <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1">Daily Completion</span>
                                     </div>
                                     <div className="bg-[#010B1C]/80 rounded-2xl p-4 border border-emerald-500/20 flex flex-col justify-center text-center relative overflow-hidden">
                                         <i className="fa-solid fa-calendar-week absolute -right-3 -bottom-3 text-5xl text-emerald-500/10"></i>
                                         <span className="text-2xl font-black text-emerald-400">{weeklyRate}%</span>
                                         <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1">Weekly Completion</span>
                                     </div>
                                     <div className="bg-[#010B1C]/80 rounded-2xl p-4 border border-purple-500/20 flex flex-col justify-center text-center relative overflow-hidden">
                                         <i className="fa-solid fa-calendar-days absolute -right-3 -bottom-3 text-5xl text-purple-500/10"></i>
                                         <span className="text-2xl font-black text-purple-400">{monthlyRate}%</span>
                                         <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1">Monthly Completion</span>
                                     </div>
                                     <div className="bg-[#010B1C]/80 rounded-2xl p-4 border border-cyan-500/20 flex flex-col justify-center text-center relative overflow-hidden">
                                         <i className="fa-solid fa-chart-line absolute -right-3 -bottom-3 text-5xl text-cyan-500/10"></i>
                                         <span className="text-2xl font-black text-cyan-400">{completionRate}%</span>
                                         <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1">Total Completion</span>
                                     </div>
                                 </div>`;
    } else if (inSubjectRadar) {
        if (l.includes('</div>') && lines[i-1] && lines[i-1].includes('</div>')) {
            inSubjectRadar = false; // Exiting the old radar block
        }
        lines[i] = ''; // blank out the old radar lines
    }
    
    // Change Deep Analytics default tab from Physics to All
    if (l.includes("const [activeAnalysisTab, setActiveAnalysisTab] = useState('Physics');")) {
        lines[i] = "    const [activeAnalysisTab, setActiveAnalysisTab] = useState('All');";
    }
}

code = lines.join('\\n');
fs.writeFileSync('index.html', code);
console.log('Safe modifications completed.');
