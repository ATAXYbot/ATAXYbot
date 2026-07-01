const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// 1. Patch destroy logic
const destroyMatch = `if (peerRef.current) peerRef.current.destroy();`;
const destroyReplacement = `if (peerRef.current) peerRef.current.destroy();
                    window.vcPeerRef = null;`;
if (content.includes(destroyMatch) && !content.includes(`window.vcPeerRef = null;`)) {
    content = content.replace(destroyMatch, destroyReplacement);
}

// 2. Patch fetchInitialRooms visibility
const fetchInitialRoomsMatch = `const { data } = await supabase.from('active_rooms')
                    .select('id, room_name, host_id, host_name, host_photo, password, created_at, room_id_5_digit, room_seats(user_id), room_audience(user_id)')
                    .order('created_at', { ascending: false });
                if (data) {
                    const enhancedData = data.map(room => ({
                        ...room, total_capacity: (room.room_seats || []).filter(s => s.user_id !== null).length + (room.room_audience || []).length
                    }));
                    const activeOnlyData = enhancedData.filter(room => room.total_capacity > 0 || String(room.host_id) === currentUserId);
                    setAvailableVCRooms(activeOnlyData);
                }`;

const fetchInitialRoomsReplacement = `const { data } = await supabase.from('active_rooms')
                    .select('id, room_name, host_id, host_name, host_photo, password, created_at, room_id_5_digit, room_type, room_seats(user_id), room_audience(user_id)')
                    .order('created_at', { ascending: false });
                if (data) {
                    const enhancedData = data.map(room => ({
                        ...room, total_capacity: (room.room_seats || []).filter(s => s.user_id !== null).length + (room.room_audience || []).length
                    }));
                    const activeOnlyData = enhancedData.filter(room => {
                        const isOwnerPresent = (room.room_seats || []).some(s => String(s.user_id) === String(room.host_id)) || (room.room_audience || []).some(a => String(a.user_id) === String(room.host_id));
                        if (room.room_type === 'advance' || room.room_type === 'permanent') {
                            return isOwnerPresent;
                        }
                        return room.total_capacity > 0 || String(room.host_id) === currentUserId;
                    });
                    setAvailableVCRooms(activeOnlyData);
                }`;

if (content.includes(fetchInitialRoomsMatch)) {
    content = content.replace(fetchInitialRoomsMatch, fetchInitialRoomsReplacement);
}

fs.writeFileSync('index.html', content);
console.log('Successfully patched index.html for visibility and destroy logic!');
