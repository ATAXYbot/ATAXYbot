const accordionContainer = document.getElementById('practiceAccordion');
const statusMessage = document.getElementById('statusMessage');

// Detect if running locally or on GitHub Pages
const getApiBaseUrl = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  // For GitHub Pages, we'd need to update this to point to your actual backend URL
  return 'http://localhost:5000'; // Update this with your production backend URL
};

const buildNestedStructure = (rows) => {
  const tree = {};

  rows.forEach((row) => {
    const subject = row.subject?.trim() || 'Unknown Subject';
    const chapter = row.chapter?.trim() || 'Unknown Chapter';
    const topic = row.topic?.trim() || 'Unknown Topic';

    if (!tree[subject]) {
      tree[subject] = {};
    }

    if (!tree[subject][chapter]) {
      tree[subject][chapter] = new Set();
    }

    tree[subject][chapter].add(topic);
  });

  return Object.keys(tree)
    .sort()
    .map((subject) => ({
      subject,
      chapters: Object.keys(tree[subject])
        .sort()
        .map((chapter) => ({
          chapter,
          topics: Array.from(tree[subject][chapter]).sort(),
        })),
    }));
};

const renderAccordion = (subjects) => {
  accordionContainer.innerHTML = '';

  if (!subjects.length) {
    accordionContainer.innerHTML =
      '<div class="accordion-no-data">No topics available yet.</div>';
    return;
  }

  subjects.forEach((subjectItem) => {
    const subjectCard = document.createElement('div');
    subjectCard.className = 'accordion-item';

    const subjectButton = document.createElement('button');
    subjectButton.className = 'accordion-button';
    subjectButton.type = 'button';
    subjectButton.setAttribute('aria-expanded', 'false');

    subjectButton.innerHTML = `
      <span class="label">
        <span>${escapeHtml(subjectItem.subject)}</span>
      </span>
      <span class="count">${subjectItem.chapters.length}</span>
      <span class="icon">▾</span>
    `;

    const subjectContent = document.createElement('div');
    subjectContent.className = 'accordion-content';

    const subjectContentInner = document.createElement('div');
    subjectContentInner.className = 'accordion-content-inner';

    subjectItem.chapters.forEach((chapterItem) => {
      const chapterCard = document.createElement('div');
      chapterCard.className = 'accordion-subitem';

      const chapterHeader = document.createElement('button');
      chapterHeader.className = 'accordion-subheader';
      chapterHeader.type = 'button';
      chapterHeader.setAttribute('aria-expanded', 'false');
      chapterHeader.innerHTML = `
        <span>${escapeHtml(chapterItem.chapter)}</span>
        <span class="count">${chapterItem.topics.length}</span>
        <span class="icon">▾</span>
      `;

      const chapterContent = document.createElement('div');
      chapterContent.className = 'accordion-subcontent';

      const chapterContentInner = document.createElement('div');
      chapterContentInner.className = 'accordion-subcontent-inner';

      chapterItem.topics.forEach((topicName) => {
        const topicRow = document.createElement('div');
        topicRow.className = 'topic-card';

        const topicLabel = document.createElement('div');
        topicLabel.className = 'topic-name';
        topicLabel.textContent = topicName;

        const practiceButton = document.createElement('button');
        practiceButton.className = 'practice-button';
        practiceButton.textContent = 'Practice Now';
        practiceButton.addEventListener('click', () => {
          const selection = {
            subject: subjectItem.subject,
            chapter: chapterItem.chapter,
            topic: topicName,
            timestamp: Date.now(),
          };
          localStorage.setItem('practiceSelection', JSON.stringify(selection));
          window.location.href = 'quiz.html';
        });

        topicRow.appendChild(topicLabel);
        topicRow.appendChild(practiceButton);
        chapterContentInner.appendChild(topicRow);
      });

      chapterContent.appendChild(chapterContentInner);
      chapterCard.appendChild(chapterHeader);
      chapterCard.appendChild(chapterContent);
      subjectContentInner.appendChild(chapterCard);

      chapterHeader.addEventListener('click', () => {
        const expanded = chapterHeader.getAttribute('aria-expanded') === 'true';
        chapterHeader.setAttribute('aria-expanded', String(!expanded));
        chapterContent.classList.toggle('open', !expanded);

        if (!expanded) {
          chapterContent.style.maxHeight = chapterContent.scrollHeight + 'px';
        } else {
          chapterContent.style.maxHeight = '0';
        }
      });
    });

    subjectContent.appendChild(subjectContentInner);
    subjectCard.appendChild(subjectButton);
    subjectCard.appendChild(subjectContent);
    accordionContainer.appendChild(subjectCard);

    subjectButton.addEventListener('click', () => {
      const expanded = subjectButton.getAttribute('aria-expanded') === 'true';
      subjectButton.setAttribute('aria-expanded', String(!expanded));
      subjectContent.classList.toggle('open', !expanded);

      if (!expanded) {
        subjectContent.style.maxHeight = subjectContent.scrollHeight + 'px';
      } else {
        subjectContent.style.maxHeight = '0';
      }
    });
  });
};

const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

const loadPracticeTopics = async () => {
  statusMessage.textContent = 'Loading topics…';
  try {
    const apiBase = getApiBaseUrl();
    const response = await fetch(`${apiBase}/api/neet/practice-topics`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    const data = result.data || result;

    if (!data || data.length === 0) {
      statusMessage.textContent = 'No practice topics found.';
      return;
    }

    const nested = buildNestedStructure(data);
    renderAccordion(nested);
    statusMessage.textContent = '';
  } catch (error) {
    console.error('Error loading practice topics:', error);
    statusMessage.textContent = 'Error: ' + error.message + '. Make sure backend is running on port 5000.';
  }
};

document.addEventListener('DOMContentLoaded', () => {
  loadPracticeTopics();
});
