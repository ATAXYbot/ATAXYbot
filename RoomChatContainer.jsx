import React, { useState, useEffect, useRef } from 'react';

export const RoomChatContainer = ({ tgId, tgName, dataConnectionsRef, chatMessages, setChatMessages, toggleMute, isMuted, setProfileOverlayTarget }) => {
    const [chatInput, setChatInput] = useState('');
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const handleSend = () => {
        if (!chatInput.trim()) return;
        const newMsg = {
            id: Date.now() + Math.random().toString(),
            userId: String(tgId),
            userName: tgName || "User",
            text: chatInput,
            time: new Date().toISOString()
        };
        
        // Local Frame Injection
        setChatMessages(prev => [...prev, newMsg]);

        // P2P Data Mesh Broadcast
        if (dataConnectionsRef && dataConnectionsRef.current) {
            const payloadStr = JSON.stringify({ type: 'ROOM_MSG', text: chatInput, sender: tgId, payload: newMsg });
            Object.values(dataConnectionsRef.current).forEach(conn => {
                if (conn && conn.open) {
                    conn.send(payloadStr);
                }
            });
        }

        setChatInput('');
    };

    return (
        <div className="flex-1 bg-gradient-to-t from-[#021633] to-transparent p-4 flex flex-col justify-end overflow-hidden z-10 relative">
            <div className="max-h-[180px] overflow-y-auto no-scrollbar space-y-2 mb-4 pointer-events-auto">
                {chatMessages.map((msg, idx) => (
                    <div key={msg.id || idx} className="bg-[#010B1C]/80 backdrop-blur border border-[#0AE0D0]/20 rounded-xl px-3 py-2 text-sm w-fit max-w-[85%] animate-in fade-in slide-in-from-bottom-2">
                        <span onClick={() => setProfileOverlayTarget({user_id: msg.userId, user_name: msg.userName})} className="font-bold text-[#A4DFE6] mr-2 cursor-pointer hover:underline">{msg.userName}:</span>
                        <span className="text-white">{msg.text}</span>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>
            <div className="w-full bg-[#010B1C]/95 backdrop-blur border-t border-[#0AE0D0]/30 p-3 flex gap-2 items-center z-20 pb-[env(safe-area-inset-bottom,_12px)] pointer-events-auto rounded-b-2xl">
                <input value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder="Say hi..." className="flex-1 bg-[#021633] border border-[#0AE0D0]/30 rounded-full px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00FFFF]" onKeyDown={(e) => { if(e.key==='Enter') handleSend(); }} />
                <button onClick={toggleMute} className={`w-11 h-11 rounded-full flex items-center justify-center text-lg transition-all shadow-lg border-2 shrink-0 ${isMuted ? 'bg-[#021633] text-gray-400 border-gray-600' : 'bg-[#00FFFF] text-[#010B1C] border-[#00FFFF] shadow-[0_0_15px_rgba(0,255,255,0.6)]'}`}>
                    <i className={`fa-solid ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
                </button>
            </div>
        </div>
    );
};