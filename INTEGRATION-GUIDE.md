# Integration Example - How to Add NEET Components to Your App

## **Option 1: Using React Components (Recommended)**

If your existing `index.html` uses React (which it does based on the code), add the NEET components directly:

### Step 1: Create Main NEET App Component

**File: `frontend/pages/NEETApp.jsx`**

```jsx
import React, { useState, useEffect } from 'react';
import { NEETChapters, NEETQuestionViewer, NEETStats } from '../components/NEETComponents';
import { preventContentCopy, getTelegramUser, neetApi } from '../utils/supabaseClient';

export const NEETApp = () => {
  const [currentView, setCurrentView] = useState('chapters');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Initialize
    preventContentCopy();
    const telegramUser = getTelegramUser();
    if (telegramUser) {
      setUser(telegramUser);
      // Register user in database
      neetApi.registerUser(telegramUser);
    }
  }, []);

  const handleSelectTopic = (topicId, topicName, chapterName) => {
    setSelectedTopic({ id: topicId, name: topicName, chapter: chapterName });
    setCurrentView('questions');
  };

  const handleBack = () => {
    setCurrentView('chapters');
    setSelectedTopic(null);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
        <h1 className="text-2xl font-bold">📚 NEET Prep</h1>
        <p className="text-sm opacity-90">Master every topic</p>
      </div>

      {/* Stats Bar */}
      {currentView === 'chapters' && <NEETStats />}

      {/* Main Content */}
      <div className="pb-20">
        {currentView === 'chapters' ? (
          <NEETChapters onSelectTopic={handleSelectTopic} />
        ) : (
          <NEETQuestionViewer
            topicId={selectedTopic.id}
            topicName={selectedTopic.name}
            chapterName={selectedTopic.chapter}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  );
};
```

### Step 2: Add to Your Main App

In your existing `index.html` React component:

```jsx
import { NEETApp } from './frontend/pages/NEETApp';

function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div>
      {/* Your existing navigation */}
      <nav>
        <button onClick={() => setActiveTab('home')}>Home</button>
        <button onClick={() => setActiveTab('neet')}>NEET Prep</button>
      </nav>

      {/* Content */}
      {activeTab === 'home' && <YourExistingApp />}
      {activeTab === 'neet' && <NEETApp />}
    </div>
  );
}
```

---

## **Option 2: Minimal Integration (Just Questions)**

If you only want to add questions without full components:

```jsx
import { useState, useEffect } from 'react';
import { neetApi } from './frontend/utils/supabaseClient';

function QuestionPractice() {
  const [chapters, setChapters] = useState([]);

  useEffect(() => {
    neetApi.getChapters().then(setChapters);
  }, []);

  const handleTopicClick = async (topicId) => {
    const data = await neetApi.getQuestions(topicId);
    console.log(data.questions);
    // Display questions
  };

  return (
    <div>
      <h2>Practice Questions</h2>
      {chapters.map(ch => (
        <div key={ch.id}>
          <h3>{ch.name}</h3>
          <button onClick={() => handleTopicClick(ch.id)}>
            View Questions
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## **Option 3: Direct HTML Integration**

If not using React, use vanilla JavaScript:

```html
<div id="neet-app"></div>

<script type="module">
  import { neetApi, preventContentCopy, getTelegramUser } from './frontend/utils/supabaseClient.js';

  // Initialize
  preventContentCopy();
  const user = getTelegramUser();
  if (user) {
    neetApi.registerUser(user);
  }

  // Load chapters
  const chapters = await neetApi.getChapters();
  
  // Render chapters
  const html = chapters.map(ch => `
    <div class="chapter">
      <h3>${ch.name}</h3>
      <p>${ch.description}</p>
    </div>
  `).join('');
  
  document.getElementById('neet-app').innerHTML = html;
</script>
```

---

## **Option 4: Tab Navigation (Like Your Existing App)**

Add a new section to your existing tab-based layout:

```jsx
// In your existing React app
import { NEETApp } from './frontend/pages/NEETApp';

function MainApp() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex gap-2 p-4 border-b">
        <button 
          onClick={() => setActiveTab('home')}
          className={activeTab === 'home' ? 'font-bold text-blue-600' : ''}
        >
          🏠 Home
        </button>
        <button 
          onClick={() => setActiveTab('neet')}
          className={activeTab === 'neet' ? 'font-bold text-blue-600' : ''}
        >
          📚 NEET
        </button>
        <button 
          onClick={() => setActiveTab('practice')}
          className={activeTab === 'practice' ? 'font-bold text-blue-600' : ''}
        >
          ✏️ Practice
        </button>
      </div>

      {/* Content */}
      {activeTab === 'home' && <YourHomeScreen />}
      {activeTab === 'neet' && <NEETApp />}
      {activeTab === 'practice' && <PracticeMode />}
    </div>
  );
}
```

---

## **Using the Utils Directly**

Don't need the full components? Use the utilities:

```javascript
// Import the utilities
import { neetApi, getTelegramUserId, preventContentCopy } from './frontend/utils/supabaseClient';

// Get all chapters
const chapters = await neetApi.getChapters();

// Get topics for a chapter
const topics = await neetApi.getTopics(chapterId);

// Get questions (with pagination)
const { questions, total, limit, offset } = await neetApi.getQuestions(
  topicId, 
  10,  // limit
  0    // offset
);

// Submit answer and get result
const result = await neetApi.submitAnswer(questionId, userAnswerIndex);
if (result.isCorrect) {
  console.log('Correct!');
  console.log(result.explanation);
}

// Get user stats
const stats = await neetApi.getUserStats();
console.log(`Accuracy: ${stats.accuracy}%`);

// Protect content
preventContentCopy();
```

---

## **File Structure After Integration**

```
ATAXYbot/
├── index.html                    # Your main app
├── package.json
├── .env.local                    # Supabase credentials
├── frontend/
│   ├── components/
│   │   └── NEETComponents.jsx    # Question components
│   ├── pages/
│   │   └── NEETApp.jsx           # Main NEET app page
│   └── utils/
│       └── supabaseClient.js     # API utilities
├── backend/
│   ├── server.js                 # Updated with NEET routes
│   ├── package.json              # With Supabase dependency
│   ├── .env                      # Supabase credentials
│   └── routes/
│       └── neet-questions.js     # Question endpoints
├── NEET-SETUP-GUIDE.md
├── GITHUB-RENDER-DEPLOYMENT.md
└── SUPABASE-SETUP.md
```

---

## **Common Issues**

### "Cannot find module"
```bash
npm install @supabase/supabase-js
```

### Components not rendering
Check:
- Supabase keys are correct in `.env.local`
- Backend is running on port 3001
- No console errors

### API calls failing
```javascript
// Add debugging
import { neetApi } from './frontend/utils/supabaseClient';

// Test
neetApi.getChapters().then(
  data => console.log('Success:', data),
  error => console.error('Error:', error)
);
```

---

## **Next Steps**

1. Copy component files to your project
2. Update your main `index.html` to include NEETApp
3. Create `.env.local` with Supabase credentials
4. Run `npm install` for any missing packages
5. Start both backend and frontend
6. Test in the app!

Done! Your NEET prep feature is integrated! 🎉
