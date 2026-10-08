(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const body = document.body;

  // Restore the visitor's preferred appearance before the page becomes interactive.
  const storedTheme = localStorage.getItem('nexora-landing-theme');
  const previewSettings = {
    theme: storedTheme === 'dark' ? 'dark' : 'light',
    direction: 'ltr',
    layout: 'default',
    menuSurface: 'dark',
    headerSurface: 'light',
    headerPosition: 'fixed'
  };
  let projectFrame = null;
  const applyProjectSettings = () => {
    try {
      const previewDocument = projectFrame?.contentDocument;
      if (!previewDocument) return;
      const html = previewDocument.documentElement;
      html.setAttribute('data-theme-color', previewSettings.theme);
      html.setAttribute('data-menu-color', previewSettings.menuSurface);
      html.setAttribute('data-header-color', previewSettings.headerSurface);
      html.setAttribute('data-header-position', previewSettings.headerPosition);
      html.setAttribute('dir', previewSettings.direction);
      const bootstrap = previewDocument.querySelector('#style');
      if (bootstrap) bootstrap.href = previewSettings.direction === 'rtl'
        ? '../assets/libs/bootstrap/css/bootstrap.rtl.min.css'
        : '../assets/libs/bootstrap/css/bootstrap.min.css';
      const applyLayout = projectFrame.contentWindow.setSidebarCustomizerLayout;
      if (typeof applyLayout === 'function') applyLayout(previewSettings.layout);
    } catch {
      // The preview can briefly navigate while its dashboard page is loading.
    }
  };
  if (storedTheme === 'dark') body.classList.add('dark-mode');
  if (storedTheme === 'dark') {
    $$('.customize-options [data-customize="theme"]').forEach((button) => button.classList.toggle('selected', button.dataset.value === 'dark'));
  }
  const themeToggle = $('.theme-toggle');
  const themeIcon = $('.theme-icon');
  const updateThemeControl = () => {
    const dark = body.classList.contains('dark-mode');
    themeIcon.textContent = dark ? '☀' : '☾';
    themeToggle.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    themeToggle.title = dark ? 'Switch to light theme' : 'Switch to dark theme';
  };
  updateThemeControl();
  const setTheme = (theme) => {
    body.classList.toggle('dark-mode', theme === 'dark');
    localStorage.setItem('nexora-landing-theme', theme);
    previewSettings.theme = theme;
    previewSettings.menuSurface = theme === 'dark' ? 'transparent' : 'dark';
    previewSettings.headerSurface = theme === 'dark' ? 'transparent' : 'light';
    applyProjectSettings();
    updateThemeControl();
    $$('.customize-options [data-customize="theme"]').forEach((button) => button.classList.toggle('selected', button.dataset.value === theme));
    $$('.customize-options [data-customize="menu-surface"]').forEach((button) => button.classList.toggle('selected', button.dataset.value === previewSettings.menuSurface));
    $$('.customize-options [data-customize="header-surface"]').forEach((button) => button.classList.toggle('selected', button.dataset.value === previewSettings.headerSurface));
    if (apexChart) apexChart.updateOptions({
      chart: { foreColor: getComputedStyle(body).getPropertyValue('--muted').trim() },
      grid: { borderColor: getComputedStyle(body).getPropertyValue('--line').trim() }
    });
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

  const previewPages = {
    sales: { label: 'sales', url: 'index.html', src: '../index.html' },
    ecommerce: { label: 'eCommerce', url: 'ecommerce-dashboard.html', src: '../ecommerce-dashboard.html' },
    crm: { label: 'CRM', url: 'crm-dashboard.html', src: '../crm-dashboard.html' },
    projects: { label: 'projects', url: 'projects-dashboard.html', src: '../projects-dashboard.html' },
    finance: { label: 'finance', url: 'finance-dashboard.html', src: '../finance-dashboard.html' },
    ai: { label: 'AI', url: 'ai-dashboard.html', src: '../ai-dashboard.html' }
  };
  projectFrame = $('#project-preview');
  projectFrame.addEventListener('load', applyProjectSettings);
  applyProjectSettings();
  const setPreview = (key) => {
    const page = previewPages[key];
    if (!page) return;
    $('#preview-url').textContent = page.url;
    projectFrame.src = page.src;
    projectFrame.title = `Live Nexora UI ${page.label} dashboard preview`;
    $$('.preview-tab').forEach((tab) => {
      const active = tab.dataset.preview === key;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
    });
  };
  $$('.preview-tab').forEach((tab) => tab.addEventListener('click', () => setPreview(tab.dataset.preview)));
  $$('[data-demo]').forEach((button) => button.addEventListener('click', () => {
    setPreview(button.dataset.demo);
    $('#showcase').scrollIntoView({ behavior: 'smooth' });
  }));
  // Change the chart's time range and supporting totals together.
  const periodData = {
    week: { total: '$18,640', change: '↗ 8.2%', bars: [35, 58, 46, 78, 61, 89, 69] },
    month: { total: '$84,560', change: '↗ 18.42%', bars: [46, 68, 55, 84, 62, 91, 73] },
    year: { total: '$942,180', change: '↗ 26.8%', bars: [42, 55, 48, 69, 77, 63, 90] }
  };
  let apexChart = null;
  if (window.ApexCharts) {
    const chartSurface = $('.chart-showcase');
    const chartText = getComputedStyle(body).getPropertyValue('--muted').trim();
    apexChart = new window.ApexCharts($('#apex-sales-chart'), {
      chart: { type: 'area', height: 185, toolbar: { show: false }, zoom: { enabled: false }, foreColor: chartText, fontFamily: 'DM Sans, sans-serif' },
      series: [
        { name: 'Revenue', data: periodData.month.bars.map((value) => value * 150) },
        { name: 'Orders', data: periodData.month.bars.map((value) => value * 19) }
      ],
      colors: ['#5e78fd', '#93f126'],
      stroke: { curve: 'smooth', width: [3, 2] },
      fill: { type: 'gradient', gradient: { opacityFrom: 0.2, opacityTo: 0.02, stops: [0, 90, 100] } },
      dataLabels: { enabled: false },
      grid: { borderColor: getComputedStyle(body).getPropertyValue('--line').trim(), strokeDashArray: 4, padding: { left: 0, right: 5 } },
      xaxis: { categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7'], axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { fontSize: '9px' } } },
      yaxis: { labels: { formatter: (value) => `$${Math.round(value / 1000)}k`, style: { fontSize: '9px' } } },
      legend: { show: false },
      tooltip: { shared: true, y: { formatter: (value, context) => context.seriesIndex === 0 ? `$${value.toLocaleString()}` : `${Math.round(value)} orders` } }
    });
    chartSurface.classList.add('has-apex-chart');
    apexChart.render();
  }
  $$('.period-switch button').forEach((button) => button.addEventListener('click', () => {
    const data = periodData[button.dataset.period];
    $$('.period-switch button').forEach((item) => item.classList.toggle('active', item === button));
    $('#chart-stat-value').textContent = data.total;
    $('.chart-stat .positive').textContent = data.change;
    $$('#revenue-bars > div').forEach((bar, index) => bar.querySelector('i').style.setProperty('--bar', `${data.bars[index]}%`));
    if (apexChart) {
      const labels = button.dataset.period === 'week' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : button.dataset.period === 'year' ? ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov', 'Dec'] : ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7'];
      apexChart.updateOptions({ xaxis: { categories: labels } });
      apexChart.updateSeries([
        { name: 'Revenue', data: data.bars.map((value) => value * 150) },
        { name: 'Orders', data: data.bars.map((value) => value * 19) }
      ]);
    }
  }));

  // Let visitors compare the exact same workspace at three device widths.
  const deviceFrame = $('#device-frame');
  $$('.device-controls button').forEach((button) => button.addEventListener('click', () => {
    deviceFrame.classList.remove('tablet-device', 'mobile-device');
    if (button.dataset.device !== 'desktop') deviceFrame.classList.add(`${button.dataset.device}-device`);
    $$('.device-controls button').forEach((item) => item.classList.toggle('active', item === button));
  }));

  const dropdown = $('#dropdown-menu');
  $('#demo-dropdown').addEventListener('click', (event) => {
    event.stopPropagation();
    dropdown.classList.toggle('open');
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('#demo-dropdown')) dropdown.classList.remove('open');
  });
  dropdown.addEventListener('click', (event) => {
    if (event.target.closest('a')) dropdown.classList.remove('open');
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    closeCustomizer();
  });

  const codeSamples = {
    html: '<section class="dashboard-card">\n  <header class="card-header">\n    <h2>Revenue overview</h2>\n    <span class="badge-success">+18.42%</span>\n  </header>\n  <div data-chart="revenue"></div>\n</section>',
    scss: '.dashboard-card {\n  padding: 1.25rem;\n  border: 1px solid $border-color;\n  border-radius: $border-radius-lg;\n  background: $surface;\n\n  .card-header {\n    display: flex;\n    justify-content: space-between;\n  }\n}',
    js: "const chart = document.querySelector('[data-chart=\\\"revenue\\\"]');\n\nif (chart) {\n  renderRevenueChart(chart, {\n    period: 'month',\n    interactive: true,\n  });\n}"
  };
  const codeContent = $('#code-content');
  const renderCode = (key) => {
    codeContent.replaceChildren(...codeSamples[key].split('\n').map((line, index) => {
      const row = document.createElement('span');
      const number = document.createElement('i');
      row.className = 'code-line';
      number.textContent = String(index + 1);
      row.append(number, document.createTextNode(line));
      return row;
    }));
    $$('.code-tabs button').forEach((tab) => tab.classList.toggle('selected', tab.dataset.code === key));
  };
  $$('.code-tabs button').forEach((button) => button.addEventListener('click', () => renderCode(button.dataset.code)));
  $('#copy-code').addEventListener('click', async (event) => {
    const activeKey = $('.code-tabs button.selected').dataset.code;
    const button = event.currentTarget;
    try {
      await navigator.clipboard.writeText(codeSamples[activeKey]);
      button.textContent = 'Copied';
    } catch {
      const range = document.createRange();
      range.selectNodeContents(codeContent);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      button.textContent = 'Select & copy';
    }
    window.setTimeout(() => { button.textContent = 'Copy code'; }, 1600);
  });

  const drawer = $('#customize-drawer');
  const drawerScrim = $('#drawer-scrim');
  const customizeTrigger = $('#customize-trigger');
  const closeCustomizer = () => {
    drawer.classList.remove('open');
    drawerScrim.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    customizeTrigger.setAttribute('aria-expanded', 'false');
  };
  customizeTrigger.addEventListener('click', () => {
    drawer.classList.add('open');
    drawerScrim.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    customizeTrigger.setAttribute('aria-expanded', 'true');
    $('#customize-close').focus();
  });
  $('#customize-close').addEventListener('click', closeCustomizer);
  drawerScrim.addEventListener('click', closeCustomizer);
  $$('.customize-options button').forEach((button) => button.addEventListener('click', () => {
    const { customize, value } = button.dataset;
    $$('.customize-options button').filter((item) => item.dataset.customize === customize)
      .forEach((item) => item.classList.toggle('selected', item === button));
    if (customize === 'theme') setTheme(value);
    if (customize === 'direction') {
      previewSettings.direction = value;
      applyProjectSettings();
    }
    if (customize === 'layout') {
      previewSettings.layout = value;
      applyProjectSettings();
    }
    if (customize === 'menu-surface') {
      previewSettings.menuSurface = value;
      applyProjectSettings();
    }
    if (customize === 'header-surface') {
      previewSettings.headerSurface = value;
      applyProjectSettings();
    }
    if (customize === 'header-position') {
      previewSettings.headerPosition = value;
      applyProjectSettings();
    }
  }));
  $('#customize-reset').addEventListener('click', () => {
    previewSettings.direction = 'ltr';
    previewSettings.layout = 'default';
    previewSettings.menuSurface = 'dark';
    previewSettings.headerSurface = 'light';
    previewSettings.headerPosition = 'fixed';
    setTheme(storedTheme === 'dark' ? 'dark' : 'light');
    const defaults = {
      theme: storedTheme === 'dark' ? 'dark' : 'light',
      direction: 'ltr',
      layout: 'default',
      'menu-surface': 'dark',
      'header-surface': 'light',
      'header-position': 'fixed'
    };
    $$('.customize-options button').forEach((button) => button.classList.toggle('selected', button.dataset.value === defaults[button.dataset.customize]));
  });

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
