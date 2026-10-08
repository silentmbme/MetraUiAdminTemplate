(() => {
  "use strict";

  const chartElement = document.getElementById("crm-revenue-analytics");
  if (chartElement && window.ApexCharts) {
  
    const styles = getComputedStyle(document.documentElement);
    const themeColor = (variable, fallback) => {
      const channels = styles.getPropertyValue(variable).trim().split(",").map((channel) => Number(channel.trim()));
      return channels.length === 3 && channels.every(Number.isFinite)
        ? `rgb(${channels.join(", ")})`
        : fallback;
    };
    const primary = themeColor("--theme-primary-rgb", "rgb(193, 237, 16)");
    const secondary = themeColor("--theme-secondary-rgb", "rgb(94, 120, 253)");
    const muted = styles.getPropertyValue("--theme-text-muted").trim() || "#7a8795";
    const border = styles.getPropertyValue("--theme-default-border").trim() || "#eaecf1";
    const periodSelect = document.getElementById("crm-revenue-period");
  
    const revenuePeriods = {
      month: {
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
        revenue: [590, 830, 880, 940, 850, 890, 930, 860, 900],
        opportunities: [340, 570, 680, 920, 770, 600, 710, 600, 820],
      },
      quarter: {
        categories: ["Q1", "Q2", "Q3", "Q4"],
        revenue: [2310, 2680, 2790, 3040],
        opportunities: [1980, 2240, 2380, 2670],
      },
      year: {
        categories: ["2022", "2023", "2024", "2025", "2026"],
        revenue: [8250, 9140, 10320, 11860, 12740],
        opportunities: [7520, 8190, 9210, 10540, 11320],
      },
    };
  
    const chart = new ApexCharts(chartElement, {
      chart: {
        type: "line",
        height: 285,
        toolbar: { show: false },
        fontFamily: "inherit",
        animations: { speed: 350 },
      },
      series: [
        { name: "Revenue", type: "column", data: revenuePeriods.month.revenue },
        { name: "Opportunity trend", type: "line", data: revenuePeriods.month.opportunities },
      ],
      colors: [secondary, primary],
      plotOptions: { bar: { columnWidth: "38%", borderRadius: 5, borderRadiusApplication: "end" } },
      stroke: { width: [0, 3], curve: "smooth", lineCap: "round" },
      markers: { size: [0, 4], strokeWidth: 2, hover: { size: 6 } },
      dataLabels: { enabled: false },
      grid: { borderColor: border, strokeDashArray: 4, padding: { left: 8, right: 8 } },
      xaxis: {
        categories: revenuePeriods.month.categories,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { colors: muted, fontSize: "11px" } },
      },
      yaxis: {
        min: 0,
        labels: { style: { colors: muted, fontSize: "11px" }, formatter: (value) => `$${Math.round(value)}` },
      },
      legend: { show: false },
      tooltip: { shared: true, intersect: false, y: { formatter: (value) => `$${value.toLocaleString()}` } },
    });
  
    chart.render();
  
    periodSelect?.addEventListener("change", () => {
      const data = revenuePeriods[periodSelect.value] || revenuePeriods.month;
      chart.updateOptions({ xaxis: { categories: data.categories } }, false, true);
      chart.updateSeries([
        { name: "Revenue", type: "column", data: data.revenue },
        { name: "Opportunity trend", type: "line", data: data.opportunities },
      ], true);
    });
  }

  const calendarGrid = document.getElementById("crm-calendar-grid");
  const calendarTitle = document.getElementById("crm-calendar-month-title");
  const calendarEvents = document.getElementById("crm-calendar-events");
  if (calendarGrid && calendarTitle && calendarEvents) {
    const calendar = calendarGrid.closest(".crm-calendar");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let selectedDate = new Date(2025, 9, 8);
    let visibleMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });
    const dateFormatter = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const eventSchedule = {
      "2025-10-08": [
        {
          title: "Mesh Weekly Meeting",
          start: "09:00",
          end: "10:00",
          timeLabel: "9:00 - 10:00 am",
          location: "Google Meet",
          attendees: [1, 4, 5],
        },
        {
          title: "Gamification Demo",
          start: "10:45",
          end: "11:45",
          timeLabel: "10:45 - 11:45 am",
          location: "Slack",
          attendees: [2, 3, 4],
        },
      ],
      "2025-10-10": [
        {
          title: "Pipeline review",
          start: "13:00",
          end: "13:30",
          timeLabel: "1:00 - 1:30 pm",
          location: "Google Meet",
          attendees: [1, 2, 5],
        },
      ],
      "2025-10-15": [
        {
          title: "Northstar Labs follow-up",
          start: "11:00",
          end: "11:30",
          timeLabel: "11:00 - 11:30 am",
          location: "Calendar",
          attendees: [2, 4],
        },
      ],
    };
    const toDateKey = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
    const renderCalendarEvents = () => {
      const events = eventSchedule[toDateKey(selectedDate)] || [];
      calendarEvents.replaceChildren();
      if (!events.length) {
        const emptyState = document.createElement("p");
        emptyState.className = "crm-calendar-empty mb-0";
        emptyState.textContent = "No meetings scheduled for this day.";
        calendarEvents.append(emptyState);
        return;
      }

      events.forEach((event) => {
        const article = document.createElement("article");
        article.className = "crm-calendar-event";
        const heading = document.createElement("div");
        heading.className = "crm-calendar-event-heading";
        const title = document.createElement("strong");
        title.textContent = event.title;
        const time = document.createElement("time");
        time.dateTime = `${toDateKey(selectedDate)}T${event.start}`;
        time.textContent = event.timeLabel;
        heading.append(title, time);

        const footer = document.createElement("div");
        footer.className = "crm-calendar-event-footer";
        const attendees = document.createElement("div");
        attendees.className = "avatar-list-stacked";
        attendees.setAttribute("aria-label", "Meeting attendees");
        event.attendees.forEach((attendeeId) => {
          const avatar = document.createElement("span");
          avatar.className = "avatar avatar-sm avatar-rounded";
          const image = document.createElement("img");
          image.src = `../assets/images/users/${attendeeId}.png`;
          image.alt = "";
          avatar.append(image);
          attendees.append(avatar);
        });
        const location = document.createElement("span");
        location.className = "crm-calendar-location";
        location.append(document.createTextNode(event.location));
        const arrow = document.createElement("i");
        arrow.className = "ri-arrow-right-s-line";
        arrow.setAttribute("aria-hidden", "true");
        location.append(arrow);
        footer.append(attendees, location);
        article.append(heading, footer);
        calendarEvents.append(article);
      });
    };
    const renderCalendar = () => {
      calendarTitle.textContent = monthFormatter.format(visibleMonth);
      calendarGrid.setAttribute("aria-label", monthFormatter.format(visibleMonth));
      calendarGrid.querySelectorAll(".crm-calendar-day").forEach((day) => day.remove());
      const weekStart = new Date(selectedDate);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());

      for (let offset = 0; offset < 7; offset += 1) {
        const date = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + offset);
        const dateKey = toDateKey(date);
        const isSelected = dateKey === toDateKey(selectedDate);
        const dayButton = document.createElement("button");
        dayButton.type = "button";
        dayButton.className = "crm-calendar-day";
        dayButton.setAttribute("aria-label", dateFormatter.format(date));
        dayButton.setAttribute("aria-pressed", String(isSelected));
        dayButton.dataset.calendarDate = dateKey;
        dayButton.textContent = String(date.getDate());
        if (dateKey === toDateKey(today)) dayButton.classList.add("is-today");
        if (isSelected) {
          dayButton.classList.add("active");
          dayButton.setAttribute("aria-current", "date");
        }
        calendarGrid.append(dayButton);
      }
      renderCalendarEvents();
    };

    calendar?.querySelectorAll("[data-calendar-step]").forEach((button) => {
      button.addEventListener("click", () => {
        visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + Number(button.dataset.calendarStep), 1);
        const selectedDay = selectedDate.getDate();
        const finalDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
        selectedDate = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), Math.min(selectedDay, finalDay));
        renderCalendar();
      });
    });
    calendarGrid.addEventListener("click", (event) => {
      const dayButton = event.target.closest("[data-calendar-date]");
      if (!dayButton) return;
      selectedDate = new Date(`${dayButton.dataset.calendarDate}T00:00:00`);
      visibleMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      renderCalendar();
      calendarGrid.querySelector(`[data-calendar-date="${toDateKey(selectedDate)}"]`)?.focus();
    });
    calendarGrid.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
      const current = event.target.closest("[data-calendar-date]");
      if (!current) return;
      event.preventDefault();
      const movement = event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : event.key === "ArrowUp" ? -7 : 7;
      selectedDate = new Date(`${current.dataset.calendarDate}T00:00:00`);
      selectedDate.setDate(selectedDate.getDate() + movement);
      visibleMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      renderCalendar();
      calendarGrid.querySelector(`[data-calendar-date="${toDateKey(selectedDate)}"]`)?.focus();
    });
    renderCalendar();
  }

  const leadRows = Array.from(document.querySelectorAll("[data-crm-lead-row]"));
  const previousButton = document.getElementById("crm-recent-leads-prev");
  const nextButton = document.getElementById("crm-recent-leads-next");
  const pageLabel = document.getElementById("crm-recent-leads-page");
  const countLabel = document.getElementById("crm-recent-leads-count");
  const pageSize = 5;
  let currentPage = 1;

  function showLeadPage() {
    if (!leadRows.length) return;

    const pageCount = Math.ceil(leadRows.length / pageSize);
    const firstRow = (currentPage - 1) * pageSize;
    leadRows.forEach((row, index) => {
      row.hidden = index < firstRow || index >= firstRow + pageSize;
    });

    const firstVisible = firstRow + 1;
    const lastVisible = Math.min(firstRow + pageSize, leadRows.length);
    if (countLabel) countLabel.textContent = `Showing ${firstVisible}-${lastVisible} of ${leadRows.length} leads`;
    if (pageLabel) pageLabel.textContent = `${currentPage} / ${pageCount}`;
    if (previousButton) previousButton.disabled = currentPage === 1;
    if (nextButton) nextButton.disabled = currentPage === pageCount;
  }

  previousButton?.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage -= 1;
      showLeadPage();
    }
  });

  nextButton?.addEventListener("click", () => {
    if (currentPage < Math.ceil(leadRows.length / pageSize)) {
      currentPage += 1;
      showLeadPage();
    }
  });

  showLeadPage();
})();
