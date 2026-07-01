const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const targetStr = `if (Date.now() - lastEmptyNag > 30 * 1000) {
                                setPartnerMessage({ 
                                    text: "From small small bricks a whole home is formed. Just like that, piece by piece reaching towards your goal will get you there! Add daily targets to stay on track.", 
                                    type: 'empty_targets', 
                                    actionText: 'Set Targets',
                                    requireAcknowledge: true, 
                                    id: Date.now() 
                                });
                                setStudyPartnerState(prev => ({ ...prev, lastEmptyNagTime: Date.now() }));
                            }`;

const replacementStr = `if (Date.now() - lastEmptyNag > 8 * 60 * 60 * 1000) { // Check every 8 hours instead of 30 seconds
                                triggerBrainMessage({ 
                                    type: 'empty_targets', 
                                    text: "From small small bricks a whole home is formed. Just like that, piece by piece reaching towards your goal will get you there! Add daily targets to stay on track.", 
                                    actionText: 'Set Targets',
                                    requireAcknowledge: true
                                }, true); // bypass global cooldown since this is a rare critical reminder
                                setStudyPartnerState(prev => ({ ...prev, lastEmptyNagTime: Date.now() }));
                            }`;

if(content.includes(targetStr)) {
    content = content.replace(targetStr, replacementStr);
    fs.writeFileSync('index.html', content, 'utf8');
    console.log("Fixed continuous nagging by changing interval from 30 seconds to 8 hours");
} else {
    console.log("Target string not found.");
}
