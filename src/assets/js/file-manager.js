(() => {
  const page = document.querySelector('.drive-page');
  if (!page) return;
  const body = page.querySelector('#drive-rows');
  const search = page.querySelector('#drive-search');
  const type = page.querySelector('#drive-type');
  const limit = page.querySelector('#drive-limit');
  let filter = 'all', currentPage = 0, ascending = true;
  let selectedFile = null;
  const rows = () => [...body.rows];
  const render = () => {
    const query = search.value.trim().toLowerCase();
    const matching = rows().filter(row => {
      const category = filter === 'all'
        || (filter === 'work' && ['documents', 'spreadsheets'].includes(row.dataset.type))
        || (filter === 'projects' && ['presentations', 'archives'].includes(row.dataset.type))
        || (filter === 'recent' && Number(row.dataset.position) < 4)
        || (filter === 'shared' && row.dataset.access === 'Shared')
        || (filter === 'starred' && row.querySelector('.drive-star').classList.contains('active'))
        || row.dataset.type === filter;
      return category && (type.value === 'all' || type.value === row.dataset.type) && row.dataset.name.toLowerCase().includes(query);
    });
    const count = Number(limit.value);
    currentPage = Math.max(0, Math.min(currentPage, Math.ceil(matching.length / count) - 1));
    const visible = matching.slice(currentPage * count, (currentPage + 1) * count);
    rows().forEach(row => { row.hidden = !visible.includes(row); });
    page.querySelectorAll('.drive-folder').forEach(folder => { folder.hidden = !folder.textContent.toLowerCase().includes(query) || !['all','work','projects'].includes(filter); });
    page.querySelector('#drive-folders').hidden = ![...page.querySelectorAll('.drive-folder')].some(folder => !folder.hidden);
    page.querySelector('#drive-empty').hidden = matching.length !== 0;
    page.querySelector('#drive-status').textContent = matching.length ? 'Showing ' + (currentPage * count + 1) + ' - ' + (currentPage * count + visible.length) + ' of ' + matching.length + ' files' : 'No files in this view';
    page.querySelector('#drive-total').textContent = rows().length;
    page.querySelector('#drive-prev').disabled = currentPage === 0;
    page.querySelector('#drive-next').disabled = (currentPage + 1) * count >= matching.length;
    const selectAll = page.querySelector('#drive-select-all');
    const selected = visible.filter(row => row.querySelector('input').checked).length;
    selectAll.checked = visible.length > 0 && selected === visible.length;
    selectAll.indeterminate = selected > 0 && selected < visible.length;
  };
  page.querySelectorAll('[data-drive-filter]').forEach(button => button.addEventListener('click', () => {
    filter = button.dataset.driveFilter; currentPage = 0;
    page.querySelectorAll('[data-drive-filter]').forEach(item => { item.classList.toggle('active', item === button); item.setAttribute('aria-pressed', String(item === button)); });
    render();
  }));
  [search, type, limit].forEach(control => control.addEventListener(control === search ? 'input' : 'change', () => { currentPage = 0; render(); }));
  page.querySelector('#drive-prev').addEventListener('click', () => { currentPage--; render(); });
  page.querySelector('#drive-next').addEventListener('click', () => { currentPage++; render(); });
  page.querySelector('#drive-sort').addEventListener('click', () => { rows().sort((a,b) => ascending ? a.dataset.name.localeCompare(b.dataset.name) : b.dataset.name.localeCompare(a.dataset.name)).forEach(row => body.append(row)); ascending = !ascending; render(); });
  page.querySelector('#drive-select-all').addEventListener('change', event => { rows().filter(row => !row.hidden).forEach(row => row.querySelector('input').checked = event.target.checked); render(); });
  body.addEventListener('change', render);
  page.addEventListener('click', event => {
    const star = event.target.closest('.drive-star');
    if (star) { star.classList.toggle('active'); const active = star.classList.contains('active'); star.setAttribute('aria-pressed', String(active)); star.setAttribute('aria-label', active ? 'Remove favourite' : 'Star file'); star.querySelector('i').className = active ? 'ri-star-fill' : 'ri-star-line'; render(); return; }
    const open = event.target.closest('[data-drive-open]');
    if (open) {
      const row = open.closest('tr');
      selectedFile = row;
      document.querySelector('#drive-share span').textContent = row.dataset.access === 'Shared' ? 'Make private' : 'Share file';
      document.querySelector('#drive-share-feedback').textContent = 'Access changes apply to this demo only.';
      const panel = document.querySelector('#file-details-panel');
      panel.querySelector('#file-details-name').textContent = row.dataset.name;
      panel.querySelector('#file-details-meta').textContent = row.dataset.type;
      panel.querySelector('#file-details-owner').textContent = row.cells[4].textContent;
      panel.querySelector('#file-details-updated').textContent = row.cells[3].textContent;
      panel.querySelector('#file-details-size').textContent = row.querySelector('small').textContent;
      panel.querySelector('#file-details-access').textContent = row.dataset.access;
      panel.querySelector('#file-details-icon').innerHTML = row.querySelector('.drive-file-icon').innerHTML;
      bootstrap.Offcanvas.getOrCreateInstance(panel).show();
    }
    const folder = event.target.closest('.drive-folder');
    if (folder) { page.querySelector('#drive-status').textContent = folder.querySelector('strong').textContent + ' selected. Folder contents are not available in this demo.'; }
  });
  document.querySelector('#new-folder-confirm').addEventListener('click', () => {
    const input = document.querySelector('#new-folder-name');
    if (!input.value.trim()) { document.querySelector('#new-folder-feedback').textContent = 'Enter a folder name.'; input.focus(); return; }
    const folder = document.createElement('button'); folder.type = 'button'; folder.className = 'drive-folder btn text-start';
    folder.innerHTML = '<span class="drive-folder-icon avatar avatar-lg bg-light text-muted"><i class="ri-folder-line"></i></span><span><strong></strong><small>0 files</small></span><i class="ri-arrow-right-s-line drive-folder-more"></i>';
    folder.querySelector('strong').textContent = input.value.trim();
    page.querySelector('#drive-folders').prepend(folder); input.value = ''; filter = 'all'; type.value = 'all'; search.value = ''; currentPage = 0;
    page.querySelectorAll('[data-drive-filter]').forEach(button => {button.classList.toggle('active', button.dataset.driveFilter === 'all'); button.setAttribute('aria-pressed', String(button.dataset.driveFilter === 'all'));});
    render();
    bootstrap.Modal.getOrCreateInstance(document.querySelector('#new-folder-modal')).hide();
  });
  document.querySelector('#file-upload-confirm').addEventListener('click', () => {
    const input = document.querySelector('#file-upload-input');
    if (!input.files.length) { input.focus(); return; }
    [...input.files].forEach(file => {
      const row = rows()[0].cloneNode(true);
      const extension = file.name.split('.').pop().toLowerCase();
      Object.assign(row.dataset, {name:file.name, type:['png','jpg','jpeg','webp','gif'].includes(extension) ? 'images' : ['xlsx','xls','csv'].includes(extension) ? 'spreadsheets' : ['mp4','mov'].includes(extension) ? 'videos' : 'documents', access:'Private', position:'0'});
      row.querySelector('strong').textContent = file.name; row.querySelector('small').textContent = (file.size / 1024).toFixed(1) + ' KB';
      row.querySelector('.drive-file-icon i').className = 'ri-file-line';
      row.cells[2].textContent = row.dataset.type; row.cells[3].textContent = 'Just now'; row.cells[4].querySelector('span span').textContent = 'You'; row.cells[5].textContent = 'Private';
      row.querySelector('input').checked = false; row.querySelector('input').setAttribute('aria-label', 'Select ' + file.name); const star = row.querySelector('.drive-star'); star.classList.remove('active'); star.setAttribute('aria-pressed','false'); star.setAttribute('aria-label', 'Star file'); star.querySelector('i').className = 'ri-star-line';
      body.prepend(row);
    });
    input.value = ''; filter = 'all'; type.value = 'all'; search.value = ''; currentPage = 0; render();
    page.querySelectorAll('[data-drive-filter]').forEach(button => {button.classList.toggle('active', button.dataset.driveFilter === 'all'); button.setAttribute('aria-pressed',String(button.dataset.driveFilter === 'all'));});
    bootstrap.Modal.getOrCreateInstance(document.querySelector('#upload-files-modal')).hide();
  });
  document.querySelector('#drive-share').addEventListener('click', () => {
    if (!selectedFile) return;
    const shared = selectedFile.dataset.access !== 'Shared';
    selectedFile.dataset.access = shared ? 'Shared' : 'Private';
    selectedFile.cells[5].textContent = selectedFile.dataset.access;
    document.querySelector('#file-details-access').textContent = selectedFile.dataset.access;
    document.querySelector('#drive-share span').textContent = shared ? 'Make private' : 'Share file';
    document.querySelector('#drive-share-feedback').textContent = shared ? 'File marked as shared in this demo.' : 'File marked as private in this demo.';
    render();
  });
  render();
})();
