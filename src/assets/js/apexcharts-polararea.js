(function () {
  'use strict';
  function initializePolarAreaCharts() {
    if (typeof ApexCharts === 'undefined') return;
    const root = document.documentElement;
    const charts = [];
    // Resolve theme colors to hex values before passing them to ApexCharts.
    function resolveColor(token) {
      const probe = document.createElement('span');
      probe.style.color = token;
      probe.style.display = 'none';
      document.body.append(probe);
      const values = getComputedStyle(probe).color.match(/[\d.]+/g);
      probe.remove();
      return values?.length >= 3
        ? '#' +
            values
              .slice(0, 3)
              .map((value) => Math.round(Number(value)).toString(16).padStart(2, '0'))
              .join('')
        : '#5e78fd';
    }
    function palette() {
      return [
        '--theme-secondary-rgb',
        '--theme-info-rgb',
        '--theme-success-rgb',
        '--theme-warning-rgb',
        '--theme-danger-rgb',
      ].map((token) => resolveColor('rgb(var(' + token + '))'));
    }
    function tooltipTheme() {
      return root.getAttribute('data-theme-color') === 'dark' ? 'dark' : 'light';
    }

    // Equal-angle sectors use their radius to compare sample values.
    function baseOptions() {
      return {
        chart: {
          type: 'polarArea',
          height: 360,
          fontFamily: 'inherit',
          foreColor: resolveColor('var(--theme-text-muted)'),
          toolbar: { show: false },
          animations: {
            enabled: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
          },
        },
        colors: palette(),
        series: [42, 32, 24, 18, 14],
        labels: ['Engineering', 'Design', 'Quality', 'Operations', 'Research'],
        fill: { opacity: 0.8 },
        stroke: { width: 2, colors: [resolveColor('var(--theme-custom-white)')] },
        plotOptions: {
          polarArea: {
            rings: { strokeWidth: 1, strokeColor: resolveColor('var(--theme-default-border)') },
            spokes: {
              strokeWidth: 1,
              connectorColors: resolveColor('var(--theme-default-border)'),
            },
          },
        },
        legend: { position: 'bottom', fontSize: '12px' },
        dataLabels: { enabled: false },
        tooltip: { theme: tooltipTheme(), y: { formatter: (value) => value + ' hours' } },
        responsive: [
          {
            breakpoint: 576,
            options: { chart: { height: 310 }, legend: { fontSize: '11px' } },
          },
        ],
      };
    }
    function createChart(id, configure) {
      const element = document.getElementById(id);
      if (!element) return null;
      const options = baseOptions();
      if (configure) configure(options);
      const chart = new ApexCharts(element, options);
      charts.push(chart);
      chart.render();
      return chart;
    }
    createChart('polararea-basic');
    const monochromeChart = createChart('polararea-monochrome', (options) => {
      options.series = [38, 32, 24, 18, 12];
      options.labels = ['Search', 'Direct', 'Referral', 'Email', 'Social'];
      options.theme = {
        monochrome: {
          enabled: true,
          color: palette()[0],
          shadeTo: 'light',
          shadeIntensity: 0.65,
        },
      };
      options.tooltip.y.formatter = (value) => value + ' reach score';
    });
    createChart('polararea-capacity', (options) => {
      options.series = [36, 44, 28, 24, 20];
      options.labels = ['Design', 'Engineering', 'Quality', 'Operations', 'Support'];
    });
    createChart('polararea-gradient', (options) => {
      options.series = [92, 78, 86, 64, 72];
      options.labels = ['Workspace', 'Portal', 'Billing', 'Analytics', 'Mobile'];
      options.fill = {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'vertical',
          opacityFrom: 0.9,
          opacityTo: 0.5,
          stops: [0, 100],
        },
      };
      options.yaxis = { min: 0, max: 100 };
      options.tooltip.y.formatter = (value) => value + ' / 100';
    });
    const qualityChart = createChart('polararea-minimal', (options) => {
      options.series = [92, 78, 86, 74, 88];
      options.labels = [
        'Unit tests',
        'Integration',
        'Accessibility',
        'Performance',
        'Security',
      ];
      options.fill = { type: 'solid', opacity: 0.65 };
      options.stroke = { width: 2, colors: palette() };
      options.yaxis = { min: 0, max: 100 };
      options.tooltip.y.formatter = (value) => value + '% covered';
    });
    const assessments = { baseline: [62, 70, 48, 64, 58], current: [82, 90, 72, 86, 78] };
    const interactiveChart = createChart('polararea-interactive', (options) => {
      options.series = assessments.current;
      options.labels = ['Scope', 'Design', 'Build', 'Quality', 'Delivery'];
      options.yaxis = { min: 0, max: 100 };
      options.tooltip.y.formatter = (value) => value + ' / 100';
    });
    document.querySelectorAll('[data-polar-period]').forEach((button) =>
      button.addEventListener('click', () => {
        const period = button.dataset.polarPeriod;
        if (!interactiveChart || !assessments[period]) return;
        interactiveChart.updateSeries(assessments[period]);
        document.querySelectorAll('[data-polar-period]').forEach((control) => {
          const active = control === button;
          control.setAttribute('aria-pressed', String(active));
          control.classList.toggle('btn-secondary', active);
          control.classList.toggle('btn-light', !active);
        });
      })
    );
    // Preserve the selected values while refreshing the project theme.
    let themeTimer;
    new MutationObserver(() => {
      clearTimeout(themeTimer);
      themeTimer = setTimeout(
        () =>
          charts.forEach((chart) =>
            chart.updateOptions(
              {
                colors: palette(),
                ...(chart === qualityChart ? { stroke: { colors: palette() } } : {}),
                ...(chart === monochromeChart
                  ? { theme: { monochrome: { color: palette()[0] } } }
                  : {}),
                chart: { foreColor: resolveColor('var(--theme-text-muted)') },
                plotOptions: {
                  polarArea: {
                    rings: { strokeColor: resolveColor('var(--theme-default-border)') },
                    spokes: { connectorColors: resolveColor('var(--theme-default-border)') },
                  },
                },
                tooltip: { theme: tooltipTheme() },
              },
              false,
              false,
              false
            )
          ),
        100
      );
    }).observe(root, { attributes: true, attributeFilter: ['data-theme-color', 'style'] });
  }
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', initializePolarAreaCharts, {
      once: true,
    });
  else initializePolarAreaCharts();
})();
