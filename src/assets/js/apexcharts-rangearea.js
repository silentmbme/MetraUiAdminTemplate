(function () {
  'use strict';
  function initializeRangeAreaCharts() {
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
          type: 'rangeArea',
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
        stroke: { show: true, width: 3, colors: ['transparent'] },
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

    const periods = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
    const lower = [18, 22, 20, 28, 26, 32, 34, 38];
    const upper = [30, 36, 34, 44, 42, 50, 54, 60];
    function rangeData(low, high) {
      return periods.map((period, index) => ({
        x: period,
        y: [low[index], high[index]],
      }));
    }
    function configureRange(options, series) {
      options.series = series;
      options.xaxis = {
        type: 'category',
        axisBorder: { show: false },
        axisTicks: { show: false },
      };
      options.stroke = {
        curve: 'straight',
        width: series.map((item) => (item.type === 'line' ? 3 : 1)),
      };
      options.fill = { opacity: series.map((item) => (item.type === 'line' ? 1 : 0.2)) };
      options.tooltip.shared = false;
    }
    createChart('rangearea-basic', (options) =>
      configureRange(options, [
        { name: 'Estimated tasks', type: 'rangeArea', data: rangeData(lower, upper) },
      ])
    );
    createChart('rangearea-combo', (options) => {
      configureRange(options, [
        { name: 'Estimated tasks', type: 'rangeArea', data: rangeData(lower, upper) },
        {
          name: 'Completed tasks',
          type: 'line',
          data: periods.map((period, index) => ({
            x: period,
            y: [24, 30, 28, 36, 34, 42, 46, 50][index],
          })),
        },
      ]);
      options.markers = { size: [0, 3] };
      options.colors = ['#32d484', '#fdaf22'];
    });
    createChart('rangearea-teams', (options) => {
      configureRange(options, [
        {
          name: 'Design hours',
          type: 'rangeArea',
          data: rangeData(
            [12, 16, 14, 20, 18, 22, 24, 26],
            [22, 28, 24, 32, 30, 36, 38, 40]
          ),
        },
        {
          name: 'Engineering hours',
          type: 'rangeArea',
          data: rangeData(
            [26, 28, 30, 32, 34, 36, 38, 40],
            [38, 42, 44, 48, 50, 54, 56, 60]
          ),
        },
      ]);
      options.stroke.curve = 'smooth';
      options.yaxis.title = { text: 'Hours' };
    });
    createChart('rangearea-forecast', (options) => {
      configureRange(options, [
        {
          name: 'Forecast range',
          type: 'rangeArea',
          data: rangeData(
            [24, 30, 28, 36, 34, 32, 34, 38],
            [24, 30, 28, 36, 34, 50, 54, 60]
          ),
        },
        {
          name: 'Observed tasks',
          type: 'line',
          data: periods.map((period, index) => ({
            x: period,
            y: [24, 30, 28, 36, 34, null, null, null][index],
          })),
        },
      ]);
      options.xaxis.categories = periods;
      options.annotations = {
        xaxis: [
          {
            x: 'Sep',
            borderColor: palette()[0],
            label: {
              text: 'Forecast starts',
              style: { background: palette()[0], color: '#fff' },
            },
          },
        ],
      };
    });
    createChart('rangearea-step', (options) => {
      configureRange(options, [
        {
          name: 'Available hours',
          type: 'rangeArea',
          data: rangeData(
            [20, 20, 28, 28, 36, 36, 28, 28],
            [32, 32, 40, 40, 48, 48, 40, 40]
          ),
        },
      ]);
      options.stroke.curve = 'stepline';
      options.yaxis.title = { text: 'Hours' };
    });
    createChart('rangearea-datetime', (options) => {
      const start = Date.UTC(2026, 8, 1);
      const points = Array.from({ length: 30 }, (_, index) => {
        const minimum = 8 + Math.round(Math.sin(index / 3) * 3);
        return { x: start + index * 86400000, y: [minimum, minimum + 10 + (index % 5)] };
      });
      configureRange(options, [
        { name: 'Response time (minutes)', type: 'rangeArea', data: points },
      ]);
      options.xaxis.type = 'datetime';
      options.chart.zoom = { enabled: true, type: 'x', autoScaleYaxis: true };
      options.chart.toolbar.show = false;
      options.yaxis.title = { text: 'Minutes' };
      options.colors = ['#32d484'];
    });
    // Preserve range data while refreshing the project theme.
    let themeTimer;
    new MutationObserver(() => {
      clearTimeout(themeTimer);
      themeTimer = setTimeout(
        () =>
          charts.forEach((chart) =>
            chart.updateOptions(
              {
                colors: palette(),
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
    document.addEventListener('DOMContentLoaded', initializeRangeAreaCharts, {
      once: true,
    });
  else initializeRangeAreaCharts();
})();
