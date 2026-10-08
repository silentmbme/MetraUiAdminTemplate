(function () {
  'use strict';
  function initializeBarCharts() {
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
          type: 'bar',
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
        plotOptions: { bar: { horizontal: true, barHeight: '52%', borderRadius: 3 } },
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
            options: { chart: { height: 300 }, legend: { position: 'bottom' } },
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

    const projects = [
      'Workspace',
      'Customer portal',
      'Billing',
      'Analytics',
      'Mobile app',
    ];
    function projectAxis(options) {
      options.xaxis.categories = projects;
      options.yaxis = { labels: { maxWidth: 130 } };
    }
    createChart('bar-basic', (options) => {
      projectAxis(options);
      options.series = [{ name: 'Completion (%)', data: [78, 64, 92, 56, 83] }];
      options.xaxis.max = 100;
    });
    createChart('bar-group', (options) => {
      projectAxis(options);
      options.series = [
        { name: 'Design', data: [18, 24, 22, 30, 26] },
        { name: 'Engineering', data: [26, 30, 28, 36, 32] },
      ];
    });
    createChart('bar-stacked', (options) => {
      projectAxis(options);
      options.chart.stacked = true;
      options.plotOptions.bar.borderRadius = 0;
      options.series = [
        { name: 'Discovery', data: [12, 8, 10, 14, 6] },
        { name: 'Build', data: [24, 32, 28, 36, 30] },
        { name: 'Review', data: [8, 12, 10, 6, 14] },
      ];
    });
    createChart('bar-full', (options) => {
      projectAxis(options);
      options.chart.stacked = true;
      options.chart.stackType = '100%';
      options.plotOptions.bar.borderRadius = 0;
      options.series = [
        { name: 'Design', data: [18, 24, 22, 30, 26] },
        { name: 'Engineering', data: [26, 30, 28, 36, 32] },
        { name: 'Quality', data: [10, 14, 12, 18, 16] },
      ];
      options.xaxis.labels = { formatter: (value) => Math.round(value) + '%' };
    });
    function varianceColors() {
      return {
        ranges: [
          {
            from: -Number.MAX_VALUE,
            to: -Number.MIN_VALUE,
            color: resolveColor('rgb(var(--theme-danger-rgb))'),
          },
          {
            from: 0,
            to: Number.MAX_VALUE,
            color: resolveColor('rgb(var(--theme-success-rgb))'),
          },
        ],
      };
    }
    const varianceChart = createChart('bar-negative', (options) => {
      projectAxis(options);
      options.series = [{ name: 'Variance', data: [-12, 8, -6, 18, 10] }];
      options.plotOptions.bar.colors = varianceColors();
      options.annotations = {
        xaxis: [
          { x: 0, borderColor: resolveColor('var(--theme-text-muted)'), strokeDashArray: 0 },
        ],
      };
    });
    createChart('bar-markers', (options) => {
      options.xaxis = { axisBorder: { show: false }, axisTicks: { show: false } };
      options.yaxis = { labels: { maxWidth: 130 } };
      options.series = [
        {
          name: 'Completed tasks',
          data: projects.map((project, index) => ({
            x: project,
            y: [24, 32, 28, 36, 30][index],
            goals: [
              {
                name: 'Target',
                value: 35,
                strokeHeight: 2,
                strokeWidth: 5,
                strokeColor: palette()[1],
              },
            ],
          })),
        },
      ];
    });
    createChart('bar-reversed', (options) => {
      projectAxis(options);
      options.yaxis.reversed = true;
      options.series = [{ name: 'Hours remaining', data: [18, 32, 8, 44, 17] }];
    });
    createChart('bar-categories', (options) => {
      projectAxis(options);
      options.series = [{ name: 'Completed tasks', data: [24, 32, 28, 36, 30] }];
      options.plotOptions.bar.dataLabels = { position: 'center' };
      options.dataLabels = {
        enabled: true,
        textAnchor: 'start',
        offsetX: 10,
        formatter: (value, context) => projects[context.dataPointIndex] + ': ' + value,
        style: { colors: ['#fff'], fontSize: '11px' },
      };
      options.yaxis.labels.show = false;
      options.colors = ['#32d484'];
    });
    createChart('bar-pattern', (options) => {
      projectAxis(options);
      options.series = [
        { name: 'Design', data: [18, 24, 22, 30, 26] },
        { name: 'Engineering', data: [26, 30, 28, 36, 32] },
      ];
      options.fill = {
        type: 'pattern',
        pattern: {
          style: ['slantedLines', 'circles'],
          width: 6,
          height: 6,
          strokeWidth: 2,
        },
      };
    });
    createChart('bar-image', (options) => {
      projectAxis(options);
      options.series = [{ name: 'Completion (%)', data: [78, 64, 92, 56, 83] }];
      options.xaxis.max = 100;
      options.fill = {
        type: 'image',
        image: { src: ['../assets/images/cards/1.jpg'], width: 600, height: 350 },
      };
      options.stroke.width = 0;
    });
    // Update colors while preserving the success/danger variance ranges.
    let themeTimer;
    new MutationObserver(() => {
      clearTimeout(themeTimer);
      themeTimer = setTimeout(
        () =>
          charts.forEach((chart) =>
            chart.updateOptions(
              {
                colors: palette(),
                ...(chart === varianceChart
                  ? { plotOptions: { bar: { colors: varianceColors() } } }
                  : {}),
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
    document.addEventListener('DOMContentLoaded', initializeBarCharts, { once: true });
  else initializeBarCharts();
})();
