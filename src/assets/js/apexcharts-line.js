(function () {
  'use strict';
  function initialize() {
    if (typeof ApexCharts === 'undefined') return;
    const charts = [];
    const root = document.documentElement;
    // Resolve theme variables to hex colors supported by ApexCharts.
    const resolve = (token) => {
      const probe = document.createElement('span');
      probe.style.color = token;
      probe.style.display = 'none';
      document.body.append(probe);
      const channels = getComputedStyle(probe).color.match(/[\d.]+/g);
      probe.remove();
      return channels?.length >= 3
        ? '#' +
            channels
              .slice(0, 3)
              .map((value) => Math.round(Number(value)).toString(16).padStart(2, '0'))
              .join('')
        : '#5e78fd';
    };
    const palette = () =>
      ['--theme-secondary-rgb', '--theme-info-rgb', '--theme-success-rgb'].map((token) =>
        resolve('rgb(var(' + token + '))')
      );
    const dark = () => root.getAttribute('data-theme-color') === 'dark';
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const output = [18, 26, 22, 34, 29, 40, 46];
    const start = Date.UTC(2026, 8, 1);
    const daily = Array.from({ length: 40 }, (_, i) => [
      start + i * 86400000,
      Math.round(30 + i * 0.9 + Math.sin(i / 3) * 12),
    ]);
    const theme = () => ({
      colors: palette(),
      chart: { foreColor: resolve('var(--theme-text-muted)') },
      grid: { borderColor: resolve('var(--theme-default-border)') },
      tooltip: { theme: dark() ? 'dark' : 'light' },
    });
    // Shared presentation for every line chart example.
    const base = () => ({
      chart: {
        type: 'line',
        height: 300,
        fontFamily: 'inherit',
        foreColor: resolve('var(--theme-text-muted)'),
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: {
          enabled: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        },
      },
      colors: palette(),
      series: [{ name: 'Completed tasks', data: output }],
      stroke: { width: 3, curve: 'straight' },
      dataLabels: { enabled: false },
      markers: { size: 0, hover: { size: 5 } },
      grid: { borderColor: resolve('var(--theme-default-border)'), strokeDashArray: 4 },
      xaxis: {
        categories: days,
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: { labels: { minWidth: 35, formatter: (value) => Number(value).toFixed(0) } },
      legend: { position: 'top', horizontalAlign: 'right' },
      tooltip: { theme: dark() ? 'dark' : 'light' },
      responsive: [
        {
          breakpoint: 576,
          options: { chart: { height: 260 }, legend: { position: 'bottom' } },
        },
      ],
    });
    const create = (id, customize) => {
      const element = document.getElementById(id);
      if (!element) return null;
      const options = base();
      if (customize) customize(options);
      const chart = new ApexCharts(element, options);
      charts.push(chart);
      chart.render();
      return chart;
    };
    const timeSeries = (options) => {
      options.series = [{ name: 'Completed tasks', data: daily }];
      options.xaxis = { type: 'datetime' };
    };
    // Basic line and labeled team comparison.
    create('line-chart');
    create('line-chart-datalabels', (options) => {
      options.series = [
        { name: 'Design', data: [12, 18, 16, 24, 20, 28, 32] },
        { name: 'Engineering', data: [18, 22, 20, 30, 28, 36, 40] },
      ];
      options.colors = ['rgba(var(--theme-success-rgb))', 'rgba(var(--theme-warning-rgb))'];
      options.dataLabels = { enabled: true, background: { enabled: false }, offsetY: -6 };
      options.markers.size = 3;
    });
    // Date-based zoom and milestone annotations.
    create('zoom-chart', (options) => {
      timeSeries(options);
      options.chart.zoom = { enabled: true, type: 'x', autoScaleYaxis: true };
      options.chart.toolbar = { show: false };
      options.colors = ['rgba(var(--theme-success-rgb))'];
    });
    create('annotation-chart', (options) => {
      options.annotations = {
        yaxis: [
          {
            y: 35,
            borderColor: palette()[1],
            label: {
              text: 'Target: 35',
              style: { background: palette()[1], color: '#fff' },
            },
          },
        ],
        xaxis: [
          {
            x: 'Fri',
            borderColor: palette()[0],
            label: {
              text: 'Release',
              style: { background: palette()[0], color: '#fff' },
            },
          },
        ],
      };
    });
    // The smaller brush chart controls the delivery-detail chart.
    create('brush-chart1', (options) => {
      timeSeries(options);
      options.chart.id = 'delivery-detail';
      options.chart.height = 200;
      options.chart.toolbar = { show: false };
    });
    create('brush-chart', (options) => {
      timeSeries(options);
      options.chart.type = 'area';
      options.chart.height = 100;
      options.responsive = [];
      options.chart.brush = { enabled: true, target: 'delivery-detail' };
      options.chart.selection = {
        enabled: true,
        xaxis: { min: daily[10][0], max: daily[25][0] },
      };
      options.fill = { opacity: 0.15 };
      options.yaxis.show = false;
      options.colors = ['#32d484'];
    });
    create('stepline-chart', (options) => {
      options.series = [{ name: 'Available hours', data: [24, 24, 32, 32, 40, 40, 32] }];
      options.stroke.curve = 'stepline';
    });
    create('gradient-chart', (options) => {
      options.stroke.curve = 'smooth';
      options.stroke.width = 4;
      options.fill = {
        type: 'gradient',
        gradient: {
          type: 'horizontal',
          gradientToColors: [palette()[1]],
          stops: [0, 100],
        },
      };
    });
    create('null-chart', (options) => {
      options.series = [{ name: 'Reports', data: [18, 26, null, 34, 29, null, 46] }];
      options.markers.size = 4;
    });
    // Keep the live demo bounded to sixteen samples.
    let samples = Array.from({ length: 16 }, (_, i) => [
      start + i * 2000,
      20 + Math.round(Math.sin(i) * 7),
    ]);
    const live = create('dynamic-chart', (options) => {
      options.series = [{ name: 'Activity (simulated)', data: samples }];
      options.xaxis = {
        type: 'datetime',
        labels: { datetimeUTC: true, format: 'HH:mm:ss' },
      };
      options.stroke.curve = 'smooth';
      options.colors = ['rgba(var(--theme-success-rgb))'];
    });
    let timer = null;
    const button = document.getElementById('line-live-toggle');
    const stop = () => {
      clearInterval(timer);
      timer = null;
      if (button) {
        button.textContent = 'Start live';
        button.setAttribute('aria-pressed', 'false');
      }
    };
    button?.addEventListener('click', () => {
      if (!live) return;
      if (timer) {
        stop();
        return;
      }
      button.textContent = 'Pause live';
      button.setAttribute('aria-pressed', 'true');
      timer = setInterval(() => {
        samples = [
          ...samples.slice(1),
          [samples.at(-1)[0] + 2000, 15 + Math.round(Math.random() * 20)],
        ];
        live.updateSeries([{ name: 'Activity (simulated)', data: samples }], false);
      }, 2000);
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
    });
    window.addEventListener('pagehide', stop);
    create('dashed-chart', (options) => {
      options.series = [
        { name: 'Actual', data: [18, 26, 22, 34, 29, 40, 46] },
        { name: 'Forecast', data: [20, 24, 28, 32, 36, 40, 44] },
      ];
      options.stroke.dashArray = [0, 6];
    });
    ['chart-line', 'chart-line2'].forEach((id, index) =>
      create(id, (options) => {
        timeSeries(options);
        options.chart.id = id;
        options.chart.group = 'project-trends';
        options.chart.height = 180;
        options.responsive = [];
        options.chart.zoom.enabled = true;
        options.chart.toolbar.show = false;
        options.series = [
          {
            name: index ? 'Reviewed tasks' : 'Completed tasks',
            data: daily.map(([date, value]) => [
              date,
              index ? Math.round(value * 0.7) : value,
            ]),
          },
        ];
      })
    );
    create('negative-chart', (options) => {
      options.series = [{ name: 'Net change', data: [-8, 12, -4, 18, 9, -6, 22] }];
      options.annotations = {
        yaxis: [{ y: 0, borderColor: resolve('var(--theme-text-muted)'), strokeDashArray: 0 }],
      };
      options.markers.size = 3;
      options.colors = ['rgba(var(--theme-warning-rgb))'];
    });
    // Refresh chart colors when the project theme changes.
    let refresh;
    new MutationObserver(() => {
      clearTimeout(refresh);
      refresh = setTimeout(
        () =>
          charts.forEach((chart) => chart.updateOptions(theme(), false, false, false)),
        100
      );
    }).observe(root, { attributes: true, attributeFilter: ['data-theme-color', 'style'] });
  }
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
