const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');
const voiceRoomsTabStart = lines.findIndex(l => l.includes('const VoiceRoomsTab = ({ tgUser, voiceState }) => {'));
console.log('VoiceRoomsTab starts at line:', voiceRoomsTabStart + 1);

const vTabEnd = lines.findIndex((l, i) => i > voiceRoomsTabStart && l.includes('const ActiveVoiceRoom = ({ tgUser, voiceState, onMinimize }) => {'));
console.log('ActiveVoiceRoom starts at line:', vTabEnd + 1);

const vTabReturn = lines.findIndex((l, i) => i > voiceRoomsTabStart && i < vTabEnd && l.includes('<div className="pb-[80px]'));
console.log('VoiceRoomsTab return starts at line:', vTabReturn + 1);

const layoutStart = lines.findIndex((l, i) => i > vTabEnd && l.includes('<div className="p-6 z-10 relative">'));
console.log('ActiveVoiceRoom layout starts at line:', layoutStart + 1);
