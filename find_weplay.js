const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

const voiceRoomsTabStart = lines.findIndex(l => l.includes('const VoiceRoomsTab = ({ tgUser, voiceState }) => {'));
const vTabEnd = lines.findIndex((l, i) => i > voiceRoomsTabStart && l.includes('const RoomSettingsModal = ({ activeRoom, onClose, onSave, currentMusic, onUpdateMusic }) => {'));

const activeRoomStart = lines.findIndex(l => l.includes('const ActiveVoiceRoom = ({ tgUser, voiceState, onMinimize }) => {'));
const aRoomEnd = lines.findIndex((l, i) => i > activeRoomStart && l.includes('const CreateRoomModal = ({ onClose, onCreate }) => {'));

console.log('VoiceRoomsTab from', voiceRoomsTabStart, 'to', vTabEnd);
console.log('ActiveVoiceRoom from', activeRoomStart, 'to', aRoomEnd);
