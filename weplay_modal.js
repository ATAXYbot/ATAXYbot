const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

const mStart = 5946;
const mEnd = 5997;

const newModal = `        const CreateRoomModal = ({ onClose, onCreate }) => {
            const [name, setName] = useState('');
            const [passwordEnabled, setPasswordEnabled] = useState(false);
            const [password, setPassword] = useState('');
            const [roomMode, setRoomMode] = useState('Normal');
            const [roomTag, setRoomTag] = useState('');
            const [isSubmitting, setIsSubmitting] = useState(false);

            const handleSubmit = async (e) => {
                e.preventDefault();
                if (!name.trim()) return;
                setIsSubmitting(true);
                const success = await onCreate(name, 'temporary', passwordEnabled && password ? password : null);
                setIsSubmitting(false);
                if (success !== false) {
                    onClose();
                }
            };

            return (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center animate-in fade-in" onClick={onClose}>
                    <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md shadow-2xl h-[85vh] sm:h-auto overflow-y-auto flex flex-col slide-in-from-bottom-full sm:slide-in-from-bottom-0" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-8 relative">
                            <i className="fa-solid fa-xmark text-gray-500 text-xl cursor-pointer" onClick={onClose}></i>
                            <h3 className="text-lg font-black text-black absolute left-1/2 -translate-x-1/2">Create Voice Room</h3>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
                            {/* Title Input */}
                            <div className="relative">
                                <input autoFocus required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Room title" className="w-full bg-gray-50 border-none rounded-xl px-4 py-4 text-black font-bold text-[15px] focus:outline-none focus:ring-1 focus:ring-gray-200" />
                                {name && <i className="fa-solid fa-circle-xmark text-gray-300 absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer" onClick={() => setName('')}></i>}
                            </div>
                            
                            {/* Password Toggle */}
                            <div className="flex items-center justify-between py-2 border-b border-gray-100 pb-4">
                                <span className="text-gray-600 font-bold text-[15px]">Password</span>
                                <div onClick={() => setPasswordEnabled(!passwordEnabled)} className={\`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors \${passwordEnabled ? 'bg-[#00D8D6]' : 'bg-gray-200'}\`}>
                                    <div className={\`w-4 h-4 bg-white rounded-full transition-transform \${passwordEnabled ? 'translate-x-6' : 'translate-x-0'}\`}></div>
                                </div>
                            </div>
                            
                            {passwordEnabled && (
                                <div className="animate-in slide-in-from-top-2 fade-in">
                                    <input type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter 4-digit code" maxLength="4" className="w-full bg-gray-50 border-none rounded-xl px-4 py-4 text-black font-bold text-[15px] focus:outline-none focus:ring-1 focus:ring-gray-200" />
                                </div>
                            )}
                            
                            {/* Room Mode Grid */}
                            <div>
                                <span className="text-gray-400 font-bold text-xs mb-3 block">Room mode</span>
                                <div className="grid grid-cols-3 gap-3">
                                    <div onClick={() => setRoomMode('Normal')} className={\`rounded-xl p-3 flex justify-between items-center cursor-pointer border \${roomMode === 'Normal' ? 'border-[#00D8D6] bg-[#F0FDFD]' : 'border-gray-100 bg-white'}\`}>
                                        <span className={\`font-bold text-[13px] \${roomMode === 'Normal' ? 'text-[#00D8D6]' : 'text-gray-700'}\`}>Normal</span>
                                        <img src="https://cdn-icons-png.flaticon.com/512/8121/8121285.png" className="w-6 h-6 object-contain" />
                                    </div>
                                    <div onClick={() => setRoomMode('Acquaint')} className={\`rounded-xl p-3 flex justify-between items-center cursor-pointer border \${roomMode === 'Acquaint' ? 'border-[#FF3B8F] bg-[#FFF0F5]' : 'border-gray-100 bg-white'}\`}>
                                        <span className={\`font-bold text-[13px] \${roomMode === 'Acquaint' ? 'text-[#FF3B8F]' : 'text-gray-700'}\`}>Acquaint</span>
                                        <img src="https://cdn-icons-png.flaticon.com/512/833/833472.png" className="w-6 h-6 object-contain" />
                                    </div>
                                    <div onClick={() => setRoomMode('Auction')} className={\`rounded-xl p-3 flex justify-between items-center cursor-pointer border \${roomMode === 'Auction' ? 'border-[#9147FF] bg-[#F5F0FF]' : 'border-gray-100 bg-white'}\`}>
                                        <span className={\`font-bold text-[13px] \${roomMode === 'Auction' ? 'text-[#9147FF]' : 'text-gray-700'}\`}>Auction</span>
                                        <img src="https://cdn-icons-png.flaticon.com/512/3746/3746014.png" className="w-6 h-6 object-contain" />
                                    </div>
                                    <div onClick={() => setRoomMode('Video')} className={\`rounded-xl p-3 flex justify-between items-center cursor-pointer border \${roomMode === 'Video' ? 'border-orange-500 bg-orange-50' : 'border-gray-100 bg-white'}\`}>
                                        <span className={\`font-bold text-[13px] \${roomMode === 'Video' ? 'text-orange-500' : 'text-gray-700'}\`}>Video</span>
                                        <img src="https://cdn-icons-png.flaticon.com/512/2854/2854199.png" className="w-6 h-6 object-contain" />
                                    </div>
                                    <div onClick={() => setRoomMode('Games')} className={\`rounded-xl p-3 flex justify-between items-center cursor-pointer border relative \${roomMode === 'Games' ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-white'}\`}>
                                        <span className={\`font-bold text-[13px] \${roomMode === 'Games' ? 'text-blue-500' : 'text-gray-700'}\`}>Games</span>
                                        <img src="https://cdn-icons-png.flaticon.com/512/3803/3803362.png" className="w-6 h-6 object-contain" />
                                        <div className="absolute -top-2 right-0 bg-[#FF3B8F] text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">NEW</div>
                                    </div>
                                </div>
                            </div>

                            {/* Room Tag */}
                            <div>
                                <span className="text-gray-400 font-bold text-xs mb-3 block">Select Room Tag</span>
                                <div className="flex gap-3 flex-wrap">
                                    {['Friends', 'Music', 'Game', 'Chats'].map(tag => (
                                        <span key={tag} onClick={() => setRoomTag(tag)} className={\`px-5 py-2 rounded-full border text-[13px] font-bold cursor-pointer transition-colors \${roomTag === tag ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200'}\`}>{tag}</span>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="text-center mt-2">
                                <span className="text-[#D4AF37] font-bold text-[13px] cursor-pointer">Create Advanced Voice Room <i className="fa-solid fa-chevron-right text-[10px]"></i></span>
                            </div>

                            {/* Submit Button */}
                            <div className="mt-auto pt-6">
                                <button type="submit" disabled={isSubmitting || !name.trim()} className="w-full bg-[#00D8D6] text-white font-black text-lg py-4 rounded-full shadow-[0_4px_15px_rgba(0,216,214,0.4)] disabled:opacity-50 active:scale-95 transition-transform flex items-center justify-center gap-2">
                                    {isSubmitting ? <i className="fa-solid fa-spinner animate-spin"></i> : 'Confirm'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            );
        };`;

lines.splice(mStart, mEnd - mStart + 1, newModal);
fs.writeFileSync('index.html', lines.join('\n'));
console.log('Applied WePlay CreateRoomModal');
