(function () {
  'use strict';
  function initializeScatterCharts() {
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
    // Shared options keep spacing, typography and axes consistent.
    function baseOptions() {
      return {
        chart: {
          type: 'scatter',
          height: 340,
          fontFamily: 'inherit',
          foreColor: resolveColor('var(--theme-text-muted)'),
          toolbar: { show: false },
          animations: {
            enabled: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
          },
        },
        colors: palette(),
        series: [],
        plotOptions: { bar: { horizontal: false, columnWidth: '48%', borderRadius: 3 } },
        dataLabels: { enabled: false },
        stroke: { show: true, width: 2, colors: ['transparent'] },
        xaxis: {
          categories: [],
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

    // Use deterministic sample pairs so the same observations appear after refresh.
    const design = [
      [12, 8],
      [18, 12],
      [24, 18],
      [30, 20],
      [36, 26],
      [42, 30],
    ];
    const engineering = [
      [16, 10],
      [22, 16],
      [28, 22],
      [34, 24],
      [40, 32],
      [46, 36],
    ];
    function configureScatter(options, series, xTitle, yTitle) {
      options.series = series;
      options.xaxis = {
        type: 'numeric',
        title: { text: xTitle },
        tickAmount: 5,
        labels: { formatter: (value) => Math.round(value) },
      };
      options.yaxis = {
        title: { text: yTitle },
        labels: { formatter: (value) => Math.round(value) },
      };
      options.markers = { size: 5, strokeWidth: 1, hover: { size: 7 } };
      options.stroke = { width: 0 };
      options.chart.zoom = { enabled: true, type: 'xy' };
      options.chart.toolbar.show = false;
      options.tooltip = {
        theme: tooltipTheme(),
        shared: false,
        intersect: true,
        x: { formatter: (value) => value + ' ' + xTitle.toLowerCase() },
        y: { formatter: (value) => value + ' ' + yTitle.toLowerCase() },
      };
    }
    createChart('scatter-basic', (options) =>
      configureScatter(
        options,
        [
          { name: 'Design', data: design },
          { name: 'Engineering', data: engineering },
        ],
        'Hours',
        'Completed tasks'
      )
    );
    createChart('scatter-datetime', (options) => {
      const start = Date.UTC(2026, 8, 1);
      const observations = (offset) =>
        Array.from({ length: 14 }, (_, index) => [
          start + index * 86400000,
          8 + offset + (index % 5) * 2,
        ]);
      configureScatter(
        options,
        [
          { name: 'Priority queue', data: observations(0) },
          { name: 'Standard queue', data: observations(7) },
        ],
        'Reporting date',
        'Response minutes'
      );
      options.xaxis = {
        type: 'datetime',
        labels: { datetimeUTC: true, format: 'dd MMM' },
      };
      options.tooltip.x = { format: 'dd MMM yyyy' };
    });
    createChart('scatter-image', (options) => {
      configureScatter(
        options,
        [
          { name: 'Workspace', data: design },
          { name: 'Portal', data: engineering },
        ],
        'Hours',
        'Completed tasks'
      );
      options.fill = {
        type: 'image',
        opacity: 1,
        image: {
          src: [
            '../assets/images/cards/1.jpg',
            '../assets/images/cards/2.jpg',
          ],
          width: 24,
          height: 24,
        },
      };
      options.markers = { size: 12, strokeWidth: 1, hover: { size: 14 } };
    });
    createChart('scatter-priority', (options) => {
      configureScatter(
        options,
        [
          {
            name: 'Product',
            data: [
              [18, 72],
              [32, 88],
              [46, 64],
              [58, 92],
            ],
          },
          {
            name: 'Operations',
            data: [
              [14, 44],
              [36, 56],
              [54, 48],
              [72, 58],
            ],
          },
        ],
        'Effort (hours)',
        'Impact score'
      );
      options.xaxis.min = 0;
      options.xaxis.max = 100;
      options.yaxis.min = 0;
      options.yaxis.max = 100;
      options.annotations = {
        xaxis: [
          {
            x: 50,
            borderColor: resolveColor('var(--theme-text-muted)'),
            label: { text: 'Effort midpoint' },
          },
        ],
        yaxis: [
          {
            y: 60,
            borderColor: resolveColor('var(--theme-text-muted)'),
            label: { text: 'Impact threshold' },
          },
        ],
      };
    });
    createChart('scatter-trend', (options) => {
      configureScatter(
        options,
        [
          {
            name: 'Observations',
            type: 'scatter',
            data: [
              [10, 8],
              [15, 10],
              [20, 16],
              [25, 18],
              [30, 25],
              [35, 26],
              [40, 33],
              [45, 34],
            ],
          },
          {
            name: 'Reference trend',
            type: 'line',
            data: [
              [10, 7],
              [45, 35],
            ],
          },
        ],
        'Hours',
        'Completed tasks'
      );
      options.stroke = { width: [0, 2], curve: 'straight', dashArray: [0, 5] };
      options.markers = { size: [5, 0] };
    });
    const outlierChart = createChart('scatter-outliers', (options) => {
      configureScatter(
        options,
        [
          {
            name: 'Typical observations',
            data: [
              [12, 2],
              [18, 3],
              [24, 2],
              [30, 4],
              [36, 3],
              [42, 5],
            ],
          },
          {
            name: 'High defect counts',
            data: [
              [24, 12],
              [38, 15],
              [46, 11],
            ],
          },
        ],
        'Reviewed tasks',
        'Defects'
      );
      options.colors = [palette()[0], resolveColor('rgb(var(--theme-danger-rgb))')];
    });
    // Update theme colors without resetting observations or zoom ranges.
    let themeTimer;
    new MutationObserver(() => {
      clearTimeout(themeTimer);
      themeTimer = setTimeout(
        () =>
          charts.forEach((chart) =>
            chart.updateOptions(
              {
                colors:
                  chart === outlierChart
                    ? [palette()[0], resolveColor('rgb(var(--theme-danger-rgb))')]
                    : palette(),
                chart: { foreColor: resolveColor('var(--theme-text-muted)') },
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
    document.addEventListener('DOMContentLoaded', initializeScatterCharts, {
      once: true,
    });
  else initializeScatterCharts();
})();
