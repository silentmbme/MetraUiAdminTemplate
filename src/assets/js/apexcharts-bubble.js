(function () {
  'use strict';
  function initializeBubbleCharts() {
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
          type: 'bubble',
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

    // Bubble points use x, y and z; z determines their relative size.
    const portfolio = [
      {
        name: 'Product',
        data: [
          [18, 72, 12],
          [32, 88, 18],
          [46, 64, 10],
          [58, 92, 24],
        ],
      },
      {
        name: 'Platform',
        data: [
          [26, 60, 16],
          [42, 78, 22],
          [68, 82, 28],
          [78, 68, 20],
        ],
      },
      {
        name: 'Operations',
        data: [
          [14, 44, 8],
          [36, 56, 14],
          [54, 48, 12],
          [72, 58, 18],
        ],
      },
    ];
    function configureBubbles(options, series, xTitle, yTitle, sizeTitle) {
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
      options.plotOptions = {
        bubble: { minBubbleRadius: 5, maxBubbleRadius: 24, zScaling: true },
      };
      options.fill = { opacity: 0.7 };
      options.stroke = { width: 1, colors: [resolveColor('var(--theme-custom-white)')] };
      options.chart.zoom = { enabled: true, type: 'xy' };
      options.chart.toolbar.show = false;
      options.tooltip = {
        theme: tooltipTheme(),
        custom: ({ seriesIndex, dataPointIndex, w }) => {
          const point = w.config.series[seriesIndex].data[dataPointIndex];
          if (!point) return '';
          const date = options.xaxis.type === 'datetime';
          const xValue = date
            ? new Date(point[0]).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                timeZone: 'UTC',
              })
            : point[0];
          return (
            '<div class="p-2 fs-12"><strong>' +
            w.config.series[seriesIndex].name +
            '</strong><br>' +
            xTitle +
            ': ' +
            xValue +
            '<br>' +
            yTitle +
            ': ' +
            point[1] +
            '<br>' +
            sizeTitle +
            ': ' +
            point[2] +
            '</div>'
          );
        },
      };
    }
    createChart('bubble-simple', (options) =>
      configureBubbles(
        options,
        portfolio,
        'Effort (hours)',
        'Impact score',
        'Team capacity'
      )
    );
    createChart('bubble-3d', (options) => {
      configureBubbles(
        options,
        [
          {
            name: 'Core projects',
            data: [
              [20, 60, 18],
              [35, 82, 28],
              [55, 72, 36],
              [70, 90, 44],
            ],
          },
          {
            name: 'Growth projects',
            data: [
              [15, 48, 12],
              [30, 68, 20],
              [48, 88, 32],
              [64, 76, 26],
            ],
          },
        ],
        'Investment ($k)',
        'Value score',
        'Reach score'
      );
      options.fill = {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'vertical',
          shadeIntensity: 0.35,
          opacityFrom: 0.9,
          opacityTo: 0.5,
          stops: [0, 70, 100],
        },
      };
    });
    createChart('bubble-risk', (options) => {
      configureBubbles(
        options,
        [
          {
            name: 'Delivery',
            data: [
              [18, 40, 16],
              [34, 72, 24],
              [48, 86, 30],
              [68, 64, 22],
            ],
          },
          {
            name: 'Research',
            data: [
              [26, 58, 12],
              [52, 92, 18],
              [74, 80, 28],
            ],
          },
        ],
        'Risk score',
        'Opportunity score',
        'Budget ($k)'
      );
      options.xaxis.min = 0;
      options.xaxis.max = 100;
      options.yaxis.min = 0;
      options.yaxis.max = 100;
    });
    createChart('bubble-capacity', (options) =>
      configureBubbles(
        options,
        [
          {
            name: 'Design',
            data: [
              [24, 16, 4],
              [32, 22, 6],
              [40, 28, 8],
            ],
          },
          {
            name: 'Engineering',
            data: [
              [28, 20, 6],
              [36, 28, 8],
              [44, 34, 10],
            ],
          },
          {
            name: 'Quality',
            data: [
              [20, 18, 3],
              [30, 24, 5],
              [38, 30, 7],
            ],
          },
        ],
        'Available hours',
        'Tasks per week',
        'Team members'
      )
    );
    function deliveryColors() {
      return [
        resolveColor('rgb(var(--theme-primary-rgb))'),
        resolveColor('rgb(var(--theme-success-rgb))'),
      ];
    }
    const deliveryChart = createChart('bubble-timeline', (options) => {
      const start = Date.UTC(2026, 8, 1);
      const weekly = (offset) =>
        Array.from({ length: 6 }, (_, index) => [
          start + index * 7 * 86400000,
          50 + offset + index * 5,
          12 + offset + index * 3,
        ]);
      configureBubbles(
        options,
        [
          { name: 'Workspace', data: weekly(0) },
          { name: 'Customer portal', data: weekly(8) },
        ],
        'Reporting date',
        'Completion (%)',
        'Completed tasks'
      );
      options.colors = deliveryColors();
      options.xaxis = {
        type: 'datetime',
        labels: { datetimeUTC: true, format: 'dd MMM' },
      };
      options.yaxis.max = 100;
    });
    createChart('bubble-priority', (options) => {
      configureBubbles(
        options,
        portfolio,
        'Effort (hours)',
        'Impact score',
        'Team capacity'
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
    // Update bubble colors when the project theme changes.
    let themeTimer;
    new MutationObserver(() => {
      clearTimeout(themeTimer);
      themeTimer = setTimeout(
        () =>
          charts.forEach((chart) =>
            chart.updateOptions(
              {
                colors: chart === deliveryChart ? deliveryColors() : palette(),
                chart: { foreColor: resolveColor('var(--theme-text-muted)') },
                stroke: { colors: [resolveColor('var(--theme-custom-white)')] },
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
    document.addEventListener('DOMContentLoaded', initializeBubbleCharts, { once: true });
  else initializeBubbleCharts();
})();
