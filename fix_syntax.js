const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const targetStr = `                    // AGORA LOGIC FOR OFFICIAL ROOMS
                    if (!clientRef.current) return;
                    const tgData = window.Telegram?.WebApp?.initDataUnsafe?.user || tgUser;
                    const userIdString = String(tgData?.id || "1001");

                    const myParticipant = participants.find(p => String(p.user_id) === userIdString);
                    const hasSeat = myParticipant && myParticipant.seat_number !== null && myParticipant.seat_number !== undefined;`;

const replacement = `                    // AGORA LOGIC FOR OFFICIAL ROOMS
                    if (!clientRef.current) return;`;

content = content.replace(targetStr, replacement);
fs.writeFileSync('index.html', content);
console.log('Fixed syntax error in syncHardwareWithState');
