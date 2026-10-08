(() => {
  "use strict";

  const chartElement = document.getElementById("finance-overview");
  const periodSelect = document.getElementById("finance-period");

  if (chartElement && window.ApexCharts) {
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
    const darkChannels = styles
      .getPropertyValue("--theme-dark-rgb")
      .trim()
      .split(",")
      .map((channel) => Number(channel.trim()));
    const dark =
      darkChannels.length === 3 && darkChannels.every(Number.isFinite)
        ? `rgb(${darkChannels.join(", ")})`
        : "#0a0a0a";
    const muted = styles.getPropertyValue("--theme-text-muted").trim() || "#7a8795";
    const border =
      styles.getPropertyValue("--theme-default-border").trim() || "#eaecf1";
    const periods = {
      month: {
        labels: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        operatingIncome: [13, 23, 20, 25, 10, 13, 13, 15, 13, 23, 20, 25],
        investmentIncome: [20, 30, 25, 50, 25, 30, 20, 35, 20, 30, 25, 50],
      },
      quarter: {
        labels: ["Q1", "Q2", "Q3", "Q4"],
        operatingIncome: [56, 48, 41, 68],
        investmentIncome: [75, 80, 75, 105],
      },
    };
    const applyBarPatterns = () => {
      const svg = chartElement.querySelector("svg.apexcharts-svg");
      if (!svg) return;

      let definitions = svg.querySelector("defs");
      if (!definitions) {
        definitions = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "defs"
        );
        svg.prepend(definitions);
      }

      definitions
        .querySelectorAll('[id^="finance-bar-hatch-"]')
        .forEach((pattern) => pattern.remove());

      const seriesGroups = Array.from(
        svg.querySelectorAll(".apexcharts-series")
      ).filter((group) => group.querySelector(".apexcharts-bar-area"));

      [dark, primary].forEach((backgroundColor, index) => {
        const patternId = `finance-bar-hatch-${index}`;
        const pattern = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "pattern"
        );
        pattern.setAttribute("id", patternId);
        pattern.setAttribute("patternUnits", "userSpaceOnUse");
        pattern.setAttribute("width", "8");
        pattern.setAttribute("height", "8");

        const background = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect"
        );
        background.setAttribute("width", "8");
        background.setAttribute("height", "8");
        background.setAttribute("fill", backgroundColor);
        pattern.append(background);

        const hatch = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path"
        );
        hatch.setAttribute("d", "M-2 8 L8 -2 M2 10 L10 2");
        hatch.setAttribute("fill", "none");
        hatch.setAttribute("stroke", "#fff");
        hatch.setAttribute("stroke-opacity", "0.58");
        hatch.setAttribute("stroke-width", "1.2");
        pattern.append(hatch);
        definitions.append(pattern);

        seriesGroups[index]
          ?.querySelectorAll(".apexcharts-bar-area")
          .forEach((bar) => {
            bar.setAttribute("fill", `url(#${patternId})`);
            bar.style.fill = `url(#${patternId})`;
          });
      });
    };
    const initial = periods.month;
    const chart = new ApexCharts(chartElement, {
      chart: {
        type: "line",
        height: 320,
        toolbar: { show: false },
        zoom: { enabled: true },
        fontFamily: "inherit",
        animations: { speed: 350 },
        stacked: true,
        events: {
          mounted: applyBarPatterns,
          updated: applyBarPatterns,
        },
      },
      series: [
        {
          name: "Operating income",
          data: initial.operatingIncome,
          type: "column",
        },
        {
          name: "Investment income",
          data: initial.investmentIncome,
          type: "column",
        },
      ],
      colors: [dark, primary],
      stroke: {
        curve: "smooth",
        colors: [dark, primary],
        width: [2, 2],
        dashArray: [0, 0],
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "40%",
          borderRadius: 3,
        },
      },
      dataLabels: { enabled: false },
      grid: { show: true, borderColor: border, strokeDashArray: 4 },
      xaxis: {
        categories: initial.labels,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          show: true,
          style: { colors: muted, fontSize: "11px", fontWeight: 600 },
        },
      },
      yaxis: {
        min: 0,
        labels: {
          style: { colors: muted, fontSize: "11px", fontWeight: 600 },
          formatter: (value) => `$${Math.round(value)}k`,
        },
      },
      legend: {
        show: true,
        position: "bottom",
        offsetY: 10,
        labels: { colors: muted },
        markers: { width: 5, height: 5, strokeWidth: 0, radius: 12 },
      },
      tooltip: { y: { formatter: (value) => `$${value.toLocaleString()}k` } },
    });

    chart.render();
    periodSelect?.addEventListener("change", () => {
      const data = periods[periodSelect.value] || initial;
      chart.updateOptions({ xaxis: { categories: data.labels } }, false, true);
      chart.updateSeries([
        {
          name: "Operating income",
          data: data.operatingIncome,
          type: "column",
        },
        {
          name: "Investment income",
          data: data.investmentIncome,
          type: "column",
        },
      ]);
    });
  }

  const search = document.getElementById("finance-activity-search");
  const statusFilter = document.getElementById("finance-activity-filter");
  const rows = Array.from(
    document.querySelectorAll(".finance-activity-table tbody tr")
  );
  const count = document.getElementById("finance-activity-count");

  function filterActivities() {
    const query = search.value.trim().toLowerCase();
    const selectedStatus = statusFilter.value;
    let visibleCount = 0;

    rows.forEach((row) => {
      const matchesQuery = row.textContent.toLowerCase().includes(query);
      const matchesStatus =
        !selectedStatus || row.dataset.status === selectedStatus;
      const isVisible = matchesQuery && matchesStatus;

      row.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    count.textContent = `Showing ${visibleCount} of ${rows.length} activities`;
  }

  search?.addEventListener("input", filterActivities);
  statusFilter?.addEventListener("change", filterActivities);

  const cardsCarousel = document.querySelector(".finance-cards-swiper");
  if (cardsCarousel && window.Swiper) {
    const cardsSection = cardsCarousel.closest(".finance-my-cards");
    new Swiper(cardsCarousel, {
      slidesPerView: 1,
      spaceBetween: 12,
      loop: true,
      speed: 550,
      autoplay: {
        delay: 3200,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      keyboard: { enabled: true },
      pagination: {
        el: cardsSection?.querySelector(".finance-cards-pagination"),
        clickable: true,
      },
      navigation: {
        prevEl: cardsSection?.querySelector(".finance-card-prev"),
        nextEl: cardsSection?.querySelector(".finance-card-next"),
      },
    });
  }
})();
