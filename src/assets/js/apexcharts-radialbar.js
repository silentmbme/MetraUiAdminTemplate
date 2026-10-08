(function () {
  'use strict';
  function initializeRadialBarCharts() {
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

    // Shared radial options use the project typography and surface colors.
    function baseOptions() {
      return {
        chart: {
          type: 'radialBar',
          height: 320,
          fontFamily: 'inherit',
          foreColor: resolveColor('var(--theme-text-muted)'),
          toolbar: { show: false },
          animations: {
            enabled: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
          },
        },
        colors: palette(),
        series: [78],
        labels: ['Readiness'],
        plotOptions: {
          radialBar: {
            hollow: { size: '70%' },
            track: {
              background: resolveColor('var(--theme-default-background)'),
              strokeWidth: '100%',
            },
            dataLabels: {
              name: { fontSize: '13px', color: resolveColor('var(--theme-text-muted)') },
              value: {
                fontSize: '28px',
                fontWeight: 600,
                color: resolveColor('var(--theme-default-text-color)'),
                formatter: (value) => Math.round(value) + '%',
              },
            },
          },
        },
        stroke: { lineCap: 'round' },
        responsive: [{ breakpoint: 576, options: { chart: { height: 280 } } }],
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
    createChart('radialbar-basic');
    createChart('radialbar-multiple', (options) => {
      options.series = [92, 76, 64];
      options.labels = ['Design', 'Engineering', 'Quality'];
      options.plotOptions.radialBar.hollow.size = '35%';
      options.plotOptions.radialBar.dataLabels.total = {
        show: true,
        label: 'Average',
        formatter: (context) =>
          Math.round(
            context.globals.seriesTotals.reduce((sum, value) => sum + value, 0) /
              context.globals.series.length
          ) + '%',
      };
      options.legend = { show: true, position: 'bottom' };
    });
    createChart('circle-custom', (options) => {
      options.series = [72];
      options.labels = ['Capacity allocated'];
      options.plotOptions.radialBar.startAngle = -135;
      options.plotOptions.radialBar.endAngle = 135;
      options.colors = ['#32d484'];
    });
    createChart('gradient-circle', (options) => {
      options.series = [84];
      options.labels = ['Delivery goal'];
      options.fill = {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'horizontal',
          gradientToColors: [palette()[1]],
          stops: [0, 100],
        },
      };
    });
    createChart('circular-stroked', (options) => {
      options.series = [86];
      options.labels = ['Review coverage'];
      options.stroke = { lineCap: 'butt', dashArray: 5 };
    });
    createChart('circle-image', (options) => {
      options.series = [68];
      options.labels = ['Workspace complete'];
      options.plotOptions.radialBar.hollow.size = '72%';
      // The HTML center keeps the image and labels aligned at every size.
      options.plotOptions.radialBar.dataLabels.show = false;
    });
    createChart('circular-semi', (options) => {
      options.series = [62];
      options.labels = ['Budget used'];
      options.plotOptions.radialBar.startAngle = -90;
      options.plotOptions.radialBar.endAngle = 90;
      options.plotOptions.radialBar.track.startAngle = -90;
      options.plotOptions.radialBar.track.endAngle = 90;
       options.colors = ['#32d484'];
    });
    const adjustableChart = createChart('radialbar-interactive', (options) => {
      options.series = [65];
      options.labels = ['Completion'];
    });
    const slider = document.getElementById('radialbar-value');
    slider?.addEventListener('input', () => {
      const value = Math.max(0, Math.min(100, Number(slider.value)));
      document.getElementById('radialbar-value-label').textContent = value + '%';
      adjustableChart?.updateSeries([value], false);
    });
    // Preserve progress values while refreshing theme colors.
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
                plotOptions: {
                  radialBar: {
                    track: { background: resolveColor('var(--theme-default-background)') },
                    dataLabels: {
                      name: { color: resolveColor('var(--theme-text-muted)') },
                      value: { color: resolveColor('var(--theme-default-text-color)') },
                    },
                  },
                },
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
    document.addEventListener('DOMContentLoaded', initializeRadialBarCharts, {
      once: true,
    });
  else initializeRadialBarCharts();
})();
