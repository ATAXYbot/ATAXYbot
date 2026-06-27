import re

def update_sathee():
    with open('c:/Users/risha/ATAXYbot/index.html', 'r', encoding='utf-8') as f:
        code = f.read()

    # 1. Update SATHEE_DATA
    # Find where SATHEE_DATA starts and ends
    start_data = code.find('const SATHEE_DATA = {')
    if start_data != -1:
        end_data = code.find('};', start_data) + 2
        
        new_data = """const SATHEE_DATA = {
    exams: [
        { id: 'exam_jee', name: 'JEE', icon: 'fa-laptop-code' },
        { id: 'exam_neet', name: 'NEET', icon: 'fa-user-doctor' },
        { id: 'exam_ssc', name: 'SSC', icon: 'fa-building-columns' },
        { id: 'exam_cuet', name: 'CUET', icon: 'fa-graduation-cap' },
        { id: 'exam_clat', name: 'CLAT', icon: 'fa-scale-balanced' },
        { id: 'exam_icar', name: 'ICAR', icon: 'fa-seedling' },
        { id: 'exam_rrb', name: 'RRB', icon: 'fa-train' },
        { id: 'exam_nda', name: 'NDA', icon: 'fa-shield-halved' }
    ],
    batches: {
        'exam_jee': [
            { id: 'b_jee_vishwas', name: 'Vishwas JEE 2024', medium: 'English Medium', icon: 'fa-rocket', color: 'blue' },
            { id: 'b_jee_prayas', name: 'Prayas JEE (Hindi)', medium: 'Hindi Medium', icon: 'fa-fire', color: 'orange' }
        ],
        'exam_neet': [
            { id: 'b_neet_sankalp', name: 'Sankalp NEET', medium: 'English Medium', icon: 'fa-heart-pulse', color: 'red' },
            { id: 'b_neet_lakshya', name: 'Lakshya NEET (Hindi)', medium: 'Hindi Medium', icon: 'fa-star-of-life', color: 'pink' }
        ],
        'exam_ssc': [
            { id: 'b_ssc_cgl', name: 'SSC CGL Target Batch', medium: 'Hindi Medium', icon: 'fa-bullseye', color: 'green' },
            { id: 'b_ssc_chsl', name: 'SSC CHSL Foundation', medium: 'English Medium', icon: 'fa-layer-group', color: 'indigo' },
            { id: 'b_ssc_mts', name: 'SSC MTS Achiever', medium: 'Bilingual', icon: 'fa-briefcase', color: 'teal' }
        ],
        'exam_cuet': [
            { id: 'b_cuet_sci', name: 'CUET UG Science', medium: 'English Medium', icon: 'fa-atom', color: 'purple' },
            { id: 'b_cuet_arts', name: 'CUET UG Arts', medium: 'Hindi Medium', icon: 'fa-palette', color: 'pink' }
        ],
        'default': [
            { id: 'b_def_1', name: 'Foundation Batch', medium: 'English Medium', icon: 'fa-book', color: 'blue' },
            { id: 'b_def_2', name: 'Target Batch', medium: 'Hindi Medium', icon: 'fa-target', color: 'red' }
        ]
    },
    subjects: {
        'b_ssc_cgl': [
            { id: 'sub_maths', name: 'Quantitative Aptitude', icon: 'fa-calculator' },
            { id: 'sub_reasoning', name: 'General Intelligence', icon: 'fa-brain' },
            { id: 'sub_english', name: 'English Language', icon: 'fa-spell-check' },
            { id: 'sub_ga', name: 'General Awareness', icon: 'fa-globe' }
        ],
        'b_jee_vishwas': [
            { id: 'sub_phy', name: 'Physics', icon: 'fa-atom' },
            { id: 'sub_chem', name: 'Chemistry', icon: 'fa-flask' },
            { id: 'sub_math_jee', name: 'Mathematics', icon: 'fa-square-root-variable' }
        ],
        'default': [
            { id: 'sub_def_1', name: 'Paper 1: Core', icon: 'fa-book' },
            { id: 'sub_def_2', name: 'Paper 2: Aptitude', icon: 'fa-brain' }
        ]
    },
    chapters: {
        'sub_maths': [
            { id: 'chap_num', name: 'Number System' },
            { id: 'chap_pct', name: 'Percentages' },
            { id: 'chap_alg', name: 'Algebra' },
            { id: 'chap_geo', name: 'Geometry' },
            { id: 'chap_trig', name: 'Trigonometry' }
        ],
        'sub_phy': [
            { id: 'chap_kin', name: 'Kinematics' },
            { id: 'chap_nl', name: 'Newton Laws of Motion' },
            { id: 'chap_we', name: 'Work & Energy' }
        ],
        'default': [
            { id: 'chap_d_1', name: 'Chapter 1: Basics' },
            { id: 'chap_d_2', name: 'Chapter 2: Intermediate Concepts' },
            { id: 'chap_d_3', name: 'Chapter 3: Advanced Applications' }
        ]
    },
    content: {
        'chap_num': [
            { id: 'lec_1', type: 'video', name: 'Lec 01: Number System Fundamentals', url: 'https://sathee.iitk.ac.in/' },
            { id: 'lec_2', type: 'video', name: 'Lec 02: Divisibility Rules & Remainders', url: 'https://sathee.iitk.ac.in/' },
            { id: 'lec_3', type: 'video', name: 'Lec 03: Unit Digit Concept', url: 'https://sathee.iitk.ac.in/' },
            { id: 'dpp_1', type: 'dpp', name: 'DPP 01: Basics of Numbers', url: 'https://sathee.iitk.ac.in/' },
            { id: 'dpp_2', type: 'dpp', name: 'DPP 02: Divisibility Questions', url: 'https://sathee.iitk.ac.in/' }
        ],
        'default': [
            { id: 'lec_def1', type: 'video', name: 'Lecture 1: Full Explanation', url: 'https://sathee.iitk.ac.in/' },
            { id: 'lec_def2', type: 'video', name: 'Lecture 2: Problem Solving', url: 'https://sathee.iitk.ac.in/' },
            { id: 'dpp_def1', type: 'dpp', name: 'DPP 1: Practice Questions', url: 'https://sathee.iitk.ac.in/' }
        ]
    }
};"""
        code = code[:start_data] + new_data + code[end_data:]

    # 2. Add SatheeTab state
    # Find setActiveSatheeContent
    start_state = code.find('const [activeSatheeContent, setActiveSatheeContent] = useState(null);')
    if start_state != -1:
        state_insert = "const [activeSatheeTab, setActiveSatheeTab] = useState('videos');"
        if "const [activeSatheeTab" not in code:
            code = code[:start_state] + state_insert + '\n            ' + code[start_state:]

    # 3. Update activeSatheeExam map to use SATHEE_DATA.batches
    code = code.replace(
        "activeSatheeExam.batches.map",
        "(SATHEE_DATA.batches[activeSatheeExam.id] || SATHEE_DATA.batches['default']).map"
    )

    # 4. Redesign Chapter view (2 buttons, no iframe)
    chapter_render_start = code.find('{activeSatheeChapter && (() => {')
    if chapter_render_start != -1:
        chapter_render_end = code.find('})()}', chapter_render_start) + 5
        
        new_chapter_render = """{activeSatheeChapter && (() => {
                                        const contents = SATHEE_DATA.content[activeSatheeChapter.id] || SATHEE_DATA.content['default'];
                                        const videos = contents.filter(c => c.type === 'video');
                                        const dpps = contents.filter(c => c.type === 'dpp');
                                        
                                        return (
                                            <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500 w-full max-w-4xl mx-auto">
                                                
                                                {/* 2 Portal Buttons */}
                                                <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 shadow-inner">
                                                    <button 
                                                        onClick={() => setActiveSatheeTab('videos')} 
                                                        className={`flex-1 py-3 rounded-xl font-black text-sm transition-all duration-300 flex items-center justify-center gap-2 ${activeSatheeTab === 'videos' ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                                    >
                                                        <i className="fa-solid fa-play-circle"></i> Videos
                                                    </button>
                                                    <button 
                                                        onClick={() => setActiveSatheeTab('questions')} 
                                                        className={`flex-1 py-3 rounded-xl font-black text-sm transition-all duration-300 flex items-center justify-center gap-2 ${activeSatheeTab === 'questions' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                                    >
                                                        <i className="fa-solid fa-file-pdf"></i> Questions (DPP)
                                                    </button>
                                                </div>

                                                <div className="mt-6">
                                                    {activeSatheeTab === 'videos' && (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
                                                            {videos.map(vid => (
                                                                <div key={vid.id} onClick={() => window.open(vid.url, '_blank')} className="bg-white/5 border border-white/10 p-4 rounded-3xl flex flex-col gap-4 cursor-pointer hover:-translate-y-1 hover:bg-white/10 hover:border-red-500/50 hover:shadow-[0_10px_30px_rgba(239,68,68,0.2)] transition-all group">
                                                                    <div className="w-full h-32 bg-gray-900 rounded-2xl relative overflow-hidden group-hover:ring-2 ring-red-500 transition-all">
                                                                        <img src="https://sathee.iitk.ac.in/images/home/home-banner/en/jee-toppers.png" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-colors">
                                                                            <div className="w-12 h-12 bg-red-500/80 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                                                                                <i className="fa-solid fa-play text-white ml-1"></i>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="font-bold text-gray-100 group-hover:text-white line-clamp-2">{vid.name}</h4>
                                                                        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1"><i className="fa-solid fa-arrow-up-right-from-square"></i> Opens in SATHEE</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {activeSatheeTab === 'questions' && (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
                                                            {dpps.map(dpp => (
                                                                <div key={dpp.id} onClick={() => window.open(dpp.url, '_blank')} className="bg-white/5 border border-white/10 p-5 rounded-3xl flex items-center gap-5 cursor-pointer hover:-translate-y-1 hover:bg-white/10 hover:border-blue-500/50 hover:shadow-[0_10px_30px_rgba(59,130,246,0.2)] transition-all group">
                                                                    <div className="w-16 h-16 bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 border border-blue-500/30 shadow-inner">
                                                                        <i className="fa-solid fa-file-lines text-2xl"></i>
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <h4 className="font-bold text-gray-100 group-hover:text-white">{dpp.name}</h4>
                                                                        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1"><i className="fa-solid fa-arrow-up-right-from-square"></i> Practice on SATHEE</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })()}"""
        
        code = code[:chapter_render_start] + new_chapter_render + code[chapter_render_end:]

    with open('c:/Users/risha/ATAXYbot/index.html', 'w', encoding='utf-8') as f:
        f.write(code)
    
    print("UI and Data Updated")

update_sathee()
