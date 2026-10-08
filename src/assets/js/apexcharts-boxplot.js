(function () {
  'use strict';
  function initializeBoxplotCharts() {
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
          type: 'boxPlot',
          height: 320,
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

    // Boxplot values are ordered: minimum, Q1, median, Q3, maximum.
    function box(name, values) {
      return { x: name, y: values };
    }
    function boxColors() {
      return {
        upper: resolveColor('rgb(var(--theme-secondary-rgb))'),
        lower: resolveColor('rgb(var(--theme-info-rgb))'),
      };
    }
    function configureBoxes(options, series, unit) {
      options.series = series;
      options.xaxis = {
        type: 'category',
        axisBorder: { show: false },
        axisTicks: { show: false },
      };
      options.plotOptions = {
        boxPlot: { colors: boxColors() },
        bar: { horizontal: false, columnWidth: '45%' },
      };
      options.stroke = { width: 1, colors: [resolveColor('var(--theme-text-muted)')] };
      options.yaxis = {
        title: { text: unit },
        labels: { formatter: (value) => Number(value).toFixed(0) },
      };
      options.tooltip.shared = false;
    }
    createChart('boxplot-basic', (options) =>
      configureBoxes(
        options,
        [
          {
            name: 'Delivery time',
            data: [
              box('Workspace', [2, 4, 6, 8, 12]),
              box('Portal', [3, 5, 7, 10, 14]),
              box('Billing', [1, 3, 4, 6, 9]),
              box('Analytics', [4, 6, 8, 12, 16]),
            ],
          },
        ],
        'Days'
      )
    );
    createChart('boxplot-scatter', (options) => {
      configureBoxes(
        options,
        [
          {
            name: 'Response range',
            type: 'boxPlot',
            data: [
              box('Mon', [4, 8, 12, 16, 22]),
              box('Tue', [5, 9, 13, 18, 24]),
              box('Wed', [3, 6, 10, 14, 20]),
              box('Thu', [4, 7, 11, 15, 21]),
              box('Fri', [5, 10, 14, 20, 26]),
            ],
          },
          {
            name: 'Outliers',
            type: 'scatter',
            data: [
              { x: 'Mon', y: 30 },
              { x: 'Wed', y: 28 },
              { x: 'Fri', y: 36 },
            ],
          },
        ],
        'Minutes'
      );
      options.colors = [palette()[0], resolveColor('rgb(var(--theme-danger-rgb))')];
      options.markers = { size: 5 };
    });
    function horizontalBoxColors() {
      return {
        upper: resolveColor('rgb(var(--theme-success-rgb))'),
        lower: resolveColor('rgb(var(--theme-warning-rgb))'),
      };
    }
    const horizontalChart = createChart('boxplot-horizontal', (options) => {
      configureBoxes(
        options,
        [
          {
            name: 'Effort range',
            data: [
              box('Design', [6, 10, 14, 18, 24]),
              box('Engineering', [12, 18, 24, 32, 42]),
              box('Quality', [4, 8, 10, 14, 20]),
              box('Operations', [3, 5, 8, 12, 16]),
            ],
          },
        ],
        'Hours'
      );
      options.plotOptions.boxPlot.colors = horizontalBoxColors();
      options.plotOptions.bar.horizontal = true;
      options.xaxis.title = { text: 'Hours' };
      delete options.yaxis.title;
      options.yaxis.labels = { maxWidth: 120 };
    });
    createChart('boxplot-teams', (options) =>
      configureBoxes(
        options,
        [
          {
            name: 'Team A',
            data: [
              box('Sprint 1', [2, 4, 5, 7, 10]),
              box('Sprint 2', [2, 3, 4, 6, 8]),
              box('Sprint 3', [1, 3, 4, 5, 7]),
            ],
          },
          {
            name: 'Team B',
            data: [
              box('Sprint 1', [3, 5, 7, 9, 12]),
              box('Sprint 2', [2, 4, 6, 8, 10]),
              box('Sprint 3', [2, 4, 5, 7, 9]),
            ],
          },
        ],
        'Days'
      )
    );
    createChart('boxplot-weekly', (options) => {
      configureBoxes(
        options,
        [
          {
            name: 'Cycle time',
            data: Array.from({ length: 6 }, (_, index) => ({
              x: Date.UTC(2026, 8, 7 + index * 7),
              y: [1, 3, 5, 7, 10].map((value) => value + (index % 3)),
            })),
          },
        ],
        'Days'
      );
      options.xaxis = {
        type: 'datetime',
        labels: { datetimeUTC: true, format: 'dd MMM' },
      };
      options.chart.zoom = { enabled: true, type: 'x', autoScaleYaxis: true };
      options.chart.toolbar.show = false;
    });
    function reviewBoxColors() {
      return {
        upper: resolveColor('rgb(var(--theme-secondary-rgb))'),
        lower: resolveColor('rgb(var(--theme-success-rgb))'),
      };
    }
    const reviewChart = createChart('boxplot-target', (options) => {
      configureBoxes(
        options,
        [
          {
            name: 'Review turnaround',
            data: [
              box('Design', [2, 4, 6, 9, 14]),
              box('Code', [3, 6, 8, 12, 18]),
              box('Content', [1, 3, 5, 7, 10]),
              box('Release', [2, 5, 7, 10, 15]),
            ],
          },
        ],
        'Hours'
      );
      options.plotOptions.boxPlot.colors = reviewBoxColors();
      options.annotations = {
        yaxis: [
          {
            y: 8,
            borderColor: resolveColor('rgb(var(--theme-success-rgb))'),
            label: {
              text: 'Target: 8 hours',
              style: {
                background: resolveColor('rgb(var(--theme-success-rgb))'),
                color: '#fff',
              },
            },
          },
        ],
      };
    });
    // Keep the upper and lower box fills aligned with the project theme.
    let themeTimer;
    new MutationObserver(() => {
      clearTimeout(themeTimer);
      themeTimer = setTimeout(
        () =>
          charts.forEach((chart) =>
            chart.updateOptions(
              {
                plotOptions: {
                  boxPlot: {
                    colors:
                      chart === horizontalChart
                        ? horizontalBoxColors()
                        : chart === reviewChart
                        ? reviewBoxColors()
                        : boxColors(),
                  },
                },
                chart: { foreColor: resolveColor('var(--theme-text-muted)') },
                stroke: { colors: [resolveColor('var(--theme-text-muted)')] },
                grid: { borderColor: resolveColor('var(--theme-default-border)') },
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
    document.addEventListener('DOMContentLoaded', initializeBoxplotCharts, {
      once: true,
    });
  else initializeBoxplotCharts();
})();
