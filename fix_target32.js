const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const badBlock = `            // 3. Contextual Tab Transitions (Post-Session)
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

// Remove bad block
content = content.replace(badBlock, '');

// Find where to inject it properly
const safeTarget = `const [currentTab, setCurrentTab] = useState('home');`;
const safeReplacement = `const [currentTab, setCurrentTab] = useState('home');

            // 3. Contextual Tab Transitions (Post-Session)
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

content = content.replace(safeTarget, safeReplacement);
fs.writeFileSync('index.html', content, 'utf8');
console.log("Fixed ReferenceError for currentTab");
