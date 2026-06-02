// PART 1: BRANDING & CREDENTIALS CONFIGURATION
const SUPABASE_URL = "https://kwzpnupjtvfrevpwfaao.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_BQ3FzD6jag0nHhYmUu0Bcw_Qq1CEeal";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// PART 2: ENVIRONMENT SECURITY & SYSTEM WRAPPERS
document.addEventListener("DOMContentLoaded", () => {
    const isLocalhost = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' || window.location.protocol === 'file:';
    const tg = window.Telegram?.WebApp;
    
    // Check telegram context
    if (!isLocalhost && (!tg || !tg.initData)) {
        document.body.innerHTML = `
            <div style="display:flex; height:100vh; width:100vw; background:#111827; color:white; align-items:center; justify-content:center; flex-direction:column; font-family:sans-serif; text-align:center; padding: 20px; box-sizing: border-box;">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 20px; color: #ef4444;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">Access Restricted</h1>
                <p style="color: #9ca3af; font-size: 14px; max-width: 300px;">This application is designed to be accessed exclusively through the ATAXY Telegram Mini App.</p>
            </div>
        `;
        return;
    }

    if (tg && tg.initData) {
        tg.ready();
        tg.expand();
    }
    
    initApp();
});

// Global MathJax Renderer
window.renderMath = async function() {
    if (window.MathJax) {
        try {
            await window.MathJax.typesetPromise();
        } catch (err) {
            console.error('MathJax error:', err);
        }
    }
};

function initApp() {
    setupNavigation();
    setupHomeTab();
    setupPracticeTab();
    setupMentorTab();
    setupProfileTab();
}

// TAB NAVIGATION
function setupNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    const views = document.querySelectorAll('.view');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            views.forEach(v => {
                v.classList.remove('active');
                v.classList.add('hidden');
            });
            
            tab.classList.add('active');
            const target = tab.getAttribute('data-target');
            const view = document.getElementById(`view-${target}`);
            if (view) {
                view.classList.remove('hidden');
                view.classList.add('active');
            }
        });
    });
}

