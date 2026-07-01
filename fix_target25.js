const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const floatingCompRegex = /const FloatingStudyPartner = \(\{ message, onClose, onAction \}\) => \{[\s\S]*?document\.body\s*\);\s*\};/g;

const newFloatingComp = `const FloatingStudyPartner = ({ message, onClose, onAction }) => {
            const [spriteIndex, setSpriteIndex] = React.useState(0);
            const [isSpeaking, setIsSpeaking] = React.useState(false);
            
            React.useEffect(() => {
                if (!message) return;
                setIsSpeaking(true);
                
                let i = 0;
                // Cycle between a few sprite frames to simulate speaking (e.g. frames 0, 2, 4)
                const speakingFrames = [0, 2, 0, 4];
                const int = setInterval(() => {
                    i = (i + 1) % speakingFrames.length;
                    setSpriteIndex(speakingFrames[i]);
                }, 200);
                
                // Estimate speaking time based on text length
                const duration = Math.min(message.text.length * 60 + 500, 6000);
                const to = setTimeout(() => {
                    setIsSpeaking(false);
                    // Depending on message type, set a final emotion/pose frame
                    if (message.type === 'missed_target') setSpriteIndex(8); // maybe an angry/crossed arms pose
                    else if (message.type === 'empty_targets') setSpriteIndex(1); // energetic pose
                    else setSpriteIndex(0); // neutral
                }, duration);
                
                return () => { clearInterval(int); clearTimeout(to); };
            }, [message]);

            if (!message) return null;
            
            const imgSrc = studyPartnerConfig?.character === 'asena' ? 'assets/characters/mia_spritesheet_16.png' : 'assets/characters/jack_spritesheet_16.png';
            
            return ReactDOM.createPortal(
                <div className="fixed bottom-0 right-0 z-[9999999] pointer-events-none w-full h-[100dvh] max-w-md mx-auto md:right-[calc(50vw-224px)] flex items-end justify-end overflow-hidden">
                    
                    {/* Dark overlay behind character for focus */}
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-500 pointer-events-auto" onClick={onClose}></div>

                    {/* Character Image */}
                    <div className="absolute bottom-[-10px] right-[-20px] w-[280px] pointer-events-none animate-in slide-in-from-bottom-[50px] fade-in duration-500 drop-shadow-[0_0_30px_rgba(0,255,255,0.2)]">
                        <ChromaImage src={imgSrc} alt="Study Partner" spriteIndex={spriteIndex} gridSize={4} className="w-full h-auto object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)]" />
                    </div>
                    
                    {/* Speech Bubble */}
                    <div className="absolute bottom-[280px] right-[40px] w-[280px] bg-white/95 dark:bg-[#010a17]/95 backdrop-blur-xl border-2 border-[#00FFFF]/40 shadow-[0_20px_50px_rgba(0,255,255,0.25)] rounded-[2rem] rounded-br-md p-6 pointer-events-auto animate-in zoom-in-75 fade-in slide-in-from-bottom-10 duration-500 delay-150 fill-mode-backwards flex flex-col gap-4">
                        
                        <div className="flex items-center gap-2 mb-1">
                            <i className="fa-solid fa-sparkles text-[#00FFFF]"></i>
                            <span className="text-xs font-black text-[#00FFFF] tracking-widest uppercase">{studyPartnerConfig?.character === 'asena' ? 'ASENA' : 'ATAXY'}</span>
                        </div>

                        <p className="text-sm md:text-base text-gray-800 dark:text-gray-100 font-bold leading-relaxed">
                            {message.text}
                        </p>
                        
                        <div className="flex gap-3 justify-end mt-2">
                            {message.actionText && (
                                <button onClick={(e) => { e.stopPropagation(); onAction(); onClose(); }} className="px-5 py-2.5 bg-[#00FFFF] text-[#010B1C] rounded-xl text-xs md:text-sm font-black shadow-[0_0_15px_rgba(0,255,255,0.5)] hover:scale-105 active:scale-95 transition-transform flex-1">
                                    {message.actionText}
                                </button>
                            )}
                            <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs md:text-sm font-bold hover:scale-105 active:scale-95 transition-transform border border-transparent dark:border-gray-700">
                                {message.requireAcknowledge ? "Got it!" : "Dismiss"}
                            </button>
                        </div>
                        
                        {/* Bubble Tail */}
                        <div className="absolute -bottom-3 right-8 w-6 h-6 bg-white/95 dark:bg-[#010a17]/95 border-b-2 border-r-2 border-[#00FFFF]/40 transform rotate-45 pointer-events-none"></div>
                    </div>
                </div>,
                document.body
            );
        };`;

if (content.match(floatingCompRegex)) {
    content = content.replace(floatingCompRegex, newFloatingComp);
    console.log("Updated FloatingStudyPartner");
} else {
    console.log("Could not find FloatingStudyPartner");
}

fs.writeFileSync('index.html', content, 'utf8');
