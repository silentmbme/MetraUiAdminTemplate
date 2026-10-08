(function () {
  "use strict";

  const chartElement = document.getElementById("support-ticket-volume");
  if (!chartElement || typeof ApexCharts === "undefined") return;

  const css = getComputedStyle(document.documentElement);
  const barColor = "rgb(94, 120, 253)";
  const muted = css.getPropertyValue("--theme-text-muted").trim() || "#748096";
  const border = css.getPropertyValue("--theme-default-border").trim() || "#e2e8ee";

  const options = {
    series: [{ name: "Tickets received", data: [3589, 5489, 8444, 11717, 7389, 6017, 4539, 3589, 2639, 1583, 1056, 739] }],
    chart: {
      type: "bar",
      height: 350,
      fontFamily: "inherit",
      toolbar: { show: false },
      zoom: { enabled: false },
      parentHeightOffset: 0,
      animations: { speed: 400 },
      dropShadow: { enabled: true, top: 5, left: 0, blur: 4, color: barColor, opacity: 0.16 },
    },
    colors: [barColor],
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: "35%",
        dataLabels: { position: "top" },
      },
    },
    fill: { opacity: 0.96 },
    dataLabels: {
      enabled: true,
      offsetY: -22,
      formatter: (value) => `${(value / 1000).toFixed(1)}k`,
      style: { fontSize: "12px", fontWeight: 600, colors: ["#344054"] },
      background: { enabled: false },
    },
    grid: { borderColor: border, strokeDashArray: 4, padding: { top: 8, left: 4, right: 8 } },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      position: "bottom",
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: muted, fontSize: "11px" } },
      tooltip: { enabled: false },
    },
    yaxis: {
      min: 0,
      max: 15000,
      tickAmount: 3,
      labels: { style: { colors: muted, fontSize: "11px" }, formatter: (value) => `${Math.round(value / 1000)}k` },
    },
    legend: { show: false },
    tooltip: { y: { formatter: (value) => `${value.toLocaleString()} tickets` } },
  };

  new ApexCharts(chartElement, options).render();

  const categoryChartElement = document.getElementById("support-resolved-category-chart");
  if (!categoryChartElement) return;

  const categoryChart = {
    series: [100, 86, 66],
    chart: {
      type: "radialBar",
      height: 220,
      width: "100%",
      fontFamily: "inherit",
      sparkline: { enabled: true },
      animations: { speed: 450 },
    },
    colors: ["rgb(10,10,10)", "rgb(94, 120, 253)", "rgb(253, 175, 34)"],
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        inverseOrder: true,
        hollow: { size: "40%", background: "#f5f6f8" },
        track: { background: "transparent", strokeWidth: "100%", margin: 7 },
        dataLabels: { show: false },
      },
    },
    labels: ["Monthly", "Weekly", "Today"],
    stroke: { lineCap: "round" },
    legend: { show: false },
    tooltip: { y: { formatter: (value) => `${Math.round(value)}% of period total` } },
  };

  new ApexCharts(categoryChartElement, categoryChart).render();
})();
