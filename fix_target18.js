const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// 1. Add showAIMentor state to App
const appStateRegex = /function App\(\) \{\s*\/\/\s*---\s*TOUR GUIDE STATE\s*---/;
if (appStateRegex.test(content)) {
    content = content.replace(appStateRegex, `function App() {
            const [showAIMentor, setShowAIMentor] = useState(false);
            
            useEffect(() => {
                const handleOpenMentor = () => setShowAIMentor(true);
                window.addEventListener('open_ataxy_mentor', handleOpenMentor);
                return () => window.removeEventListener('open_ataxy_mentor', handleOpenMentor);
            }, []);
            
            // --- TOUR GUIDE STATE ---`);
    console.log("Added showAIMentor state.");
} else {
    console.log("Could not find App state area.");
}

// 2. Change AIMentorView conditionally rendering inside App
const renderRegex = /\{currentTab === 'ai' && <AIMentorView onBack=\{\(\) => setCurrentTab\(previousTabRef\.current \|\| 'home'\)\} \/>\}/;
if (renderRegex.test(content)) {
    content = content.replace(renderRegex, `{showAIMentor && <AIMentorView onBack={() => setShowAIMentor(false)} />}`);
    console.log("Replaced AIMentorView rendering inside App.");
} else {
    console.log("Could not find AIMentorView rendering in App.");
}

// 3. Update the nav-btn-mentor button to dispatch event instead of navigating
const navBtnRegex = /id="nav-btn-mentor" onClick=\{\(\) => \{ if \(onNavigate\) onNavigate\('ai'\); \}\}/;
if (navBtnRegex.test(content)) {
    content = content.replace(navBtnRegex, `id="nav-btn-mentor" onClick={() => { window.dispatchEvent(new CustomEvent('open_ataxy_mentor')); }}`);
    console.log("Updated nav-btn-mentor onClick.");
} else {
    console.log("Could not find nav-btn-mentor.");
}

// 4. Update AIMentorView to use ReactDOM.createPortal
// Replace start of return
const mentorReturnStartRegex = /return \(\s*<div className="pb-\[calc\(180px_\+_env\(safe-area-inset-bottom,_0px\)\)\] animate-in fade-in flex flex-col h-full bg-white dark:bg-gray-950 relative">/;
if (mentorReturnStartRegex.test(content)) {
    content = content.replace(mentorReturnStartRegex, `return ReactDOM.createPortal(
                <div className="fixed inset-0 z-[4000000] animate-in fade-in zoom-in-95 flex flex-col bg-white dark:bg-gray-950 md:max-w-screen-xl max-w-md mx-auto shadow-2xl">`);
    console.log("Updated AIMentorView return start.");
} else {
    console.log("Could not find AIMentorView return start.");
}

// Replace end of return
// To find the end of AIMentorView safely, we will look for:
//                 </div>
//             );
//         };
//
//         // ==========================================
//         // ⏱️ PRACTICE SESSION TIMER

const mentorReturnEndRegex = / {16}<\/div>\n {12}\);\n {8}\};\n\n {8}\/\/ ==========================================\n {8}\/\/ ⏱️ PRACTICE SESSION TIMER/s;

if (mentorReturnEndRegex.test(content)) {
    content = content.replace(mentorReturnEndRegex, `                </div>, document.body
            );
        };

        // ==========================================
        // ⏱️ PRACTICE SESSION TIMER`);
    console.log("Updated AIMentorView return end.");
} else {
    console.log("Could not find AIMentorView return end.");
}


fs.writeFileSync('index.html', content, 'utf8');
