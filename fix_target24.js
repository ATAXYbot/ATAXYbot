const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// 1. Define FloatingStudyPartner at the end of the global components
const floatingCompStr = `
        const FloatingStudyPartner = ({ message, onClose, onAction }) => {
            if (!message) return null;
            
            return ReactDOM.createPortal(
                <div className="fixed top-20 right-4 z-[9999999] animate-in slide-in-from-right fade-in duration-500 max-w-[280px]">
                    <div className="bg-white/95 dark:bg-[#021633]/95 backdrop-blur-xl border border-[#00FFFF]/30 shadow-[0_10px_40px_rgba(0,255,255,0.15)] rounded-2xl p-4 relative cursor-pointer" onClick={() => { if(message.actionText && onAction) onAction(); else onClose(); }}>
                        <div className="absolute -top-6 -left-6 w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 p-[2px] shadow-[0_0_15px_rgba(0,255,255,0.3)] animate-pulse-slow">
                            <AtaxyLogo className="w-full h-full rounded-full border-2 border-white dark:border-[#010B1C] bg-black" />
                        </div>
                        <div className="ml-6">
                            <p className="text-sm text-gray-800 dark:text-gray-200 font-bold leading-snug">
                                {message.text}
                            </p>
                            <div className="mt-3 flex gap-2 justify-end">
                                {message.actionText && (
                                    <button onClick={(e) => { e.stopPropagation(); onAction(); onClose(); }} className="px-4 py-1.5 bg-[#00FFFF] text-[#010B1C] rounded-lg text-xs font-black shadow-[0_0_10px_rgba(0,255,255,0.4)] hover:scale-105 active:scale-95 transition-transform">
                                        {message.actionText}
                                    </button>
                                )}
                                <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="px-4 py-1.5 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold hover:scale-105 active:scale-95 transition-transform">
                                    {message.requireAcknowledge ? "Got it!" : "Dismiss"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            );
        };
`;

const globalComponentsAnchor = `const renderMarkdown = (text) => {`;
if (content.includes(globalComponentsAnchor) && !content.includes('FloatingStudyPartner')) {
    content = content.replace(globalComponentsAnchor, floatingCompStr + '\n' + globalComponentsAnchor);
    console.log("Injected FloatingStudyPartner");
}

// 2. Enable Study Partner by default
const configAnchor = `const [studyPartnerConfig, setStudyPartnerConfig] = React.useState({ enabled: false, character: 'none', hasSeenOnboarding: true });`;
if (content.includes(configAnchor)) {
    content = content.replace(configAnchor, `const [studyPartnerConfig, setStudyPartnerConfig] = React.useState({ enabled: true, character: 'ataxy', hasSeenOnboarding: true });`);
    console.log("Enabled Study Partner config");
}

// 3. Update the interval to check for empty targets
const intervalAnchor = `                    if (!foundMissed) {
                        const lastWater = studyPartnerState.lastWaterTime || Date.now();
                        if (Date.now() - lastWater > 2 * 60 * 60 * 1000) {
                            // setPartnerMessage({ text: \`Time for a quick break! Hydrate yourself with some water.\`, type: 'water', id: Date.now() });
                            setStudyPartnerState(prev => ({ ...prev, lastWaterTime: Date.now() }));
                        }
                    }`;
                    
const updatedInterval = `                    if (!foundMissed) {
                        if (todayTargets.length === 0) {
                            const lastEmptyNag = studyPartnerState.lastEmptyNagTime || 0;
                            // Check every 30 seconds for demo purposes instead of 15 mins
                            if (Date.now() - lastEmptyNag > 30 * 1000) {
                                setPartnerMessage({ 
                                    text: "From small small bricks a whole home is formed. Just like that, piece by piece reaching towards your goal will get you there! Add daily targets to stay on track.", 
                                    type: 'empty_targets', 
                                    actionText: 'Set Targets',
                                    requireAcknowledge: true, 
                                    id: Date.now() 
                                });
                                setStudyPartnerState(prev => ({ ...prev, lastEmptyNagTime: Date.now() }));
                            }
                        } else {
                            const lastWater = studyPartnerState.lastWaterTime || Date.now();
                            if (Date.now() - lastWater > 2 * 60 * 60 * 1000) {
                                setStudyPartnerState(prev => ({ ...prev, lastWaterTime: Date.now() }));
                            }
                        }
                    }`;
if (content.includes(intervalAnchor)) {
    content = content.replace(intervalAnchor, updatedInterval);
    console.log("Updated checkInterval for empty targets");
}

// 4. Also update the interval time from 60000 to something faster for testing (5 seconds)
const intervalTimeRegex = /}, 60000\); \/\/ Check every minute/g;
if (intervalTimeRegex.test(content)) {
    content = content.replace(intervalTimeRegex, `}, 5000); // Check every 5 seconds for testing`);
    console.log("Updated interval tick to 5 seconds");
}

// 5. Inject the FloatingStudyPartner component in the App return block
const appReturnAnchor = `<GlobalTimerWidget timer={globalTimer} setTimer={setGlobalTimer} />`;
const appReturnInject = `<GlobalTimerWidget timer={globalTimer} setTimer={setGlobalTimer} />
                    <FloatingStudyPartner 
                        message={partnerMessage} 
                        onClose={() => setPartnerMessage(null)} 
                        onAction={() => {
                            if (partnerMessage?.type === 'empty_targets') {
                                setCurrentTab('home');
                                setShowTargetPortal(true);
                                setPartnerMessage(null);
                            }
                        }}
                    />`;
if (content.includes(appReturnAnchor) && !content.includes('FloatingStudyPartner message={partnerMessage}')) {
    content = content.replace(appReturnAnchor, appReturnInject);
    console.log("Injected FloatingStudyPartner in App return");
}

fs.writeFileSync('index.html', content, 'utf8');
