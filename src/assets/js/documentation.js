(function () {
  'use strict';
  const links = Array.from(document.querySelectorAll('.docs-nav-link'));
  const sections = Array.from(document.querySelectorAll('.docs-section'));
  const search = document.getElementById('docs-search');
  const status = document.getElementById('docs-status');
  search.addEventListener('input', function () {
    const query = search.value.trim().toLowerCase();
    let count = 0;
    links.forEach(function (link, index) {
      const matches = sections[index].textContent.toLowerCase().includes(query);
      link.hidden = !matches;
      if (matches) count += 1;
    });
    status.textContent = count
      ? count + ' matching guide sections'
      : 'No matching sections. Try another keyword.';
  });
  function markActive(id) {
    links.forEach(function (link) {
      const active = link.hash === '#' + id;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  const themeButton = document.getElementById('docs-theme');
  function setTheme(mode) {
    document.documentElement.setAttribute('data-theme-color', mode);
    document.querySelector('.docs-brand img').src =
      '../assets/images/brand-logos/' +
      (mode === 'dark' ? 'desktop-dark.png' : 'desktop-logo.png');
    themeButton.setAttribute(
      'aria-label',
      mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
    );
    themeButton.innerHTML =
      '<i class="' +
      (mode === 'dark' ? 'ri-sun-line' : 'ri-moon-line') +
      '" aria-hidden="true"></i>';
  }
  let preferredTheme = 'light';
  try {
    preferredTheme = localStorage.getItem('nexoraDocsTheme') || 'light';
  } catch (error) {}
  setTheme(preferredTheme === 'dark' ? 'dark' : 'light');
  themeButton.addEventListener('click', function () {
    const mode =
      document.documentElement.getAttribute('data-theme-color') === 'dark'
        ? 'light'
        : 'dark';
    setTheme(mode);
    try {
      localStorage.setItem('nexoraDocsTheme', mode);
    } catch (error) {}
  });
  markActive(location.hash.slice(1) || 'welcome');

  links.forEach(function (link) {
    link.addEventListener('click', function () {
      markActive(link.hash.slice(1));
      const navigation = document.getElementById('docs-navigation');
      const drawer = bootstrap.Offcanvas.getInstance(navigation);
      if (drawer) drawer.hide();
    });
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        const visible = entries.filter(function (entry) {
          return entry.isIntersecting;
        });
        if (visible.length) markActive(visible[0].target.id);
      },
      { rootMargin: '-100px 0px -55% 0px', threshold: 0 }
    );
    sections.forEach(function (section) {
      observer.observe(section);
    });
  }
  document.querySelectorAll('.docs-code').forEach(function (block) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-sm btn-light docs-copy';
    button.textContent = 'Copy';
    button.setAttribute('aria-label', 'Copy code example');
    button.addEventListener('click', async function () {
      try {
        await navigator.clipboard.writeText(
          block.querySelector('code').textContent
        );
        button.textContent = 'Copied';
      } catch (error) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(block.querySelector('code'));
        selection.removeAllRanges();
        selection.addRange(range);
        button.textContent = 'Press Ctrl+C';
      }
      window.setTimeout(function () {
        button.textContent = 'Copy';
      }, 2500);
    });
    block.appendChild(button);
  });
})();
