(function () {
  'use strict';
  function initializeTreemapCharts() {
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
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const design = [18, 24, 22, 30, 26, 34, 38];
    const engineering = [26, 30, 28, 36, 32, 40, 44];
    const quality = [10, 14, 12, 18, 16, 20, 24];
    function workstreams() {
      return [
        { name: 'Design', data: design },
        { name: 'Engineering', data: engineering },
        { name: 'Quality', data: quality },
      ];
    }
    // Shared options keep spacing, typography and axes consistent.
    function baseOptions() {
      return {
        chart: {
          type: 'treemap',
          height: 340,
          fontFamily: 'inherit',
          foreColor: resolveColor('var(--theme-text-muted)'),
          toolbar: { show: false },
          animations: {
            enabled: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
          },
        },
        colors: palette(),
        series: [{ name: 'Completed tasks', data: design }],
        plotOptions: { bar: { horizontal: false, columnWidth: '48%', borderRadius: 3 } },
        dataLabels: { enabled: false },
        stroke: { show: true, width: 2, colors: ['transparent'] },
        xaxis: {
          categories: weekdays,
          axisBorder: { show: false },
          axisTicks: { show: false },
        },
        yaxis: { labels: { formatter: (value) => Number(value).toFixed(0) } },
        grid: { borderColor: resolveColor('var(--theme-default-border)'), strokeDashArray: 4 },
        legend: { position: 'top', horizontalAlign: 'right' },
        tooltip: { theme: tooltipTheme() },
        responsive: [
          {
            breakpoint: 576,
            options: { chart: { height: 260 }, legend: { position: 'bottom' } },
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

    function points(names, values) {
      return names.map((name, index) => ({ x: name, y: values[index] }));
    }
    function configureTreemap(options, series, unit) {
      options.series = series;
      options.plotOptions = { treemap: { enableShades: true, shadeIntensity: 0.35 } };
      options.stroke = { width: 3, colors: [resolveColor('var(--theme-custom-white)')] };
      options.legend = { show: false, position: 'bottom' };
      options.dataLabels = {
        enabled: true,
        style: { fontSize: '12px' },
        formatter: (label, context) => [
          label,
          context.value.toLocaleString('en-US') + unit,
        ],
        offsetY: -3,
      };
      options.tooltip = {
        theme: tooltipTheme(),
        y: { formatter: (value) => value.toLocaleString('en-US') + unit },
      };
      options.grid = { show: false };
      delete options.xaxis;
      delete options.yaxis;
    }
    createChart('treemap-basic', (options) =>
      configureTreemap(
        options,
        [
          {
            name: 'Planned work',
            data: points(
              ['Workspace', 'Portal', 'Billing', 'Analytics', 'Mobile', 'Support'],
              [160, 120, 95, 85, 70, 45]
            ),
          },
        ],
        ' hours'
      )
    );
    createChart('treemap-multi', (options) => {
      configureTreemap(
        options,
        [
          {
            name: 'Design',
            data: points(
              ['Research', 'Prototype', 'Interface', 'Review'],
              [48, 64, 80, 32]
            ),
          },
          {
            name: 'Engineering',
            data: points(
              ['Frontend', 'Backend', 'Integration', 'Testing'],
              [120, 96, 72, 64]
            ),
          },
        ],
        ' hours'
      );
      options.legend.show = true;
    });
    createChart('treemap-distributed', (options) => {
      configureTreemap(
        options,
        [
          {
            name: 'Resources',
            data: points(
              [
                'Development',
                'Design',
                'Quality',
                'Operations',
                'Research',
                'Documentation',
              ],
              [120, 85, 65, 48, 36, 28]
            ),
          },
        ],
        ' hours'
      );
      options.plotOptions.treemap.distributed = true;
      options.plotOptions.treemap.enableShades = false;
    });
    function varianceRanges() {
      return [
        { from: -30, to: -1, color: resolveColor('rgb(var(--theme-danger-rgb))') },
        { from: 0, to: 30, color: resolveColor('rgb(var(--theme-success-rgb))') },
      ];
    }
    const varianceChart = createChart('treemap-colorranges', (options) => {
      configureTreemap(
        options,
        [
          {
            name: 'Variance',
            data: points(
              ['Workspace', 'Portal', 'Billing', 'Analytics', 'Mobile', 'Support'],
              [18, -12, 24, -8, 10, -16]
            ),
          },
        ],
        ' tasks'
      );
      options.plotOptions.treemap.colorScale = { ranges: varianceRanges() };
      options.plotOptions.treemap.enableShades = false;
    });
    createChart('treemap-budget', (options) =>
      configureTreemap(
        options,
        [
          {
            name: 'Sample budget',
            data: points(
              [
                'Engineering',
                'Design',
                'Infrastructure',
                'Quality',
                'Research',
                'Operations',
              ],
              [42, 24, 18, 14, 10, 8]
            ),
          },
        ],
        ' $k'
      )
    );
    function readinessRanges() {
      return [
        { from: 0, to: 49, color: resolveColor('rgb(var(--theme-warning-rgb))') },
        { from: 50, to: 79, color: resolveColor('rgb(var(--theme-secondary-rgb))') },
        { from: 80, to: 100, color: resolveColor('rgb(var(--theme-success-rgb))') },
      ];
    }
    const readinessChart = createChart('treemap-completion', (options) => {
      configureTreemap(
        options,
        [
          {
            name: 'Completion',
            data: points(
              ['Scope', 'Design', 'Build', 'Review', 'Release'],
              [100, 92, 78, 64, 40]
            ),
          },
        ],
        '%'
      );
      options.plotOptions.treemap.enableShades = false;
      options.plotOptions.treemap.colorScale = { ranges: readinessRanges() };
    });
    let themeTimer;
    new MutationObserver(() => {
      clearTimeout(themeTimer);
      themeTimer = setTimeout(
        () =>
          charts.forEach((chart) => {
            const ranges =
              chart === varianceChart
                ? varianceRanges()
                : chart === readinessChart
                ? readinessRanges()
                : null;
            chart.updateOptions(
              {
                colors: palette(),
                ...(ranges
                  ? { plotOptions: { treemap: { colorScale: { ranges: ranges } } } }
                  : {}),
                chart: { foreColor: resolveColor('var(--theme-text-muted)') },
                stroke: { colors: [resolveColor('var(--theme-custom-white)')] },
                tooltip: { theme: tooltipTheme() },
              },
              false,
              false,
              false
            );
          }),
        100
      );
    }).observe(root, { attributes: true, attributeFilter: ['data-theme-color', 'style'] });
  }
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', initializeTreemapCharts, {
      once: true,
    });
  else initializeTreemapCharts();
})();