// PART 3: TAB 1 - HOME VIEW (DAILY TARGETS)
function setupHomeTab() {
    const dateInput = document.getElementById('target-date');
    const textInput = document.getElementById('target-text');
    const btn = document.getElementById('set-target-btn');
    const list = document.getElementById('target-list');
    
    dateInput.valueAsDate = new Date();
    
    const renderTargets = () => {
        const date = dateInput.value;
        if (!date) return;
        const targets = JSON.parse(localStorage.getItem(`ataxy_targets_${date}`) || '[]');
        list.innerHTML = '';
        targets.forEach((t, i) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <input type="checkbox" ${t.done ? 'checked' : ''} onchange="toggleTarget('${date}', ${i})">
                <span style="${t.done ? 'text-decoration: line-through; color: #999;' : ''}">${t.text}</span>
            `;
            list.appendChild(li);
        });
    };
    
    window.toggleTarget = (date, index) => {
        const targets = JSON.parse(localStorage.getItem(`ataxy_targets_${date}`) || '[]');
        targets[index].done = !targets[index].done;
        localStorage.setItem(`ataxy_targets_${date}`, JSON.stringify(targets));
        renderTargets();
    };

    btn.addEventListener('click', () => {
        const date = dateInput.value;
        const text = textInput.value.trim();
        if (!date || !text) return;
        
        const targets = JSON.parse(localStorage.getItem(`ataxy_targets_${date}`) || '[]');
        targets.push({ text, done: false });
        localStorage.setItem(`ataxy_targets_${date}`, JSON.stringify(targets));
        
        textInput.value = '';
        renderTargets();
    });
    
    dateInput.addEventListener('change', renderTargets);
    renderTargets();

    document.querySelectorAll('.course-card').forEach(card => {
        card.addEventListener('click', () => {
            const course = card.getAttribute('data-course');
            // Navigate to practice
            document.querySelector('.nav-tab[data-target="practice"]').click();
            
            // Trigger filter change
            const courseSelect = document.getElementById('filter-course');
            if (courseSelect) {
                courseSelect.value = course;
                courseSelect.dispatchEvent(new Event('change'));
            }
        });
    });
}

// PART 4: TAB 2 - PRACTICE VIEW
let practiceData = [];
let filteredData = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 10;
let activeMasterRevision = null; // null | 'bookmarks' | 'incorrect' | 'notes'
let currentAIQuestionId = null;

async function setupPracticeTab() {
    // Fetch NEET question dataset for Redox Reaction from Supabase
    try {
        const { data: questions, error } = await supabase
            .from('questions')
            .select(`
                id,
                question_text,
                options,
                correct_answer,
                explanation,
                topics ( name ),
                chapters!inner ( name, subject )
            `)
            .eq('chapters.name', 'Redox Reaction');
            
        if (error) {
            console.error('Error fetching questions:', error);
            practiceData = [];
        } else if (questions && questions.length > 0) {
            practiceData = questions.map((q, i) => {
                let opts = q.options;
                // Ensure options is an array
                if (typeof opts === 'string') {
                    try { opts = JSON.parse(opts); } catch(e) { opts = []; }
                }
                
                return {
                    id: q.id.toString(),
                    course: "Allen Module Course",
                    module: "Race Module",
                    chapter: "Redox Reaction",
                    topic: q.topics ? q.topics.name : "ALLEN RACE",
                    text: `Question ${i + 1}: ${q.question_text}`,
                    options: Array.isArray(opts) ? opts : [],
                    correctOption: q.correct_answer, // 1-based index based on SQL
                    explanation: q.explanation || "No explanation provided."
                };
            });
        } else {
            console.warn('No questions found for Redox Reaction in Supabase.');
            practiceData = [];
        }
    } catch(err) {
        console.error('Network or parsing error fetching questions:', err);
        practiceData = [];
    }

    // Initialize core storage arrays
    ['neet_bookmarks', 'neet_incorrect', 'neet_notes'].forEach(key => {
        if (!localStorage.getItem(key)) {
            localStorage.setItem(key, JSON.stringify(key === 'neet_notes' ? {} : []));
        }
    });

    const switches = document.querySelectorAll('.revision-switches .switch');
    switches.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('active')) {
                btn.classList.remove('active');
                activeMasterRevision = null;
            } else {
                switches.forEach(s => s.classList.remove('active'));
                btn.classList.add('active');
                activeMasterRevision = btn.getAttribute('data-type');
            }
            applyFilters();
        });
    });

    const filters = ['filter-course', 'filter-module', 'filter-chapter', 'filter-topic'];
    filters.forEach(f => {
        document.getElementById(f).addEventListener('change', () => {
            updateCascadingFilters();
            applyFilters();
        });
    });

    // Offset Pagination Control
    document.getElementById('page-first').addEventListener('click', () => { currentPage = 1; renderQuestions(); });
    document.getElementById('page-prev').addEventListener('click', () => { if(currentPage > 1) { currentPage--; renderQuestions(); } });
    document.getElementById('page-next').addEventListener('click', () => { if(currentPage * ITEMS_PER_PAGE < filteredData.length) { currentPage++; renderQuestions(); } });
    document.getElementById('page-last').addEventListener('click', () => { currentPage = Math.ceil(filteredData.length / ITEMS_PER_PAGE) || 1; renderQuestions(); });

    // Global Modal Overlay handling
    document.getElementById('modal-overlay').addEventListener('click', closeModals);
    
    // Auto-select Redox Reaction if not selected
    const chapterSelect = document.getElementById('filter-chapter');
    if (chapterSelect) {
        chapterSelect.value = "Redox Reaction";
    }
    
    applyFilters();
}

function updateCascadingFilters() {
    // Dynamic Cascading logic placeholder - for real production we'd filter available dropdown options based on the prior selections.
}

function applyFilters() {
    const course = document.getElementById('filter-course').value;
    const module = document.getElementById('filter-module').value;
    const chapter = document.getElementById('filter-chapter').value;
    const topic = document.getElementById('filter-topic').value;

    let baseData = practiceData;
    
    if (activeMasterRevision) {
        if (activeMasterRevision === 'bookmarks') {
            const bookmarks = JSON.parse(localStorage.getItem('neet_bookmarks') || '[]');
            baseData = baseData.filter(q => bookmarks.includes(q.id));
        } else if (activeMasterRevision === 'incorrect') {
            const incorrect = JSON.parse(localStorage.getItem('neet_incorrect') || '[]');
            baseData = baseData.filter(q => incorrect.includes(q.id));
        } else if (activeMasterRevision === 'notes') {
            const notes = JSON.parse(localStorage.getItem('neet_notes') || '{}');
            baseData = baseData.filter(q => notes[q.id] && notes[q.id].trim().length > 0);
        }
    }

    filteredData = baseData.filter(q => {
        return (!course || q.course === course) &&
               (!module || q.module === module) &&
               (!chapter || q.chapter === chapter) &&
               (!topic || q.topic === topic);
    });

    currentPage = 1;
    renderQuestions();
}

function renderQuestions() {
    const container = document.getElementById('question-container');
    container.innerHTML = '';
    
    document.getElementById('page-numbers').textContent = currentPage;

    if (filteredData.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#666; margin-top: 2rem;">No questions found.</p>';
        return;
    }

    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const pageData = filteredData.slice(start, end);

    const bookmarks = JSON.parse(localStorage.getItem('neet_bookmarks') || '[]');
    const notes = JSON.parse(localStorage.getItem('neet_notes') || '{}');

    pageData.forEach((q, index) => {
        const isBookmarked = bookmarks.includes(q.id);
        const savedNote = notes[q.id] || '';
        const notesDisplay = activeMasterRevision === 'notes' ? 'block' : 'none';

        const card = document.createElement('div');
        card.className = 'question-card';
        card.innerHTML = `
            <div class="q-header">
                <span class="q-num">Q. ${start + index + 1}</span>
                <i class="fa-solid fa-bookmark bookmark-icon ${isBookmarked ? 'active' : ''}" onclick="toggleBookmark('${q.id}', this)"></i>
            </div>
            <div class="q-text">${q.text}</div>
            
            <div class="options-grid">
                ${q.options.map((opt, i) => `<div class="option-item">${i + 1}. ${opt}</div>`).join('')}
            </div>
            
            <div class="notes-block" style="display: ${notesDisplay}">
                <label>Add Notes</label>
                <textarea rows="3" onchange="saveNote('${q.id}', this.value)">${savedNote}</textarea>
            </div>

            <div class="attempt-bar" id="attempt-bar-${q.id}">
                ${[1, 2, 3, 4].map(num => `
                    <div class="pad" id="pad-${q.id}-${num}" onclick="attemptQuestion('${q.id}', ${num}, ${q.correctOption})">${num}</div>
                `).join('')}
            </div>
            
            <div class="action-buttons hidden" id="actions-${q.id}">
                <button onclick="openGoogleSheet('${encodeURIComponent(q.topic)}')">Ask Google 🔍</button>
                <button onclick="openAISheet('${q.id}')">Ask ATAXY Mentor ✨</button>
            </div>
        `;
        container.appendChild(card);
    });

    window.renderMath();
}

window.toggleBookmark = function(id, iconEl) {
    let bookmarks = JSON.parse(localStorage.getItem('neet_bookmarks') || '[]');
    if (bookmarks.includes(id)) {
        bookmarks = bookmarks.filter(b => b !== id);
        iconEl.classList.remove('active');
    } else {
        bookmarks.push(id);
        iconEl.classList.add('active');
    }
    localStorage.setItem('neet_bookmarks', JSON.stringify(bookmarks));
};

window.saveNote = function(id, val) {
    let notes = JSON.parse(localStorage.getItem('neet_notes') || '{}');
    notes[id] = val;
    localStorage.setItem('neet_notes', JSON.stringify(notes));
};

window.attemptQuestion = function(qid, selected, correct) {
    [1, 2, 3, 4].forEach(n => {
        const pad = document.getElementById(`pad-${qid}-${n}`);
        if(pad) {
            pad.onclick = null;
            pad.style.pointerEvents = 'none';
        }
    });

    const selectedPad = document.getElementById(`pad-${qid}-${selected}`);
    const correctPad = document.getElementById(`pad-${qid}-${correct}`);

    if (selected === correct) {
        if(selectedPad) selectedPad.classList.add('correct');
    } else {
        if(selectedPad) selectedPad.classList.add('wrong');
        if(correctPad) correctPad.classList.add('correct');
        
        let incorrect = JSON.parse(localStorage.getItem('neet_incorrect') || '[]');
        if (!incorrect.includes(qid)) {
            incorrect.push(qid);
            localStorage.setItem('neet_incorrect', JSON.stringify(incorrect));
        }
    }

    const actions = document.getElementById(`actions-${qid}`);
    if(actions) actions.classList.remove('hidden');
};

window.openGoogleSheet = function(topic) {
    document.getElementById('modal-overlay').classList.add('active');
    const sheet = document.getElementById('modal-google');
    sheet.classList.add('active');
    document.getElementById('google-iframe').src = `https://www.google.com/search?igu=1&q=NCERT+${topic}`;
};

window.openAISheet = function(qid) {
    document.getElementById('modal-overlay').classList.add('active');
    const sheet = document.getElementById('modal-ai');
    sheet.classList.add('active');
    
    currentAIQuestionId = qid;
    const q = practiceData.find(x => x.id === qid);
    const chatHistory = document.getElementById('ai-chat-history');
    
    chatHistory.innerHTML = `
        <div style="margin-bottom:1rem;">
            <strong>ATAXY Mentor:</strong><br>
            Hello! Let's break down this problem...<br><br>
            ${q.explanation}
        </div>
    `;
    window.renderMath();
    
    const sendBtn = document.getElementById('ai-followup-send');
    const input = document.getElementById('ai-followup-input');
    
    sendBtn.onclick = async () => {
        const text = input.value.trim();
        if(!text) return;
        
        chatHistory.innerHTML += `<div style="margin-bottom:1rem; color: var(--primary-color);"><strong>You:</strong><br>${text}</div>`;
        input.value = '';
        chatHistory.scrollTop = chatHistory.scrollHeight;
        
        const systemPrompt = "You are ATAXY Mentor. The student is asking a follow-up doubt on a NEET question. Provide a direct, encouraging explanation with LaTeX formatting.";
        const responseText = await callGeminiAPI(text, systemPrompt);
        
        chatHistory.innerHTML += `<div style="margin-bottom:1rem; border-left: 2px solid var(--primary-color); padding-left: 10px;"><strong>ATAXY Mentor:</strong><br>${responseText}</div>`;
        window.renderMath();
        chatHistory.scrollTop = chatHistory.scrollHeight;
    };
};

window.closeModals = function() {
    document.getElementById('modal-overlay').classList.remove('active');
    document.getElementById('modal-google').classList.remove('active');
    document.getElementById('modal-ai').classList.remove('active');
    document.getElementById('google-iframe').src = "";
};

// PART 5: TAB 3 - MENTOR
let mentorChatHistory = [];

async function askAtaxyMentor(userMessage) {
    const url = `https://ataxy-ai-proxy.thevoicesession.workers.dev`;
    
    let combinedText = "You are ATAXY Mentor, a brilliant, encouraging NEET exam tutor. Explain this clearly, using single $ signs for any math/science formulas.\n\n";
    mentorChatHistory.forEach(msg => {
        combinedText += `${msg.role === 'user' ? 'Student' : 'ATAXY Mentor'}: ${msg.text}\n\n`;
    });
    combinedText += `Student: ${userMessage}\nATAXY Mentor: `;

    try {
        let response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                model: "gemini-3.1-flash-lite",
                contents: [{ role: 'user', parts: [{ text: combinedText }] }]
            })
        });

        const rawText = await response.text();
        let data;
        try {
            data = JSON.parse(rawText);
        } catch (e) {
            return `Proxy Error: The server returned an invalid response. Make sure your Cloudflare worker is deployed and online.`;
        }

        if (!response.ok) {
            return `Google API Error: ${data.error?.message || response.statusText}`;
        }
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
    } catch (error) {
        return `Connection error: ${error.message}`;
    }
}

