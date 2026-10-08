(function () {
  'use strict';
  function initializeColumnCharts() {
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
          height: 300,
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
    createChart('column-basic');
    createChart('column-datalabels', (options) => {
      options.series = workstreams().slice(0, 2);
      options.dataLabels = {
        enabled: true,
        offsetY: -16,
        style: { fontSize: '10px', colors: [resolveColor('var(--theme-default-text-color)')] },
      };
      options.plotOptions.bar.dataLabels = { position: 'top' };
      options.yaxis.max = 55;
    });
    createChart('column-stacked', (options) => {
      options.chart.stacked = true;
      options.series = workstreams();
      options.plotOptions.bar.borderRadius = 0;
    });
    createChart('column-stacked-full', (options) => {
      options.chart.stacked = true;
      options.chart.stackType = '100%';
      options.series = workstreams();
      options.plotOptions.bar.borderRadius = 0;
      options.yaxis = {
        min: 0,
        max: 100,
        labels: { formatter: (value) => Math.round(value) + '%' },
      };
    });
    createChart('column-markers', (options) => {
      options.xaxis = { axisBorder: { show: false }, axisTicks: { show: false } };
      options.series = [
        {
          name: 'Actual',
          data: weekdays.map((day, index) => ({
            x: day,
            y: design[index],
            goals: [
              {
                name: 'Target',
                value: 30,
                strokeWidth: 3,
                strokeHeight: 5,
                strokeColor: palette()[1],
              },
            ],
          })),
        },
      ];
    });
    createChart('column-rotated-labels', (options) => {
      options.xaxis.categories = [
        'Workspace redesign',
        'Customer portal',
        'Billing integration',
        'Analytics studio',
        'Mobile experience',
      ];
      options.xaxis.labels = {
        rotate: -35,
        rotateAlways: true,
        trim: false,
        maxHeight: 100,
      };
      options.series = [{ name: 'Progress (%)', data: [78, 64, 92, 56, 83] }];
      options.yaxis.max = 100;
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
    const varianceChart = createChart('column-negative', (options) => {
      options.plotOptions.bar.colors = varianceColors();
      options.series = [{ name: 'Variance', data: [-12, 8, -6, 18, 10, -4, 22] }];
      options.annotations = {
        yaxis: [
          { y: 0, borderColor: resolveColor('var(--theme-text-muted)'), strokeDashArray: 0 },
        ],
      };
    });
    createChart('column-range', (options) => {
      options.chart.type = 'rangeBar';
      options.xaxis = { type: 'category' };
      options.series = [
        {
          name: 'Estimated hours',
          data: [
            { x: 'Discovery', y: [4, 8] },
            { x: 'Design', y: [10, 18] },
            { x: 'Build', y: [24, 40] },
            { x: 'Review', y: [8, 14] },
            { x: 'Release', y: [4, 10] },
          ],
        },
      ];
      options.yaxis.title = { text: 'Hours' };
    });
    // Year selection works from chart clicks and keyboard-accessible buttons.
    const quarterlyData = {
      2024: [86, 98, 110, 126],
      2025: [112, 124, 142, 158],
      2026: [136, 158, 174, 192],
    };
    let quarterlyChart;
    function selectYear(year) {
      if (!quarterlyData[year] || !quarterlyChart) return;
      quarterlyChart.updateSeries([
        { name: 'Completed tasks', data: quarterlyData[year] },
      ]);
      const status = document.getElementById('column-year-status');
      if (status) status.textContent = year + ' quarterly delivery';
      document.querySelectorAll('[data-column-year]').forEach((button) => {
        const active = button.dataset.columnYear === year;
        button.setAttribute('aria-pressed', String(active));
        button.classList.toggle('btn-secondary', active);
        button.classList.toggle('btn-light', !active);
      });
    }
    createChart('chart-year', (options) => {
      options.chart.height = 180;
      options.responsive = [];
      options.xaxis.categories = Object.keys(quarterlyData);
      options.series = [
        {
          name: 'Annual tasks',
          data: Object.values(quarterlyData).map((values) =>
            values.reduce((sum, value) => sum + value, 0)
          ),
        },
      ];
      options.chart.events = {
        dataPointSelection: (event, context, config) => {
          const year = Object.keys(quarterlyData)[config.dataPointIndex];
          if (year) selectYear(year);
        },
      };
    });
    quarterlyChart = createChart('chart-quarter', (options) => {
      options.chart.height = 180;
      options.responsive = [];
      options.xaxis.categories = ['Q1', 'Q2', 'Q3', 'Q4'];
      options.series = [{ name: 'Completed tasks', data: quarterlyData['2026'] }];
    });
    document
      .querySelectorAll('[data-column-year]')
      .forEach((button) =>
        button.addEventListener('click', () => selectYear(button.dataset.columnYear))
      );
    createChart('columns-distributed', (options) => {
      options.plotOptions.bar.distributed = true;
      options.xaxis.categories = ['Scope', 'Design', 'Build', 'Review', 'Release'];
      options.series = [{ name: 'Completion (%)', data: [100, 92, 78, 64, 40] }];
      options.yaxis.max = 100;
      options.legend.show = false;
      options.dataLabels = { enabled: true, formatter: (value) => value + '%' };
    });
    // Refresh theme colors without replacing the current data selection.
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
    document.addEventListener('DOMContentLoaded', initializeColumnCharts, { once: true });
  else initializeColumnCharts();
})();
