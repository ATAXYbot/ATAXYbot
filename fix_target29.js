const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const targetStr = `const [studyPartnerConfig, setStudyPartnerConfig] = React.useState({ enabled: true, character: 'ataxy', hasSeenOnboarding: true });`;

const replacement = `const [studyPartnerConfig, setStudyPartnerConfig] = React.useState({ enabled: true, character: 'ataxy', hasSeenOnboarding: true });
            
            // --- AUTONOMOUS CHARACTER BRAIN ---
            const [brainMetrics, setBrainMetrics] = React.useState(() => safeGetJSON('ataxy_brain_metrics', { lastSeen: Date.now(), lastMessageTime: 0 }));
            
            const triggerBrainMessage = React.useCallback((msg, bypassCooldown = false) => {
                setBrainMetrics(prev => {
                    const now = Date.now();
                    if (!bypassCooldown && now - prev.lastMessageTime < 60000 * 10) { 
                        // 10 minute global cooldown to prevent flooding
                        return prev;
                    }
                    setPartnerMessage(msg);
                    const next = { ...prev, lastMessageTime: now };
                    safeSetItem('ataxy_brain_metrics', JSON.stringify(next));
                    return next;
                });
            }, []);

            // 1. lastSeen Tracker
            React.useEffect(() => {
                const int = setInterval(() => {
                    setBrainMetrics(prev => {
                        const next = { ...prev, lastSeen: Date.now() };
                        safeSetItem('ataxy_brain_metrics', JSON.stringify(next));
                        return next;
                    });
                }, 10000);
                return () => clearInterval(int);
            }, []);

            // 2. Offline / Missed Targets Checker
            React.useEffect(() => {
                const now = Date.now();
                const offlineDuration = now - brainMetrics.lastSeen;
                if (offlineDuration > 60000 * 15) { // 15+ mins offline
                    const todayStr = getTodayStr();
                    const todayTargets = targetsData[todayStr] || [];
                    const missedTargets = todayTargets.filter(t => {
                        if (t.done || !t.endTime) return false;
                        const [h, m] = t.endTime.split(':');
                        const targetTime = new Date();
                        targetTime.setHours(h, m, 0, 0);
                        return targetTime.getTime() > brainMetrics.lastSeen && targetTime.getTime() < now;
                    });
                    
                    if (missedTargets.length > 0) {
                        setTimeout(() => {
                            triggerBrainMessage({
                                type: 'missed_target',
                                text: \`Welcome back! You missed \${missedTargets.length} scheduled target\${missedTargets.length > 1 ? 's' : ''} while you were offline. Let's get back to work!\`,
                                requireAcknowledge: true
                            }, true); // bypass cooldown
                        }, 2000);
                    }
                }
            }, []);

            // 3. Contextual Tab Transitions (Post-Session)
            const [prevTab, setPrevTab] = React.useState(currentTab);
            React.useEffect(() => {
                if (prevTab === 'questions' && currentTab === 'home') {
                    triggerBrainMessage({
                        type: 'chatter',
                        text: "Great practice session! Analyzing your mistakes and learning from them is how you build an empire piece by piece.",
                        requireAcknowledge: true
                    });
                }
                setPrevTab(currentTab);
            }, [currentTab]);
`;

if(content.includes(targetStr)) {
    content = content.replace(targetStr, replacement);
    console.log("Injected Autonomous Brain");
}

fs.writeFileSync('index.html', content, 'utf8');
