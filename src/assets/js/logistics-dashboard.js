(() => {
  "use strict";

  const chartElement = document.getElementById("logistics-expenses-chart");
  const yearSelect = document.getElementById("logistics-expense-year");
  if (!chartElement || !window.ApexCharts) return;

  const styles = getComputedStyle(document.documentElement);
  const secondaryChannels = styles
    .getPropertyValue("--theme-secondary-rgb")
    .trim()
    .split(",")
    .map((channel) => Number(channel.trim()));
  const secondary =
    secondaryChannels.length === 3 && secondaryChannels.every(Number.isFinite)
      ? `rgb(${secondaryChannels.join(", ")})`
      : "#6757f5";
  const muted = styles.getPropertyValue("--theme-text-muted").trim() || "#7a8795";
  const border = styles.getPropertyValue("--theme-default-border").trim() || "#eaecf1";
  const expenseData = {
    2025: [1580, 2230, 1330, 2121, 2360, 2140],
    2026: [1760, 2280, 1480, 2121, 2470, 2310],
  };

  const selectedMonth = 3;
  const buildSeries = (year) => {
    const values = expenseData[year] || expenseData[2025];
    return [
      {
        name: "Monthly expenses",
        data: values.map((value, index) => (index === selectedMonth ? 0 : value)),
      },
      {
        name: "Selected month",
        data: values.map((value, index) => (index === selectedMonth ? value : 0)),
      },
    ];
  };

  const chart = new ApexCharts(chartElement, {
    chart: {
      type: "bar",
      height: 245,
      stacked: true,
      toolbar: { show: false },
      fontFamily: "inherit",
      animations: { speed: 300 },
    },
    series: buildSeries(yearSelect?.value || "2025"),
    colors: ["#858b95", secondary],
    fill: {
      type: ["pattern", "solid"],
      opacity: 1,
      pattern: {
        style: "slantedLines",
        width: 8,
        height: 8,
        strokeWidth: 2,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "56%",
        borderRadius: 15,
      },
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: border,
      strokeDashArray: 0,
      xaxis: { lines: { show: false } },
      padding: { top: 8, left: 0, right: 0, bottom: 0 },
    },
    xaxis: {
      categories: ["Apr", "May", "Jun", "Jul", "Aug", "Sep"],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: muted, fontSize: "12px" } },
    },
    yaxis: {
      min: 0,
      max: 2800,
      tickAmount: 3,
      labels: { show: false },
    },
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "center",
      fontSize: "11px",
      labels: { colors: muted },
      markers: { width: 8, height: 8, radius: 8 },
      itemMargin: { horizontal: 10, vertical: 0 },
    },
    annotations: {
      points: [
        {
          x: "Jul",
          y: 2121,
          marker: {
            size: 5,
            fillColor: "#fff",
            strokeColor: secondary,
            strokeWidth: 3,
          },
          label: {
            text: "$2121",
            borderColor: "#202124",
            offsetY: -18,
            style: {
              background: "#202124",
              color: "#fff",
              fontSize: "11px",
              padding: { left: 9, right: 9, top: 5, bottom: 5 },
            },
          },
        },
      ],
    },
    tooltip: {
      shared: false,
      intersect: true,
      y: { formatter: (value) => `$${Math.round(value).toLocaleString()}` },
      marker: { show: false },
    },
    states: {
      hover: { filter: { type: "lighten", value: 0.04 } },
      active: { filter: { type: "none" } },
    },
  });

  chart.render();
  yearSelect?.addEventListener("change", () => {
    chart.updateSeries(buildSeries(yearSelect.value));
  });
})();
