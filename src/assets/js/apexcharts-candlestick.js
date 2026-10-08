(function () {
  'use strict';
  function initializeCandlestickCharts() {
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
          type: 'candlestick',
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

    // Deterministic sample prices are illustrative, not live market data.
    const firstDate = Date.UTC(2026, 8, 1);
    const sessions = [];
    let previousClose = 100;
    for (let index = 0; sessions.length < 30; index++) {
      const date = firstDate + index * 86400000;
      const weekday = new Date(date).getUTCDay();
      if (weekday === 0 || weekday === 6) continue;
      const open = Number((previousClose + Math.sin(index) * 1.1).toFixed(2));
      const close = Number((open + Math.cos(index * 0.8) * 2.3).toFixed(2));
      const high = Number((Math.max(open, close) + 1.4 + (index % 3) * 0.3).toFixed(2));
      const low = Number((Math.min(open, close) - 1.2 - (index % 2) * 0.4).toFixed(2));
      sessions.push({ x: date, y: [open, high, low, close] });
      previousClose = close;
    }
    function candleColors() {
      return {
        upward: resolveColor('rgb(var(--theme-success-rgb))'),
        downward: resolveColor('rgb(var(--theme-danger-rgb))'),
      };
    }
    function configureCandles(options) {
      options.series = [{ name: 'Sample price', data: sessions }];
      options.xaxis = {
        type: 'datetime',
        labels: { datetimeUTC: true, format: 'dd MMM' },
      };
      options.plotOptions = {
        candlestick: { colors: candleColors(), wick: { useFillColor: true } },
      };
      options.stroke = { width: 1 };
      options.yaxis = {
        tooltip: { enabled: true },
        labels: { formatter: (value) => Number(value).toFixed(1) },
      };
      options.chart.zoom = { enabled: true, type: 'x', autoScaleYaxis: true };
      options.chart.toolbar.show = false;
    }
    createChart('candlestick-basic', configureCandles);
    createChart('chart-candlestick', (options) => {
      configureCandles(options);
      options.chart.id = 'sample-price-detail';
      options.chart.height = 220;
      options.responsive = [];
      options.chart.toolbar.show = false;
    });
    createChart('chart-bar', (options) => {
      options.chart.type = 'bar';
      options.chart.height = 100;
      options.responsive = [];
      options.chart.brush = { enabled: true, target: 'sample-price-detail' };
      options.chart.selection = {
        enabled: true,
        xaxis: { min: sessions[10].x, max: sessions[22].x },
      };
      options.series = [
        {
          name: 'Sample volume',
          data: sessions.map((point, index) => ({
            x: point.x,
            y: 800 + index * 25 + (index % 5) * 180,
          })),
        },
      ];
      options.xaxis = { type: 'datetime' };
      options.yaxis.show = false;
      options.plotOptions.bar.columnWidth = '65%';
    });
    function sessionColors() {
      return {
        upward: resolveColor('rgb(var(--theme-secondary-rgb))'),
        downward: resolveColor('rgb(var(--theme-success-rgb))'),
      };
    }
    const sessionChart = createChart('candlestick-categoryx', (options) => {
      configureCandles(options);
      options.plotOptions.candlestick.colors = sessionColors();
      options.series = [
        {
          name: 'Sample price',
          data: sessions.slice(0, 10).map((point) => ({
            x: new Date(point.x).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              timeZone: 'UTC',
            }),
            y: point.y,
          })),
        },
      ];
      options.xaxis = { type: 'category', labels: { rotate: -35 } };
      options.chart.zoom.enabled = false;
      options.chart.toolbar.show = false;
    });
    createChart('candlestick-line', (options) => {
      configureCandles(options);
      options.series = [
        { name: 'Sample price', type: 'candlestick', data: sessions },
        {
          name: '5-session average',
          type: 'line',
          data: sessions.map((point, index) => ({
            x: point.x,
            y:
              index < 4
                ? null
                : Number(
                    (
                      sessions
                        .slice(index - 4, index + 1)
                        .reduce((sum, item) => sum + item.y[3], 0) / 5
                    ).toFixed(2)
                  ),
          })),
        },
      ];
      options.stroke = { width: [1, 2], curve: 'straight' };
    });
    createChart('candlestick-annotated', (options) => {
      configureCandles(options);
      options.annotations = {
        yaxis: [
          {
            y: 97,
            borderColor: candleColors().downward,
            label: {
              text: 'Reference support',
              style: { background: candleColors().downward, color: '#fff' },
            },
          },
          {
            y: 109,
            borderColor: candleColors().upward,
            label: {
              text: 'Reference resistance',
              style: { background: candleColors().upward, color: '#fff' },
            },
          },
        ],
      };
    });
    createChart('candlestick-ohlc', (options) => {
      configureCandles(options);
      options.plotOptions.candlestick.type = 'ohlc';
      options.stroke.width = 2;
    });
    // Keep candle movement colors in sync with the project theme.
    let themeTimer;
    new MutationObserver(() => {
      clearTimeout(themeTimer);
      themeTimer = setTimeout(
        () =>
          charts.forEach((chart) =>
            chart.updateOptions(
              {
                colors: palette(),
                plotOptions: {
                  candlestick: {
                    colors: chart === sessionChart ? sessionColors() : candleColors(),
                  },
                },
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
    document.addEventListener('DOMContentLoaded', initializeCandlestickCharts, {
      once: true,
    });
  else initializeCandlestickCharts();
})();