function setupMentorTab() {
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const chatLog = document.getElementById('chat-log');

    if (!chatInput || !sendBtn || !chatLog) return;

    sendBtn.addEventListener('click', async () => {
        const userMessage = chatInput.value.trim();
        if (!userMessage) return;

        const userDiv = document.createElement('div');
        userDiv.className = 'chat-message user';
        userDiv.innerHTML = `<strong>You:</strong> ${userMessage}`;
        chatLog.appendChild(userDiv);
        
        chatInput.value = '';
        chatLog.scrollTop = chatLog.scrollHeight;

        const typingId = 'typing-' + Date.now();
        const aiDiv = document.createElement('div');
        aiDiv.className = 'chat-message ai';
        aiDiv.id = typingId;
        aiDiv.innerHTML = `<strong>ATAXY Mentor:</strong> ATAXY Mentor is typing...`;
        chatLog.appendChild(aiDiv);
        chatLog.scrollTop = chatLog.scrollHeight;

        const aiResponse = await askAtaxyMentor(userMessage);
        
        mentorChatHistory.push({ role: 'user', text: userMessage });
        mentorChatHistory.push({ role: 'ai', text: aiResponse });

        const typingElement = document.getElementById(typingId);
        if (typingElement) {
            typingElement.innerHTML = `<strong>ATAXY Mentor:</strong> ${aiResponse}`;
        }
        
        if (typeof window.renderMath === 'function') {
            window.renderMath();
        }
        chatLog.scrollTop = chatLog.scrollHeight;
    });
}

