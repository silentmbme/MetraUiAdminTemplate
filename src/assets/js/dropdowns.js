(() => {
 const search = document.getElementById('dropdown-search');
 if (!search) return;
 const links = [...document.querySelectorAll('[data-dropdown-destination]')];
 search.addEventListener('input', () => {
  const query = search.value.trim().toLowerCase();
  links.forEach(link => { link.hidden = !link.textContent.toLowerCase().includes(query); });
  document.getElementById('dropdown-search-empty').hidden = links.some(link => !link.hidden);
 });
})();

(() => {
 const feedback = document.getElementById('dropdown-widget-feedback');
 if (!feedback) return;
 document.querySelectorAll('[data-dropdown-demo]').forEach(button => button.addEventListener('click', () => { feedback.textContent = button.dataset.dropdownDemo; }));
})();
