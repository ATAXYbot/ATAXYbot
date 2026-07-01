const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const floatingCompRegex = /const FloatingStudyPartner = \(\{ message, onClose, onAction, config \}\) => \{[\s\S]*?document\.body\s*\);\s*\};/g;

const newComponents = `const TypewriterText = ({ text, onComplete, speed = 40 }) => {
            const [displayedText, setDisplayedText] = React.useState('');
            
            React.useEffect(() => {
                setDisplayedText('');
                let i = 0;
                const int = setInterval(() => {
                    setDisplayedText(text.slice(0, i + 1));
                    i++;
                    if (i >= text.length) {
                        clearInterval(int);
                        if (onComplete) onComplete();
                    }
                }, speed);
                return () => clearInterval(int);
            }, [text, speed]);
            
            return <span>{displayedText}</span>;
        };

        const analyzeEmotion = (text) => {
            const lower = text.toLowerCase();
            if (lower.match(/late|why|work|missed/)) return 'angry';
            if (lower.match(/awesome|great|completing|congratulations/)) return 'happy';
            if (lower.match(/goal|track|target|bricks/)) return 'motivated';
            return 'neutral';
        };

        const FloatingStudyPartner = ({ message, onClose, onAction, config }) => {
            const [spriteIndex, setSpriteIndex] = React.useState(0);
            const [isSpeaking, setIsSpeaking] = React.useState(false);
            
            React.useEffect(() => {
                if (!message) return;
                setIsSpeaking(true);
                
                const emotion = analyzeEmotion(message.text);
                let sequence = [];
                
                // Slow, gradual pose shifting based on emotion
                if (emotion === 'angry') {
                    sequence = [
                        { time: 0, pose: 8 },
                        { time: 2000, pose: 9 }, 
                        { time: 4000, pose: 8 }
                    ];
                } else if (emotion === 'happy') {
                    sequence = [
                        { time: 0, pose: 4 },
                        { time: 1500, pose: 5 },
                        { time: 4000, pose: 4 }
                    ];
                } else if (emotion === 'motivated') {
                    sequence = [
                        { time: 0, pose: 0 },      // Starts calm
                        { time: 2000, pose: 4 },   // Gets expressive
                        { time: 4000, pose: 5 }    // Very motivated
                    ];
                } else {
                    sequence = [
                        { time: 0, pose: 0 },
                        { time: 3000, pose: 2 }
                    ];
                }

                let timeouts = [];
                const playSequence = (seqIndex) => {
                    if (seqIndex >= sequence.length) return;
                    const step = sequence[seqIndex];
                    const t = setTimeout(() => {
                        setSpriteIndex(step.pose);
                        playSequence(seqIndex + 1);
                    }, seqIndex === 0 ? 0 : step.time - (sequence[seqIndex - 1]?.time || 0));
                    timeouts.push(t);
                };
                
                playSequence(0);
                
                return () => {
                    timeouts.forEach(clearTimeout);
                };
            }, [message]);

            if (!message) return null;
            
            const imgSrc = config?.character === 'asena' ? 'assets/characters/mia_spritesheet_16.png' : 'assets/characters/jack_spritesheet_16.png';
            
            return ReactDOM.createPortal(
                <div className="fixed bottom-0 right-0 z-[9999999] pointer-events-none w-full h-[100dvh] max-w-md mx-auto md:right-[calc(50vw-224px)] flex items-end justify-end overflow-hidden">
                    
                    {/* Dark overlay behind character for focus */}
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-500 pointer-events-auto" onClick={onClose}></div>

                    {/* Character Image with CSS breathing animation */}
                    <div className={\`absolute bottom-[-10px] right-[-20px] w-[280px] pointer-events-none animate-in slide-in-from-bottom-[50px] fade-in duration-500 drop-shadow-[0_0_30px_rgba(0,255,255,0.2)] \${isSpeaking ? 'animate-[characterBreathe_1.5s_ease-in-out_infinite]' : 'animate-[characterBreathe_3s_ease-in-out_infinite]'}\`}>
                        <ChromaImage src={imgSrc} alt="Study Partner" spriteIndex={spriteIndex} gridSize={4} className="w-full h-auto object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)]" />
                    </div>
                    
                    {/* Speech Bubble */}
                    <div className="absolute bottom-[280px] right-[40px] w-[280px] bg-white/95 dark:bg-[#010a17]/95 backdrop-blur-xl border-2 border-[#00FFFF]/40 shadow-[0_20px_50px_rgba(0,255,255,0.25)] rounded-[2rem] rounded-br-md p-6 pointer-events-auto animate-in zoom-in-75 fade-in slide-in-from-bottom-10 duration-500 delay-150 fill-mode-backwards flex flex-col gap-4">
                        
                        <div className="flex items-center gap-2 mb-1">
                            <i className="fa-solid fa-sparkles text-[#00FFFF]"></i>
                            <span className="text-xs font-black text-[#00FFFF] tracking-widest uppercase">{config?.character === 'asena' ? 'ASENA' : 'ATAXY'}</span>
                        </div>

                        <p className="text-sm md:text-base text-gray-800 dark:text-gray-100 font-bold leading-relaxed min-h-[60px]">
                            <TypewriterText text={message.text} onComplete={() => setIsSpeaking(false)} speed={45} />
                        </p>
                        
                        <div className={\`flex gap-3 justify-end mt-2 transition-opacity duration-500 \${isSpeaking ? 'opacity-0 pointer-events-none' : 'opacity-100'}\`}>
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
    content = content.replace(floatingCompRegex, newComponents);
    console.log("Updated FloatingStudyPartner with Visual Novel Engine");
} else {
    console.log("Could not find FloatingStudyPartner");
}

fs.writeFileSync('index.html', content, 'utf8');
