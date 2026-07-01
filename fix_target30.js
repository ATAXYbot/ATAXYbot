const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const oldAddTarget = `const timeStr = newTargetStartTime ? \`at \${newTargetStartTime}\` : 'for today';
                    setPartnerMessage({
                        type: 'added_target',
                        text: \`I have noted "\${newTarget}" \${timeStr}. Come back on time!\`,
                        requireAcknowledge: true
                    });`;

const newAddTarget = `const timeStr = newTargetStartTime ? \`at \${newTargetStartTime}\` : 'for today';
                    if (!newTargetStartTime) {
                        triggerBrainMessage({
                            type: 'chatter',
                            text: \`I have noted "\${newTarget}". However, without a set time slot, I can't track it! Consider editing this target and adding a time slot.\`,
                            requireAcknowledge: true
                        }, true); // bypass cooldown
                    } else {
                        triggerBrainMessage({
                            type: 'added_target',
                            text: \`I have noted "\${newTarget}" \${timeStr}. Come back on time!\`,
                            requireAcknowledge: true
                        }, true);
                    }`;

content = content.replace(oldAddTarget, newAddTarget);
fs.writeFileSync('index.html', content, 'utf8');
console.log("Updated addTarget logic with Brain integration");
