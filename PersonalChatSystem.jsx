import React, { useState, useEffect, useRef } from 'react';

export const PersonalChatSystem = ({ tgId, sendPrivateDM, acceptFriendRequest, dataConnectionsRef }) => {
    const [dms, setDms] = useState({});
    const [pending, setPending] = useState([]);
    const [friends, setFriends] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const [dmInput, setDmInput] = useState('');
    const chatEndRef = useRef(null);

    const loadCloudData = () => {
        if (!window.Telegram?.WebApp?.CloudStorage) return;
        window.Telegram.WebApp.CloudStorage.getKeys((err, keys) => {
            if (keys) {
                const dmKeys = keys.filter(k => k.startsWith('dms_'));
                window.Telegram.WebApp.CloudStorage.getItems(dmKeys, (err, vals) => {
                    const loadedDms = {};
                    dmKeys.forEach(k => {
                        try { loadedDms[k.replace('dms_', '')] = JSON.parse(vals[k]); } catch(e){}
                    });
                    setDms(loadedDms);
                });
            }
        });
        window.Telegram.WebApp.CloudStorage.getItem('ataxy_pending_friends', (err, val) => {
            if (val) try { setPending(JSON.parse(val)); } catch(e){}
        });
        window.Telegram.WebApp.CloudStorage.getItem('ataxy_friends', (err, val) => {
            if (val) try { setFriends(JSON.parse(val)); } catch(e){}
        });
    };

    useEffect(() => {
        loadCloudData();
        const handleUpdate = () => loadCloudData();
        window.addEventListener('dm_updated', handleUpdate);
        const handleOpenThread = (e) => setActiveChatId(e.detail);
        window.addEventListener('open_dm_thread', handleOpenThread);
        
        return () => {
            window.removeEventListener('dm_updated', handleUpdate);
            window.removeEventListener('open_dm_thread', handleOpenThread);
        };
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [dms, activeChatId]);

    const handleSend = () => {
        if(dmInput.trim() && activeChatId) {
            // 1. The 2-Message Privacy Lock
            const isFriend = friends.includes(String(activeChatId));
            const history = dms[activeChatId] || [];
            const mySentCount = history.filter(m => String(m.sender) === String(tgId)).length;
            
            if (!isFriend && mySentCount >= 2) {
                alert("Privacy Lock: You can only send 2 messages until they accept your friend request.");
                return;
            }

            const newMsg = { sender: String(tgId), text: dmInput.trim(), time: Date.now() };
            const updatedHistory = [...history, newMsg];
            
            // Local UI Update
            setDms(prev => ({ ...prev, [activeChatId]: updatedHistory }));
            setDmInput('');

            // Storage Management Loop
            if (window.Telegram?.WebApp?.CloudStorage) {
                window.Telegram.WebApp.CloudStorage.setItem('dms_' + activeChatId, JSON.stringify(updatedHistory), (err) => {
                    if (!err) window.dispatchEvent(new Event('dm_updated'));
                });
            }
            
            // P2P Data Transmission
            if (dataConnectionsRef && dataConnectionsRef.current) {
                const conn = dataConnectionsRef.current[activeChatId];
                if (conn && conn.open) {
                    conn.send(JSON.stringify({ type: 'PRIVATE_DM', senderId: tgId, text: newMsg.text }));
                } else if (sendPrivateDM) {
                    sendPrivateDM(activeChatId, newMsg.text);
                }
            } else if (sendPrivateDM) {
                sendPrivateDM(activeChatId, newMsg.text);
            }
        }
    };

    if (activeChatId) {
        const chatHistory = dms[activeChatId] || [];
        const isFriend = friends.includes(String(activeChatId));
        return (
            <div className="flex flex-col h-full bg-[#010B1C]">
                <div className="flex items-center gap-3 p-4 border-b border-[#0AE0D0]/20 bg-[#021633]">
                    <button onClick={() => setActiveChatId(null)} className="text-[#A4DFE6] hover:text-white text-xl transition-colors"><i className="fa-solid fa-arrow-left"></i></button>
                    <h3 className="font-bold text-[#00FFFF] text-lg">User {String(activeChatId).substring(0,5)}</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                    {chatHistory.map((m, idx) => (
                        <div key={idx} className={`flex ${String(m.sender) === String(tgId) ? 'justify-end' : 'justify-start'}`}>
                            <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-sm shadow-sm ${String(m.sender) === String(tgId) ? 'bg-[#00FFFF] text-[#010B1C] rounded-br-none' : 'bg-[#021633] text-white border border-[#0AE0D0]/30 rounded-bl-none'}`}>
                                {m.text}
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>
                <div className="p-3 bg-[#021633] border-t border-[#0AE0D0]/30 flex gap-2 pb-[env(safe-area-inset-bottom,_12px)]">
                    <input value={dmInput} onChange={(e) => setDmInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }} placeholder={isFriend ? "Type a message..." : "Type a message... (Max 2 until accepted)"} className="flex-1 bg-[#010B1C] border border-[#0AE0D0]/30 rounded-full px-4 py-2 text-white focus:outline-none focus:border-[#00FFFF] transition-colors" />
                    <button onClick={handleSend} className="w-10 h-10 bg-[#00FFFF] text-[#010B1C] rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(0,255,255,0.4)] active:scale-95 transition-transform"><i className="fa-solid fa-paper-plane"></i></button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto pb-20 p-4">
            {pending.length > 0 && (
                <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl">
                    <h4 className="text-yellow-400 font-bold mb-3 flex items-center gap-2"><i className="fa-solid fa-user-plus"></i> Friend Requests</h4>
                    {pending.map(uid => (
                        <div key={uid} className="flex justify-between items-center bg-[#010B1C] p-3 rounded-xl border border-yellow-500/20 mb-2 shadow-sm">
                            <span className="text-white font-bold text-sm">User {String(uid).substring(0,8)}</span>
                            <button onClick={() => acceptFriendRequest(uid)} className="bg-yellow-500 text-black px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-yellow-400 transition-colors">Accept</button>
                        </div>
                    ))}
                </div>
            )}
            
            <h4 className="text-[#A4DFE6] font-bold mb-3 uppercase tracking-wider text-xs">Direct Messages</h4>
            {Object.keys(dms).length === 0 && <p className="text-gray-500 text-center py-6 italic text-sm">No conversations yet.</p>}
            {Object.entries(dms).map(([uid, msgs]) => (
                <div key={uid} onClick={() => setActiveChatId(uid)} className="bg-[#021633] p-4 rounded-2xl border border-[#0AE0D0]/20 flex items-center gap-4 cursor-pointer hover:border-[#00FFFF] transition-colors mb-3 shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-[#00FFFF]/20 text-[#00FFFF] flex items-center justify-center font-bold text-xl border border-[#00FFFF]/40">{String(uid).charAt(0).toUpperCase()}</div>
                    <div className="flex-1 overflow-hidden">
                        <h4 className="font-bold text-white mb-1">User {String(uid).substring(0,8)}</h4>
                        <p className="text-xs text-[#A4DFE6] truncate">{msgs[msgs.length-1]?.text}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};