(() => {
  'use strict';

  const form = document.getElementById('workspace-search-form');
  const input = document.getElementById('workspace-search-input');
  const typeFilter = document.getElementById('search-type-filter');
  const pricingFilter = document.getElementById('search-pricing-filter');
  const sortFilter = document.getElementById('search-sort-filter');
  const clearFilters = document.getElementById('search-clear-filters');
  const count = document.getElementById('search-results-count');
  const emptyState = document.getElementById('search-empty-state');
  const queryLabel = document.querySelector('.search-query-label');
  const resultItems = [...document.querySelectorAll('.search-tool-result')];
  const resultList = document.querySelector('.search-result-list');
  const savedTools = new Set(JSON.parse(localStorage.getItem('nexora-saved-search-tools') || '[]'));

  const normalize = (value) => value.trim().toLowerCase();

  function renderResults() {
    const query = normalize(input.value);
    const type = typeFilter.value;
    const pricing = pricingFilter.value;
    let visibleCount = 0;
    const visibleItems = [];

    resultItems.forEach((item) => {
      const matchesText = !query || normalize(item.dataset.searchText || item.textContent).includes(query);
      const matchesType = type === 'all' || item.dataset.toolType === type;
      const matchesPricing = pricing === 'all' || item.dataset.pricing === pricing;
      const visible = matchesText && matchesType && matchesPricing;
      item.hidden = !visible;
      if (visible) {
        visibleCount += 1;
        visibleItems.push(item);
      }
    });

    if (sortFilter.value === 'rating') visibleItems.sort((a, b) => getRating(b) - getRating(a));
    if (sortFilter.value === 'newest') visibleItems.sort((a, b) => getUpdatedDate(b) - getUpdatedDate(a));
    visibleItems.forEach((item) => resultList.insertBefore(item, emptyState));
    count.textContent = String(visibleCount);
    queryLabel.textContent = input.value.trim() ? `"${input.value.trim()}"` : 'all tools';
    emptyState.hidden = visibleCount > 0;
  }

  function getRating(item) {
    return Number(item.querySelector('.search-tool-meta')?.textContent.match(/([\d.]+)\s*rating/i)?.[1] || 0);
  }

  function getUpdatedDate(item) {
    const date = item.querySelector('.search-tool-meta')?.textContent.match(/Updated\s+([A-Za-z]+\s+\d{1,2},\s+\d{4})/i)?.[1];
    return date ? new Date(date).getTime() : 0;
  }

  resultItems.forEach((item) => {
    const title = item.querySelector('h2');
    const titleRow = document.createElement('div');
    titleRow.className = 'search-result-title-row';
    title.parentNode.insertBefore(titleRow, title);
    titleRow.append(title);

    const saveButton = document.createElement('button');
    saveButton.type = 'button';
    saveButton.className = 'search-tool-save';
    saveButton.setAttribute('aria-label', 'Save tool');
    const toolUrl = title.querySelector('a')?.getAttribute('href') || title.textContent.trim();
    const updateSavedState = () => {
      const isSaved = savedTools.has(toolUrl);
      saveButton.setAttribute('aria-pressed', String(isSaved));
      saveButton.setAttribute('aria-label', isSaved ? 'Remove saved tool' : 'Save tool');
      saveButton.innerHTML = '<i class="' + (isSaved ? 'ri-bookmark-fill' : 'ri-bookmark-line') + '" aria-hidden="true"></i>';
    };
    saveButton.addEventListener('click', () => {
      if (savedTools.has(toolUrl)) savedTools.delete(toolUrl);
      else savedTools.add(toolUrl);
      localStorage.setItem('nexora-saved-search-tools', JSON.stringify([...savedTools]));
      updateSavedState();
    });
    titleRow.append(saveButton);
    updateSavedState();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    renderResults();
  });
  input.addEventListener('input', renderResults);
  typeFilter.addEventListener('change', renderResults);
  pricingFilter.addEventListener('change', renderResults);
  sortFilter.addEventListener('change', renderResults);
  clearFilters.addEventListener('click', () => {
    input.value = '';
    typeFilter.value = 'all';
    pricingFilter.value = 'all';
    sortFilter.value = 'relevance';
    renderResults();
    input.focus();
  });

  document.querySelectorAll('[data-popular-query]').forEach((button) => {
    button.addEventListener('click', () => {
      input.value = button.dataset.popularQuery;
      renderResults();
      input.focus();
    });
  });

  renderResults();
})();
