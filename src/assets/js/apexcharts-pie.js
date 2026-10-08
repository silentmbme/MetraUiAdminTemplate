(function () {
  'use strict';
  function initializePieCharts() {
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

    // Shared options keep all pie examples aligned with the project typography.
    function baseOptions() {
      return {
        chart: {
          type: 'pie',
          height: 340,
          fontFamily: 'inherit',
          foreColor: resolveColor('var(--theme-text-muted)'),
          toolbar: { show: false },
          animations: {
            enabled: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
          },
        },
        colors: palette(),
        series: [42, 28, 18, 12],
        labels: ['Engineering', 'Design', 'Quality', 'Operations'],
        stroke: { width: 3, colors: [resolveColor('var(--theme-custom-white)')] },
        dataLabels: {
          enabled: true,
          formatter: (value) => Math.round(value) + '%',
          style: { fontSize: '11px' },
        },
        legend: { position: 'bottom', fontSize: '12px' },
        tooltip: { theme: tooltipTheme(), y: { formatter: (value) => value + ' hours' } },
        responsive: [
          {
            breakpoint: 576,
            options: { chart: { height: 300 }, legend: { fontSize: '11px' } },
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
    function donut(options) {
      options.chart.type = 'donut';
      options.plotOptions = {
        pie: {
          donut: {
            size: '68%',
            labels: {
              show: true,
              name: { fontSize: '13px' },
              value: { fontSize: '24px', formatter: (value) => String(value) },
              total: {
                show: true,
                label: 'Total hours',
                formatter: (context) =>
                  String(
                    context.globals.seriesTotals.reduce((sum, value) => sum + value, 0)
                  ),
              },
            },
          },
        },
      };
    }
    createChart('pie-basic');
    createChart('donut-simple', (options) => {
      donut(options);
      options.series = [36, 24, 18, 12];
      options.labels = ['In progress', 'Review', 'Planned', 'Complete'];
      options.plotOptions.pie.donut.labels.total.label = 'Work items';
      options.tooltip.y.formatter = (value) => value + ' items';
    });
    let values = [42, 28, 18, 12];
    let labels = ['Engineering', 'Design', 'Quality', 'Operations'];
    const interactiveChart = createChart('donut-update', donut);
    function updateAllocation() {
      if (!interactiveChart) return;
      interactiveChart.updateOptions({ series: [...values], labels: [...labels] });
      document.getElementById('pie-update-status').textContent =
        labels.length + ' sample categories';
      document.getElementById('add').disabled = labels.length >= 6;
      document.getElementById('remove').disabled = labels.length <= 2;
    }
    document.getElementById('randomize')?.addEventListener('click', () => {
      values = values.map(() => 10 + Math.round(Math.random() * 40));
      updateAllocation();
    });
    document.getElementById('add')?.addEventListener('click', () => {
      if (labels.length >= 6) return;
      labels.push(
        ['Engineering', 'Design', 'Quality', 'Operations', 'Research', 'Documentation'][
          labels.length
        ]
      );
      values.push(15);
      updateAllocation();
    });
    document.getElementById('remove')?.addEventListener('click', () => {
      if (labels.length <= 2) return;
      labels.pop();
      values.pop();
      updateAllocation();
    });
    document.getElementById('reset')?.addEventListener('click', () => {
      values = [42, 28, 18, 12];
      labels = ['Engineering', 'Design', 'Quality', 'Operations'];
      updateAllocation();
    });
    const monochromeChart = createChart('pie-monochrome', (options) => {
      options.labels = ['Direct', 'Search', 'Referral', 'Email'];
      options.series = [38, 32, 18, 12];
      options.theme = {
        monochrome: {
          enabled: true,
          color: palette()[0],
          shadeTo: 'light',
          shadeIntensity: 0.6,
        },
      };
      options.tooltip.y.formatter = (value) => value + ' visits';
    });
    createChart('donut-gradient', (options) => {
      donut(options);
      options.labels = ['Build', 'Design', 'Infrastructure', 'Quality'];
      options.series = [48, 24, 18, 10];
      options.fill = {
        type: 'gradient',
        gradient: {
          shade: 'light',
          shadeIntensity: 0.3,
          opacityFrom: 1,
          opacityTo: 0.75,
          stops: [0, 100],
        },
      };
      options.plotOptions.pie.donut.labels.total.label = 'Budget ($k)';
      options.tooltip.y.formatter = (value) => '$' + value + 'k';
    });
    createChart('pie-image', (options) => {
      options.fill = {
        type: 'image',
        image: {
          src: [
            '../assets/images/cards/1.jpg',
            '../assets/images/cards/2.jpg',
            '../assets/images/cards/17.png',
            '../assets/images/cards/16.png',
          ],
        },
      };
    });
    createChart('donut-pattern', (options) => {
      donut(options);
      options.fill = {
        type: 'pattern',
        pattern: {
          style: ['verticalLines', 'horizontalLines', 'slantedLines', 'circles'],
          width: 6,
          height: 6,
          strokeWidth: 2,
        },
      };
    });
    createChart('donut-semi', (options) => {
      donut(options);
      options.plotOptions.pie.startAngle = -90;
      options.plotOptions.pie.endAngle = 90;
      options.plotOptions.pie.donut.labels.total.label = 'Allocated hours';
      options.dataLabels.enabled = false;
    });
    // Theme updates preserve changes made through the allocation controls.
    let themeTimer;
    new MutationObserver(() => {
      clearTimeout(themeTimer);
      themeTimer = setTimeout(
        () =>
          charts.forEach((chart) =>
            chart.updateOptions(
              {
                colors: palette(),
                ...(chart === monochromeChart
                  ? { theme: { monochrome: { color: palette()[0] } } }
                  : {}),
                chart: { foreColor: resolveColor('var(--theme-text-muted)') },
                stroke: { colors: [resolveColor('var(--theme-custom-white)')] },
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
    document.addEventListener('DOMContentLoaded', initializePieCharts, { once: true });
  else initializePieCharts();
})();
