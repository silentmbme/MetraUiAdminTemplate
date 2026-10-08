(function () {
  'use strict';
  function initializeAreaCharts() {
    if (typeof ApexCharts === 'undefined') return;
    const root = document.documentElement;
    const charts = [];
    // Convert CSS theme values into concrete chart colors.
    function resolveColor(token) {
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
    }
    function palette() {
      return ['--theme-secondary-rgb', '--theme-info-rgb', '--theme-success-rgb'].map((token) =>
        resolveColor('rgb(var(' + token + '))')
      );
    }
    function tooltipTheme() {
      return root.getAttribute('data-theme-color') === 'dark' ? 'dark' : 'light';
    }
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const design = [18, 24, 22, 30, 26, 34, 38];
    const engineering = [26, 30, 28, 36, 32, 40, 44];
    const quality = [10, 14, 12, 18, 16, 20, 24];
    const startDate = Date.UTC(2025, 9, 1);
    const history = Array.from({ length: 400 }, (_, index) => [
      startDate + index * 86400000,
      Math.round(30 + index * 0.12 + Math.sin(index / 9) * 9),
    ]);
    // Shared options keep all examples aligned with the project theme.
    function baseOptions() {
      return {
        chart: {
          type: 'area',
          height: 300,
          fontFamily: 'inherit',
          foreColor: resolveColor('var(--theme-text-muted)'),
          toolbar: { show: false },
          zoom: { enabled: false },
          animations: {
            enabled: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
          },
        },
        colors: palette(),
        series: [{ name: 'Completed tasks', data: design }],
        stroke: { width: 3, curve: 'straight' },
        fill: {
          type: 'gradient',
          gradient: { opacityFrom: 0.35, opacityTo: 0.04, stops: [0, 100] },
        },
        dataLabels: { enabled: false },
        markers: { size: 0, hover: { size: 4 } },
        xaxis: {
          categories: weekdays,
          axisBorder: { show: false },
          axisTicks: { show: false },
        },
        yaxis: {
          labels: { minWidth: 35, formatter: (value) => Number(value).toFixed(0) },
        },
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
    function workstreams() {
      return [
        { name: 'Design', data: design },
        { name: 'Engineering', data: engineering },
        { name: 'Quality', data: quality },
      ];
    }
    function applyDates(options) {
      options.series = [{ name: 'Completed tasks', data: history }];
      options.xaxis = { type: 'datetime' };
    }
    createChart('area-basic');
    createChart('area-spline', (options) => {
      options.series = workstreams().slice(0, 2);
      options.stroke.curve = 'smooth';
      options.colors = ['#32d484', '#fdaf22'];
    });
    createChart('area-stacked', (options) => {
      options.chart.stacked = true;
      options.series = workstreams();
      options.fill = { type: 'solid', opacity: 0.55 };
      options.stroke.curve = 'smooth';
    });
    createChart('area-percent', (options) => {
      options.chart.stacked = true;
      options.chart.stackType = '100%';
      options.series = workstreams();
      options.fill = { type: 'solid', opacity: 0.65 };
      options.yaxis = {
        min: 0,
        max: 100,
        labels: { formatter: (value) => Math.round(value) + '%' },
      };
    });
    createChart('area-negative', (options) => {
      options.series = [{ name: 'Variance', data: [-12, 8, -6, 18, 10, -4, 22] }];
      options.annotations = {
        yaxis: [
          { y: 0, borderColor: resolveColor('var(--theme-text-muted)'), strokeDashArray: 0 },
        ],
      };
      options.colors = ['#32d484'];
    });
    // The navigator targets the main chart by its chart ID.
    createChart('chart-months', (options) => {
      applyDates(options);
      options.chart.id = 'area-delivery-detail';
      options.chart.height = 200;
      options.responsive = [];
    });
    createChart('chart-years', (options) => {
      applyDates(options);
      options.chart.height = 100;
      options.responsive = [];
      options.chart.brush = { enabled: true, target: 'area-delivery-detail' };
      options.chart.selection = {
        enabled: true,
        xaxis: { min: history[250][0], max: history[350][0] },
      };
      options.yaxis.show = false;
      options.colors = ['#32d484'];
    });
    createChart('area-irregular', (options) => {
      options.xaxis = { type: 'datetime' };
      options.series = [
        {
          name: 'Design',
          data: [
            [startDate, 18],
            [startDate + 2 * 86400000, 26],
            [startDate + 5 * 86400000, 22],
            [startDate + 9 * 86400000, 34],
            [startDate + 14 * 86400000, 38],
          ],
        },
        {
          name: 'Engineering',
          data: [
            [startDate + 86400000, 24],
            [startDate + 4 * 86400000, 32],
            [startDate + 8 * 86400000, 28],
            [startDate + 12 * 86400000, 40],
            [startDate + 14 * 86400000, 44],
          ],
        },
      ];
      options.markers.size = 3;
      options.tooltip.shared = false;
    });
    createChart('area-null', (options) => {
      options.series = [
        { name: 'Submitted reports', data: [18, 24, null, 30, 26, null, 38] },
      ];
      options.markers.size = 4;
    });
    const dateChart = createChart('area-datetime', (options) => {
      applyDates(options);
      options.chart.zoom = { enabled: true, type: 'x', autoScaleYaxis: true };
      options.chart.toolbar.show = false;
      options.stroke.curve = 'smooth';
    });
    document.querySelectorAll('[data-area-period]').forEach((button) =>
      button.addEventListener('click', () => {
        if (!dateChart) return;
        const end = history.at(-1)[0];
        const period = button.dataset.areaPeriod;
        const beginning =
          period === 'all'
            ? history[0][0]
            : Math.max(history[0][0], end - Number(period) * 86400000);
        dateChart.zoomX(beginning, end);
        document.querySelectorAll('[data-area-period]').forEach((control) => {
          const active = control === button;
          control.setAttribute('aria-pressed', String(active));
          control.classList.toggle('btn-secondary', active);
          control.classList.toggle('btn-light', !active);
        });
      })
    );
    createChart('area-step', (options) => {
      options.series = [{ name: 'Available hours', data: [24, 24, 32, 32, 40, 40, 32] }];
      options.stroke.curve = 'stepline';
      options.fill = { type: 'solid', opacity: 0.2 };
      options.colors = ['#32d484'];
    });
    // Update theme colors without replacing chart data or interactions.
    let refreshTimer;
    new MutationObserver(() => {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(
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
    document.addEventListener('DOMContentLoaded', initializeAreaCharts, { once: true });
  else initializeAreaCharts();
})();
