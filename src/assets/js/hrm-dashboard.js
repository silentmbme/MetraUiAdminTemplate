(() => {
  const muted = "#8c9097";
  const grid = "rgba(119, 119, 142, 0.12)";

  const employeeMixElement = document.querySelector("#hrm-employee-mix-chart");
  if (typeof ApexCharts !== "undefined" && employeeMixElement) {
    const employeeMixChart = new ApexCharts(employeeMixElement, {
      series: [1326, 1160, 998],
      labels: ["Male", "Female"],
      chart: { type: "donut", height: 225, fontFamily: "inherit" },
      colors: ["#1570ef", "rgb(147, 241, 38)"],
      fill: { type: "solid", opacity: 1, colors: ["#1570ef", "rgb(147, 241, 38)", "rgba(10,10,10)"] },
      dataLabels: { enabled: false },
      stroke: { width: 3, colors: ["#fff"] },
      legend: { show: false },
      plotOptions: {
        pie: {
          expandOnClick: false,
          donut: { size: "70%", labels: { show: false } },
        },
      },
      tooltip: { y: { formatter: (value) => `${value.toLocaleString()} employees` } },
    });
    employeeMixChart.render();
  }

  const payrollElement = document.querySelector("#hrm-payroll-chart");
  if (typeof ApexCharts !== "undefined" && payrollElement) {
    const payrollChart = new ApexCharts(payrollElement, {
      series: [
        { name: "Payroll", type: "area", data: [2.82, 2.98, 2.98, 2.72, 2.82, 2.82, 3.12, 3.12, 3.02, 2.82, 2.82, 3.12] },
        { name: "Budget", type: "line", data: [3.18, 3.42, 3.42, 3.18, 3.08, 3.18, 3.18, 3.34, 3.34, 3.26, 3.52, 3.52] },
      ],
      chart: { type: "line", height: 285, toolbar: { show: false }, fontFamily: "inherit", zoom: { enabled: false } },
      colors: ["rgb(94,120,253)", "rgba(10,10,10,0.5)"],
      dataLabels: { enabled: false },
      stroke: { curve: "smooth", width: [2.5, 2], dashArray: [0, 6], lineCap: "round" },
      fill: {
        type: ["gradient", "solid"],
        gradient: { shadeIntensity: 0.15, opacityFrom: 0.24, opacityTo: 0.02, stops: [0, 90, 100] },
      },
      markers: { size: 0, hover: { size: 5 }, strokeWidth: 2, strokeColors: "#fff" },
      xaxis: {
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { colors: muted, fontSize: "10px" } },
      },
      yaxis: {
        min: 2.4,
        max: 3.8,
        tickAmount: 4,
        labels: { formatter: (value) => `$${value.toFixed(1)}m`, style: { colors: muted, fontSize: "10px" } },
      },
      grid: { borderColor: grid, strokeDashArray: 4, padding: { left: 2, right: 2 } },
      legend: { show: false },
      tooltip: { y: { formatter: (value) => `$${value.toFixed(2)}m` } },
    });
    payrollChart.render();
  }
})();
