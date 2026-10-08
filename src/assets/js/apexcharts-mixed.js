(function () {
  'use strict';
  function initializeMixedCharts() {
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
          type: 'line',
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

    const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
    const completed = [28, 35, 32, 44, 40, 52];
    const target = [30, 34, 38, 42, 46, 50];
    function configureMixed(options, series) {
      options.series = series;
      options.xaxis.categories = months;
      options.stroke = {
        width: series.map((item) => (item.type === 'column' ? 0 : 3)),
        curve: 'smooth',
      };
      options.fill = { opacity: series.map((item) => (item.type === 'area' ? 0.2 : 1)) };
      options.tooltip.shared = true;
      options.tooltip.intersect = false;
    }
    createChart('mixed-linecolumn', (options) =>
      configureMixed(options, [
        { name: 'Completed tasks', type: 'column', data: completed },
        { name: 'Target', type: 'line', data: target },
      ])
    );
    createChart('mixed-multiple-y', (options) => {
      configureMixed(options, [
        { name: 'Logged hours', type: 'column', data: [120, 145, 132, 160, 152, 180] },
        { name: 'Completion rate', type: 'line', data: [58, 64, 68, 74, 79, 86] },
      ]);
      options.yaxis = [
        {
          seriesName: 'Logged hours',
          title: { text: 'Hours' },
          labels: { formatter: (value) => Math.round(value) },
        },
        {
          seriesName: 'Completion rate',
          opposite: true,
          min: 0,
          max: 100,
          title: { text: 'Completion (%)' },
          labels: { formatter: (value) => Math.round(value) + '%' },
        },
      ];
    });
    createChart('mixed-linearea', (options) =>
      configureMixed(options, [
        { name: 'Planned tasks', type: 'area', data: [32, 38, 40, 48, 48, 56] },
        { name: 'Completed tasks', type: 'line', data: completed },
      ])
    );
    createChart('mixed-all', (options) =>
      configureMixed(options, [
        { name: 'Completed tasks', type: 'column', data: completed },
        { name: 'Capacity', type: 'area', data: [36, 40, 44, 50, 54, 60] },
        { name: 'Target', type: 'line', data: target },
      ])
    );
    // Only the column series are stacked; the target line remains independent.
    createChart('mixed-stacked', (options) => {
      configureMixed(options, [
        { name: 'Design', type: 'column', data: [12, 16, 14, 20, 18, 24] },
        { name: 'Engineering', type: 'column', data: [16, 19, 18, 24, 22, 28] },
        { name: 'Target', type: 'line', data: target },
      ]);
      options.chart.stacked = true;
      options.chart.stackOnlyBar = true;
      options.plotOptions.bar.borderRadius = 0;
    });
    function budgetColors() {
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
    const budgetChart = createChart('mixed-budget', (options) => {
      configureMixed(options, [
        { name: 'Budget variance', type: 'column', data: [-12, 8, -6, 18, 10, -4] },
        { name: 'Spending', type: 'line', data: [82, 90, 86, 98, 94, 102] },
      ]);
      options.plotOptions.bar.colors = budgetColors();
      options.yaxis = [
        {
          seriesName: 'Budget variance',
          title: { text: 'Variance ($k)' },
          labels: { formatter: (value) => Math.round(value) },
        },
        {
          seriesName: 'Spending',
          opposite: true,
          min: 0,
          title: { text: 'Spending ($k)' },
          labels: { formatter: (value) => Math.round(value) },
        },
      ];
    });
    // Refresh theme colors without changing series types or values.
    let themeTimer;
    new MutationObserver(() => {
      clearTimeout(themeTimer);
      themeTimer = setTimeout(
        () =>
          charts.forEach((chart) =>
            chart.updateOptions(
              {
                colors: palette(),
                ...(chart === budgetChart
                  ? { plotOptions: { bar: { colors: budgetColors() } } }
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
    document.addEventListener('DOMContentLoaded', initializeMixedCharts, { once: true });
  else initializeMixedCharts();
})();
