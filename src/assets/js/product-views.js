(() => {
  "use strict";

  const periodSelect = document.getElementById("views-period");
  const chartElement = document.getElementById("product-views-chart");
  const sourcesElement = document.getElementById("views-sources-chart");
  if (!window.ApexCharts || !chartElement || !sourcesElement) return;

  const periodData = {
    7: {
      views: [1840, 2160, 1980, 2520, 2390, 2880, 2710],
      visitors: [1120, 1360, 1240, 1580, 1510, 1820, 1690],
      total: "16,480",
      visitorsTotal: "10,320",
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
    30: {
      views: [
        4200, 5100, 4680, 5860, 6240, 5520, 7180, 6840, 7620, 7010, 8140, 7780,
        8960, 8420, 9180, 8760, 10240, 9640, 10820, 9940, 11480, 10620, 11940,
        11180, 12640, 11980, 13420, 12840, 14680, 13920,
      ],
      visitors: [
        2660, 3210, 2980, 3740, 4010, 3520, 4580, 4360, 4870, 4480, 5220, 4980,
        5740, 5390, 5880, 5610, 6540, 6150, 6930, 6360, 7350, 6800, 7660, 7180,
        8110, 7690, 8610, 8240, 9410, 8910,
      ],
      total: "268,420",
      visitorsTotal: "171,840",
      labels: Array.from({ length: 30 }, (_, index) => `Day ${index + 1}`),
    },
    90: {
      views: [
        18200, 19400, 17600, 21800, 22600, 20400, 24800, 23700, 26100, 24900,
        27800, 26500, 29400,
      ],
      visitors: [
        11600, 12400, 11200, 13900, 14400, 13000, 15800, 15100, 16600, 15800,
        17700, 16900, 18700,
      ],
      total: "792,640",
      visitorsTotal: "508,920",
      labels: [
        "Week 1",
        "Week 2",
        "Week 3",
        "Week 4",
        "Week 5",
        "Week 6",
        "Week 7",
        "Week 8",
        "Week 9",
        "Week 10",
        "Week 11",
        "Week 12",
        "Week 13",
      ],
    },
  };

  const cssValue = (name, fallback) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim() ||
    fallback;
  const toHex = (value, fallback) => {
    const parts = value.split(",").map((part) => Number(part.trim()));
    return parts.length === 3 && parts.every(Number.isFinite)
      ? `#${parts
          .map((part) =>
            Math.max(0, Math.min(255, part)).toString(16).padStart(2, "0")
          )
          .join("")}`
      : fallback;
  };
  const colors = {
    primary: toHex(cssValue("--theme-primary-rgb", "193,237,16"), "#7a9b18"),
    secondary: "#5e78fd",
    muted: cssValue("--theme-text-muted", "#7a8795"),
    border: cssValue("--theme-default-border", "#e8ebef"),
    text: cssValue("--theme-default-text-color", "#273142"),
  };

  const trafficChart = new ApexCharts(chartElement, {
    chart: {
      type: "line",
      height: 350,
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: "inherit",
      animations: { speed: 350 },
    },
    series: [
      { name: "Views", type: "column", data: [] },
      { name: "Visitors", type: "line", data: [] },
    ],
    colors: [colors.primary, colors.secondary],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: [0, 3] },
    fill: { opacity: [0.78, 1] },
    markers: { size: [0, 3], strokeWidth: 0, hover: { size: 5 } },
    plotOptions: {
      bar: { columnWidth: "42%", borderRadius: 4, borderRadiusApplication: "end" },
    },
    grid: {
      borderColor: colors.border,
      strokeDashArray: 4,
      padding: { left: 4, right: 12 },
    },
    xaxis: {
      categories: [],
      labels: {
        style: { colors: colors.muted, fontSize: "11px" },
        rotate: -30,
        offsetY: 18,
        hideOverlappingLabels: true,
        trim: true,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: {
      labels: {
        style: { colors: colors.muted, fontSize: "11px" },
        formatter: (value) => `${Math.round(value / 1000)}k`,
      },
    },
    legend: { show: false },
    tooltip: {
      shared: true,
      intersect: false,
      y: { formatter: (value) => `${Number(value).toLocaleString()} visits` },
    },
    responsive: [
      {
        breakpoint: 576,
        options: {
          chart: { height: 240 },
          xaxis: { labels: { rotate: -45, style: { fontSize: "9px" } } },
        },
      },
    ],
  });

  const sourcesChart = new ApexCharts(sourcesElement, {
    chart: { type: "bar", height: 250, fontFamily: "inherit", toolbar: { show: false } },
    series: [{ name: "Traffic share", data: [52, 28, 13, 7] }],
    colors: [colors.primary, colors.secondary, "#a58be7", "#ffb547"],
    dataLabels: {
      enabled: true,
      textAnchor: "start",
      offsetX: 8,
      style: { colors: [colors.text], fontSize: "11px", fontWeight: 600 },
      formatter: (value) => `${value}%`,
    },
    legend: { show: false },
    plotOptions: {
      bar: {
        horizontal: true,
        distributed: true,
        borderRadius: 5,
        barHeight: "48%",
        dataLabels: { position: "top" },
      },
    },
    xaxis: {
      categories: ["Online store", "Search", "Social", "Referral"],
      min: 0,
      max: 60,
      tickAmount: 3,
      labels: {
        style: { colors: colors.muted, fontSize: "10px" },
        formatter: (value) => `${value}%`,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { style: { colors: colors.text, fontSize: "11px" } } },
    grid: {
      borderColor: colors.border,
      strokeDashArray: 4,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
      padding: { left: 4, right: 22 },
    },
    tooltip: { y: { formatter: (value) => `${value}% of visits` } },
  });
  function updatePeriod() {
    const data = periodData[periodSelect.value] || periodData[30];
    document.getElementById("views-total").textContent = data.total;
    document.getElementById("views-visitors").textContent = data.visitorsTotal;
    trafficChart.updateOptions(
      { xaxis: { categories: data.labels } },
      false,
      true
    );
    trafficChart.updateSeries(
      [
        { name: "Views", type: "column", data: data.views },
        { name: "Visitors", type: "line", data: data.visitors },
      ],
      true
    );
  }

  Promise.all([trafficChart.render(), sourcesChart.render()]).then(
    updatePeriod
  );
  periodSelect.addEventListener("change", updatePeriod);
})();
