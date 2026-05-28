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
    const batch = row.batch?.trim() || 'Allen Module';
    const file = row.file?.trim() || 'Race';
    const subject = row.subject?.trim() || 'Unknown Subject';
    const chapter = row.chapter?.trim() || 'Unknown Chapter';
    const topic = row.topic?.trim() || 'Unknown Topic';

    if (!tree[batch]) tree[batch] = {};
    if (!tree[batch][file]) tree[batch][file] = {};
    if (!tree[batch][file][subject]) tree[batch][file][subject] = {};
    if (!tree[batch][file][subject][chapter]) tree[batch][file][subject][chapter] = new Set();

    tree[batch][file][subject][chapter].add(topic);
  });

  return Object.keys(tree).sort().map((batch) => ({
    batch,
    files: Object.keys(tree[batch]).sort().map((file) => ({
      file,
      subjects: Object.keys(tree[batch][file]).sort().map((subject) => ({
        subject,
        chapters: Object.keys(tree[batch][file][subject]).sort().map((chapter) => ({
          chapter,
          topics: Array.from(tree[batch][file][subject][chapter]).sort()
        }))
      }))
    }))
  }));
};

const setupAccordionToggle = (button, content) => {
  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    content.classList.toggle('open', !expanded);

    if (!expanded) {
      content.style.maxHeight = content.scrollHeight + 'px';
      setTimeout(() => {
        if (content.classList.contains('open')) {
          content.style.maxHeight = 'none';
        }
      }, 350);
    } else {
      content.style.maxHeight = content.scrollHeight + 'px';
      // Force reflow
      void content.offsetHeight;
      content.style.maxHeight = '0';
    }
  });
};

const renderAccordion = (batches) => {
  accordionContainer.innerHTML = '';

  if (!batches.length) {
    accordionContainer.innerHTML =
      '<div class="accordion-no-data">No topics available yet.</div>';
    return;
  }

  batches.forEach((batchItem) => {
    const batchCard = document.createElement('div');
    batchCard.className = 'accordion-item';

    const batchButton = document.createElement('button');
    batchButton.className = 'accordion-button';
    batchButton.type = 'button';
    batchButton.setAttribute('aria-expanded', 'false');
    batchButton.innerHTML = `
      <span class="label">
        <span>${escapeHtml(batchItem.batch)}</span>
      </span>
      <span class="count">${batchItem.files.length}</span>
      <span class="icon">▾</span>
    `;

    const batchContent = document.createElement('div');
    batchContent.className = 'accordion-content';

    const batchContentInner = document.createElement('div');
    batchContentInner.className = 'accordion-content-inner';

    batchItem.files.forEach((fileItem) => {
      const fileCard = document.createElement('div');
      fileCard.className = 'accordion-subitem';

      const fileButton = document.createElement('button');
      fileButton.className = 'accordion-subheader';
      fileButton.type = 'button';
      fileButton.setAttribute('aria-expanded', 'false');
      fileButton.innerHTML = `
        <span>${escapeHtml(fileItem.file)}</span>
        <span class="count">${fileItem.subjects.length}</span>
        <span class="icon">▾</span>
      `;

      const fileContent = document.createElement('div');
      fileContent.className = 'accordion-subcontent';

      const fileContentInner = document.createElement('div');
      fileContentInner.className = 'accordion-subcontent-inner';

      fileItem.subjects.forEach((subjectItem) => {
        const subjectCard = document.createElement('div');
        subjectCard.className = 'accordion-subitem';
        subjectCard.style.border = 'none';
        subjectCard.style.background = '#f9fafb';

        const subjectButton = document.createElement('button');
        subjectButton.className = 'accordion-subheader';
        subjectButton.style.background = '#f1f5f9';
        subjectButton.type = 'button';
        subjectButton.setAttribute('aria-expanded', 'false');
        subjectButton.innerHTML = `
          <span>${escapeHtml(subjectItem.subject)}</span>
          <span class="count">${subjectItem.chapters.length}</span>
          <span class="icon">▾</span>
        `;

        const subjectContent = document.createElement('div');
        subjectContent.className = 'accordion-subcontent';

        const subjectContentInner = document.createElement('div');
        subjectContentInner.className = 'accordion-subcontent-inner';

        subjectItem.chapters.forEach((chapterItem) => {
          const chapterCard = document.createElement('div');
          chapterCard.className = 'accordion-subitem';
          chapterCard.style.border = 'none';

          const chapterButton = document.createElement('button');
          chapterButton.className = 'accordion-subheader';
          chapterButton.style.background = 'transparent';
          chapterButton.style.paddingLeft = '24px';
          chapterButton.type = 'button';
          chapterButton.setAttribute('aria-expanded', 'false');
          chapterButton.innerHTML = `
            <span>${escapeHtml(chapterItem.chapter)}</span>
            <span class="count">${chapterItem.topics.length}</span>
            <span class="icon">▾</span>
          `;

          const chapterContent = document.createElement('div');
          chapterContent.className = 'accordion-subcontent';

          const chapterContentInner = document.createElement('div');
          chapterContentInner.className = 'accordion-subcontent-inner';
          chapterContentInner.style.paddingLeft = '24px';

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
                batch: batchItem.batch,
                file: fileItem.file,
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

          setupAccordionToggle(chapterButton, chapterContent);
          chapterContent.appendChild(chapterContentInner);
          chapterCard.appendChild(chapterButton);
          chapterCard.appendChild(chapterContent);
          subjectContentInner.appendChild(chapterCard);
        });

        setupAccordionToggle(subjectButton, subjectContent);
        subjectContent.appendChild(subjectContentInner);
        subjectCard.appendChild(subjectButton);
        subjectCard.appendChild(subjectContent);
        fileContentInner.appendChild(subjectCard);
      });

      setupAccordionToggle(fileButton, fileContent);
      fileContent.appendChild(fileContentInner);
      fileCard.appendChild(fileButton);
      fileCard.appendChild(fileContent);
      batchContentInner.appendChild(fileCard);
    });

    setupAccordionToggle(batchButton, batchContent);
    batchContent.appendChild(batchContentInner);
    batchCard.appendChild(batchButton);
    batchCard.appendChild(batchContent);
    accordionContainer.appendChild(batchCard);
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
