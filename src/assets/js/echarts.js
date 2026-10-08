(function () {
  'use strict';
  function initialize() {
    if (typeof echarts === 'undefined') return;
    const root = document.documentElement,
      instances = [];
    function color(token) {
      const probe = document.createElement('span');
      probe.style.color = token;
      probe.style.display = 'none';
      document.body.append(probe);
      const result = getComputedStyle(probe).color;
      probe.remove();
      return result;
    }
    function palette() {
      return ['primary', 'secondary', 'success', 'info', 'warning', 'danger'].map(
        (name) => color('rgb(var(--theme-' + name + '-rgb))')
      );
    }
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const projects = ['Workspace', 'Portal', 'Billing', 'Analytics', 'Mobile'];
    const design = [18, 24, 22, 30, 26, 34, 38],
      engineering = [26, 30, 28, 36, 32, 40, 44];
    function base() {
      return {
        color: palette(),
        backgroundColor: 'transparent',
        textStyle: {
          fontFamily: getComputedStyle(document.body).fontFamily,
          color: color('var(--theme-text-muted)'),
        },
        animation: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        aria: { enabled: true },
        tooltip: { trigger: 'axis' },
        legend: { bottom: 0, textStyle: { color: color('var(--theme-text-muted)') } },
        grid: { left: 15, right: 20, top: 25, bottom: 55, containLabel: true },
        xAxis: {
          type: 'category',
          data: days,
          axisLine: { lineStyle: { color: color('var(--theme-default-border)') } },
          axisLabel: { color: color('var(--theme-text-muted)') },
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: color('var(--theme-text-muted)') },
          splitLine: {
            lineStyle: { color: color('var(--theme-default-border)'), type: 'dashed' },
          },
        },
      };
    }
    function line(name, data, extra = {}) {
      return { name, type: 'line', data, symbolSize: 6, ...extra };
    }
    function bar(name, data, extra = {}) {
      return { name, type: 'bar', data, barMaxWidth: 32, ...extra };
    }
    function chart(id, configure) {
      const container = document.getElementById('echart-' + id);
      if (!container) return;
      const instance = echarts.init(container);
      const build = () => {
        const options = base();
        configure(options);
        return options;
      };
      instance.setOption(build());
      instances.push({ instance, container, build });
    }
    // Cartesian charts share typography, axes and responsive spacing.
    chart('basic-line', (options) => {
      options.color = [palette()[2]];
      options.series = [line('Completed tasks', design)];
    });
    chart(
      'smoothed-line',
      (o) =>
        (o.series = [
          line('Design', design, { smooth: true }),
          line('Engineering', engineering, { smooth: true }),
        ])
    );
    chart('basic-area', (options) => {
      options.color = [palette()[1]];
      options.series = [
        line('Tasks', design, { areaStyle: { opacity: 0.2 }, smooth: true }),
      ];
    });
    chart(
      'stacked-line',
      (o) =>
        (o.series = [
          line('Design', design, { stack: 'work' }),
          line('Engineering', engineering, { stack: 'work' }),
        ])
    );
    chart(
      'stacked-area',
      (o) =>
        (o.series = [
          line('Design', design, { stack: 'work', areaStyle: { opacity: 0.3 } }),
          line('Engineering', engineering, {
            stack: 'work',
            areaStyle: { opacity: 0.3 },
          }),
        ])
    );
    chart('step-line', (options) => {
      options.color = [palette()[3]];
      options.series = [
        line('Capacity', [24, 24, 32, 32, 40, 40, 32], { step: 'end' }),
      ];
    });
    chart(
      'bar-basic',
      (o) => (o.series = [bar('Design', design), bar('Engineering', engineering)])
    );
    chart('bar-background', (o) => {
      o.xAxis.data = projects;
      o.yAxis.max = 100;
      o.series = [
        bar('Completion (%)', [78, 64, 92, 56, 83], {
          showBackground: true,
          backgroundStyle: { color: color('var(--theme-default-background)') },
        }),
      ];
    });
    chart('bar-single', (o) => {
      o.xAxis.data = projects;
      o.series = [
        bar(
          'Progress',
          [78, 64, 92, 56, 83].map((value, index) => ({
            value,
            itemStyle: { color: palette()[index] },
          }))
        ),
      ];
    });
    chart('waterfall', (o) => {
      o.xAxis.data = ['Start', 'Build', 'Design', 'Savings', 'Quality', 'Total'];
      o.series = [
        bar('Offset', [0, 100, 125, 129, 129, 0], {
          stack: 'budget',
          silent: true,
          itemStyle: { color: 'transparent' },
          emphasis: { itemStyle: { color: 'transparent' } },
          tooltip: { show: false },
        }),
        bar('Budget change', [100, 25, 18, 14, 10, 139], {
          stack: 'budget',
          itemStyle: { color: palette()[1] },
          label: { show: true, position: 'top' },
        }),
      ];
      o.legend.show = false;
    });
    chart('negative-values', (o) => {
      o.xAxis.data = projects;
      o.series = [
        bar(
          'Variance',
          [-12, 8, -6, 18, 10].map((value) => ({
            value,
            itemStyle: { color: palette()[value < 0 ? 5 : 2] },
          }))
        ),
      ];
    });
    chart(
      'bar-labels',
      (o) =>
        (o.series = [
          bar('Completed tasks', design, {
            label: { show: true, position: 'top', color: color('var(--theme-text-muted)') },
          }),
        ])
    );
    function horizontal(o, stacked) {
      o.xAxis = {
        type: 'value',
        splitLine: { lineStyle: { color: color('var(--theme-default-border)') } },
      };
      o.yAxis = {
        type: 'category',
        data: projects,
        axisLabel: { color: color('var(--theme-text-muted)') },
      };
      o.series = [bar('Design', [18, 24, 22, 30, 26], stacked ? { stack: 'work' } : {})];
      if (stacked)
        o.series.push(bar('Engineering', [26, 30, 28, 36, 32], { stack: 'work' }));
    }
    chart('bar-horizontal', (o) => horizontal(o, false));
    chart('stacked-horizontal', (o) => horizontal(o, true));
    function nonAxis(o) {
      delete o.xAxis;
      delete o.yAxis;
      delete o.grid;
      o.tooltip = { trigger: 'item' };
    }
    const allocation = [
      { name: 'Engineering', value: 42 },
      { name: 'Design', value: 24 },
      { name: 'Infrastructure', value: 18 },
      { name: 'Quality', value: 10 },
      { name: 'Research', value: 6 },
    ];
    chart('pie', (o) => {
      nonAxis(o);
      o.series = [
        {
          type: 'pie',
          radius: '62%',
          center: ['50%', '45%'],
          data: allocation,
          label: { show: false },
          emphasis: { label: { show: true } },
          itemStyle: { borderColor: color('var(--theme-custom-white)'), borderWidth: 3 },
        },
      ];
    });
    chart('doughnut', (o) => {
      nonAxis(o);
      o.series = [
        {
          type: 'pie',
          radius: ['42%', '66%'],
          center: ['50%', '45%'],
          data: allocation,
          label: { show: false },
          itemStyle: { borderColor: color('var(--theme-custom-white)'), borderWidth: 3 },
        },
      ];
    });
    const pairs = [
      [12, 8],
      [18, 12],
      [24, 18],
      [30, 20],
      [36, 26],
      [42, 30],
    ];
    chart('scatter', (o) => {
      o.xAxis.type = 'value';
      delete o.xAxis.data;
      o.series = [
        { name: 'Design', type: 'scatter', symbolSize: 10, data: pairs },
        {
          name: 'Engineering',
          type: 'scatter',
          symbolSize: 10,
          data: pairs.map(([x, y]) => [x + 4, y + 6]),
        },
      ];
    });
    chart('bubble', (o) => {
      o.xAxis.type = 'value';
      delete o.xAxis.data;
      o.series = [
        {
          name: 'Impact',
          type: 'scatter',
          data: [
            [18, 72, 12],
            [32, 88, 18],
            [46, 64, 10],
            [58, 92, 24],
          ],
          symbolSize: (value) => value[2] * 1.5,
        },
      ];
    });
    chart('candlestick', (o) => {
      o.xAxis.data = ['Session 1', 'Session 2', 'Session 3', 'Session 4', 'Session 5'];
      o.yAxis.scale = true;
      o.series = [
        {
          name: 'Sample price',
          type: 'candlestick',
          data: [
            [100, 104, 98, 106],
            [104, 102, 100, 107],
            [102, 108, 101, 110],
            [108, 105, 103, 111],
            [105, 109, 104, 112],
          ],
          itemStyle: {
            color: palette()[2],
            color0: palette()[5],
            borderColor: palette()[2],
            borderColor0: palette()[5],
          },
        },
      ];
    });
    chart('basic-radar', (o) => {
      nonAxis(o);
      o.radar = {
        indicator: ['Scope', 'Design', 'Build', 'Quality', 'Delivery', 'Support'].map(
          (name) => ({ name, max: 100 })
        ),
        axisName: { color: color('var(--theme-text-muted)') },
        splitLine: { lineStyle: { color: color('var(--theme-default-border)') } },
      };
      o.series = [
        {
          type: 'radar',
          data: [
            { name: 'Current', value: [82, 90, 72, 86, 78, 68] },
            { name: 'Target', value: [90, 95, 90, 95, 90, 85] },
          ],
          areaStyle: { opacity: 0.15 },
        },
      ];
    });
    chart('heatmap', (o) => {
      o.xAxis.data = days;
      o.yAxis = { type: 'category', data: ['Design', 'Build', 'Quality', 'Support'] };
      o.visualMap = {
        min: 0,
        max: 30,
        show: false,
        inRange: { color: [color('var(--theme-default-background)'), palette()[1]] },
      };
      o.series = [
        {
          type: 'heatmap',
          data: Array.from({ length: 28 }, (_, i) => [
            i % 7,
            Math.floor(i / 7),
            4 + ((i * 7) % 26),
          ]),
          label: { show: true },
        },
      ];
    });
    chart('treemap', (o) => {
      nonAxis(o);
      o.legend.show = false;
      o.series = [
        {
          type: 'treemap',
          roam: false,
          nodeClick: false,
          breadcrumb: { show: false },
          data: allocation.map((item) => ({ ...item })),
          label: { formatter: '{b}\n{c}' },
        },
      ];
    });
    chart('funnel', (o) => {
      nonAxis(o);
      o.series = [
        {
          type: 'funnel',
          top: 20,
          bottom: 45,
          left: '15%',
          width: '70%',
          data: [
            { name: 'Prospects', value: 100 },
            { name: 'Qualified', value: 72 },
            { name: 'Proposal', value: 48 },
            { name: 'Signed', value: 28 },
          ],
          label: { position: 'inside' },
          itemStyle: { borderColor: color('var(--theme-custom-white)'), borderWidth: 2 },
        },
      ];
    });
    chart('gauge-basic', (o) => {
      nonAxis(o);
      o.legend.show = false;
      o.series = [
        {
          type: 'gauge',
          startAngle: 210,
          endAngle: -30,
          progress: { show: true, width: 16 },
          axisLine: {
            lineStyle: { width: 16, color: [[1, color('var(--theme-default-background)')]] },
          },
          itemStyle: { color: palette()[0] },
          axisLabel: { color: color('var(--theme-text-muted)') },
          detail: {
            formatter: '{value}%',
            fontSize: 26,
            color: color('var(--theme-default-text-color)'),
          },
          title: { color: color('var(--theme-text-muted)') },
          data: [{ value: 78, name: 'Readiness' }],
        },
      ];
    });
    chart('simple-graph', (o) => {
      nonAxis(o);
      o.legend.show = false;
      o.series = [
        {
          type: 'graph',
          layout: 'circular',
          roam: false,
          symbolSize: 48,
          label: {
            show: true,
            color: color('var(--theme-default-text-color)'),
            position: 'bottom',
          },
          data: ['Scope', 'Design', 'Build', 'Review', 'Release'].map((name) => ({
            name,
          })),
          links: [
            { source: 'Scope', target: 'Design' },
            { source: 'Design', target: 'Build' },
            { source: 'Build', target: 'Review' },
            { source: 'Review', target: 'Release' },
            { source: 'Review', target: 'Design' },
          ],
          lineStyle: { color: palette()[1], width: 2 },
          edgeSymbol: ['none', 'arrow'],
        },
      ];
    });
    chart('pictorial', (o) => {
      horizontal(o, false);
      o.color = [palette()[2]];
      o.series = [
        {
          name: 'Capacity',
          type: 'pictorialBar',
          symbol: 'roundRect',
          symbolRepeat: true,
          symbolSize: [8, 18],
          symbolMargin: 2,
          data: [18, 24, 22, 30, 26],
        },
      ];
    });
    // Resize only visible containers and update all examples when theme values change.
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver((entries) =>
        entries.forEach((entry) => {
          if (entry.contentRect.width && entry.contentRect.height)
            instances.find((item) => item.container === entry.target)?.instance.resize();
        })
      );
      instances.forEach((item) => observer.observe(item.container));
    }
    let timer;
    new MutationObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(
        () =>
          instances.forEach(({ instance, build }) => instance.setOption(build(), true)),
        100
      );
    }).observe(root, { attributes: true, attributeFilter: ['style', 'data-theme-color'] });
  }
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
