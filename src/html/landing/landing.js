(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const body = document.body;
  const root = document.documentElement;

  // Restore the visitor's preferred appearance before the page becomes interactive.
  const storedTheme = localStorage.getItem('nexorauiThemeMode')
    || localStorage.getItem('nexora-landing-theme');
  const initialTheme = storedTheme === 'dark' ? 'dark' : 'light';
  const previewSettings = {
    theme: initialTheme,
    menuSurface: initialTheme === 'dark' ? 'transparent' : 'dark',
    headerSurface: initialTheme === 'dark' ? 'transparent' : 'light'
  };
  let projectFrame = null;
  const applyProjectSettings = () => {
    const frames = [projectFrame, ...$$('.dashboard-live-frame')].filter(Boolean);
    frames.forEach((frame) => {
      try {
        const previewDocument = frame.contentDocument;
        if (!previewDocument) return;
        const html = previewDocument.documentElement;
        const previewStorage = frame.contentWindow.localStorage;
        previewStorage.setItem('nexorauiThemeMode', previewSettings.theme);
        if (previewSettings.theme === 'dark') {
          previewStorage.setItem('nexorauidarktheme', 'true');
          previewStorage.removeItem('nexorauilighttheme');
        } else {
          previewStorage.removeItem('nexorauidarktheme');
          previewStorage.setItem('nexorauilighttheme', 'true');
        }
        html.setAttribute('data-theme-color', previewSettings.theme);
        html.setAttribute('data-menu-color', previewSettings.menuSurface);
        html.setAttribute('data-header-color', previewSettings.headerSurface);
      } catch {
        // Each live preview may be navigating while a dashboard page loads.
      }
    });
  };
  const settlePreviewTheme = () => {
    [0, 120, 450].forEach((delay) => window.setTimeout(applyProjectSettings, delay));
  };
  body.classList.toggle('dark-mode', initialTheme === 'dark');
  root.classList.toggle('dark-mode', initialTheme === 'dark');
  root.setAttribute('data-theme-color', initialTheme);
  const themeToggle = $('.theme-toggle');
  const themeIcon = $('.theme-icon i');
  const updateThemeControl = () => {
    const dark = body.classList.contains('dark-mode');
    themeIcon.className = dark ? 'ri-sun-line' : 'ri-moon-line';
    themeToggle.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    themeToggle.title = dark ? 'Switch to light theme' : 'Switch to dark theme';
  };
  updateThemeControl();
  const setTheme = (theme) => {
    const dark = theme === 'dark';
    body.classList.toggle('dark-mode', theme === 'dark');
    root.classList.toggle('dark-mode', dark);
    root.setAttribute('data-theme-color', theme);
    localStorage.setItem('nexora-landing-theme', theme);
    // Dashboard pages read these shared preferences before their styles load.
    localStorage.setItem('nexorauiThemeMode', theme);
    if (dark) {
      localStorage.setItem('nexorauidarktheme', 'true');
      localStorage.removeItem('nexorauilighttheme');
    } else {
      localStorage.removeItem('nexorauidarktheme');
      localStorage.setItem('nexorauilighttheme', 'true');
    }
    previewSettings.theme = theme;
    previewSettings.menuSurface = theme === 'dark' ? 'transparent' : 'dark';
    previewSettings.headerSurface = theme === 'dark' ? 'transparent' : 'light';
    applyProjectSettings();
    requestAnimationFrame(settlePreviewTheme);
    settlePreviewTheme();
    updateThemeControl();
  };
  const toggleTheme = () => setTheme(body.classList.contains('dark-mode') ? 'light' : 'dark');
  themeToggle.addEventListener('click', toggleTheme);
  $('#demo-theme').addEventListener('click', toggleTheme);

  const menuButton = $('.menu-toggle');
  const navigation = $('.main-nav');
  menuButton.addEventListener('click', () => {
    const open = navigation.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  $$('.main-nav a').forEach((link) => link.addEventListener('click', () => {
    navigation.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  }));

  const header = $('.site-header');
  const backTop = $('#back-top');
  const updateScrollState = () => {
    header.classList.toggle('scrolled', window.scrollY > 12);
    backTop.classList.toggle('visible', window.scrollY > 500);
  };
  window.addEventListener('scroll', updateScrollState, { passive: true });
  updateScrollState();
  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Reveal sections only as they approach the viewport.
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08 });
  $$('.reveal').forEach((element) => revealObserver.observe(element));

  // Defer card previews until nearby; eager-load each one once requested so
  // the browser's own lazy-loading threshold does not add another delay.
  const dashboardPreviewObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const frame = entry.target;
      frame.addEventListener('load', () => {
        frame.closest('.dashboard-live-preview, .app-live-preview')?.classList.remove('is-loading');
        settlePreviewTheme();
      }, { once: true });
      frame.closest('.dashboard-live-preview, .app-live-preview')?.classList.add('is-loading');
      frame.loading = 'eager';
      frame.src = frame.dataset.livePreview;
      observer.unobserve(frame);
    });
  }, { rootMargin: '120px 0px' });
  $$('.dashboard-live-frame').forEach((frame) => dashboardPreviewObserver.observe(frame));

  const previewPages = {
    sales: { title: 'Sales dashboard', label: 'sales', url: 'index.html', src: '../index.html' },
    ecommerce: { title: 'eCommerce dashboard', label: 'eCommerce', url: 'ecommerce-dashboard.html', src: '../ecommerce-dashboard.html' },
    crm: { title: 'CRM dashboard', label: 'CRM', url: 'crm-dashboard.html', src: '../crm-dashboard.html' },
    projects: { title: 'Projects dashboard', label: 'projects', url: 'projects-dashboard.html', src: '../projects-dashboard.html' },
    finance: { title: 'Finance dashboard', label: 'finance', url: 'finance-dashboard.html', src: '../finance-dashboard.html' },
    ai: { title: 'AI dashboard', label: 'AI', url: 'ai-dashboard.html', src: '../ai-dashboard.html' },
    hrm: { title: 'HRM dashboard', label: 'HRM', url: 'hrm-dashboard.html', src: '../hrm-dashboard.html' },
    logistics: { title: 'Logistics dashboard', label: 'logistics', url: 'logistics-dashboard.html', src: '../logistics-dashboard.html' },
    support: { title: 'Support dashboard', label: 'support', url: 'support-dashboard.html', src: '../support-dashboard.html' }
  };
  projectFrame = $('#project-preview');
  const showcaseBrowser = projectFrame.closest('.showcase-browser');
  const syncProjectPreviewScale = () => {
    const referenceWidth = 1600;
    const scale = Math.min(showcaseBrowser.clientWidth / referenceWidth, 1);
    if (!scale) return;
    projectFrame.style.width = `${referenceWidth}px`;
    projectFrame.style.height = `${620 / scale}px`;
    projectFrame.style.transform = `scale(${scale})`;
  };
  const projectPreviewResizeObserver = new ResizeObserver(syncProjectPreviewScale);
  projectPreviewResizeObserver.observe(showcaseBrowser);
  syncProjectPreviewScale();
  projectFrame.addEventListener('load', () => {
    showcaseBrowser.classList.remove('is-loading');
    settlePreviewTheme();
  });
  projectFrame.addEventListener('error', () => showcaseBrowser.classList.remove('is-loading'));
  applyProjectSettings();
  const setPreview = (key) => {
    const page = previewPages[key];
    if (!page) return;
    showcaseBrowser.classList.add('is-loading');
    $('#preview-name').textContent = page.title;
    $('#preview-url').textContent = page.url;
    projectFrame.src = page.src;
    projectFrame.title = `Live Nexora UI ${page.label} dashboard preview`;
    $$('.preview-tab').forEach((tab) => {
      const active = tab.dataset.preview === key;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
    });
    $$('.dashboard-card').forEach((card) => {
      const active = card.querySelector('[data-demo]')?.dataset.demo === key;
      card.classList.toggle('preview-active', active);
    });
  };
  $$('.preview-tab').forEach((tab) => tab.addEventListener('click', () => setPreview(tab.dataset.preview)));
  $$('[data-demo]').forEach((button) => button.addEventListener('click', () => {
    setPreview(button.dataset.demo);
    $('#showcase').scrollIntoView({ behavior: 'smooth' });
  }));
  // Keep the navigation indicator in sync with the current section.
  const navLinks = $$('.main-nav a');
  const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const target = `#${visible.target.id}`;
    navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === target));
  }, { rootMargin: '-20% 0px -65% 0px', threshold: [0, 0.1, 0.5] });
  ['features', 'dashboards', 'apps', 'components', 'faq'].forEach((id) => {
    const section = document.getElementById(id);
    if (section) sectionObserver.observe(section);
  });
})();
