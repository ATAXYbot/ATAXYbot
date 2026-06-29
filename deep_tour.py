import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Target Input
content = content.replace(
    'className="flex-1 flex flex-col sm:flex-row gap-2"',
    'id="tour-target-input" className="flex-1 flex flex-col sm:flex-row gap-2"'
)

# 2. Target List
content = content.replace(
    'className="space-y-2 mb-4 min-h-[60px]"',
    'id="tour-target-list" className="space-y-2 mb-4 min-h-[60px]"'
)

# 3. AI Analytics
content = content.replace(
    'onClick={() => setShowDetailedAnalyzer(true)} className="bg-gradient-to-r from-gray-900',
    'id="tour-ai-analytics" onClick={() => setShowDetailedAnalyzer(true)} className="bg-gradient-to-r from-gray-900'
)

# 4. VC Room List
content = content.replace(
    '<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 px-4 pb-20 max-w-7xl mx-auto">',
    '<div id="tour-vc-list" className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 px-4 pb-20 max-w-7xl mx-auto">'
)

# 5. VC Create
content = content.replace(
    'onClick={() => setVcRoomActive(true)}',
    'id="tour-vc-create" onClick={() => setVcRoomActive(true)}'
)

# 6. Global Chat
content = content.replace(
    'onClick={() => { setActiveChatId(\'global\');',
    'id="tour-chats-global" onClick={() => { setActiveChatId(\'global\');'
)

# 7. Private Chats
content = content.replace(
    '<div className="px-3 pb-24 overflow-y-auto">',
    '<div id="tour-chats-private" className="px-3 pb-24 overflow-y-auto">'
)

# 8. Practice Subjects
content = content.replace(
    '<div className="grid grid-cols-2 md:grid-cols-4 gap-3">',
    '<div id="tour-practice-subjects" className="grid grid-cols-2 md:grid-cols-4 gap-3">'
)

# 9. Practice Mock
content = content.replace(
    'onClick={() => setCustomGeneratorMode(customGeneratorMode === \'generator\' ? \'history\' : \'generator\')}',
    'id="tour-practice-mock" onClick={() => setCustomGeneratorMode(customGeneratorMode === \'generator\' ? \'history\' : \'generator\')}'
)

# 10. Profile Stats
content = content.replace(
    '<div className="grid grid-cols-3 gap-3 mb-6">',
    '<div id="tour-profile-stats" className="grid grid-cols-3 gap-3 mb-6">'
)

# 11. Profile Heatmap
content = content.replace(
    '<h3 className="text-gray-800 dark:text-gray-200 font-bold mb-3 flex items-center gap-2"><i className="fa-solid fa-fire-flame-curved text-orange-500"></i> Activity Heatmap</h3>',
    '<h3 id="tour-profile-heatmap" className="text-gray-800 dark:text-gray-200 font-bold mb-3 flex items-center gap-2"><i className="fa-solid fa-fire-flame-curved text-orange-500"></i> Activity Heatmap</h3>'
)

# 12. Profile Settings
content = content.replace(
    '<i className="fa-solid fa-gear text-lg text-gray-500 dark:text-gray-400"></i>',
    '<i id="tour-profile-settings" className="fa-solid fa-gear text-lg text-gray-500 dark:text-gray-400"></i>'
)

# Update TOUR_STEPS in App
old_tour_steps = """            const TOUR_STEPS = [
                { targetId: null, tab: 'home', text: 'Welcome to ATAXY! I am your AI Mentor. Let me give you a quick tour!' },
                { targetId: 'nav-btn-home', tab: 'home', text: 'This is the Home tab! Here you can see your daily targets and AI predictions.' },
                { targetId: 'nav-btn-mentor', tab: 'home', text: 'Click here anytime to chat with me. I can solve your doubts 24/7!' },
                { targetId: 'nav-btn-vc', tab: 'vc', text: 'Join Voice Rooms here to study live with your friends!' },
                { targetId: 'nav-btn-chats', tab: 'chats', text: 'Chat globally or direct message your study partners here.' },
                { targetId: 'nav-btn-practice', tab: 'questions', text: 'Practice for JEE/NEET with AI-generated tests and PYQs here!' },
                { targetId: 'nav-btn-profile', tab: 'profile', text: 'Check your analytics and settings in your Profile. You are all set! Happy studying!' }
            ];"""

