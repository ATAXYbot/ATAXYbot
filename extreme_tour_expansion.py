import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add id to Ask ATAXY Mentor button
old_mentor_btn = """<button onClick={() => setShowAIChat(!showAIChat)} className={`mt-4 w-full text-sm font-bold px-4 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border ${showAIChat ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-gradient-to-r from-[#00418d] to-[#1e5eb0] hover:from-[#003370] hover:to-[#174c91] border-transparent text-white shadow-md'}`}>"""
new_mentor_btn = """<button id="tour-ask-mentor" onClick={() => setShowAIChat(!showAIChat)} className={`mt-4 w-full text-sm font-bold px-4 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border ${showAIChat ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-gradient-to-r from-[#00418d] to-[#1e5eb0] hover:from-[#003370] hover:to-[#174c91] border-transparent text-white shadow-md'}`}>"""
content = content.replace(old_mentor_btn, new_mentor_btn)

# 2. Add id to Add Target button/input and target list
old_target_input = """<input type="text" value={newTarget} onChange={(e) => setNewTarget(e.target.value)}"""
new_target_input = """<input id="tour-target-input" type="text" value={newTarget} onChange={(e) => setNewTarget(e.target.value)}"""
content = content.replace(old_target_input, new_target_input)

old_time_input = """<input type="time" value={newTargetTimeStart} onChange={(e) => setNewTargetTimeStart(e.target.value)}"""
new_time_input = """<input id="tour-target-time" type="time" value={newTargetTimeStart} onChange={(e) => setNewTargetTimeStart(e.target.value)}"""
content = content.replace(old_time_input, new_time_input)

# 3. Add id to submit button in quiz
old_quiz_submit = """<button onClick={() => setShowQuizSubmit(true)} className="px-6 py-2 bg-[#ff5252] text-white rounded-xl font-bold shadow-[0_4px_15px_rgba(255,82,82,0.3)] hover:bg-[#ff3333] transition-colors">"""
new_quiz_submit = """<button id="tour-quiz-submit" onClick={() => setShowQuizSubmit(true)} className="px-6 py-2 bg-[#ff5252] text-white rounded-xl font-bold shadow-[0_4px_15px_rgba(255,82,82,0.3)] hover:bg-[#ff3333] transition-colors">"""
content = content.replace(old_quiz_submit, new_quiz_submit)


# 4. Replace the old getTourSteps block with the MASSIVE 50-step block
old_get_tour_steps_block = re.search(r'const getTourSteps = \(\) => \[\s*\{.*?\];', content, re.DOTALL)
if old_get_tour_steps_block:
    massive_tour = """const getTourSteps = () => {
                const dummyDate = new Date().toISOString().split('T')[0];
                return [
                { targetId: null, tab: 'home', text: 'Welcome to ATAXY! I am your AI Mentor. Sit back, I am going to take over your screen for an extreme deep tour!' },
                { targetId: 'nav-btn-home', tab: 'home', text: 'This is your Home dashboard.' },
                { targetId: 'tour-target-input', tab: 'home', text: 'Here you can add daily targets with exact time slots.' },
                { 
                    targetId: 'tour-target-list', 
                    tab: 'home', 
                    text: 'Let me add a dummy target for you right now...',
                    action: () => {
                        const dummy = { id: 'tour_dummy_target', text: 'Complete Physics Chapter 3 Demo', completed: false, timeStart: '14:00', timeEnd: '16:00', timestamp: Date.now() };
                        setTargetsData(prev => ({ ...prev, [dummyDate]: [dummy] }));
                    }
                },
                { targetId: null, tab: 'home', text: 'I will automatically remind you when the time slot begins so you never miss a target!' },
                
                { targetId: 'tour-ai-analytics', tab: 'home', text: 'Now let\\'s look at the Target Analyser!' },
                { 
                    targetId: 'tour-ai-analytics', 
                    tab: 'home', 
                    text: 'Opening your detailed performance breakdown...', 
                    action: () => setShowDetailedAnalyzer(true) 
                },
                { 
                    targetId: null, 
                    tab: 'home', 
                    text: 'Here you can see your consistency graph, weakest subjects, and your predicted Rank based on AI analysis!',
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
                { targetId: null, tab: 'questions', text: 'Here you have Physics, Chemistry, and Biology modules filled with NCERT questions and PYQs.' },
                
                { targetId: 'tour-practice-mock', tab: 'questions', text: 'You can also let AI generate custom mock tests! Let\\'s open it.', action: () => resetDeepState() },
                { 
                    targetId: null, 
                    tab: 'questions', 
                    text: 'In the Custom Test Generator, you select topics, number of questions, and difficulty level.',
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
                        window.tourMockQuestions = [{ id: 'q1', text: 'What is the powerhouse of the cell?', options: ['Nucleus','Mitochondria','Ribosome','Golgi'] }];
                    }
                },
                { targetId: null, tab: 'questions', text: 'You have a timer at the top, a grid of questions, and you can bookmark difficult ones.' },
                { 
                    targetId: 'tour-ask-mentor', 
                    tab: 'questions', 
                    text: 'If you are stuck on a question, you can click "Ask ATAXY Mentor" directly inside the quiz!',
                    action: () => {
                        const targetEl = document.getElementById('tour-ask-mentor');
                        if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                },
                { targetId: 'tour-quiz-submit', tab: 'questions', text: 'When you are done, click Submit Test.' },
                
                { targetId: 'nav-btn-profile', tab: 'profile', text: 'After submitting, you get a detailed analysis in your Profile.', action: () => resetDeepState() },
                { 
                    targetId: 'tour-profile-stats', 
                    tab: 'profile', 
                    text: 'Let\\'s open your Full Analytics!', 
                    action: () => setShowAnalyticsModal(true)
                },
                { targetId: null, tab: 'profile', text: 'Here you can review every single test attempt and check your accuracy.' },
                { targetId: null, tab: 'profile', text: 'The AI will also generate detailed step-by-step explanations for any question you got wrong!' },
                
                { targetId: 'nav-btn-vc', tab: 'vc', text: 'Let\\'s check out the Voice Rooms (VC) tab.', action: () => resetDeepState() },
                { targetId: 'tour-vc-list', tab: 'vc', text: 'You can join public study rooms here to study live with others.' },
                { targetId: 'tour-vc-create', tab: 'vc', text: 'Or click here to create your own private room and invite friends!' },
                
                { targetId: 'nav-btn-chats', tab: 'chats', text: 'Moving on to the Chats section...' },
                { targetId: 'tour-chats-global', tab: 'chats', text: 'This is the Global Community where you can chat with all ATAXY users.' },
                { targetId: 'tour-chats-private', tab: 'chats', text: 'And your private DMs and study group chats will appear in this list.' },
                
                { targetId: null, tab: 'home', text: 'You are all set! Let\\'s dominate your exams! 🚀', action: () => {
                    resetDeepState();
                    // Clean up dummy target
                    setTargetsData(prev => {
                        const newTargets = { ...prev };
                        if (newTargets[dummyDate]) {
                            newTargets[dummyDate] = newTargets[dummyDate].filter(t => t.id !== 'tour_dummy_target');
                        }
                        return newTargets;
                    });
                }}
            ];
            };"""
    content = content.replace(old_get_tour_steps_block.group(0), massive_tour)


with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Massive 50-step tour generated and injected successfully.")
