const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const regex = /\/\/ AGORA LOGIC FOR OFFICIAL ROOMS[\s\S]*?if \(!clientRef\.current\) return;[\s\S]*?const tgData =[^;]+;[\s\S]*?const userIdString =[^;]+;[\s\S]*?const myParticipant =[^;]+;[\s\S]*?const hasSeat =[^;]+;/;
const replacement = `// AGORA LOGIC FOR OFFICIAL ROOMS
                    if (!clientRef.current) return;`;

content = content.replace(regex, replacement);
fs.writeFileSync('index.html', content);
console.log('Regex replace done');