new_tour_steps = """            const TOUR_STEPS = [
                { targetId: null, tab: 'home', text: 'Welcome to ATAXY! I am your AI Mentor. Let me give you a deep tour of the app!' },
                { targetId: 'nav-btn-home', tab: 'home', text: 'This is your Home dashboard.' },
                { targetId: 'tour-target-input', tab: 'home', text: 'Here you can log your daily study targets with exact timeframes.' },
                { targetId: 'tour-target-list', tab: 'home', text: 'Your pending and completed targets will show up here.' },
                { targetId: 'tour-ai-analytics', tab: 'home', text: 'Our AI analyzes your consistency and predicts your potential Rank here!' },
                { targetId: 'nav-btn-mentor', tab: 'home', text: 'Click this hero button anytime to chat with me 24/7.' },
                { targetId: 'nav-btn-vc', tab: 'vc', text: 'Let\\'s check out the Voice Rooms (VC) tab.' },
                { targetId: 'tour-vc-list', tab: 'vc', text: 'You can join public study rooms here to study live with others.' },
                { targetId: 'tour-vc-create', tab: 'vc', text: 'Or click here to create your own private room and invite friends!' },
                { targetId: 'nav-btn-chats', tab: 'chats', text: 'Moving on to the Chats section...' },
                { targetId: 'tour-chats-global', tab: 'chats', text: 'This is the Global Community where you can chat with all ATAXY users.' },
                { targetId: 'tour-chats-private', tab: 'chats', text: 'And your private DMs and study group chats will appear in this list.' },
                { targetId: 'nav-btn-practice', tab: 'questions', text: 'Now for the most important part: The Practice tab!' },
                { targetId: 'tour-practice-subjects', tab: 'questions', text: 'Select your subject (Physics, Chemistry, etc.) to access PYQs and NCERT questions.' },
                { targetId: 'tour-practice-mock', tab: 'questions', text: 'You can also let AI generate custom mock tests for you here!' },
                { targetId: 'nav-btn-profile', tab: 'profile', text: 'Finally, your Profile.' },
                { targetId: 'tour-profile-stats', tab: 'profile', text: 'Track your overall accuracy, target completion rate, and current streak.' },
                { targetId: 'tour-profile-heatmap', tab: 'profile', text: 'This heatmap visualizes your daily consistency over the year.' },
                { targetId: 'tour-profile-settings', tab: 'profile', text: 'Customize your profile and app settings here.' },
                { targetId: null, tab: 'home', text: 'You are all set! Let\\'s dominate your exams! 🚀' }
            ];"""
content = content.replace(old_tour_steps, new_tour_steps)

# Update Skip Tour button logic in bubble
old_button_logic = """                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (tourStep > -1 && onTourNext) {
                                                onTourNext();
                                                return;
                                            }
                                            setVisible(false);
                                            setTimeout(() => {
                                                if (physicsRef.current) physicsRef.current.partnerMessage = null;
                                                setPartnerMessage(null);
                                            }, 300);
                                        }}
                                        className="bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-800/60 px-4 py-1.5 rounded-lg font-bold text-xs shadow-sm transition-colors active:scale-95"
                                    >
                                        {tourStep > -1 ? "Next 🚀" : bubbleBtnText}
                                    </button>"""

new_button_logic = """                                    {tourStep > -1 ? (
                                        <div className="flex gap-2 w-full justify-between">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setVisible(false);
                                                    setTimeout(() => {
                                                        if (physicsRef.current) physicsRef.current.partnerMessage = null;
                                                        setPartnerMessage(null);
                                                        // Use a custom event to tell App to cancel the tour
                                                        window.dispatchEvent(new CustomEvent('ataxy_cancel_tour'));
                                                    }, 300);
                                                }}
                                                className="bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors active:scale-95"
                                            >
                                                Skip
                                            </button>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (onTourNext) onTourNext();
                                                }}
                                                className="bg-blue-500 text-white hover:bg-blue-600 px-4 py-1.5 rounded-lg font-bold text-xs shadow-sm transition-colors active:scale-95"
                                            >
                                                Next 🚀
                                            </button>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setVisible(false);
                                                setTimeout(() => {
                                                    if (physicsRef.current) physicsRef.current.partnerMessage = null;
                                                    setPartnerMessage(null);
                                                }, 300);
                                            }}
                                            className="bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-800/60 px-4 py-1.5 rounded-lg font-bold text-xs shadow-sm transition-colors active:scale-95"
                                        >
                                            {bubbleBtnText}
                                        </button>
                                    )}"""
content = content.replace(old_button_logic, new_button_logic)

# In App, add the event listener for 'ataxy_cancel_tour'
app_cancel_tour = """            React.useEffect(() => {
                const handleCancelTour = () => {
                    setTourStep(-1);
                    localStorage.setItem('ataxy_tour_completed', 'true');
                };
                window.addEventListener('ataxy_cancel_tour', handleCancelTour);
                return () => window.removeEventListener('ataxy_cancel_tour', handleCancelTour);
            }, []);
"""
content = content.replace("            React.useEffect(() => {\n                if (tourStep > -1", app_cancel_tour + "            React.useEffect(() => {\n                if (tourStep > -1")

# Update physics scroll into view
physics_scroll = """                                p.isGrounded = false;
                                if (dist < 15) {
                                    p.state = 'greet';
                                } else {
                                    p.state = 'falling';
                                }"""
new_physics_scroll = """                                p.isGrounded = false;
                                if (dist < 15) {
                                    p.state = 'greet';
                                } else {
                                    p.state = 'falling';
                                }
                                
                                // Auto scroll logic if target is offscreen
                                if (dist > 300 && p.vy > 0 && rect.bottom > window.innerHeight) {
                                    window.scrollBy({ top: 10, behavior: 'auto' });
                                } else if (dist > 300 && p.vy < 0 && rect.top < 0) {
                                    window.scrollBy({ top: -10, behavior: 'auto' });
                                }"""
content = content.replace(physics_scroll, new_physics_scroll)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Deep tour logic injected successfully")
