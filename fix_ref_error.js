const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const targetStr = `<img src={currentUserPhoto || 'https://picsum.photos/100'} className="w-7 h-7 rounded-full border border-[#FFD700]" />`;
const replacementStr = `<img src={(window.Telegram?.WebApp?.initDataUnsafe?.user?.photo_url || tgUser?.photo_url) || 'https://picsum.photos/100'} className="w-7 h-7 rounded-full border border-[#FFD700]" />`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('index.html', content);
console.log('Fixed currentUserPhoto reference error in ActiveVoiceRoom');
