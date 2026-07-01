const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const badBlock = `            // 3. Contextual Tab Transitions (Post-Session)
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

// Remove bad block
content = content.replace(badBlock, '');

// Find where to inject it properly
const safeTarget = `const [syllabusTest, setSyllabusTest] = useState(null);`;
const safeReplacement = `const [syllabusTest, setSyllabusTest] = useState(null);

            // 3. Contextual Tab Transitions (Post-Session)
            const [prevTab, setPrevTab] = React.useState(currentTab);
            const [sessionQuestionsSolved, setSessionQuestionsSolved] = React.useState(0);
            
            // Increment session counter when an attempt is made
            React.useEffect(() => {
                if (currentTab === 'questions' && practiceAttempts) {
                    setSessionQuestionsSolved(Object.keys(practiceAttempts).length);
                }
            }, [practiceAttempts]);

            React.useEffect(() => {
                if (prevTab === 'questions' && currentTab === 'home') {
                    const diff = (practiceAttempts ? Object.keys(practiceAttempts).length : 0) - sessionQuestionsSolved;
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
                if (currentTab === 'questions' && practiceAttempts) {
                    setSessionQuestionsSolved(Object.keys(practiceAttempts).length);
                }
                setPrevTab(currentTab);
            }, [currentTab]);`;

content = content.replace(safeTarget, safeReplacement);
fs.writeFileSync('index.html', content, 'utf8');
console.log("Fixed ReferenceError for practiceAttempts by moving block down");
