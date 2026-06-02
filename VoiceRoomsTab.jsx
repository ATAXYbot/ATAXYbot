/**
 * ATAXY - Voice Rooms Tab Component
 * WePlay-style split-pane interface (Discovery Dashboard & Active Room)
 */

import { useAgoraVoice } from '../services/agoraService';

export const VoiceRoomsTab = ({ tgUser, handleBack }) => {
    const [activeRoom, setActiveRoom] = React.useState(null);
    
    const mockRooms = [
        { id: "room_phy", name: "Physics Core Doubt Lounge", host: "Dr. H.C. Verma", listeners: 142 },
        { id: "room_chem", name: "Organic Chem Sync-Session", host: "Walter White", listeners: 89 },
        { id: "room_bio", name: "Genetics Rapid Fire", host: "Charles Darwin", listeners: 215 },
    ];

    return (
        <div className="pb-[80px] animate-in fade-in flex flex-col h-[calc(100vh-60px)] bg-[#010B1C] text-white">
            {!activeRoom ? (
                <div className="p-4 flex-1 overflow-y-auto">
                    <h2 className="text-2xl font-black mb-4 text-[#00FFFF] drop-shadow-[0_0_8px_rgba(0,255,255,0.4)] tracking-wide">Public Lounges</h2>
                    <div className="space-y-4 mb-20">
                        {mockRooms.map(room => (
                            <div key={room.id} onClick={() => setActiveRoom(room)} className="bg-[#021633] border border-[#0AE0D0]/30 rounded-2xl p-4 shadow-[0_0_15px_rgba(0,255,255,0.05)] cursor-pointer hover:border-[#00FFFF] transition-all relative overflow-hidden group">
                                <div className="relative z-10">
                                    <h3 className="font-bold text-lg text-white mb-1">{room.name}</h3>
                                    <div className="flex justify-between items-center text-sm text-[#A4DFE6]">
                                        <span><i className="fa-solid fa-crown text-[#F9D33A] mr-1"></i> {room.host}</span>
                                        <span className="flex items-center gap-1 bg-[#010B1C] px-2 py-1 rounded-md border border-[#00FFFF]/20"><i className="fa-solid fa-headphones text-[#00FFFF]"></i> {room.listeners}</span>
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 w-24 h-24 bg-[#00FFFF] opacity-5 rounded-full blur-2xl group-hover:opacity-20 transition-opacity"></div>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => setActiveRoom({id: `room_${Date.now()}`, name: `${tgUser.first_name}'s Lounge`, host: tgUser.first_name, listeners: 1})} className="fixed bottom-[80px] right-6 w-14 h-14 bg-gradient-to-r from-[#00FFFF] to-[#0AE0D0] text-[#010B1C] rounded-full shadow-[0_0_20px_rgba(0,255,255,0.6)] flex items-center justify-center text-2xl hover:scale-110 transition-transform z-50">
                        <i className="fa-solid fa-plus"></i>
                    </button>
                </div>
            ) : (
                <ActiveVoiceRoom room={activeRoom} tgUser={tgUser} onLeave={() => setActiveRoom(null)} />
            )}
        </div>
    );
};

export const ActiveVoiceRoom = ({ room, tgUser, onLeave }) => {
    const { client, isConnected, remoteUsers, isMuted, setIsMuted, localAudioTrack, setLocalAudioTrack, isSpeaker, setIsSpeaker } = useAgoraVoice(room.id, tgUser);

    const toggleMic = async () => {
        if (!localAudioTrack) {
            // Upgrade role to Host and publish audio
            try {
                await client.setClientRole("host");
                const track = await window.AgoraRTC.createMicrophoneAudioTrack();
                await client.publish([track]);
                setLocalAudioTrack(track);
                setIsMuted(false);
                setIsSpeaker(true);
            } catch (e) {
                console.error("Failed to publish audio", e);
            }
        } else {
            // Toggle mute
            const nextMute = !isMuted;
            await localAudioTrack.setMuted(nextMute);
            setIsMuted(nextMute);
        }
    };

    const handleLeave = async () => {
        if (localAudioTrack) {
            localAudioTrack.stop();
            localAudioTrack.close();
        }
        if (client) {
            try { await client.unpublish(); } catch(e){}
            await client.leave();
        }
        onLeave();
    };

    // Seat logic - exactly 8 slots
    const MAX_SEATS = 8;
    const speakers = [];
    
    if (isSpeaker) {
        speakers.push({ uid: tgUser.id || 'local', name: tgUser.first_name || 'Me', isLocal: true, speaking: !isMuted });
    }
    remoteUsers.slice(0, MAX_SEATS - (isSpeaker ? 1 : 0)).forEach(u => {
        speakers.push({ uid: u.uid, name: `Speaker ${u.uid.toString().substring(0,4)}`, isLocal: false, speaking: u.hasAudio });
    });

    const emptySeats = Array.from({ length: MAX_SEATS - speakers.length });

    return (
        <div className="flex-1 flex flex-col relative z-10">
            {/* Header */}
            <div className="px-4 py-4 flex items-center justify-between border-b border-[#0AE0D0]/20 bg-[#010B1C]/90 backdrop-blur">
                <div className="flex flex-col">
                    <h2 className="text-xl font-black text-[#E0F7FA] leading-tight drop-shadow-[0_0_5px_rgba(0,255,255,0.3)]">{room.name}</h2>
                    <p className="text-xs text-[#00FFFF] font-bold"><span className="w-2 h-2 inline-block rounded-full bg-[#00FFFF] animate-pulse mr-1"></span> Live</p>
                </div>
                <button onClick={handleLeave} className="bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors shadow-[0_0_10px_rgba(255,0,0,0.2)]">
                    Leave
                </button>
            </div>

            {/* Speaker Stage (WePlay Seating) */}
            <div className="p-6">
                <h3 className="text-sm font-bold text-[#A4DFE6] uppercase tracking-widest mb-4">Speaker Stage</h3>
                <div className="grid grid-cols-4 gap-y-6 gap-x-4">
                    {speakers.map(s => (
                        <div key={s.uid} className="flex flex-col items-center gap-2">
                            <div className={`w-14 h-14 rounded-full bg-gradient-to-br from-[#00FFFF] to-blue-600 flex items-center justify-center text-xl font-bold border-2 ${s.speaking ? 'border-[#00FFFF] shadow-[0_0_15px_rgba(0,255,255,0.8)] animate-pulse text-[#010B1C]' : 'border-transparent text-white'}`}>
                                {s.name.charAt(0)}
                            </div>
                            <span className="text-[10px] text-center font-semibold text-[#E0F7FA] truncate w-full">{s.name}</span>
                        </div>
                    ))}
                    {emptySeats.map((_, i) => (
                        <div key={`empty-${i}`} onClick={!isSpeaker ? toggleMic : undefined} className={`flex flex-col items-center gap-2 ${!isSpeaker ? 'cursor-pointer hover:opacity-80' : 'opacity-40'}`}>
                            <div className="w-14 h-14 rounded-full border-2 border-dashed border-[#0AE0D0]/40 flex items-center justify-center bg-[#021633]">
                                <i className="fa-solid fa-microphone-lines text-[#0AE0D0]/40 text-lg"></i>
                            </div>
                            <span className="text-[10px] text-[#A4DFE6]/50">Empty</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Audience Panel & Controls */}
            <div className="flex-1 bg-[#021633] mt-2 rounded-t-3xl border-t border-[#0AE0D0]/20 p-6 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
                {/* Audience avatars logic... */}
            </div>

            <div className="fixed bottom-[60px] w-full max-w-md bg-[#010B1C]/95 backdrop-blur border-t border-[#0AE0D0]/30 p-3 flex justify-around items-center z-20">
                <button className="w-12 h-12 flex items-center justify-center text-[#A4DFE6] hover:text-[#00FFFF] text-xl transition-colors"><i className="fa-regular fa-comment-dots"></i></button>
                <button onClick={toggleMic} className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all shadow-lg border-2 ${isMuted ? 'bg-[#021633] text-gray-400 border-gray-600' : 'bg-[#00FFFF] text-[#010B1C] border-[#00FFFF] shadow-[0_0_20px_rgba(0,255,255,0.6)]'}`}>
                    <i className={`fa-solid ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
                </button>
                <button className="w-12 h-12 flex items-center justify-center text-[#A4DFE6] hover:text-[#00FFFF] text-xl transition-colors"><i className="fa-solid fa-hand-sparkles"></i></button>
            </div>
        </div>
    );
};