(function () {
  'use strict';
  function initializeCharts() {
    if (typeof Chart === 'undefined') return;
    const root = document.documentElement;
    const charts = [];
    function color(token) {
      const probe = document.createElement('span');
      probe.style.color = token;
      probe.style.display = 'none';
      document.body.append(probe);
      const rgb = getComputedStyle(probe).color;
      probe.remove();
      return rgb;
    }
    function palette() {
      return ['primary', 'secondary', 'success', 'info', 'warning', 'danger'].map(
        (name) => color('rgb(var(--theme-' + name + '-rgb))')
      );
    }
    function translucent(value, opacity) {
      return value.replace('rgb(', 'rgba(').replace(')', ', ' + opacity + ')');
    }
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const projects = ['Workspace', 'Portal', 'Billing', 'Analytics', 'Mobile'];
    const design = [18, 24, 22, 30, 26, 34, 38];
    const engineering = [26, 30, 28, 36, 32, 40, 44];
    function dataset(label, data, index, filled = false) {
      return {
        label,
        data,
        borderColor: palette()[index],
        backgroundColor: filled ? translucent(palette()[index], 0.18) : palette()[index],
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 3,
      };
    }
    function options() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        animation: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? false
          : { duration: 400 },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              boxWidth: 8,
              padding: 18,
              color: color('var(--theme-text-muted)'),
            },
          },
          tooltip: { padding: 10 },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: color('var(--theme-text-muted)') } },
          y: {
            beginAtZero: true,
            grid: { color: color('var(--theme-default-border)') },
            ticks: { color: color('var(--theme-text-muted)') },
          },
        },
      };
    }
    // Keep each example explicit so its datasets and options are easy to edit.
    function create(id, type, data, configure) {
      const canvas = document.getElementById('chartjs-' + id);
      if (!canvas) return;
      const config = { type, data, options: options() };
      if (configure) configure(config);
      const chart = new Chart(canvas, config);
      charts.push({ chart, id });
      return chart;
    }
    create(
      'line',
      'line',
      {
        labels: days,
        datasets: [
          dataset('Design', design, 1, true),
          dataset('Engineering', engineering, 2, true),
        ],
      },
      (config) => {
        config.data.datasets.forEach((series) => (series.fill = true));
      }
    );
    create('bar', 'bar', {
      labels: days,
      datasets: [dataset('Design', design, 0), dataset('Engineering', engineering, 1)],
    });
    create(
      'horizontal',
      'bar',
      {
        labels: projects,
        datasets: [dataset('Completion (%)', [78, 64, 92, 56, 83], 2)],
      },
      (config) => {
        config.options.indexAxis = 'y';
        config.options.scales.x.max = 100;
        config.options.plugins.legend.display = false;
      }
    );
    create(
      'stacked',
      'bar',
      {
        labels: days,
        datasets: [
          dataset('Design', design, 1),
          dataset('Engineering', engineering, 1),
          dataset('Quality', [10, 14, 12, 18, 16, 20, 24], 2),
        ],
      },
      (config) => {
        config.options.scales.x.stacked = true;
        config.options.scales.y.stacked = true;
      }
    );
    function circular(config) {
      delete config.options.scales;
      config.data.datasets[0].backgroundColor = palette();
      config.data.datasets[0].borderColor = color('var(--theme-custom-white)');
    }
    create(
      'pie',
      'pie',
      {
        labels: ['Engineering', 'Design', 'Infrastructure', 'Quality', 'Research'],
        datasets: [{ data: [42, 24, 18, 10, 6], borderWidth: 3 }],
      },
      circular
    );
    create(
      'doughnut',
      'doughnut',
      {
        labels: ['In progress', 'Review', 'Planned', 'Complete'],
        datasets: [{ data: [36, 24, 18, 12], borderWidth: 3 }],
      },
      (config) => {
        circular(config);
        config.options.cutout = '68%';
      }
    );
    create('mixed', 'bar', {
      labels: days,
      datasets: [
        dataset('Completed tasks', design, 0),
        {
          ...dataset('Target', [20, 24, 28, 32, 36, 40, 44], 1),
          type: 'line',
          order: -1,
        },
      ],
    });
    create(
      'polar',
      'polarArea',
      {
        labels: ['Design', 'Engineering', 'Quality', 'Operations', 'Support'],
        datasets: [{ data: [36, 44, 28, 24, 20], borderWidth: 2 }],
      },
      (config) => {
        circular(config);
        config.options.scales = {
          r: {
            beginAtZero: true,
            grid: { color: color('var(--theme-default-border)') },
            ticks: { color: color('var(--theme-text-muted)'), backdropColor: 'transparent' },
          },
        };
      }
    );
    create(
      'radar',
      'radar',
      {
        labels: ['Scope', 'Design', 'Build', 'Quality', 'Delivery', 'Support'],
        datasets: [
          dataset('Current', [82, 90, 72, 86, 78, 68], 0, true),
          dataset('Target', [90, 95, 90, 95, 90, 85], 1, true),
        ],
      },
      (config) => {
        config.options.scales = {
          r: {
            min: 0,
            max: 100,
            grid: { color: color('var(--theme-default-border)') },
            angleLines: { color: color('var(--theme-default-border)') },
            pointLabels: { color: color('var(--theme-text-muted)') },
            ticks: {
              stepSize: 20,
              color: color('var(--theme-text-muted)'),
              backdropColor: 'transparent',
            },
          },
        };
      }
    );
    create(
      'scatter',
      'scatter',
      {
        datasets: [
          dataset(
            'Design',
            [
              [12, 8],
              [18, 12],
              [24, 18],
              [30, 20],
              [36, 26],
            ].map(([x, y]) => ({ x, y })),
            0
          ),
          dataset(
            'Engineering',
            [
              [16, 10],
              [22, 16],
              [28, 22],
              [34, 24],
              [40, 32],
            ].map(([x, y]) => ({ x, y })),
            1
          ),
        ],
      },
      (config) => {
        config.options.scales.x.title = { display: true, text: 'Hours' };
        config.options.scales.y.title = { display: true, text: 'Completed tasks' };
        config.data.datasets.forEach((series) => (series.pointRadius = 5));
      }
    );
    create(
      'bubble',
      'bubble',
      {
        datasets: [
          dataset(
            'Product',
            [
              { x: 18, y: 72, r: 8 },
              { x: 32, y: 88, r: 12 },
              { x: 46, y: 64, r: 10 },
              { x: 58, y: 92, r: 16 },
            ],
            0
          ),
          dataset(
            'Operations',
            [
              { x: 14, y: 44, r: 6 },
              { x: 36, y: 56, r: 10 },
              { x: 54, y: 48, r: 8 },
              { x: 72, y: 58, r: 12 },
            ],
            2
          ),
        ],
      },
      (config) => {
        config.options.scales.x.title = { display: true, text: 'Effort (hours)' };
        config.options.scales.y.title = { display: true, text: 'Impact score' };
      }
    );
    create(
      'variance',
      'bar',
      { labels: projects, datasets: [dataset('Variance', [-12, 8, -6, 18, 10], 0)] },
      (config) => {
        config.options.plugins.legend.display = false;
        config.data.datasets[0].backgroundColor = config.data.datasets[0].data.map(
          (value) => palette()[value < 0 ? 5 : 2]
        );
        config.data.datasets[0].borderWidth = 0;
      }
    );
    // Recolor existing instances without changing their sample data.
    let refresh;
    new MutationObserver(() => {
      clearTimeout(refresh);
      refresh = setTimeout(
        () =>
          charts.forEach(({ chart, id }) => {
            chart.options.plugins.legend.labels.color = color('var(--theme-text-muted)');
            Object.values(chart.options.scales || {}).forEach((scale) => {
              if (scale.ticks) scale.ticks.color = color('var(--theme-text-muted)');
              if (scale.grid) scale.grid.color = color('var(--theme-default-border)');
              if (scale.angleLines)
                scale.angleLines.color = color('var(--theme-default-border)');
              if (scale.pointLabels) scale.pointLabels.color = color('var(--theme-text-muted)');
            });
            chart.data.datasets.forEach((series, index) => {
              if (['pie', 'doughnut', 'polar'].includes(id)) {
                series.backgroundColor = palette();
                series.borderColor = color('var(--theme-custom-white)');
              } else if (id === 'variance') {
                series.backgroundColor = series.data.map(
                  (value) => palette()[value < 0 ? 4 : 2]
                );
              } else {
                const selected =
                  palette()[id === 'bubble' && index === 1 ? 2 : index % 6];
                series.borderColor = selected;
                series.backgroundColor = ['line', 'radar'].includes(id)
                  ? translucent(selected, 0.18)
                  : selected;
              }
            });
            chart.update('none');
          }),
        100
      );
    }).observe(root, { attributes: true, attributeFilter: ['data-theme-color', 'style'] });
  }
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', initializeCharts, { once: true });
  else initializeCharts();
})();
