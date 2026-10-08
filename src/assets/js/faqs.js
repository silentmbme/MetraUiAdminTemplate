(function () {
  'use strict';
  const search = document.getElementById('faq-search');
  if (!search) return;
  let category = 'all';
  const buttons = [...document.querySelectorAll('[data-faq-category]')];
  function filterQuestions() {
    const query = search.value.trim().toLowerCase();
    let total = 0;
    document.querySelectorAll('[data-faq-group]').forEach((group) => {
      let matches = 0;
      group.querySelectorAll('[data-faq-question]').forEach((item) => {
        const visible =
          (category === 'all' || category === group.dataset.faqGroup) &&
          item.textContent.toLowerCase().includes(query);
        item.hidden = !visible;
        if (visible) matches++;
      });
      group.hidden = !matches;
      total += matches;
    });
    document.getElementById('faq-empty').hidden = total > 0;
    document.getElementById('faq-result-status').textContent =
      total + ' questions available';
  }
  search.addEventListener('input', filterQuestions);
  buttons.forEach((button) =>
    button.addEventListener('click', () => {
      category = button.dataset.faqCategory;
      buttons.forEach((control) => {
        const active = control === button;
        control.setAttribute('aria-pressed', String(active));
        control.classList.toggle('btn-secondary', active);
        control.classList.toggle('btn-light', !active);
      });
      filterQuestions();
    })
  );
  document.getElementById('faq-clear').addEventListener('click', () => {
    search.value = '';
    filterQuestions();
    search.focus();
  });
  filterQuestions();
})();
