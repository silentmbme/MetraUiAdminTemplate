(() => {
  const themeStyles = getComputedStyle(document.documentElement);
  const themePrimaryRgb = themeStyles.getPropertyValue("--theme-primary-rgb").trim();
  const themePrimary = themePrimaryRgb
    ? `rgb(${themePrimaryRgb})`
    : themeStyles.getPropertyValue("--theme-primary-color").trim() || "#93f126";
  const themeSecondaryRgb = themeStyles.getPropertyValue("--theme-secondary-rgb").trim();
  const themeSecondaryTrack = themeSecondaryRgb ? `rgba(${themeSecondaryRgb}, 0.08)` : "rgba(94, 120, 253, 0.08)";
  const requestChartElement = document.querySelector("#ai-request-chart");
  const modelChartElement = document.querySelector("#ai-model-chart");
  const latencyChartElement = document.querySelector("#ai-latency-chart");
  const evaluationChartElement = document.querySelector("#ai-evaluation-chart");
  const costChartElement = document.querySelector("#ai-cost-chart");
  const periodSelect = document.querySelector("#ai-period");

  const requestFunnels = {
    7: { stages: [61900, 46400, 34000, 18500], label: "the last 7 days" },
    30: { stages: [248600, 186500, 136700, 74600], label: "the last 30 days" },
    90: { stages: [718000, 538500, 394900, 215400], label: "the last 90 days" },
  };

  if (typeof ApexCharts !== "undefined" && costChartElement) {
    const costChart = new ApexCharts(costChartElement, {
      series: [{
        name: "Inference spend",
        data: [2480, 2670, 2540, 2940, 3090, 3280, 3170, 3460, 3610, 3740, 3520, 3842],
      }],
      chart: {
        type: "bar",
        height: 130,
        toolbar: { show: false },
        fontFamily: "inherit",
      },
      colors: ["#5e78fd"],
      fill: { type: "solid", opacity: 1, colors: ["#5e78fd"] },
      plotOptions: { bar: { columnWidth: "48%", borderRadius: 4, colors: { backgroundBarColors: [themeSecondaryTrack], backgroundBarRadius: 4 } } },
      dataLabels: { enabled: false },
      stroke: { show: false },
      xaxis: {
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        labels: { show: true, rotate: 0, style: { fontSize: "10px", colors: "#8c9097" } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: { show: false },
      grid: { show: false, padding: { top: 4, right: 3, bottom: 0, left: 3 } },
      tooltip: { y: { formatter: (value) => `$${value.toLocaleString()}` } },
    });
    costChart.render();
  }

  const updateRequestFunnel = (funnel) => {
    if (!requestChartElement || !funnel) return;
    const firstStage = funnel.stages[0];
    const baseline = 280;
    const maxValue = firstStage * 1.1;
    const xPoints = [0, 250, 500, 750, 1000];
    const chartPoints = [...funnel.stages, funnel.stages[funnel.stages.length - 1] * 0.66];
    const yPoints = chartPoints.map((value) => baseline - (value / maxValue) * (baseline - 12));

    requestChartElement.querySelectorAll("[data-funnel-segment]").forEach((segment, index) => {
      const leftX = index === 0 ? xPoints[index] : xPoints[index] + 4;
      const rightX = index === funnel.stages.length - 1 ? xPoints[index + 1] : xPoints[index + 1] - 4;
      segment.setAttribute("points", `${leftX},${yPoints[index]} ${rightX},${yPoints[index + 1]} ${rightX},${baseline} ${leftX},${baseline}`);
    });
    requestChartElement.querySelector("[data-funnel-line]")?.setAttribute(
      "d",
      `M${xPoints[0]} ${yPoints[0]} ${xPoints.slice(1).map((x, index) => `L${x} ${yPoints[index + 1]}`).join(" ")}`,
    );

    document.querySelectorAll("[data-ai-stage-value]").forEach((element) => {
      const stageIndex = Number(element.dataset.aiStageValue);
      element.textContent = `${(funnel.stages[stageIndex] / 1000).toFixed(1)}k`;
    });
    document.querySelectorAll("[data-ai-stage-rate]").forEach((element) => {
      const stageIndex = Number(element.dataset.aiStageRate);
      element.textContent = `${Math.round((funnel.stages[stageIndex] / firstStage) * 100)}%`;
    });
    document.querySelector("[data-ai-range-label]")?.replaceChildren(document.createTextNode(funnel.label));
  };

  updateRequestFunnel(requestFunnels[periodSelect?.value || "30"]);

  periodSelect?.addEventListener("change", () => {
    const selectedRange = requestFunnels[periodSelect.value];
    if (!selectedRange) return;

    document.querySelector("[data-ai-period-description]")?.replaceChildren(document.createTextNode("Requests moving through each completion stage"));
    updateRequestFunnel(selectedRange);
  });

  if (typeof ApexCharts !== "undefined" && modelChartElement) {
    const modelChart = new ApexCharts(modelChartElement, {
      series: [48, 32, 20],
      labels: ["MetraUI GPT", "Claude Sonnet", "Gemini Pro"],
      chart: { type: "donut", height: 280, fontFamily: "inherit" },
      colors: ["rgb(10, 10, 10)", "rgb(147, 241, 38)", "rgb(94, 120, 253)"],
      dataLabels: { enabled: false },
      stroke: { width: 3, colors: ["#fff"] },
      legend: { show: false },
      plotOptions: {
        pie: {
          expandOnClick: false,
          donut: {
            size: "76%",
            labels: {
              show: true,
              name: { show: true, fontSize: "12px", color: "#6c757d", offsetY: 18 },
              value: { show: true, fontSize: "24px", fontWeight: 600, offsetY: -14, formatter: (value) => `${value}%` },
              total: { show: true, label: "Requests", fontSize: "12px", color: "#6c757d", formatter: () => "248.6k" },
            },
          },
        },
      },
      tooltip: { y: { formatter: (value) => `${value}% of requests` } },
    });
    modelChart.render();
  }

  if (typeof ApexCharts !== "undefined" && latencyChartElement) {
    const latencyChart = new ApexCharts(latencyChartElement, {
      series: [
        { name: "P50 median", data: [612, 940, 1100] },
        { name: "P95 tail latency", data: [1420, 1980, 2240] },
      ],
      chart: { type: "bar", height: 235, toolbar: { show: false }, fontFamily: "inherit", zoom: { enabled: false } },
      colors: ["rgb(147, 241, 38)", "#5e78fd"],
      plotOptions: { bar: { horizontal: true, barHeight: "48%", borderRadius: 4, borderRadiusApplication: "end" } },
      stroke: { show: false },
      dataLabels: { enabled: false },
      xaxis: {
        categories: ["MetraUI GPT", "Claude Sonnet", "Gemini Pro"],
        min: 0,
        max: 2500,
        tickAmount: 5,
        labels: { formatter: (value) => `${Math.round(value)} ms`, style: { colors: "#8c9097", fontSize: "10px" } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: { labels: { style: { colors: "#6c757d", fontSize: "12px" } } },
      grid: { borderColor: "#eef0f2", strokeDashArray: 3, padding: { left: 8, right: 12 } },
      legend: { show: true, position: "bottom", horizontalAlign: "left", fontSize: "11px", markers: { width: 8, height: 8, radius: 8 } },
      tooltip: { shared: true, intersect: false, y: { formatter: (value) => `${value.toLocaleString()} ms` } },
    });
    latencyChart.render();
  }

  if (typeof ApexCharts !== "undefined" && evaluationChartElement) {
    const evaluationChart = new ApexCharts(evaluationChartElement, {
      series: [94.8],
      chart: { type: "radialBar", height: 138, width: 138, sparkline: { enabled: true }, fontFamily: "inherit" },
      colors: [themePrimary],
      plotOptions: { radialBar: { hollow: { size: "68%" }, track: { background: "#eef0f2", strokeWidth: "100%" }, dataLabels: { show: false } } },
      stroke: { lineCap: "round" },
    });
    evaluationChart.render();
  }

  const generateButton = document.querySelector("#ai-generate-button");
  const promptInput = document.querySelector("#ai-prompt-input");
  const taskSelect = document.querySelector("#ai-task-select");
  const modelSelect = document.querySelector("#ai-model-select");
  const preview = document.querySelector("#ai-generated-preview");
  const previewText = document.querySelector("#ai-generated-text");

  generateButton?.addEventListener("click", () => {
    const prompt = promptInput?.value.trim();
    if (!prompt) {
      promptInput?.focus();
      promptInput?.setCustomValidity("Enter a prompt to create a sample preview.");
      promptInput?.reportValidity();
      return;
    }

    promptInput.setCustomValidity("");
    const task = taskSelect?.value.toLowerCase() || "generation";
    const model = modelSelect?.value || "Selected model";
    previewText.textContent = `Sample ${task} response for "${prompt}". This preview uses demo content and was not generated by ${model}.`;
    preview.classList.remove("d-none");
  });

  promptInput?.addEventListener("input", () => promptInput.setCustomValidity(""));

  document.querySelector("#ai-export")?.addEventListener("click", () => {
    const rows = Array.from(document.querySelectorAll(".table tbody tr"));
    const csvLines = [["Run", "Assistant", "Model", "Duration", "Tokens", "Status", "Cost"]];

    rows.forEach((row) => {
      csvLines.push(Array.from(row.querySelectorAll("td")).map((cell) => cell.innerText.trim().replace(/\s+/g, " ")));
    });

    const csv = csvLines.map((line) => line.map((value) => `"${value.replace(/"/g, '""')}"`).join(",")).join("\n");
    const downloadUrl = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const downloadLink = document.createElement("a");
    downloadLink.href = downloadUrl;
    downloadLink.download = "ai-runs-sample.csv";
    downloadLink.click();
    URL.revokeObjectURL(downloadUrl);
  });
})();
