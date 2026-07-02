const fs = require('fs');
try {
    let content = fs.readFileSync('index.html', 'utf8');

    // 1. Fix Image Sending Bug & Chat Icon
    content = content.replace(
        '<i className="fa-regular fa-comment-dots text-[#A4DFE6] text-sm"></i>',
        '<i className="fa-regular fa-face-smile text-[#A4DFE6] text-sm cursor-pointer hover:text-[#00FFFF] transition-colors"></i>'
    );
    
    // Fix missing image upload input
    const formHtml = `<form onSubmit={(e) => { e.preventDefault(); if (chatInput.trim() || pendingImage) { sendPeerChatMessage(chatInput.trim() || (pendingImage ? '📸 Sent an image' : ''), pendingImage); setChatInput(''); setPendingImage(null); } }} className="flex-1 relative">`;
    const formWithInput = formHtml + `
                                <input type="file" id="vc-chat-img" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files && e.target.files[0]) { const reader = new FileReader(); reader.onload = (ev) => setPendingImage(ev.target.result); reader.readAsDataURL(e.target.files[0]); } }} />`;
    content = content.replace(formHtml, formWithInput);

    // 2. Fix Chat Panel Overlap (Bottom Bar)
    content = content.replace(
        'className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-30 floating-element flex flex-col gap-2 shrink-0"',
        'className="absolute bottom-[calc(24px+var(--tg-safe-area-inset-bottom,env(safe-area-inset-bottom,0px)))] left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-30 floating-element flex flex-col gap-2 shrink-0"'
    );

    // 3. Fix Top Header Overlap (Telegram Mini App)
    content = content.replace(
        'className="px-4 py-3 flex items-center justify-between z-20 relative pt-[calc(30px+env(safe-area-inset-top,0px))]"',
        'className="px-4 py-3 flex items-center justify-between z-20 relative pt-[calc(20px+var(--tg-content-safe-area-inset-top,env(safe-area-inset-top,0px)))]"'
    );
    // Add margin to the right button group in the header to avoid Telegram's native buttons
    content = content.replace(
        '</div>\r\n                        <div className="flex items-center gap-2">',
        '</div>\r\n                        <div className="flex items-center gap-2 mr-[90px] md:mr-0">'
    );
    content = content.replace( // fallback for \n
        '</div>\n                        <div className="flex items-center gap-2">',
        '</div>\n                        <div className="flex items-center gap-2 mr-[90px] md:mr-0">'
    );

    // 4. WePlay VC Tab Enhancement
    const activeRoomsHeader = `<div className="flex items-center justify-between mb-4 px-2">`;
    const categoriesUI = `
                            {/* Categories Header like WePlay */}
                            <div className="flex items-center gap-6 px-4 py-2 overflow-x-auto no-scrollbar border-b border-white/5 mb-4">
                                <div className="text-[15px] font-black text-white border-b-2 border-[#00FFFF] pb-1 shrink-0 cursor-pointer">All</div>
                                <div className="text-sm font-bold text-white/50 pb-1 shrink-0 cursor-pointer hover:text-white/80">Study</div>
                                <div className="text-sm font-bold text-white/50 pb-1 shrink-0 cursor-pointer hover:text-white/80">Chill</div>
                                <div className="text-sm font-bold text-white/50 pb-1 shrink-0 cursor-pointer hover:text-white/80">Music</div>
                                <div className="text-sm font-bold text-white/50 pb-1 shrink-0 cursor-pointer hover:text-white/80">Doubt</div>
                            </div>`;
    
    // Add Categories only if it doesn't already exist
    if (!content.includes('Categories Header like WePlay')) {
        content = content.replace(activeRoomsHeader, categoriesUI + '\n' + activeRoomsHeader);
    }

    // Replace the Room Item mapping completely
    const oldRoomMappingStart = `sortedActiveRooms.map(room => (\r\n                                            <div key={room.id} onClick={() => {`;
    const oldRoomMappingStartLF = `sortedActiveRooms.map(room => (\n                                            <div key={room.id} onClick={() => {`;
    
    // Using Regex to replace the entire map block
    const mapRegex = /sortedActiveRooms\.map\(room => \([\s\S]*?className="bg-gradient-to-r from-\[#021A40\][\s\S]*?Join\r?\n\s*<\/button>\r?\n\s*<\/div>\r?\n\s*<\/div>\r?\n\s*<\/div>\r?\n\s*\)\)/m;
    
    const newRoomMapping = `sortedActiveRooms.map(room => (
                                            <div key={room.id} onClick={() => {
                                                if (room.password) { setRoomToJoinWithPassword(room); }
                                                else { joinRoom(room); }
                                            }} className="bg-transparent border-b border-white/5 py-3 flex flex-row gap-3 items-center cursor-pointer hover:bg-white/[0.02] transition-all group">
                                                
                                                {/* Left: Avatar (Squircle) */}
                                                <div className="relative w-[56px] h-[56px] shrink-0">
                                                    <div className="w-full h-full rounded-[18px] bg-[#021A40] bg-cover bg-center text-[#00FFFF] font-black text-2xl flex items-center justify-center border border-[#0AE0D0]/20 overflow-hidden shadow-md" style={room.host_photo ? { backgroundImage: \`url(\${room.host_photo})\` } : {}}>
                                                        {!room.host_photo && (room.host_name ? room.host_name[0].toUpperCase() : 'H')}
                                                    </div>
                                                </div>

                                                {/* Center: Info */}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-[14px] font-bold text-white/90 leading-tight truncate mb-1 flex items-center gap-1">
                                                        {room.password && <i className="fa-solid fa-lock text-[#FF007F] text-[10px] shrink-0"></i>}
                                                        {room.room_name}
                                                    </h4>
                                                    <div className="flex items-center gap-2">
                                                        <span className="bg-blue-500/10 text-blue-400 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0">
                                                            <i className="fa-solid fa-microphone-lines text-[8px]"></i> {room.room_type === 'permanent' ? 'Study' : 'Chat'}
                                                        </span>
                                                        <span className="text-[11px] text-white/40 flex items-center gap-1 font-semibold truncate">
                                                            <i className="fa-solid fa-user text-[9px]"></i> {room.total_capacity || 1}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                {/* Right: Badges */}
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <div className="w-6 h-6 rounded-full bg-[#FFD700]/10 flex items-center justify-center border border-[#FFD700]/30 shadow-sm text-[#FFD700]">
                                                        <i className="fa-solid fa-crown text-[10px]"></i>
                                                    </div>
                                                    <div className="w-6 h-6 rounded-full bg-[#00FFFF]/10 flex items-center justify-center border border-[#00FFFF]/30 shadow-sm text-[#00FFFF]">
                                                        <i className="fa-solid fa-fire text-[10px]"></i>
                                                    </div>
                                                    <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/30 shadow-sm text-blue-400">
                                                        <i className="fa-solid fa-ranking-star text-[10px]"></i>
                                                    </div>
                                                </div>
                                            </div>
                                        ))`;
    
    if (mapRegex.test(content)) {
        content = content.replace(mapRegex, newRoomMapping);
    } else {
        console.log("Could not find the map block to replace.");
    }

    fs.writeFileSync('index.html', content);
    console.log("Applied changes successfully.");
} catch (e) {
    console.error(e);
}
