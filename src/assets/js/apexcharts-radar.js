(function () {
  'use strict';
  function initializeRadarCharts() {
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

    const dimensions = ['Scope', 'Design', 'Build', 'Quality', 'Delivery', 'Support'];
    function polygonColors() {
      return {
        strokeColors: resolveColor('var(--theme-default-border)'),
        connectorColors: resolveColor('var(--theme-default-border)'),
        fill: {
          colors: [
            resolveColor('var(--theme-custom-white)'),
            resolveColor('var(--theme-default-background)'),
          ],
        },
      };
    }
    // Every assessment uses a 0?100 scale for fair comparisons.
    function baseOptions() {
      return {
        chart: {
          type: 'radar',
          height: 360,
          fontFamily: 'inherit',
          foreColor: resolveColor('var(--theme-text-muted)'),
          toolbar: { show: false },
          animations: {
            enabled: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
          },
        },
        colors: palette(),
        series: [{ name: 'Project score', data: [82, 90, 72, 86, 78, 68] }],
        xaxis: { categories: dimensions },
        yaxis: {
          min: 0,
          max: 100,
          tickAmount: 5,
          labels: { formatter: (value) => Math.round(value) },
        },
        stroke: { width: 2 },
        fill: { opacity: 0.18 },
        markers: { size: 3 },
        plotOptions: { radar: { polygons: polygonColors() } },
        legend: { position: 'bottom' },
        tooltip: { theme: tooltipTheme(), y: { formatter: (value) => value + ' / 100' } },
        responsive: [
          { breakpoint: 576, options: { chart: { height: 320 }, markers: { size: 2 } } },
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
    createChart('radar-basic');
    createChart('radar-multiple', (options) => {
      options.series = [
        { name: 'Design team', data: [88, 94, 62, 80, 76, 72] },
        { name: 'Engineering team', data: [78, 70, 92, 88, 84, 68] },
      ];
      options.colors = ['#5e78fd', '#32d484'];
    });
    createChart('radar-polygon', (options) => {
      options.series = [{ name: 'Readiness', data: [90, 86, 78, 92, 80, 74] }];
      options.plotOptions.radar.polygons.strokeWidth = 1;
      options.fill.opacity = 0.25;
      options.colors = ['#93f126'];
    });
    createChart('radar-target', (options) => {
      options.series = [
        { name: 'Current', data: [82, 90, 72, 86, 78, 68] },
        { name: 'Target', data: [90, 95, 90, 95, 90, 85] },
      ];
      options.stroke.dashArray = [0, 5];
      options.fill.opacity = [0.2, 0.04];
      options.markers.size = [3, 0];
    });
    const qualityChart = createChart('radar-minimal', (options) => {
      options.xaxis.categories = [
        'Unit tests',
        'Integration',
        'Accessibility',
        'Performance',
        'Security',
        'Regression',
      ];
      options.series = [{ name: 'Coverage', data: [92, 78, 86, 74, 88, 82] }];
      options.colors = [resolveColor('rgb(var(--theme-success-rgb))')];
      options.stroke = { width: 3, colors: options.colors };
      options.fill = { type: 'solid', opacity: 0.25, colors: options.colors };
      options.markers.size = 4;
    });
    const assessments = {
      baseline: [62, 70, 48, 64, 58, 52],
      current: [82, 90, 72, 86, 78, 68],
    };
    const interactiveChart = createChart('radar-interactive', (options) => {
      options.series = [{ name: 'Current assessment', data: assessments.current }];
      options.colors = ['#32d484'];
    });
    document.querySelectorAll('[data-radar-period]').forEach((button) =>
      button.addEventListener('click', () => {
        const period = button.dataset.radarPeriod;
        if (!interactiveChart || !assessments[period]) return;
        interactiveChart.updateSeries([
          {
            name: period === 'current' ? 'Current assessment' : 'Baseline assessment',
            data: assessments[period],
          },
        ]);
        document.querySelectorAll('[data-radar-period]').forEach((control) => {
          const active = control === button;
          control.setAttribute('aria-pressed', String(active));
          control.classList.toggle('btn-secondary', active);
          control.classList.toggle('btn-light', !active);
        });
      })
    );
    // Theme updates preserve the selected assessment.
    let themeTimer;
    new MutationObserver(() => {
      clearTimeout(themeTimer);
      themeTimer = setTimeout(
        () =>
          charts.forEach((chart) =>
            chart.updateOptions(
              {
                colors:
                  chart === qualityChart
                    ? [resolveColor('rgb(var(--theme-success-rgb))')]
                    : palette(),
                ...(chart === qualityChart
                  ? {
                      stroke: { colors: [resolveColor('rgb(var(--theme-success-rgb))')] },
                      fill: { colors: [resolveColor('rgb(var(--theme-success-rgb))')] },
                    }
                  : {}),
                chart: { foreColor: resolveColor('var(--theme-text-muted)') },
                plotOptions: { radar: { polygons: polygonColors() } },
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
    document.addEventListener('DOMContentLoaded', initializeRadarCharts, { once: true });
  else initializeRadarCharts();
})();
