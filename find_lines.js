const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

const seatStart = lines.findIndex(l => l.includes('const renderSeat = (seatNum, occupant, label, isLarge = false) => {'));
const layoutStart = lines.findIndex((l, i) => l.includes('<div className="p-6 pb-2">') && lines[i+1].includes("activeRoom.room_type === 'advance'"));
const headerStart = lines.findIndex(l => l.includes('<div className="flex-1 flex flex-col relative z-10 bg-[#010B1C] min-h-screen">'));
const voiceRoomsTabStart = lines.findIndex(l => l.includes('const VoiceRoomsTab = ({ tgUser, voiceState }) => {'));
const filterStart = lines.findIndex((l, i) => i > voiceRoomsTabStart && l.includes('displayRooms = availableRooms.filter(r => r.id !== myAdvanceRoom?.id);'));
const useGlobalVoiceStart = lines.findIndex(l => l.includes('const useGlobalVoice = (tgUser) => {'));

console.log('SeatStart:', seatStart);
console.log('LayoutStart:', layoutStart);
console.log('HeaderStart:', headerStart);
console.log('FilterStart:', filterStart);
console.log('useGlobalVoiceStart:', useGlobalVoiceStart);
