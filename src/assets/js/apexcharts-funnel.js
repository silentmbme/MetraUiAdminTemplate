(function () {
  'use strict';
  function initializeFunnelCharts() {
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
          height: 350,
          fontFamily: 'inherit',
          foreColor: resolveColor('var(--theme-text-muted)'),
          toolbar: { show: false },
          animations: {
            enabled: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
          },
        },
        colors: palette(),
        series: [{ name: 'Completed tasks', data: design }],
        plotOptions: {
          bar: {
            horizontal: true,
            barHeight: '85%',
            borderRadius: 0,
            isFunnel: true,
            isFunnel3d: false,
            distributed: true,
          },
        },
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

    // Each stage is displayed in order; funnels use descending values.
    function configureFunnel(options, stages, values, seriesName, percentage = false) {
      options.series = [{ name: seriesName, data: values }];
      options.xaxis = {
        categories: stages,
        labels: { show: false },
        axisBorder: { show: false },
        axisTicks: { show: false },
      };
      options.yaxis = { show: false };
      options.grid = { show: false };
      options.legend = { show: false };
      options.stroke = { width: 0 };
      options.dataLabels = {
        enabled: true,
        formatter: (value, context) =>
          stages[context.dataPointIndex] +
          ': ' +
          (percentage ? value + '%' : value.toLocaleString('en-US')),
        style: { fontSize: '11px', fontWeight: 500, colors: ['#fff'] },
        dropShadow: { enabled: true, top: 1, left: 0, blur: 2, opacity: 0.55 },
      };
      options.tooltip = {
        theme: tooltipTheme(),
        y: {
          formatter: (value) =>
            percentage
              ? value + '% of initial visitors'
              : value.toLocaleString('en-US') + ' ' + seriesName.toLowerCase(),
        },
      };
      options.responsive = [
        {
          breakpoint: 576,
          options: {
            chart: { height: 300 },
            dataLabels: { style: { fontSize: '10px' } },
          },
        },
      ];
    }
    createChart('funnel-chart', (options) =>
      configureFunnel(
        options,
        ['Prospects', 'Qualified', 'Discovery', 'Proposal', 'Signed'],
        [1200, 840, 560, 320, 180],
        'Prospects'
      )
    );
    createChart('funnel-conversion', (options) =>
      configureFunnel(
        options,
        [
          'Visitors',
          'Signup started',
          'Email verified',
          'Workspace created',
          'Activated',
        ],
        [100, 64, 48, 32, 21],
        'Conversion',
        true
      )
    );
    createChart('funnel-hiring', (options) =>
      configureFunnel(
        options,
        ['Applications', 'Screened', 'Interviews', 'Offers', 'Accepted'],
        [420, 240, 96, 28, 18],
        'Candidates'
      )
    );
    createChart('funnel-release', (options) =>
      configureFunnel(
        options,
        ['Scoped', 'Designed', 'Built', 'Reviewed', 'Released'],
        [96, 82, 68, 54, 42],
        'Work items'
      )
    );
    createChart('funnel-depth', (options) => {
      configureFunnel(
        options,
        ['New tickets', 'Triaged', 'Assigned', 'Resolved', 'Confirmed'],
        [640, 520, 420, 310, 260],
        'Tickets'
      );
      options.plotOptions.bar.isFunnel3d = true;
    });
    createChart('pyramid-chart', (options) =>
      configureFunnel(
        options,
        ['Advocates', 'Subscribers', 'Registered', 'Returning', 'Visitors'],
        [180, 420, 860, 1600, 2400],
        'People'
      )
    );
    // Reapply theme colors without changing stage data.
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
    document.addEventListener('DOMContentLoaded', initializeFunnelCharts, { once: true });
  else initializeFunnelCharts();
})();
