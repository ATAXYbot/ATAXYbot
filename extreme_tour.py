import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Change resetDeepState to a hoisted function
content = content.replace(
    'const resetDeepState = () => {',
    'function resetDeepState() {'
)

# 2. Update TOUR_STEPS to getTourSteps()
old_tour_steps_block = """            const TOUR_STEPS = [
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

new_tour_steps_block = """            const getTourSteps = () => [
                { targetId: null, tab: 'home', text: 'Welcome to ATAXY! I am your AI Mentor. Sit back, I am going to take over your screen for an extreme deep tour!' },
                { targetId: 'nav-btn-home', tab: 'home', text: 'This is your Home dashboard.' },
                { targetId: 'tour-ai-analytics', tab: 'home', text: 'Let me show you the Performance Analyser!' },
                { 
                    targetId: 'tour-ai-analytics', 
                    tab: 'home', 
                    text: 'I am opening it for you right now...', 
                    action: () => setShowDetailedAnalyzer(true) 
                },
                { 
                    targetId: null, 
                    tab: 'home', 
                    text: 'Here you can see your consistency graph, weakest subjects, and your predicted Rank!',
                },
                { 
                    targetId: 'nav-btn-mentor', 
                    tab: 'home', 
                    text: 'Click the ATAXY Mentor button anytime to chat with me.',
                    action: () => setShowDetailedAnalyzer(false)
                },
                { 
                    targetId: null, 
                    tab: 'home', 
                    text: 'I can solve your doubts, explain concepts, and give you study plans 24/7!',
                    action: () => setCurrentTab('ai')
                },
                { targetId: 'nav-btn-vc', tab: 'vc', text: 'Let\\'s check out the Voice Rooms (VC) tab.' },
                { targetId: 'nav-btn-practice', tab: 'questions', text: 'Now for the most important part: The Practice tab!' },
                { targetId: 'tour-practice-subjects', tab: 'questions', text: 'Let\\'s dive inside the NEET Bank course!' },
                { 
                    targetId: 'tour-practice-subjects', 
                    tab: 'questions', 
                    text: 'Opening NEET Bank...', 
                    action: () => {
                        const neetBatch = SATHEE_DATA?.batches?.neet?.[0];
                        if (neetBatch) setActivePracticeBatch(neetBatch);
                    }
                },
                { 
                    targetId: null, 
                    tab: 'questions', 
                    text: 'Here you have Physics, Chemistry, and Biology modules.' 
                },
                { targetId: 'tour-practice-mock', tab: 'questions', text: 'You can also let AI generate custom mock tests! Let\\'s open it.', action: () => resetDeepState() },
                { 
                    targetId: null, 
                    tab: 'questions', 
                    text: 'In the Custom Test Generator, you can select specific topics, number of questions, and difficulty level.',
                    action: () => setCustomGeneratorMode('generator')
                },
                { 
                    targetId: null, 
                    tab: 'questions', 
                    text: 'Once you generate a test, the active quiz screen looks like this!',
                    action: () => {
                        setCustomGeneratorMode('history');
                        const dummyChapter = { name: "Tour Demo Quiz", isCustomTest: true, id: "tour_dummy" };
                        setActivePracticeChapter(dummyChapter);
                        setPracticeSelectedTopic("Demo");
                        setShowQuiz(true);
                        // Mocking some loaded questions so the quiz screen renders safely
                        // Use a global mock to avoid React undefined errors in quiz render
                        window.tourMockQuestions = [{ id: 'q1', text: 'Demo Question 1?', options: ['A','B','C','D'] }];
                    }
                },
                { 
                    targetId: null, 
                    tab: 'questions', 
                    text: 'You have a timer at the top, a grid of questions, and you can bookmark difficult ones.' 
                },
                { targetId: 'nav-btn-profile', tab: 'profile', text: 'After submitting, you get a detailed analysis in your Profile.', action: () => resetDeepState() },
                { 
                    targetId: 'tour-profile-stats', 
                    tab: 'profile', 
                    text: 'Let\\'s open your Full Analytics!', 
                    action: () => setShowAnalyticsModal(true)
                },
                { 
                    targetId: null, 
                    tab: 'profile', 
                    text: 'Here you can review every single test attempt, check your mistakes, and read AI explanations!' 
                },
                { targetId: null, tab: 'home', text: 'You are all set! Let\\'s dominate your exams! 🚀', action: () => resetDeepState() }
            ];"""
content = content.replace(old_tour_steps_block, new_tour_steps_block)

# 3. Update handleTourNext
old_handle_tour_next = """            const handleTourNext = () => {
                const nextStep = tourStep + 1;
                if (nextStep >= TOUR_STEPS.length) {
                    setTourStep(-1);
                    localStorage.setItem('ataxy_tour_completed', 'true');
                    setPartnerMessage({ type: 'chatter', text: "Tour completed! Let's crack it!" });
                    setCurrentTab('home');
                } else {
                    setTourStep(nextStep);
                }
            };"""
            
new_handle_tour_next = """            const handleTourNext = () => {
                const steps = getTourSteps();
                const nextStep = tourStep + 1;
                if (nextStep >= steps.length) {
                    setTourStep(-1);
                    localStorage.setItem('ataxy_tour_completed', 'true');
                    setPartnerMessage({ type: 'chatter', text: "Tour completed! Let's crack it!" });
                    resetDeepState();
                    setCurrentTab('home');
                } else {
                    setTourStep(nextStep);
                }
            };"""
content = content.replace(old_handle_tour_next, new_handle_tour_next)

# 4. Update the useEffect that watches tourStep
old_use_effect_tour = """            React.useEffect(() => {
                const handleCancelTour = () => {
                    setTourStep(-1);
                    localStorage.setItem('ataxy_tour_completed', 'true');
                };
                window.addEventListener('ataxy_cancel_tour', handleCancelTour);
                return () => window.removeEventListener('ataxy_cancel_tour', handleCancelTour);
            }, []);
            
            React.useEffect(() => {
                if (tourStep > -1 && tourStep < TOUR_STEPS.length) {
                    const step = TOUR_STEPS[tourStep];
                    if (step.tab !== currentTab) setCurrentTab(step.tab);
                    setPartnerMessage({ type: 'chatter', text: step.text });
                }
            }, [tourStep]);"""

new_use_effect_tour = """            React.useEffect(() => {
                const handleCancelTour = () => {
                    setTourStep(-1);
                    localStorage.setItem('ataxy_tour_completed', 'true');
                    resetDeepState();
                };
                window.addEventListener('ataxy_cancel_tour', handleCancelTour);
                return () => window.removeEventListener('ataxy_cancel_tour', handleCancelTour);
            }, []);
            
            React.useEffect(() => {
                const steps = getTourSteps();
                if (tourStep > -1 && tourStep < steps.length) {
                    const step = steps[tourStep];
                    if (step.tab !== currentTab) setCurrentTab(step.tab);
                    if (step.action) {
                        try { step.action(); } catch (e) { console.error("Tour action error", e); }
                    }
                    setPartnerMessage({ type: 'chatter', text: step.text });
                }
            }, [tourStep]);"""
content = content.replace(old_use_effect_tour, new_use_effect_tour)

# 5. Fix the missing loadedQuestions injection in Question View
# When in Tour mode, we mock the questions so it doesn't crash when activePracticeChapter is dummy
quiz_view_fix = """                            const selectedTopic = practiceSelectedTopic;
                            let displayedQuestions = loadedQuestions;"""
new_quiz_view_fix = """                            const selectedTopic = practiceSelectedTopic;
                            let displayedQuestions = window.tourMockQuestions && activePracticeChapter?.id === 'tour_dummy' ? window.tourMockQuestions : loadedQuestions;"""
content = content.replace(quiz_view_fix, new_quiz_view_fix)

# 6. Update the Widget tour props
old_widget_props = """tourTargetId={tourStep > -1 ? TOUR_STEPS[tourStep].targetId : null}"""
new_widget_props = """tourTargetId={tourStep > -1 ? getTourSteps()[tourStep].targetId : null}"""
content = content.replace(old_widget_props, new_widget_props)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Extreme deep tour logic injected successfully")
