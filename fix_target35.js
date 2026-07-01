const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const hookTarget = `            // 3. Contextual Tab Transitions (Post-Session)
            const [prevTab, setPrevTab] = React.useState(currentTab);
            React.useEffect(() => {
                if (prevTab === 'questions' && currentTab === 'home') {
                    triggerBrainMessage({
                        type: 'chatter',
                        text: "Great practice session! Analyzing your mistakes and learning from them is how you build an empire piece by piece.",
                        requireAcknowledge: true
                    });
                }
                setPrevTab(currentTab);
            }, [currentTab]);`;

const hookReplacement = `            // 3. Contextual Tab Transitions (Post-Session)
            const [prevTab, setPrevTab] = React.useState(currentTab);
            const [sessionQuestionsSolved, setSessionQuestionsSolved] = React.useState(0);
            
            // Increment session counter when an attempt is made
            React.useEffect(() => {
                if (currentTab === 'questions') {
                    setSessionQuestionsSolved(Object.keys(practiceAttempts).length);
                }
            }, [practiceAttempts]);

            React.useEffect(() => {
                if (prevTab === 'questions' && currentTab === 'home') {
                    const diff = Object.keys(practiceAttempts).length - sessionQuestionsSolved;
                    if (diff > 0) {
                        triggerBrainMessage({
                            type: 'chatter',
                            text: \`Great session! You just solved \${diff} question\${diff > 1 ? 's' : ''}. Analyzing your mistakes and learning from them is how you build an empire piece by piece.\`,
                            requireAcknowledge: true
                        }, true); // bypass cooldown
                    } else {
                        triggerBrainMessage({
                            type: 'chatter',
                            text: "You didn't solve any new questions this session! Consistency is key, try to at least do 5 questions next time.",
                            requireAcknowledge: true
                        });
                    }
                }
                if (currentTab === 'questions') {
                    setSessionQuestionsSolved(Object.keys(practiceAttempts).length);
                }
                setPrevTab(currentTab);
            }, [currentTab]);`;

content = content.replace(hookTarget, hookReplacement);
fs.writeFileSync('index.html', content, 'utf8');
console.log("Upgraded post-session praise to be dynamic");
