const fs = require('fs');
let code = fs.readFileSync('c:/Users/risha/ATAXYbot/index.html', 'utf8');

const targetStr = `                                        const activeData = activePracticeBatch && activePracticeBatch.sourceTable
                                            ? (qbankDataByTable[activePracticeBatch.sourceTable] || [])
                                            : qbankData;
                                        return activeData.length > 0 ? activeData.map(sub => (`

const replacementStr = `                                        const activeData = activePracticeBatch && activePracticeBatch.sourceTable
                                            ? (qbankDataByTable[activePracticeBatch.sourceTable] || [])
                                            : qbankData;
                                            
                                        const getDynamicSubjectIcon = (name, fallback) => {
                                            if (!name) return fallback || <i className="fa-solid fa-folder"></i>;
                                            const lower = name.toLowerCase();
                                            if (lower.includes('physic')) return <i className="fa-solid fa-atom"></i>;
                                            if (lower.includes('chemist')) return <i className="fa-solid fa-flask-vial"></i>;
                                            if (lower.includes('botan')) return <i className="fa-solid fa-leaf"></i>;
                                            if (lower.includes('zoolog') || lower.includes('biolog')) return <i className="fa-solid fa-dna"></i>;
                                            if (lower.includes('math')) return <i className="fa-solid fa-calculator"></i>;
                                            if (lower.includes('computer') || lower.includes('code')) return <i className="fa-solid fa-laptop-code"></i>;
                                            if (fallback === '📁' || fallback === '📂') return <i className="fa-solid fa-book"></i>;
                                            return fallback || <i className="fa-solid fa-book"></i>;
                                        };

                                        return activeData.length > 0 ? activeData.map(sub => (`

code = code.replace(targetStr, replacementStr);

const targetIconCall = `hover:scale-110'}\`}>{sub.icon}</div>`;
const replaceIconCall = `hover:scale-110'}\`}>{getDynamicSubjectIcon(sub.name, sub.icon)}</div>`;
code = code.replace(targetIconCall, replaceIconCall);

fs.writeFileSync('c:/Users/risha/ATAXYbot/index.html', code);
console.log('Icons updated successfully!');
