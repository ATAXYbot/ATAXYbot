import re

def refactor_sathee_ui():
    with open('c:/Users/risha/ATAXYbot/index.html', 'r', encoding='utf-8') as f:
        code = f.read()

    # 1. Update the batches map function to include the onClick redirect
    batch_map_start = code.find('{(SATHEE_DATA.batches[activeSatheeExam.id] || SATHEE_DATA.batches[\'default\']).map(batch => (')
    if batch_map_start != -1:
        batch_map_end = code.find('</div>', code.find('<div className="flex-1">', batch_map_start)) + 6 + 100 # Rough estimate
        # Replace the onClick handler
        old_onclick = "onClick={() => setActiveSatheeBatch(batch)}"
        new_onclick = """onClick={() => {
                                                    // Save state so we can restore it when user clicks 'Back'
                                                    sessionStorage.setItem('ataxy_return_exam', activeSatheeExam.id);
                                                    sessionStorage.setItem('ataxy_return_type', 'others');
                                                    
                                                    // Immediately redirect to SATHEE courseView menu
                                                    const ref = batch.course_reference || 'ssc-mts-crash-course';
                                                    window.open(`https://sathee.iitk.ac.in/dashboard/courseView?course_reference=${ref}&language=he#`, '_self');
                                                }}"""
        
        # We need to make sure we replace the EXACT onClick
        
        # Let's use regex to replace it
        code = re.sub(r'onClick=\{\(\) => setActiveSatheeBatch\(batch\)\}', new_onclick, code)

    # 2. Add the State Restoration Hook
    # We can inject this near the top of the main React component `App` or `PracticeMode`?
    # Actually, the entire thing is inside a massive `window.App = () => {`
    app_start = code.find('const App = () => {')
    if app_start != -1:
        # Find the end of useState declarations
        use_effect_insert_point = code.find('useEffect(() => {', app_start)
        if use_effect_insert_point != -1:
            restoration_code = """
            // SATHEE Back-Navigation State Restoration
            useEffect(() => {
                const returnType = sessionStorage.getItem('ataxy_return_type');
                const returnExamId = sessionStorage.getItem('ataxy_return_exam');
                if (returnType === 'others' && returnExamId) {
                    setActivePracticeMode('bank');
                    setActivePracticeBatch({ type: 'others', name: 'Others', id: 'pb_others' });
                    // We need to wait for SATHEE_DATA to be available, it's defined globally
                    setTimeout(() => {
                        if (typeof SATHEE_DATA !== 'undefined') {
                            const exam = SATHEE_DATA.exams.find(e => e.id === returnExamId);
                            if (exam) setActiveSatheeExam(exam);
                        }
                    }, 100);
                    sessionStorage.removeItem('ataxy_return_type');
                    sessionStorage.removeItem('ataxy_return_exam');
                }
            }, []);
"""
            code = code[:use_effect_insert_point] + restoration_code + code[use_effect_insert_point:]

    # 3. Remove Subjects, Chapters, and Videos code
    # We can use find() and substring to remove these blocks
    subject_block_start = code.find('{activeSatheeBatch && !activeSatheeSubject && (() => {')
    if subject_block_start != -1:
        # Find the end of the chapter block, which is the last block
        chapter_block_end = code.find('})()}', code.find('{activeSatheeChapter && (() => {')) + 5
        
        code = code[:subject_block_start] + code[chapter_block_end:]

    # 4. Clean up unused states and variables (optional, but good practice)
    code = code.replace("const [activeSatheeSubject, setActiveSatheeSubject] = useState(null);", "")
    code = code.replace("const [activeSatheeChapter, setActiveSatheeChapter] = useState(null);", "")
    code = code.replace("const [activeSatheeContent, setActiveSatheeContent] = useState(null);", "")
    code = code.replace("const [activeSatheeTab, setActiveSatheeTab] = useState('videos');", "")

    # Also update the Back button to only clear exam
    bad_back_btn = """onClick={(e) => { 
                                            e.preventDefault(); 
                                            e.stopPropagation(); 
                                            if (activeSatheeContent) setActiveSatheeContent(null);
                                            else if (activeSatheeChapter) setActiveSatheeChapter(null);
                                            else if (activeSatheeSubject) setActiveSatheeSubject(null);
                                            else if (activeSatheeBatch) setActiveSatheeBatch(null);
                                            else if (activeSatheeExam) setActiveSatheeExam(null);
                                            else setActivePracticeBatch(null); 
                                        }}"""
                                        
    good_back_btn = """onClick={(e) => { 
                                            e.preventDefault(); 
                                            e.stopPropagation(); 
                                            if (activeSatheeBatch) setActiveSatheeBatch(null);
                                            else if (activeSatheeExam) setActiveSatheeExam(null);
                                            else setActivePracticeBatch(null); 
                                        }}"""
    code = code.replace(bad_back_btn, good_back_btn)

    with open('c:/Users/risha/ATAXYbot/index.html', 'w', encoding='utf-8') as f:
        f.write(code)
    
    print("Refactoring complete! UI is now strictly Exam -> Batch -> Redirect.")

refactor_sathee_ui()
