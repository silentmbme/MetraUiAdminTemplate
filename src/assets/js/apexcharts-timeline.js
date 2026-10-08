(function () {
  'use strict';
  function initializeTimelineCharts() {
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
          type: 'rangeBar',
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
        plotOptions: { bar: { horizontal: true, barHeight: '55%', borderRadius: 3 } },
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

    // UTC dates keep sample schedules consistent across time zones.
    const beginning = Date.UTC(2026, 9, 5);
    const day = 86400000;
    function task(name, start, end) {
      return { x: name, y: [beginning + start * day, beginning + end * day] };
    }
    function configureTimeline(options, series) {
      options.series = series;
      options.xaxis = {
        type: 'datetime',
        labels: { datetimeUTC: true, format: 'dd MMM' },
      };
      options.yaxis = { labels: { maxWidth: 125 } };
      options.stroke = { width: 1, colors: ['transparent'] };
      options.tooltip = {
        theme: tooltipTheme(),
        custom: ({ seriesIndex, dataPointIndex, w }) => {
          const point = w.config.series[seriesIndex].data[dataPointIndex];
          if (!point) return '';
          const format = (value) =>
            new Date(value).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              timeZone: 'UTC',
            });
          return (
            '<div class="p-2 fs-12"><strong>' +
            point.x +
            '</strong><br>' +
            format(point.y[0]) +
            ' &ndash; ' +
            format(point.y[1]) +
            '</div>'
          );
        },
      };
    }
    createChart('timeline-basic', (options) =>
      configureTimeline(options, [
        {
          name: 'Schedule',
          data: [
            task('Discovery', 0, 3),
            task('Design', 3, 7),
            task('Build', 7, 15),
            task('Review', 15, 18),
            task('Release', 18, 20),
          ],
        },
      ])
    );
    createChart('timeline-colors', (options) => {
      configureTimeline(options, [
        {
          name: 'Roadmap',
          data: [
            task('Research', 0, 4),
            task('Prototype', 4, 8),
            task('Implementation', 8, 16),
            task('Quality checks', 14, 19),
            task('Launch', 19, 22),
          ],
        },
      ]);
      options.plotOptions.bar.distributed = true;
      options.legend.show = false;
    });
    createChart('timeline-multi', (options) =>
      configureTimeline(options, [
        {
          name: 'Design',
          data: [
            task('Workspace', 0, 5),
            task('Customer portal', 5, 10),
            task('Analytics', 10, 15),
          ],
        },
        {
          name: 'Engineering',
          data: [
            task('Workspace', 4, 12),
            task('Customer portal', 10, 18),
            task('Analytics', 15, 23),
          ],
        },
      ])
    );
    createChart('timeline-advanced', (options) => {
      configureTimeline(options, [
        {
          name: 'Sprint 1',
          data: [task('Design', 0, 7), task('Build', 4, 13), task('Review', 10, 16)],
        },
        {
          name: 'Sprint 2',
          data: [task('Design', 5, 12), task('Build', 10, 20), task('Review', 18, 24)],
        },
      ]);
      options.plotOptions.bar.rangeBarOverlap = true;
      options.chart.zoom = { enabled: true, type: 'x' };
      options.chart.toolbar.show = false;
      options.annotations = {
        xaxis: [
          {
            x: beginning + 14 * day,
            borderColor: palette()[1],
            label: {
              text: 'Checkpoint',
              style: { background: palette()[1], color: '#fff' },
            },
          },
        ],
      };
      options.colors = ['#32d484', '#fdaf22'];
    });
    createChart('timeline-grouped', (options) => {
      configureTimeline(options, [
        {
          name: 'Workspace',
          data: [
            task('Design team', 0, 4),
            task('Engineering', 4, 10),
            task('Review team', 10, 13),
          ],
        },
        {
          name: 'Customer portal',
          data: [
            task('Design team', 5, 9),
            task('Engineering', 11, 18),
            task('Review team', 18, 21),
          ],
        },
      ]);
      options.plotOptions.bar.rangeBarGroupRows = true;
    });
    createChart('dumbbell-chart', (options) => {
      options.series = [
        {
          name: 'Initial / revised estimate',
          data: [
            { x: 'Discovery', y: [6, 10] },
            { x: 'Design', y: [16, 22] },
            { x: 'Build', y: [32, 44] },
            { x: 'Review', y: [12, 18] },
            { x: 'Release', y: [8, 12] },
          ],
        },
      ];
      options.xaxis = {
        type: 'numeric',
        title: { text: 'Estimated hours' },
        labels: { formatter: (value) => Math.round(value) },
      };
      options.yaxis = { labels: { maxWidth: 125 } };
      options.plotOptions.bar.isDumbbell = true;
      options.plotOptions.bar.dumbbellColors = [[palette()[0], palette()[1]]];
      options.legend.show = false;
      options.tooltip = {
        theme: tooltipTheme(),
        custom: ({ dataPointIndex, w }) => {
          const point = w.config.series[0].data[dataPointIndex];
          return point
            ? '<div class="p-2 fs-12"><strong>' +
                point.x +
                '</strong><br>Initial: ' +
                point.y[0] +
                ' hours<br>Revised: ' +
                point.y[1] +
                ' hours</div>'
            : '';
        },
      };
      options.colors = ['#32d484', '#5e78fd'];
    });
    // Theme updates preserve schedules and zoom selections.
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
    document.addEventListener('DOMContentLoaded', initializeTimelineCharts, {
      once: true,
    });
  else initializeTimelineCharts();
})();
