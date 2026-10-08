(() => {
  "use strict";

  const element = document.getElementById("income-over-time-chart");
  if (!element || !window.ApexCharts) return;

  const styles = getComputedStyle(document.documentElement);
  const primaryChannels = styles
    .getPropertyValue("--theme-primary-rgb")
    .trim()
    .split(",")
    .map((channel) => Number(channel.trim()));
  const primary =
    primaryChannels.length === 3 && primaryChannels.every(Number.isFinite)
      ? `rgb(${primaryChannels.join(", ")})`
      : "#c1ed10";
  const muted = styles.getPropertyValue("--theme-text-muted").trim() || "#7a8795";
  const border = styles.getPropertyValue("--theme-default-border").trim() || "#eaecf1";

  const chart = new ApexCharts(element, {
    chart: {
      type: "bar",
      height: 260,
      toolbar: { show: false },
      fontFamily: "inherit",
      animations: { speed: 350 },
    },
    series: [{ name: "Income", data: [22100, 25200, 28800, 27600, 30150, 32840] }],
    colors: [primary],
    fill: { colors: [primary], opacity: 1 },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "42%",
        borderRadius: 4,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    grid: { borderColor: border, strokeDashArray: 4, padding: { top: 0, right: 8 } },
    xaxis: {
      categories: ["Apr", "May", "Jun", "Jul", "Aug", "Sep"],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: muted, fontSize: "12px" } },
    },
    yaxis: {
      min: 0,
      max: 40000,
      tickAmount: 4,
      labels: {
        style: { colors: muted, fontSize: "11px" },
        formatter: (value) => `$${Math.round(value / 1000)}k`,
      },
    },
    legend: { show: false },
    tooltip: { y: { formatter: (value) => `$${value.toLocaleString()}` } },
  });

  chart.render();
})();
