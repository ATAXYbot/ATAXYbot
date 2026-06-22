const fs = require('fs');

let code = fs.readFileSync('index.html', 'utf8');

const statusShapeRegex = /const StatusShape = \(\{ status, num \}\) => \{[\s\S]*?return null;\s*\};/m;

const newStatusShapeStr = `const StatusShape = ({ status, num }) => {
                                if (status === 'not_visited') {
                                    return (
                                        <div className="w-[42px] h-[32px] text-black flex items-center justify-center font-normal text-[14px] bg-gradient-to-b from-[#ffffff] to-[#d5d5d5] rounded-[4px] relative shrink-0" style={{ boxShadow: 'inset 0 0 0 1px #888, inset 0 2px 0 rgba(255,255,255,0.8), 0 1px 2px rgba(0,0,0,0.2)' }}>
                                            <span className="relative z-10">{num}</span>
                                        </div>
                                    );
                                }
                                if (status === 'not_answered') {
                                    return (
                                        <div className="w-[42px] h-[32px] relative flex items-center justify-center shrink-0">
                                            <svg viewBox="0 0 42 32" className="absolute inset-0 w-full h-full z-0 block" style={{ filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.25))' }}>
                                              <defs>
                                                <linearGradient id="orgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                                  <stop offset="0%" stopColor="#f47814" />
                                                  <stop offset="100%" stopColor="#d14e00" />
                                                </linearGradient>
                                              </defs>
                                              <polygon points="1,1 34,1 41,31 1,31" fill="url(#orgGrad)" stroke="#a33a00" strokeWidth="1" strokeLinejoin="round" />
                                            </svg>
                                            <span className="relative z-10 text-white font-normal text-[14px]">{num}</span>
                                        </div>
                                    );
                                }
                                if (status === 'answered') {
                                    return (
                                        <div className="w-[42px] h-[32px] relative flex items-center justify-center shrink-0">
                                            <svg viewBox="0 0 42 32" className="absolute inset-0 w-full h-full z-0 block" style={{ filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.25))' }}>
                                              <defs>
                                                <linearGradient id="grnGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                                  <stop offset="0%" stopColor="#66c266" />
                                                  <stop offset="100%" stopColor="#4ea04e" />
                                                </linearGradient>
                                              </defs>
                                              <polygon points="8,1 41,1 41,31 1,31" fill="url(#grnGrad)" stroke="#2b752b" strokeWidth="1" strokeLinejoin="round" />
                                            </svg>
                                            <span className="relative z-10 text-white font-normal text-[14px]">{num}</span>
                                        </div>
                                    );
                                }
                                if (status === 'marked') {
                                    return (
                                        <div className="w-[34px] h-[34px] rounded-full text-white flex items-center justify-center font-normal text-[14px] relative shrink-0" style={{ background: 'linear-gradient(180deg, #6b4cba 0%, #462c82 100%)', boxShadow: 'inset 0 0 0 1px #30165c, 0 1px 2px rgba(0,0,0,0.2)' }}>
                                            <span className="relative z-10">{num}</span>
                                        </div>
                                    );
                                }
                                if (status === 'answered_marked') {
                                    return (
                                        <div className="w-[34px] h-[34px] rounded-full text-white flex items-center justify-center font-normal text-[14px] relative shrink-0" style={{ background: 'linear-gradient(180deg, #6b4cba 0%, #462c82 100%)', boxShadow: 'inset 0 0 0 1px #30165c, 0 1px 2px rgba(0,0,0,0.2)' }}>
                                            <span className="relative z-10">{num}</span>
                                            <div className="absolute bottom-[-2px] right-[-2px] w-3.5 h-3.5 rounded-full border border-white z-20 flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #66c266 0%, #4ea04e 100%)', boxShadow: 'inset 0 0 0 1px #2b752b' }}>
                                                <i className="fa-solid fa-bars text-[6px] text-white transform scale-75"></i>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            };`;

if (code.match(statusShapeRegex)) {
    code = code.replace(statusShapeRegex, newStatusShapeStr);
    fs.writeFileSync('index.html', code);
    console.log('3D shapes updated successfully.');
} else {
    console.log('Regex did not match.');
}