async function callGeminiAPI(prompt, systemInstruction) {
    const url = `https://ataxy-ai-proxy.thevoicesession.workers.dev`;
    const combinedText = `${systemInstruction}\n\nStudent: ${prompt}`;
    const body = {
        model: "gemini-3.1-flash-lite",
        contents: [{ role: "user", parts: [{ text: combinedText }] }]
    };

    try {
        let res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        
        const rawText = await res.text();
        let data;
        try {
            data = JSON.parse(rawText);
        } catch (e) {
            return "Proxy Error: The server returned an invalid response.";
        }
        
        if (!res.ok) {
            return `API Error: ${data.error?.message || res.statusText}`;
        }
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
    } catch(err) {
        return "Network error occurred.";
    }
}

// PART 6: TAB 4 - PROFILE VIEW
function setupProfileTab() {
    const step1 = document.getElementById('auth-step-1');
    const step2 = document.getElementById('auth-step-2');
    const userSection = document.getElementById('user-section');
    const authSection = document.getElementById('auth-section');
    const sendBtn = document.getElementById('auth-send-otp');
    const verifyBtn = document.getElementById('auth-verify-otp');
    const logoutBtn = document.getElementById('auth-logout');
    
    const emailPhone = document.getElementById('auth-email-phone');
    const otpInput = document.getElementById('auth-otp');
    const userDetails = document.getElementById('user-details-text');

    // Check existing session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) showUser(session.user);
    });

    supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
            showUser(session.user);
        } else {
            showAuth();
        }
    });

    let currentEmail = '';

    sendBtn.addEventListener('click', async () => {
        const val = emailPhone.value.trim();
        if(!val) return;
        currentEmail = val;
        
        const { error } = await supabase.auth.signInWithOtp({ email: val });
        if (error) {
            alert(error.message);
        } else {
            step1.classList.add('hidden');
            step2.classList.remove('hidden');
        }
    });

    verifyBtn.addEventListener('click', async () => {
        const token = otpInput.value.trim();
        if(!token) return;
        
        const { error } = await supabase.auth.verifyOtp({ email: currentEmail, token, type: 'email' });
        if (error) alert(error.message);
    });

    logoutBtn.addEventListener('click', async () => {
        await supabase.auth.signOut();
    });

    function showUser(user) {
        authSection.classList.add('hidden');
        userSection.classList.remove('hidden');
        userDetails.textContent = `Logged in as: ${user.email || user.phone}`;
        step1.classList.remove('hidden');
        step2.classList.add('hidden');
        emailPhone.value = '';
        otpInput.value = '';
    }

    function showAuth() {
        userSection.classList.add('hidden');
        authSection.classList.remove('hidden');
    }
}