(() => {
 const search = document.getElementById('list-task-search');
 if (!search) return;
 const rows = [...document.querySelectorAll('[data-work-item]')];
 const update = () => {
  const query = search.value.trim().toLowerCase();
  rows.forEach(row => { row.classList.toggle('d-none', !row.textContent.toLowerCase().includes(query)); row.querySelector('label').classList.toggle('text-decoration-line-through', row.querySelector('input').checked); });
  const completed = rows.filter(row => row.querySelector('input').checked).length;
  const visible = rows.filter(row => !row.classList.contains('d-none')).length;
  document.getElementById('work-queue-feedback').textContent = completed + ' of ' + rows.length + ' tasks complete' + (query ? ' / ' + visible + ' matching tasks' : '');
 };
 search.addEventListener('input', update);
 rows.forEach(row => row.querySelector('input').addEventListener('change', update));
 update();
})();
