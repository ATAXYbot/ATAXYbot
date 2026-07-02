const fs = require('fs');

try {
    let content = fs.readFileSync('index.html', 'utf8');

    // Make the main App wrappers mobile sized on Desktop
    content = content.replace(/md:max-w-screen-xl max-w-md/g, 'w-full max-w-md mx-auto');
    content = content.replace(/md:max-w-screen-xl/g, 'w-full max-w-md mx-auto');
    
    // Fix ActiveVoiceRoom container (it's hardcoded to fixed inset-0)
    // We want the overlay to be inset-0, but the inner content to be max-w-md
    // We can do this by wrapping the VoiceRoom content in another div or just adding max-w-md mx-auto to it.
    // Let's find: `className="fixed inset-0 z-[2000000] bg-[#010B1C] text-white flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 font-sans"`
    // And replace it with `className="fixed inset-0 z-[2000000] bg-black/80 flex justify-center backdrop-blur-sm" onClick={() => setShowRoomMenu(false)}><div className="w-full h-full max-w-md mx-auto bg-[#010B1C] md:border-x border-white/20 text-white flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 font-sans shadow-2xl relative" onClick={e => e.stopPropagation()}>`
    // Wait, the original has `onClick={() => setShowRoomMenu(false)}`.
    
    content = content.replace(
        `className="fixed inset-0 z-[2000000] bg-[#010B1C] text-white flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 font-sans" onClick={() => setShowRoomMenu(false)}`,
        `className="fixed inset-0 z-[2000000] bg-black/80 flex justify-center backdrop-blur-sm" onClick={() => setShowRoomMenu(false)}><div className="w-full h-full max-w-[480px] bg-[#010B1C] md:border-x border-white/20 text-white flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 font-sans shadow-[0_0_50px_rgba(0,255,255,0.1)] relative" onClick={e => e.stopPropagation()}>`
    );

    // Now we must close the div at the end of renderActiveRoom.
    // The original ends with:
    // `                    </div>
    //              </VoiceRoomErrorBoundary>
    //          );`
    // Actually it doesn't end with VoiceRoomErrorBoundary inside renderActiveRoom. `renderActiveRoom` returns a div.
    // Let's replace the last `</div>` of renderActiveRoom.
    
    // An easier way: just add the classes directly to the fixed inset-0 container so it doesn't require nesting!
    // But `fixed inset-0 max-w-md mx-auto` will still fill the height, and center horizontally.
    // Yes! `fixed inset-0 max-w-md mx-auto` works perfectly in Tailwind without needing an extra wrapper!
    // Let's use that instead, it's much safer!
    
    let content2 = fs.readFileSync('index.html', 'utf8');
    
    // Globally replace md:max-w-screen-xl with max-w-[480px]
    content2 = content2.replace(/md:max-w-screen-xl max-w-md/g, 'max-w-md mx-auto md:border-x border-[#0AE0D0]/20 md:shadow-[0_0_50px_rgba(0,255,255,0.05)]');
    content2 = content2.replace(/md:max-w-screen-xl/g, 'max-w-md mx-auto md:border-x border-[#0AE0D0]/20 md:shadow-[0_0_50px_rgba(0,255,255,0.05)]');

    // Active Voice Room overlay
    content2 = content2.replace(
        `className="fixed inset-0 z-[2000000] bg-[#010B1C] text-white flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 font-sans"`,
        `className="fixed inset-0 max-w-md mx-auto md:border-x border-[#0AE0D0]/20 md:shadow-[0_0_50px_rgba(0,255,255,0.1)] z-[2000000] bg-[#010B1C] text-white flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 font-sans"`
    );
    
    fs.writeFileSync('index.html', content2);
    console.log("Success");
} catch (e) {
    console.error(e);
}
