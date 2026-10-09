// Shared defaults for all ApexCharts instances in the project.
window.Apex = window.Apex || {};
window.Apex.chart = window.Apex.chart || {};
window.Apex.chart.toolbar = {
  ...window.Apex.chart.toolbar,
  show: false,
};

// Ensure every ApexCharts instance is registered, including charts without an
// explicit chart.id, so live palette changes can recolor all pages uniformly.
let metraApexCharts;
function trackApexCharts(Constructor) {
  if (!Constructor?.prototype || Constructor.prototype.render?.metraThemeTracked) {
    return Constructor;
  }

  const render = Constructor.prototype.render;
  const trackedRender = function (...args) {
    const chartConfig = this.w?.config?.chart;
    if (chartConfig && !chartConfig.id) {
      chartConfig.id = `metraui-${this.w.globals.cuid}`;
      this.w.globals.chartID = chartConfig.id;
    }
    return render.apply(this, args);
  };
  trackedRender.metraThemeTracked = true;
  Constructor.prototype.render = trackedRender;
  return Constructor;
}

Object.defineProperty(window, "ApexCharts", {
  configurable: true,
  enumerable: true,
  get() {
    return metraApexCharts;
  },
  set(Constructor) {
    metraApexCharts = trackApexCharts(Constructor);
  },
});

(() => {
  const root = document.documentElement;
  let refreshTimer;

  function refreshApexChartPalette() {
    const channels = ["primary", "secondary", "success", "info", "warning", "danger"];
    const colors = channels.map((name) => {
      const value = getComputedStyle(root).getPropertyValue(`--theme-${name}-rgb`).trim();
      return value ? `rgb(${value})` : "#5e78fd";
    });

    (window.Apex?._chartInstances || []).forEach(({ chart }) => {
      if (chart?.updateOptions) {
        chart.updateOptions({ colors, fill: { colors } }, false, false, false);
      }
    });
  }

  new MutationObserver(() => {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(refreshApexChartPalette, 80);
  }).observe(root, { attributes: true, attributeFilter: ["style"] });
})();
