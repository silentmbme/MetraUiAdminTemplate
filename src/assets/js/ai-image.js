(() => {
  const form = document.querySelector('#image-generator-form');
  if (!form) return;

  const promptField = document.querySelector('#image-prompt');
  const promptCount = document.querySelector('#prompt-count');
  const resultsGrid = document.querySelector('#image-results-grid');
  const previewPrompt = document.querySelector('#preview-prompt');
  const previewStyle = document.querySelector('#preview-style-label');
  const feedback = document.querySelector('#image-feedback');
  const downloadLink = document.querySelector('#image-download');
  const favoriteButton = document.querySelector('#image-favorite');
  const emptyState = document.querySelector('#image-empty-state');
  const result = document.querySelector('#image-result');
  const galleryCards = [...document.querySelectorAll('.gallery-card')];
  const modeButtons = [...document.querySelectorAll('[data-image-mode]')];
  const ratioSelect = document.querySelector('#image-ratio-select');
  const intensity = document.querySelector('#image-intensity');
  const intensityValue = document.querySelector('#image-intensity-value');
  const lighting = document.querySelector('#image-lighting');
  const cameraAngle = document.querySelector('#image-camera-angle');
  const outputCountButtons = [...document.querySelectorAll('[data-preview-count]')];
  let outputCount = Number(outputCountButtons.find((button) => button.getAttribute('aria-pressed') === 'true').dataset.previewCount);
  const generateLabel = document.querySelector('#image-generate-label');
  let activeMode = 'Fast';
  let activeRatio = ratioSelect.value;
  let activeCard = galleryCards[0];
  let activeVariantIndex = 0;

  const updatePromptCount = () => {
    promptCount.textContent = promptField.value.length;
  };

  const updateSettingsLabel = () => {
    previewStyle.textContent = `${activeMode} / ${activeRatio} / ${intensity.value}% intensity / ${lighting.value} / ${cameraAngle.value}`;
  };

  const showResult = () => {
    emptyState.hidden = true;
    result.classList.remove('d-none');
  };

  const updateSelection = () => {
    resultsGrid.querySelectorAll('.image-variation').forEach((button) => {
      const selected = Number(button.dataset.variantIndex) === activeVariantIndex;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });

    const imagePath = `../assets/images/media/${activeCard.dataset.imageSrc}`;
    downloadLink.href = imagePath;
    downloadLink.download = `${activeCard.dataset.imageName.toLowerCase().replace(/\s+/g, '-')}-sample.jpg`;
    previewPrompt.textContent = promptField.value.trim() || activeCard.dataset.imageCopy;
    galleryCards.forEach((reference) => {
      const selected = reference === activeCard;
      reference.classList.toggle('active', selected);
      reference.setAttribute('aria-pressed', String(selected));
    });
  };

  const resetFavorite = () => {
    favoriteButton.setAttribute('aria-pressed', 'false');
    favoriteButton.setAttribute('aria-label', 'Add selected preview to favorites');
    favoriteButton.innerHTML = '<i class="ri-heart-line"></i>';
    favoriteButton.classList.remove('text-danger');
  };

  const renderVariants = (startIndex) => {
    resultsGrid.replaceChildren();
    for (let offset = 0; offset < outputCount; offset += 1) {
      const galleryIndex = (startIndex + offset) % galleryCards.length;
      const source = galleryCards[galleryIndex];
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'image-variation';
      card.dataset.variantIndex = String(offset);
      card.setAttribute('aria-pressed', 'false');
      card.setAttribute('aria-label', `Select preview ${offset + 1}, ${source.dataset.imageName}`);

      const image = document.createElement('img');
      image.src = `../assets/images/media/${source.dataset.imageSrc}`;
      image.alt = source.dataset.imageAlt;
      image.loading = 'lazy';

      const caption = document.createElement('span');
      caption.className = 'image-variation-caption';
      const title = document.createElement('span');
      title.className = 'fw-semibold';
      title.textContent = `Concept 0${offset + 1}`;
      const description = document.createElement('span');
      description.className = 'text-muted fs-11';
      description.textContent = source.dataset.imageName;
      caption.append(title, description);
      card.append(image, caption);
      resultsGrid.append(card);

      card.addEventListener('click', () => {
        activeVariantIndex = offset;
        activeCard = source;
        updateSelection();
        feedback.textContent = `Concept 0${offset + 1} selected.`;
      });
    }
    activeVariantIndex = 0;
    activeCard = galleryCards[startIndex % galleryCards.length];
    updateSelection();
    resetFavorite();
  };

  promptField.addEventListener('input', updatePromptCount);
  updatePromptCount();
  updateSettingsLabel();

  modeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeMode = button.dataset.imageMode;
      modeButtons.forEach((option) => {
        const selected = option === button;
        option.classList.toggle('active', selected);
        option.setAttribute('aria-pressed', String(selected));
      });
      updateSettingsLabel();
    });
  });

  ratioSelect.addEventListener('change', () => {
    activeRatio = ratioSelect.value;
    updateSettingsLabel();
  });

  const updateGenerateLabel = () => {
    generateLabel.textContent = 'Generate ' + outputCount + ' previews';
  };
    outputCountButtons.forEach((button) => {
    button.addEventListener('click', () => {
      outputCount = Number(button.dataset.previewCount);
      outputCountButtons.forEach((option) => {
        const selected = option === button;
        option.classList.toggle('active', selected);
        option.setAttribute('aria-pressed', String(selected));
      });
      updateGenerateLabel();
    });
  });
  updateGenerateLabel();
  intensity.addEventListener('input', () => {
    intensityValue.textContent = intensity.value + '%';
    updateSettingsLabel();
  });

  lighting.addEventListener('change', updateSettingsLabel);
  cameraAngle.addEventListener('change', updateSettingsLabel);

  galleryCards.forEach((card, index) => {
    card.addEventListener('click', () => {
      galleryCards.forEach((reference) => {
        const selected = reference === card;
        reference.classList.toggle('active', selected);
        reference.setAttribute('aria-pressed', String(selected));
      });
      renderVariants(index);
      showResult();
      feedback.textContent = `Sample concepts are ready, using ${card.dataset.imageName} as the starting reference.`;
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!promptField.value.trim()) {
      feedback.textContent = 'Add a prompt to create your preview set.';
      promptField.focus();
      return;
    }

    const startIndex = (galleryCards.indexOf(activeCard) + 1) % galleryCards.length;
    renderVariants(startIndex);
    showResult();
    updateSettingsLabel();
    feedback.textContent = 'Sample concepts are shown for your prompt. Original image generation is not connected.';
  });

  document.querySelector('#image-clear-prompt').addEventListener('click', () => {
    promptField.value = '';
    updatePromptCount();
    promptField.focus();
    feedback.textContent = 'Prompt cleared.';
  });

  document.querySelector('#image-back-to-prompt').addEventListener('click', () => promptField.focus());

  favoriteButton.addEventListener('click', () => {
    const isFavorite = favoriteButton.getAttribute('aria-pressed') === 'true';
    favoriteButton.setAttribute('aria-pressed', String(!isFavorite));
    favoriteButton.setAttribute('aria-label', isFavorite ? 'Add selected preview to favorites' : 'Remove selected preview from favorites');
    favoriteButton.innerHTML = `<i class="${isFavorite ? 'ri-heart-line' : 'ri-heart-fill'}"></i>`;
    favoriteButton.classList.toggle('text-danger', !isFavorite);
    feedback.textContent = isFavorite ? 'Removed from favorites.' : 'Added to favorites for this session.';
  });
})();