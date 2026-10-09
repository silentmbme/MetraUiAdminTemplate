(() => {
  const modal = document.getElementById('header-responsive-search');
  if (!modal || modal.dataset.searchReady) return;
  modal.dataset.searchReady = 'true';
  const input = modal.querySelector('#global-search-input');
  const category = modal.querySelector('#global-search-category');
  const results = modal.querySelector('#global-search-results');
  const status = modal.querySelector('#global-search-status');
  const empty = modal.querySelector('#global-search-empty');
  const clear = modal.querySelector('#global-search-clear');
  const storageKey = 'nexoraui.recentPages';
  const pages = new Map();
  let scope = 'all';
  let opener;
  let recent = [];
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (Array.isArray(saved)) recent = saved.filter(item => typeof item === 'string').slice(0, 8);
  } catch { /* Search also works when browser storage is unavailable. */ }

  document.querySelectorAll('.sidenav-menu a.sidenav-link[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!/^[a-zA-Z0-9_-]+\.html$/.test(href) || pages.has(href)) return;
    const title = link.textContent.replace(/\s+/g, ' ').trim();
    const group = link.closest('.sidenav-submenu.sidenav-level-1')?.parentElement;
    const groupLink = group?.querySelector(':scope > a.sidenav-link');
    const groupName = groupLink?.textContent.replace(/\s+/g, ' ').trim() || 'Pages';
    pages.set(href, { href, title, category: groupName });
  });
  recent = recent.filter(href => pages.has(href));
  [...new Set([...pages.values()].map(page => page.category))].sort().forEach(name => {
    category.add(new Option(name, name));
  });

  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify(recent)); } catch { /* Optional history. */ }
  }

  function render() {
    const query = input.value.trim().toLowerCase();
    const words = query.split(/\s+/).filter(Boolean);
    const pool = scope === 'recent' ? recent.map(href => pages.get(href)) : [...pages.values()];
    const matches = pool.filter(page => (!category.value || page.category === category.value)
      && words.every(word => `${page.title} ${page.category} ${page.href}`.toLowerCase().includes(word)));
    if (scope === 'all') matches.sort((a, b) => {
      const score = page => query ? Number(page.title.toLowerCase() === query) * 3 + Number(page.title.toLowerCase().startsWith(query)) : Number(recent.includes(page.href));
      return score(b) - score(a) || a.title.localeCompare(b.title);
    });
    results.replaceChildren();
    matches.forEach(page => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = page.href;
      link.className = 'search-result';
      const icon = document.createElement('span');
      icon.className = 'search-result-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = page.title.slice(0, 1).toUpperCase();
      const label = document.createElement('span');
      label.className = 'search-result-label';
      const title = document.createElement('strong');
      title.textContent = page.title;
      const subtitle = document.createElement('small');
      subtitle.textContent = page.category;
      label.append(title, subtitle);
      const hint = document.createElement('span');
      hint.className = 'search-result-hint';
      const isCurrentPage = page.href === location.pathname.split('/').pop();
      hint.textContent = isCurrentPage ? 'Current page' : 'Open';
      if (!isCurrentPage) {
        const openIcon = document.createElement('i');
        openIcon.className = 'ri-arrow-up-right-line';
        openIcon.setAttribute('aria-hidden', 'true');
        hint.append(' ', openIcon);
      }
      link.append(icon, label, hint);
      link.addEventListener('click', () => {
        recent = [page.href, ...recent.filter(href => href !== page.href)].slice(0, 8);
        save();
      });
      item.append(link);
      results.append(item);
    });
    status.textContent = `${matches.length} ${scope === 'recent' ? 'recent ' : ''}page${matches.length === 1 ? '' : 's'}${query ? ' found' : ' available'}`;
    empty.hidden = matches.length > 0;
    modal.querySelector('#global-search-empty-description').textContent = scope === 'recent' && !recent.length
      ? 'Pages you open from search will appear here.' : 'Try another keyword or choose a different category.';
    clear.hidden = recent.length === 0;
  }

  input.addEventListener('input', render);
  category.addEventListener('change', render);
  modal.querySelectorAll('[data-search-scope]').forEach(button => {
    button.addEventListener('click', () => {
      scope = button.dataset.searchScope;
      modal.querySelectorAll('[data-search-scope]').forEach(tab => {
        const active = tab === button;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-pressed', String(active));
      });
      render();
    });
  });
  clear.addEventListener('click', () => { recent = []; save(); render(); input.focus(); });
  modal.addEventListener('keydown', event => {
    const links = [...results.querySelectorAll('a')];
    const current = links.indexOf(document.activeElement);
    if (event.target !== input && current === -1) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const next = event.key === 'ArrowDown' ? current + 1 : current - 1;
      if (next < 0) input.focus();
      else links[Math.min(next, links.length - 1)]?.focus();
    } else if (event.key === 'Enter' && event.target === input) {
      event.preventDefault();
      links[0]?.click();
    }
  });
  modal.addEventListener('show.bs.modal', () => { opener = document.activeElement; render(); });
  modal.addEventListener('shown.bs.modal', () => { input.focus(); input.select(); });
  modal.addEventListener('hidden.bs.modal', () => { if (opener?.isConnected) opener.focus(); });
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'k') {
      if (!window.bootstrap?.Modal || document.querySelector('.modal.show:not(#header-responsive-search)')) return;
      event.preventDefault();
      window.bootstrap.Modal.getOrCreateInstance(modal).toggle();
    }
  });
  render();
})();
