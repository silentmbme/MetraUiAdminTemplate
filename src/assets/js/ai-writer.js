(() => {
  const form = document.querySelector('#writer-form');
  if (!form) return;

  const topicField = document.querySelector('#writer-topic');
  const editor = document.querySelector('#writer-editor');
  const typeField = document.querySelector('#writer-type');
  const toneField = document.querySelector('#writer-tone');
  const lengthField = document.querySelector('#writer-length');
  const audienceField = document.querySelector('#writer-audience');
  const status = document.querySelector('#writer-status');
  const wordCount = document.querySelector('#draft-word-count');
  const assistantForm = document.querySelector('#writer-assistant-form');
  const assistantPrompt = document.querySelector('#writer-assistant-prompt');
  const assistantEmpty = document.querySelector('#writer-assistant-empty');
  const assistantResponse = document.querySelector('#writer-assistant-response');
  const assistantResponseTitle = document.querySelector('#writer-assistant-response-title');
  const assistantResponseText = document.querySelector('#writer-assistant-response-text');
  const selectedPassage = document.querySelector('#writer-selected-passage');
  let rememberedSelection = '';

  const getEditorText = () => editor.innerText.replace(/\u00a0/g, ' ').trim();
  const escapeHtml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const setEditorText = (text) => {
    editor.innerHTML = text.split(/\n\s*\n/).map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`).join('');
  };

  const updateCounts = () => {
    document.querySelector('#brief-count').textContent = topicField.value.length;
    const words = getEditorText().match(/\S+/g) || [];
    wordCount.textContent = words.length;
  };

  const makeDraft = () => {
    const topic = topicField.value.trim();
    if (!topic) {
      status.textContent = 'Add a brief first so the sample draft has a clear direction.';
      topicField.focus();
      return;
    }

    const type = typeField.value;
    const tone = toneField.value.toLowerCase();
    const audience = audienceField.value.trim();
    const audienceText = audience ? ` with ${audience} in mind` : '';
    const opening = tone === 'friendly'
      ? 'Here is a friendly starting point'
      : tone === 'confident'
        ? 'Here is a confident starting point'
        : tone === 'concise'
          ? 'Here is a concise starting point'
          : 'Here is a professional starting point';

    let paragraphs;
    if (type === 'Email') {
      paragraphs = [
        'Subject: A first look, just for you',
        `Hello,\n\n${opening}${audienceText}: ${topic}`,
        lengthField.value === 'Long'
          ? 'We would love for you to take a look, explore what is new, and let us know what you think. Keep an eye out for more details soon.'
          : 'We would love for you to take a look. More details are coming soon.',
        'Best,\nThe team',
      ];
    } else if (type === 'Social post') {
      paragraphs = [
        `${opening}${audienceText}: ${topic}`,
        lengthField.value === 'Long'
          ? 'Save this for later, share it with someone who may find it useful, and tell us which idea you will try first.'
          : 'Save this for later and share your favorite tip below.',
        '#EverydayIdeas #MadeForYou',
      ];
    } else if (type === 'Meeting summary') {
      paragraphs = [
        'Meeting summary',
        `Discussion\n${topic}`,
        'Next steps\n- Confirm owners and due dates\n- Share open questions with the team\n- Review progress at the next check-in',
      ];
    } else if (type === 'Product description') {
      paragraphs = [
        `${opening}${audienceText}: ${topic}`,
        lengthField.value === 'Long'
          ? 'Thoughtfully designed for everyday use, it brings together dependable materials and considered details. Add it to your routine at home, at work, or wherever the day takes you.'
          : 'Thoughtfully designed to make everyday use simple and dependable.',
        'A practical choice for your next everyday essential.',
      ];
    } else {
      paragraphs = [
        `A fresh perspective on ${topic}`,
        `${opening}${audienceText}, this article explores the key ideas, useful context, and practical steps behind the topic. Start with what matters most, then build a clear plan around your goals.`,
        lengthField.value === 'Long'
          ? 'Consider how these ideas apply in different situations, what resources may help, and which small action you can take first. A thoughtful approach makes it easier to learn, adjust, and keep moving forward.'
          : 'Use these ideas as a starting point, then adapt them to your own goals and context.',
        'The best next step is the one you can put into practice today.',
      ];
    }

    setEditorText(paragraphs.join('\n\n'));
    document.querySelector('#draft-type-badge').textContent = type;
    document.querySelector('#draft-tone-badge').textContent = `${toneField.value} tone`;
    document.querySelector('#draft-description').textContent = `${type} / ${lengthField.value.toLowerCase()} sample draft`;
    updateCounts();
    status.textContent = 'Sample draft created locally. Edit it to match your voice and details.';
    window.bootstrap?.Offcanvas.getInstance(document.querySelector('#writer-brief-offcanvas'))?.hide();
  };

  const respondToAssistant = (request) => {
    const currentSelection = window.getSelection();
    if (currentSelection && currentSelection.rangeCount && editor.contains(currentSelection.getRangeAt(0).commonAncestorContainer)) {
      rememberedSelection = currentSelection.toString().trim();
    }
    const selection = rememberedSelection;
    const prompt = request.trim();
    if (!prompt && !selection) {
      status.textContent = 'Select a passage or write a request for the assistant.';
      assistantPrompt.focus();
      return;
    }

    const normalized = prompt.toLowerCase();
    assistantResponseTitle.textContent = 'Writing suggestion';
    assistantResponseText.textContent = normalized.includes('short')
      ? 'Remove repeated ideas, keep the main benefit, and use one direct sentence to make this section easier to scan.'
      : normalized.includes('continue')
        ? 'Continue with one specific example, then connect it to the next action you want the reader to take.'
        : 'Lead with the main point, prefer direct verbs, and support the idea with one concrete detail.';

    selectedPassage.textContent = selection ? 'Selected passage: "' + selection + '"' : 'No passage selected. This suggestion is based on your request.';
    selectedPassage.classList.toggle('d-none', !selection);
    assistantEmpty.classList.add('d-none');
    assistantResponse.classList.remove('d-none');
    status.textContent = 'A local sample writing suggestion is ready.';
    assistantPrompt.value = '';
  };

  editor.addEventListener('mouseup', () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount && editor.contains(selection.getRangeAt(0).commonAncestorContainer)) rememberedSelection = selection.toString().trim();
  });
  editor.addEventListener('keyup', () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount && editor.contains(selection.getRangeAt(0).commonAncestorContainer)) rememberedSelection = selection.toString().trim();
  });

  topicField.addEventListener('input', updateCounts);
  editor.addEventListener('input', updateCounts);
  updateCounts();

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    makeDraft();
  });

  document.querySelectorAll('.quick-prompt').forEach((button) => {
    button.addEventListener('click', () => {
      topicField.value = button.dataset.prompt;
      typeField.value = button.dataset.type;
      updateCounts();
      status.textContent = 'Sample brief added. Create a draft when you are ready.';
      topicField.focus();
    });
  });

  document.querySelectorAll('[data-writer-command]').forEach((button) => {
    button.addEventListener('click', () => {
      editor.focus();
      document.execCommand(button.dataset.writerCommand, false, button.dataset.writerValue || null);
      updateCounts();
    });
  });

  document.querySelectorAll('[data-writer-prompt]').forEach((button) => {
    button.addEventListener('click', () => {
      assistantPrompt.value = button.dataset.writerPrompt;
      assistantPrompt.focus();
    });
  });

  document.querySelector('#writer-ask-selection').addEventListener('click', () => {
    respondToAssistant('Improve the selected passage');
  });

  assistantForm.addEventListener('submit', (event) => {
    event.preventDefault();
    respondToAssistant(assistantPrompt.value);
  });

  document.querySelector('#writer-clear').addEventListener('click', () => {
    editor.innerHTML = '';
    updateCounts();
    status.textContent = 'Document cleared.';
    editor.focus();
  });

  document.querySelector('#writer-rewrite').addEventListener('click', makeDraft);

  document.querySelector('#writer-copy').addEventListener('click', async () => {
    const text = getEditorText();
    if (!text) {
      status.textContent = 'There is no draft text to copy yet.';
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      status.textContent = 'Draft copied to clipboard.';
    } catch {
      status.textContent = 'Clipboard access is unavailable in this browser.';
    }
  });

  document.querySelector('#writer-download').addEventListener('click', () => {
    const text = getEditorText();
    if (!text) {
      status.textContent = 'There is no draft text to download yet.';
      return;
    }
    const file = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'writing-draft.txt';
    link.click();
    URL.revokeObjectURL(url);
    status.textContent = 'Draft downloaded as a text file.';
  });
})();