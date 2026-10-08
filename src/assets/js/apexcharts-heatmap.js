(function () {
  'use strict';
  function initializeHeatmapCharts() {
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
          type: 'heatmap',
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

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const teams = ['Design', 'Engineering', 'Quality', 'Operations', 'Support'];
    // Deterministic data keeps the examples stable across page loads.
    function matrix(rows, columns, valueForCell) {
      return rows.map((name, row) => ({
        name: name,
        data: columns.map((label, column) => ({
          x: label,
          y: valueForCell(row, column),
        })),
      }));
    }
    function configureHeatmap(options, series) {
      options.series = series;
      options.plotOptions = {
        heatmap: { radius: 3, shadeIntensity: 0.5, useFillColorAsStroke: false },
      };
      options.stroke = { width: 3, colors: [resolveColor('var(--theme-custom-white)')] };
      options.xaxis = {
        type: 'category',
        axisBorder: { show: false },
        axisTicks: { show: false },
      };
      options.yaxis = { labels: { maxWidth: 110 } };
      options.legend = { show: false, position: 'bottom' };
      options.tooltip = {
        theme: tooltipTheme(),
        y: { formatter: (value) => String(value) },
      };
    }
    function capacityRanges() {
      return [
        {
          from: 0,
          to: 39,
          name: 'Low: <40%',
          color: resolveColor('rgb(var(--theme-info-rgb))'),
        },
        {
          from: 40,
          to: 79,
          name: 'Balanced: 40?79%',
          color: resolveColor('rgb(var(--theme-success-rgb))'),
        },
        {
          from: 80,
          to: 100,
          name: 'High: 80?100%',
          color: resolveColor('rgb(var(--theme-warning-rgb))'),
        },
      ];
    }
    function statusRanges() {
      return [
        {
          from: 0,
          to: 39,
          name: 'Early: <40%',
          color: resolveColor('rgb(var(--theme-warning-rgb))'),
        },
        {
          from: 40,
          to: 79,
          name: 'In progress: 40?79%',
          color: resolveColor('rgb(var(--theme-secondary-rgb))'),
        },
        {
          from: 80,
          to: 100,
          name: 'Near complete: 80?100%',
          color: resolveColor('rgb(var(--theme-success-rgb))'),
        },
      ];
    }
    function varianceRanges() {
      return [
        {
          from: -20,
          to: -1,
          name: 'Below plan',
          color: resolveColor('rgb(var(--theme-danger-rgb))'),
        },
        { from: 0, to: 0, name: 'On plan', color: resolveColor('rgb(var(--theme-info-rgb))') },
        {
          from: 1,
          to: 20,
          name: 'Above plan',
          color: resolveColor('rgb(var(--theme-success-rgb))'),
        },
      ];
    }
    createChart('heatmap-basic', (options) => {
      configureHeatmap(
        options,
        matrix(teams, days, (row, column) => 4 + ((row * 7 + column * 3) % 24))
      );
      options.colors = [palette()[0]];
      options.tooltip.y.formatter = (value) => value + ' tasks';
    });
    createChart('heatmap-multiseries', (options) => {
      configureHeatmap(
        options,
        matrix(
          teams,
          ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
          (row, column) => 12 + ((row * 11 + column * 7) % 38)
        )
      );
      options.plotOptions.heatmap.distributed = true;
      options.tooltip.y.formatter = (value) => value + ' tasks';
    });
    const capacityChart = createChart('heatmap-colorrange', (options) => {
      configureHeatmap(
        options,
        matrix(teams, days, (row, column) => (row * 21 + column * 13 + 18) % 101)
      );
      options.plotOptions.heatmap.colorScale = { ranges: capacityRanges() };
      options.legend.show = true;
      options.tooltip.y.formatter = (value) => value + '% utilized';
    });
    const statusChart = createChart('heatmap-range', (options) => {
      configureHeatmap(
        options,
        matrix(
          ['Workspace', 'Portal', 'Billing', 'Analytics'],
          ['Scope', 'Design', 'Build', 'Review', 'Release'],
          (row, column) => Math.max(5, 100 - column * 18 - row * 9)
        )
      );
      options.plotOptions.heatmap.enableShades = false;
      options.plotOptions.heatmap.colorScale = { ranges: statusRanges() };
      options.legend.show = true;
      options.dataLabels = {
        enabled: true,
        formatter: (value) => value + '%',
        style: { fontSize: '10px' },
      };
      options.tooltip.y.formatter = (value) => value + '% complete';
    });
    createChart('heatmap-hourly', (options) => {
      configureHeatmap(
        options,
        matrix(
          days.slice(0, 5),
          ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'],
          (row, column) => 6 + ((row * 9 + column * 7) % 32)
        )
      );
      options.colors = [palette()[1]];
      options.tooltip.y.formatter = (value) => value + ' tickets';
    });
    const varianceChart = createChart('heatmap-variance', (options) => {
      configureHeatmap(
        options,
        matrix(
          teams,
          ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
          (row, column) => ((row * 7 + column * 5) % 31) - 15
        )
      );
      options.plotOptions.heatmap.enableShades = false;
      options.plotOptions.heatmap.colorScale = { ranges: varianceRanges() };
      options.legend.show = true;
      options.dataLabels = {
        enabled: true,
        formatter: (value) => (value > 0 ? '+' : '') + value,
        style: { fontSize: '11px' },
      };
      options.tooltip.y.formatter = (value) =>
        (value > 0 ? '+' : '') + value + ' tasks vs plan';
    });
    // Rebuild semantic color ranges when the theme changes.
    let themeTimer;
    new MutationObserver(() => {
      clearTimeout(themeTimer);
      themeTimer = setTimeout(
        () =>
          charts.forEach((chart, index) => {
            const ranges =
              chart === capacityChart
                ? capacityRanges()
                : chart === statusChart
                ? statusRanges()
                : chart === varianceChart
                ? varianceRanges()
                : null;
            chart.updateOptions(
              {
                colors:
                  index === 0 ? [palette()[0]] : index === 4 ? [palette()[1]] : palette(),
                ...(ranges
                  ? { plotOptions: { heatmap: { colorScale: { ranges: ranges } } } }
                  : {}),
                chart: { foreColor: resolveColor('var(--theme-text-muted)') },
                stroke: { colors: [resolveColor('var(--theme-custom-white)')] },
                grid: { borderColor: resolveColor('var(--theme-default-border)') },
                tooltip: { theme: tooltipTheme() },
              },
              false,
              false,
              false
            );
          }),
        100
      );
    }).observe(root, { attributes: true, attributeFilter: ['data-theme-color', 'style'] });
  }
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', initializeHeatmapCharts, {
      once: true,
    });
  else initializeHeatmapCharts();
})();
