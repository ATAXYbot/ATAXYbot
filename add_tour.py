import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update StudyPartnerWidget signature
content = content.replace(
    "const StudyPartnerWidget = ({ partnerConfig, partnerMessage, setPartnerMessage, currentTab, showQuiz }) => {",
    "const StudyPartnerWidget = ({ partnerConfig, partnerMessage, setPartnerMessage, currentTab, showQuiz, tourStep, tourTargetId, onTourNext }) => {"
)

# 2. Update StudyPartnerWidget physics loop to handle tour mode
physics_tour_code = """
                        if (tourStep > -1 && tourTargetId) {
                            const targetEl = document.getElementById(tourTargetId);
                            if (targetEl) {
                                const rect = targetEl.getBoundingClientRect();
                                const targetX = rect.left + rect.width / 2;
                                // Hover 140px above the element
                                const targetY = rect.top - 140;
                                
                                p.vx += (targetX - p.x) * 0.05;
                                p.vy += (targetY - p.y) * 0.05;
                                
                                // Dampen velocity
                                p.vx *= 0.8;
                                p.vy *= 0.8;
                                
                                p.isGrounded = false;
                                p.state = 'falling';
                            }
                        } else {
                            p.vy += 0.6; // Gravity
                        }
"""
content = content.replace("                        p.vy += 0.6; // Gravity", physics_tour_code)

# 3. Update the Next button in StudyPartnerWidget bubble
old_button = """                                    <button 
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
                                    </button>"""

new_button = """                                    <button 
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
content = content.replace(old_button, new_button)

# 4. Inject tour state and logic in App()
app_start_code = """        function App() {
            // --- TOUR GUIDE STATE ---
            const TOUR_STEPS = [
                { targetId: null, tab: 'home', text: 'Welcome to ATAXY! I am your AI Mentor. Let me give you a quick tour!' },
                { targetId: 'nav-btn-home', tab: 'home', text: 'This is the Home tab! Here you can see your daily targets and AI predictions.' },
                { targetId: 'nav-btn-mentor', tab: 'home', text: 'Click here anytime to chat with me. I can solve your doubts 24/7!' },
                { targetId: 'nav-btn-vc', tab: 'vc', text: 'Join Voice Rooms here to study live with your friends!' },
                { targetId: 'nav-btn-chats', tab: 'chats', text: 'Chat globally or direct message your study partners here.' },
                { targetId: 'nav-btn-practice', tab: 'questions', text: 'Practice for JEE/NEET with AI-generated tests and PYQs here!' },
                { targetId: 'nav-btn-profile', tab: 'profile', text: 'Check your analytics and settings in your Profile. You are all set! Happy studying!' }
            ];
            
            const [tourStep, setTourStep] = React.useState(() => localStorage.getItem('ataxy_tour_completed') === 'true' ? -1 : 0);
            
            const handleTourNext = () => {
                const nextStep = tourStep + 1;
                if (nextStep >= TOUR_STEPS.length) {
                    setTourStep(-1);
                    localStorage.setItem('ataxy_tour_completed', 'true');
                    setPartnerMessage({ type: 'chatter', text: "Tour completed! Let's crack it!" });
                    setCurrentTab('home');
                } else {
                    setTourStep(nextStep);
                }
            };
            
            React.useEffect(() => {
                if (tourStep > -1 && tourStep < TOUR_STEPS.length) {
                    const step = TOUR_STEPS[tourStep];
                    if (currentTab !== step.tab) {
                        setCurrentTab(step.tab);
                    }
                    setTimeout(() => {
                        setPartnerMessage({ type: 'tour', text: step.text, emotion: 'happy' });
                    }, 500);
                }
            }, [tourStep]);
            // ------------------------
"""
content = content.replace("        function App() {", app_start_code)

# 5. Inject tour props into <StudyPartnerWidget />
widget_render_old = """                    <StudyPartnerWidget partnerConfig={studyPartnerConfig} partnerMessage={partnerMessage} setPartnerMessage={setPartnerMessage} currentTab={currentTab} showQuiz={showQuiz} />"""
widget_render_new = """                    <StudyPartnerWidget partnerConfig={studyPartnerConfig} partnerMessage={partnerMessage} setPartnerMessage={setPartnerMessage} currentTab={currentTab} showQuiz={showQuiz} tourStep={tourStep} tourTargetId={tourStep > -1 ? TOUR_STEPS[tourStep].targetId : null} onTourNext={handleTourNext} />"""
content = content.replace(widget_render_old, widget_render_new)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Tour code injected successfully!")
