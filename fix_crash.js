const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');
const activeRoomStart = lines.findIndex(l => l.includes('const ActiveVoiceRoom = ({ tgUser, voiceState, onMinimize }) => {'));
lines.splice(activeRoomStart + 2, 0, '            const chatEndRef = React.useRef(null);', '            React.useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [voiceState.chatMessages]);');
fs.writeFileSync('index.html', lines.join('\n'));
console.log('Fixed chatEndRef crash');
