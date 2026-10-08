(function () {
  "use strict";

  if (typeof ApexCharts === "undefined") return;

  const theme = getComputedStyle(document.body);
  const primaryRgb = theme.getPropertyValue("--theme-primary-rgb").trim() || "100, 110, 240";
  const secondaryRgb = theme.getPropertyValue("--theme-secondary-rgb").trim() || primaryRgb;
  const secondary = `rgb(${secondaryRgb})`;

  const statusElement = document.querySelector("#projects-status-chart");
  if (statusElement) {
    const ranges = {
      "1d": [18, 48, 48, 66, 66, 49, 49, 68, 68, 35, 35, 29, 59, 59, 74, 74],
      "7d": [22, 50, 50, 69, 69, 51, 51, 71, 71, 39, 39, 30, 61, 61, 78, 78],
      "2w": [16, 43, 43, 62, 62, 46, 46, 63, 63, 34, 34, 27, 57, 57, 74, 74, 50, 50, 82, 82],
      "1m": [14, 40, 40, 59, 59, 44, 44, 68, 68, 41, 41, 24, 58, 58, 76, 76, 54, 54, 84, 84],
      "6m": [12, 37, 37, 56, 56, 46, 46, 70, 70, 42, 42, 28, 61, 61, 79, 79, 53, 53, 87, 87],
      "1y": [10, 33, 33, 52, 52, 42, 42, 66, 66, 38, 38, 25, 58, 58, 76, 76, 50, 50, 89, 89],
    };
    const statusChart = new ApexCharts(statusElement, {
      chart: {
        type: "area",
        height: 112,
        fontFamily: "inherit",
        sparkline: { enabled: true },
        toolbar: { show: false },
        zoom: { enabled: false },
      },
      series: [{ name: "Project activity", data: ranges["2w"] }],
      colors: [secondary],
      stroke: { curve: "smooth", width: 2, lineCap: "round" },
      fill: {
        type: "gradient",
        colors: ["#5e78fd"],
        gradient: { shadeIntensity: 0, opacityFrom: 0.4, opacityTo: 0.1, stops: [0, 100] },
      },
      markers: { size: 0, hover: { size: 4, color: secondary } },
      dataLabels: { enabled: false },
      grid: { show: false, padding: { left: 0, right: 0, top: 8, bottom: 0 } },
      yaxis: { min: 0, max: 100 },
      tooltip: { y: { formatter: (value) => `${value} project activity points` } },
    });
    statusChart.render();

    document.querySelectorAll("[data-project-range]").forEach((button) => {
      button.addEventListener("click", () => {
        const range = button.dataset.projectRange;
        if (!ranges[range]) return;
        statusChart.updateSeries([{ name: "Project activity", data: ranges[range] }]);
        document.querySelectorAll("[data-project-range]").forEach((rangeButton) => {
          rangeButton.classList.toggle("active", rangeButton === button);
          rangeButton.setAttribute("aria-pressed", rangeButton === button ? "true" : "false");
        });
        statusElement.setAttribute("aria-label", `Project activity trend for the last ${button.textContent.trim()}`);
      });
    });
  }

  var options = {
    chart: {
      height: 340,
      type: "scatter",
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    series: [
      {
        name: "Occupied Capacity",
        data: [[1, 18], [2, 28], [3, 24], [4, 36], [5, 30], [6, 26]],
      },
      {
        name: "Available Capacity",
        data: [[1, 9], [2, 14], [3, 18], [4, 22], [5, 20], [6, 32]],
      },
    ],
    colors: ["rgba(var(--theme-dark-rgb), 1)", "rgba(var(--theme-secondary-rgb), 1)"],
    markers: {
      size: 18,
      shape: "square",
      strokeWidth: 0,
      hover: { size: 20 },
    },
    grid: { borderColor: "#edf2f7", strokeDashArray: 4 },
    dataLabels: { enabled: false },
    legend: { show: false },
    xaxis: {
      categories: ["Jan", "Mar", "May", "Jul", "Sep", "Dec"],
    },
    yaxis: { min: 0 },
  };

  new ApexCharts(document.querySelector("#project-productivity"), options).render();

})();
