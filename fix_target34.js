const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const regex = /if \(Date\.now\(\) - lastEmptyNag > 30 \* 1000\) \{[\s\S]*?setStudyPartnerState\(prev => \(\{ \.\.\.prev, lastEmptyNagTime: Date\.now\(\) \}\)\);\s*\}/g;

const replacement = `if (Date.now() - lastEmptyNag > 12 * 60 * 60 * 1000) {
                                triggerBrainMessage({ 
                                    text: "From small small bricks a whole home is formed. Just like that, piece by piece reaching towards your goal will get you there! Add daily targets to stay on track.", 
                                    type: 'empty_targets', 
                                    actionText: 'Set Targets',
                                    requireAcknowledge: true
                                }, true);
                                setStudyPartnerState(prev => ({ ...prev, lastEmptyNagTime: Date.now() }));
                            }`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync('index.html', content, 'utf8');
    console.log("Successfully replaced the nag interval!");
} else {
    console.log("Regex didn't match.");
}
