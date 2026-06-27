import re

def update_ui_for_sections():
    with open('c:/Users/risha/ATAXYbot/index.html', 'r', encoding='utf-8') as f:
        code = f.read()

    # 1. Add activeSatheeSection state
    state_injection = """            const [activeSatheeExam, setActiveSatheeExam] = useState(null);
            const [activeSatheeSection, setActiveSatheeSection] = useState(null);"""
    code = code.replace("            const [activeSatheeExam, setActiveSatheeExam] = useState(null);", state_injection)

    # 2. Update SATHEE_DATA
    # I need to completely replace the SATHEE_DATA constant.
    sathee_data_start = code.find('const SATHEE_DATA = {')
    sathee_data_end = code.find('const PRACTICE_BATCHES =')
    
    new_sathee_data = """const SATHEE_DATA = {
    exams: [
        { id: 'exam_ssc', name: 'SSC', icon: 'fa-building-columns' },
        { id: 'exam_cuet', name: 'CUET', icon: 'fa-graduation-cap' },
        { id: 'exam_clat', name: 'CLAT', icon: 'fa-scale-balanced' },
        { id: 'exam_icar', name: 'ICAR', icon: 'fa-seedling' },
        { id: 'exam_rrb', name: 'RRB', icon: 'fa-train' },
        { id: 'exam_nda', name: 'NDA', icon: 'fa-shield-halved' }
    ],
    sections: {
        'exam_ssc': [
            { id: 'sec_ssc_mts', name: 'MTS' },
            { id: 'sec_ssc_cgl', name: 'CGL' }
        ]
    },
    batches: {
        'sec_ssc_mts': [
            { id: 'b_mts_1', name: 'SSC MTS Crash Course', medium: 'Hinglish', icon: 'fa-rocket', color: 'blue', course_reference: 'ssc-mts-crash-course' }
        ],
        'sec_ssc_cgl': [
            { id: 'b_cgl_1', name: 'SSC CGL Target Batch', medium: 'Hinglish', icon: 'fa-bullseye', color: 'green', course_reference: 'ssc-cgl-target-batch' }
        ],
        'default': [
            { id: 'b_def_1', name: 'General Foundation Course', medium: 'Bilingual', icon: 'fa-book-open', color: 'purple', course_reference: 'general-foundation' }
        ]
    }
};

        """
    code = code[:sathee_data_start] + new_sathee_data + code[sathee_data_end:]

    # 3. Update the Render Block
    # Find the current exam batches rendering block
    render_start = code.find('{activeSatheeExam && !activeSatheeBatch && (')
    render_end = code.find('</div>', code.find('<div className="flex-1">', render_start)) + 120
    # I will just regex replace the whole block.
    # Actually, it's safer to find the boundaries precisely.
    render_block_code = code[render_start:code.find(')}', render_start)+2]

    new_render_block = """{activeSatheeExam && !activeSatheeSection && !activeSatheeBatch && (
                            <div className="space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
                                {SATHEE_DATA.sections && SATHEE_DATA.sections[activeSatheeExam.id] ? (
                                    SATHEE_DATA.sections[activeSatheeExam.id].map(sec => (
                                        <div key={sec.id} onClick={() => setActiveSatheeSection(sec)} className="group relative w-full p-5 rounded-3xl overflow-hidden cursor-pointer bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400`}>
                                                    <i className="fa-solid fa-layer-group"></i>
                                                </div>
                                                <h3 className="font-bold text-gray-800 dark:text-white text-lg">{sec.name}</h3>
                                            </div>
                                            <i className="fa-solid fa-chevron-right text-gray-400"></i>
                                        </div>
                                    ))
                                ) : (
                                    (SATHEE_DATA.batches[activeSatheeExam.id] || SATHEE_DATA.batches['default']).map(batch => (
                                        <div key={batch.id} onClick={() => {
                                            sessionStorage.setItem('ataxy_return_exam', activeSatheeExam.id);
                                            sessionStorage.setItem('ataxy_return_type', 'others');
                                            const ref = batch.course_reference || 'default-course';
                                            window.open(`https://sathee.iitk.ac.in/dashboard/courseView?course_reference=${ref}&language=he#`, '_self');
                                        }} className="group relative w-full p-5 rounded-3xl overflow-hidden cursor-pointer bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-${batch.color || 'blue'}-50 dark:bg-${batch.color || 'blue'}-900/30 text-${batch.color || 'blue'}-500 dark:text-${batch.color || 'blue'}-400`}>
                                                    <i className={`fa-solid ${batch.icon}`}></i>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-800 dark:text-white">{batch.name}</h3>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{batch.medium}</p>
                                                </div>
                                            </div>
                                            <i className="fa-solid fa-chevron-right text-gray-400"></i>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeSatheeExam && activeSatheeSection && !activeSatheeBatch && (
                            <div className="space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
                                {(SATHEE_DATA.batches[activeSatheeSection.id] || SATHEE_DATA.batches['default']).map(batch => (
                                    <div key={batch.id} onClick={() => {
                                        sessionStorage.setItem('ataxy_return_exam', activeSatheeExam.id);
                                        sessionStorage.setItem('ataxy_return_section', activeSatheeSection.id);
                                        sessionStorage.setItem('ataxy_return_type', 'others');
                                        const ref = batch.course_reference || 'default-course';
                                        window.open(`https://sathee.iitk.ac.in/dashboard/courseView?course_reference=${ref}&language=he#`, '_self');
                                    }} className="group relative w-full p-5 rounded-3xl overflow-hidden cursor-pointer bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-${batch.color || 'blue'}-50 dark:bg-${batch.color || 'blue'}-900/30 text-${batch.color || 'blue'}-500 dark:text-${batch.color || 'blue'}-400`}>
                                                <i className={`fa-solid ${batch.icon}`}></i>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-800 dark:text-white">{batch.name}</h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{batch.medium}</p>
                                            </div>
                                        </div>
                                        <i className="fa-solid fa-chevron-right text-gray-400"></i>
                                    </div>
                                ))}
                            </div>
                        )}"""

    code = code.replace(render_block_code, new_render_block)

    # 4. Update the breadcrumb
    bad_breadcrumb = "{activeSatheeBatch ? activeSatheeBatch.name : activeSatheeExam ? activeSatheeExam.name : 'All Exams (SATHEE)'}"
    good_breadcrumb = "{activeSatheeBatch ? activeSatheeBatch.name : activeSatheeSection ? activeSatheeSection.name : activeSatheeExam ? activeSatheeExam.name : 'All Exams (SATHEE)'}"
    code = code.replace(bad_breadcrumb, good_breadcrumb)

    # 5. Update back button logic
    bad_back_btn = """onClick={(e) => { 
                                            e.preventDefault(); 
                                            e.stopPropagation(); 
                                            if (activeSatheeBatch) setActiveSatheeBatch(null);
                                            else if (activeSatheeExam) setActiveSatheeExam(null);
                                            else setActivePracticeBatch(null); 
                                        }}"""
                                        
    good_back_btn = """onClick={(e) => { 
                                            e.preventDefault(); 
                                            e.stopPropagation(); 
                                            if (activeSatheeBatch) setActiveSatheeBatch(null);
                                            else if (activeSatheeSection) setActiveSatheeSection(null);
                                            else if (activeSatheeExam) setActiveSatheeExam(null);
                                            else setActivePracticeBatch(null); 
                                        }}"""
    code = code.replace(bad_back_btn, good_back_btn)

    # 6. Update restore logic
    bad_restore = """                        if (typeof SATHEE_DATA !== 'undefined') {
                            const exam = SATHEE_DATA.exams.find(e => e.id === returnExamId);
                            if (exam) setActiveSatheeExam(exam);
                        }
                    }, 50);
                    sessionStorage.removeItem('ataxy_return_type');
                    sessionStorage.removeItem('ataxy_return_exam');"""

    good_restore = """                        if (typeof SATHEE_DATA !== 'undefined') {
                            const exam = SATHEE_DATA.exams.find(e => e.id === returnExamId);
                            if (exam) {
                                setActiveSatheeExam(exam);
                                const returnSectionId = sessionStorage.getItem('ataxy_return_section');
                                if (returnSectionId && SATHEE_DATA.sections && SATHEE_DATA.sections[returnExamId]) {
                                    const section = SATHEE_DATA.sections[returnExamId].find(s => s.id === returnSectionId);
                                    if (section) setActiveSatheeSection(section);
                                }
                            }
                        }
                    }, 50);
                    sessionStorage.removeItem('ataxy_return_type');
                    sessionStorage.removeItem('ataxy_return_exam');
                    sessionStorage.removeItem('ataxy_return_section');"""
    code = code.replace(bad_restore, good_restore)

    with open('c:/Users/risha/ATAXYbot/index.html', 'w', encoding='utf-8') as f:
        f.write(code)

    print("Successfully added SSC Sections!")

update_ui_for_sections()
