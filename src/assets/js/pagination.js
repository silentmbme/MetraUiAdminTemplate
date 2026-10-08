(() => {
 document.querySelectorAll('[data-pagination-demo]').forEach(list => {
  let page = 1;
  list.addEventListener('click', event => {
   const button = event.target.closest('button');
   if (!button || button.disabled) return;
   page = Math.min(5, Math.max(1, button.dataset.page ? Number(button.dataset.page) : page + Number(button.dataset.step)));
   list.querySelectorAll('[data-page]').forEach(control => { const active = Number(control.dataset.page) === page; control.parentElement.classList.toggle('active', active); if (active) control.setAttribute('aria-current', 'page'); else control.removeAttribute('aria-current'); });
   list.querySelectorAll('[data-step]').forEach(control => { control.disabled = Number(control.dataset.step) < 0 ? page === 1 : page === 5; control.parentElement.classList.toggle('disabled', control.disabled); });
   list.closest('.card-body').querySelector('[data-page-feedback]').textContent = 'Page ' + page + ' of 5';
  });
 });
 const size = document.getElementById('pagination-page-size');
 if (!size) return;
 const names = ['Liam Carter','Sarah Smith','Emma Wilson','James Taylor','Olivia Martin','Noah Davis','Ava Thompson','Lucas Brown','Mia Anderson','Ethan Clark','Isabella Lewis','Henry Walker'];
 let page = 1;
 const controls = document.getElementById('pagination-directory-controls');
 const render = () => {
  const perPage = Number(size.value), pages = Math.ceil(names.length / perPage);
  page = Math.min(page, pages);
  const start = (page - 1) * perPage;
  document.getElementById('pagination-results').innerHTML = names.slice(start, start + perPage).map(name => '<li class="list-group-item fs-13">' + name + '</li>').join('');
  document.getElementById('pagination-result-range').textContent = 'Showing ' + (start + 1) + '-' + Math.min(start + perPage, names.length) + ' of ' + names.length + ' people';
  controls.innerHTML = Array.from({length: pages}, (_, index) => '<li class="page-item ' + (index + 1 === page ? 'active' : '') + '"><button type="button" class="page-link" data-directory-page="' + (index + 1) + '" ' + (index + 1 === page ? 'aria-current="page"' : '') + '>' + (index + 1) + '</button></li>').join('');
 };
 controls.addEventListener('click', event => { const button = event.target.closest('[data-directory-page]'); if (!button) return; page = Number(button.dataset.directoryPage); render(); controls.querySelector('[aria-current="page"]').focus(); });
 size.addEventListener('change', () => { page = 1; render(); });
 render();
})();
