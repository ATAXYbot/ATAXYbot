import re

def inject_use_effect():
    with open('c:/Users/risha/ATAXYbot/index.html', 'r', encoding='utf-8') as f:
        code = f.read()

    app_start = code.find('function App() {')
    if app_start != -1:
        # Find the first useState or just inject it directly after function App() {
        use_effect_insert_point = code.find('{', app_start) + 1
        
        restoration_code = """
            // SATHEE Back-Navigation State Restoration
            React.useEffect(() => {
                const returnType = sessionStorage.getItem('ataxy_return_type');
                const returnExamId = sessionStorage.getItem('ataxy_return_exam');
                if (returnType === 'others' && returnExamId) {
                    // Set timeout to ensure SATHEE_DATA is parsed
                    setTimeout(() => {
                        setActivePracticeMode('bank');
                        setActivePracticeBatch({ type: 'others', name: 'Others', id: 'pb_others' });
                        if (typeof SATHEE_DATA !== 'undefined') {
                            const exam = SATHEE_DATA.exams.find(e => e.id === returnExamId);
                            if (exam) setActiveSatheeExam(exam);
                        }
                    }, 50);
                    sessionStorage.removeItem('ataxy_return_type');
                    sessionStorage.removeItem('ataxy_return_exam');
                }
            }, []);
"""
        code = code[:use_effect_insert_point] + restoration_code + code[use_effect_insert_point:]
        
        with open('c:/Users/risha/ATAXYbot/index.html', 'w', encoding='utf-8') as f:
            f.write(code)
            
        print("Effect Injected.")
    else:
        print("function App() not found")

inject_use_effect()
