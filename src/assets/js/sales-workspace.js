(() => {
  "use strict";
  const root = document.querySelector(".sales-workspace");
  if (!root) return;
  const view = root.dataset.salesView;
  document.title = `${document.querySelector("h1")?.textContent || "Sales"} | NexoraUI`;
  if (view === "starter") return;

  // Browser preferences and settings form.
  const defaults = {
    workspace: "NexoraUI Sales",
    email: "sales@example.com",
    target: 20000,
    period: "30",
  };
  let preferences = { ...defaults };
  try {
    const saved = JSON.parse(localStorage.getItem("nexoraui.salesPreferences") || "{}");
    if (typeof saved.workspace === "string" && saved.workspace.trim())
      preferences.workspace = saved.workspace.slice(0, 60);
    if (typeof saved.email === "string") preferences.email = saved.email;
    if (Number(saved.target) > 0 && Number(saved.target) <= 100000000)
      preferences.target = Number(saved.target);
    if (["7", "30", "90"].includes(String(saved.period))) preferences.period = String(saved.period);
  } catch {
    /* Defaults work without browser storage. */
  }
  function showFeedback(message) {
    const feedback = document.getElementById("sales-feedback");
    if (feedback) feedback.textContent = message;
  }
  function savePreferences() {
    try {
      localStorage.setItem("nexoraui.salesPreferences", JSON.stringify(preferences));
      showFeedback("Preferences saved in this browser.");
      return true;
    } catch {
      showFeedback("Browser storage is unavailable. Preferences could not be saved.");
      return false;
    }
  }
  const eyebrow = document.querySelector(".sales-page-heading .sales-eyebrow");
  if (eyebrow) eyebrow.textContent = `${preferences.workspace} / SALES`;
  const form = document.getElementById("sales-settings-form");
  if (form) {
    let savedPreferences = { ...preferences };
    function updateSettingsSaveState() {
      const values = Object.fromEntries(new FormData(form));
      const dirty = Object.keys(savedPreferences).some(
        (key) => String(savedPreferences[key]) !== values[key]
      );
      const saveState = document.getElementById("settings-save-state");
      const discardButton = document.getElementById("sales-settings-discard");
      if (saveState) {
        saveState.textContent = dirty ? "Unsaved changes" : "All changes saved";
      }
      if (discardButton) discardButton.disabled = !dirty;
    }
    form.addEventListener("input", updateSettingsSaveState);
    form.addEventListener("change", updateSettingsSaveState);
    document.getElementById("sales-settings-discard")?.addEventListener("click", () => {
      preferences = { ...savedPreferences };
      fill();
      updateSettingsSaveState();
      showFeedback("Unsaved changes discarded.");
    });
    const fill = () =>
      Object.entries(preferences).forEach(([name, value]) => {
        form.elements.namedItem(name).value = value;
      });
    fill();
    updateSettingsSaveState();
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      preferences = {
        workspace: form.elements.workspace.value.trim(),
        email: form.elements.email.value.trim(),
        target: Number(form.elements.target.value),
        period: form.elements.period.value,
      };
      if (!preferences.workspace) {
        showFeedback("Enter a workspace name.");
        return;
      }
      if (savePreferences()) savedPreferences = { ...preferences };
      updateSettingsSaveState();
    });
    document.getElementById("sales-settings-reset")?.addEventListener("click", () => {
      preferences = { ...defaults };
      fill();
      savePreferences();
    });
    return;
  }

  // Demo data shared by reports, payments, invoices, and team pages.
  const members = [
    { name: "Liam Carter", role: "Sales lead", image: "1.png" },
    { name: "Emily Johnson", role: "Account executive", image: "2.png" },
    { name: "Sarah Davis", role: "Customer partnerships", image: "3.png" },
    { name: "Michael Brown", role: "Business development", image: "4.png" },
  ];
  const customers = [
    "Olivia Wilson",
    "James Taylor",
    "Ava Martinez",
    "Noah Thompson",
    "Sophia Chen",
    "Liam Anderson",
    "Mia Robinson",
    "Ethan Lee",
  ];
  const products = [
    "Urban Chic Satchel",
    "TrailBlaze Runners",
    "VisionTech SLR",
    "FlexiSeat Office Chair",
    "DecoDial Classic",
    "Club Fleece Hoodie",
  ];
  const channels = ["Online store", "Direct sales", "Marketplace", "Partners"];
  const formatMoney = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const records = Array.from({ length: 36 }, (_, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() - index * 2);
    return {
      id: `INV-${String(2048 - index)}`,
      customer: customers[index % customers.length],
      product: products[index % products.length],
      date,
      amount: [90, 120, 750, 450, 140, 220][index % 6],
      status: index % 9 === 7 ? "Refunded" : index % 5 === 2 ? "Pending" : "Paid",
      channel: channels[index % 4],
      owner: index % members.length,
    };
  });
  const period = document.getElementById("sales-period");
  if (period) period.value = preferences.period;
  const periodValue = () => period?.value || preferences.period;
  let page = 0;
  let chart;
  let channelChart;
  const channelColors = ["#9ad6c4", "#a399cc", "#d6ee7d", "#7b93eb"];
  const pageSize = 6;
  const getPeriodRecords = () =>
    records.filter((record) => (today - record.date) / 86400000 < Number(periodValue()));
  const ownerFilter = new URLSearchParams(location.search).get("owner");
  function getFilteredRecords() {
    const query = (document.getElementById("sales-search")?.value || "").trim().toLowerCase();
    const status = document.getElementById("sales-status")?.value || "";
    return getPeriodRecords().filter(
      (record) =>
        (ownerFilter === null || record.owner === Number(ownerFilter)) &&
        (!status || record.status === status) &&
        `${record.id} ${record.customer} ${record.product}`.toLowerCase().includes(query)
    );
  }
  const sumAmounts = (rows) => rows.reduce((total, row) => total + row.amount, 0);
  const formatDate = (date) =>
    date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  // Payment rows, filtering, and pagination.
  function renderPaymentTable() {
    const body = document.getElementById("sales-records");
    if (!body) return;
    const rows = getFilteredRecords();
    if (view === "invoices") updateInvoiceFilters();
    page = Math.min(page, Math.max(0, Math.ceil(rows.length / pageSize) - 1));
    const paymentRow = (row) => {
      const statusClass = {
        Paid: "bg-success-transparent",
        Pending: "bg-warning-transparent",
        Refunded: "bg-secondary-transparent",
      }[row.status];
      const customerImage = `${customers.indexOf(row.customer) + 1}.jpg`;
      return `
      <tr>
        <td>
          <button
            type="button"
            class="btn btn-link p-0 fw-medium text-default"
            data-record="${row.id}"
          >
            ${row.id}
          </button>
        </td>
        <td>
          <div class="d-flex align-items-center gap-2">
            <span class="avatar avatar-sm avatar-rounded flex-shrink-0">
              <img src="../assets/images/users/${customerImage}" alt="" loading="lazy" />
            </span>
            <div>
              <span class="fw-medium d-block">${row.customer}</span>
              <span class="text-muted fs-12">${row.product}</span>
            </div>
          </div>
        </td>
        <td>${formatDate(row.date)}</td>
        <td><span class="badge ${statusClass}">${row.status}</span></td>
        <td class="fw-semibold">${formatMoney(row.amount)}</td>
        <td>
          <button
            type="button"
            class="btn btn-sm btn-icon btn-secondary-light"
            data-record="${row.id}"
            aria-label="View ${row.id}"
          >
            <i class="ri-eye-line" aria-hidden="true"></i>
          </button>
        </td>
      </tr>
    `;
    };
    body.innerHTML =
      rows
        .slice(page * pageSize, (page + 1) * pageSize)
        .map((row) =>
          view === "payments" || view === "invoices"
            ? paymentRow(row)
            : `
      <tr>
        <td>
          <button type="button" class="sales-invoice-link" data-record="${row.id}">
            ${row.id}
          </button>
        </td>
        <td>
          <span class="sales-customer-name">${row.customer}</span>
          <small>${row.product}</small>
        </td>
        <td>${formatDate(row.date)}</td>
        <td>
          <span class="sales-status sales-status-${row.status.toLowerCase()}">
            <span aria-hidden="true"></span>
            ${row.status}
          </span>
        </td>
        <td class="fw-semibold">${formatMoney(row.amount)}</td>
        <td>
          <button
            type="button"
            class="sales-detail-button"
            data-record="${row.id}"
            aria-label="View ${row.id}"
          >
            <i class="ri-arrow-right-up-line" aria-hidden="true"></i>
          </button>
        </td>
      </tr>
    `
        )
        .join("") ||
      '<tr><td colspan="6" class="sales-no-results">No transactions match your filters. Try another search or period.</td></tr>';
    const tableCount = document.getElementById("sales-table-count");
    const previousButton = document.getElementById("sales-prev");
    const nextButton = document.getElementById("sales-next");
    if (tableCount) {
      tableCount.textContent = rows.length
        ? `Showing ${page * pageSize + 1}–${Math.min((page + 1) * pageSize, rows.length)} of ${rows.length} records`
        : "0 records";
    }
    if (previousButton) previousButton.disabled = page === 0;
    if (nextButton) nextButton.disabled = (page + 1) * pageSize >= rows.length;
  }
  const rgbToHex = (value) =>
    "#" +
    value
      .split(",")
      .map((part) =>
        Math.max(0, Math.min(255, Number(part.trim())))
          .toString(16)
          .padStart(2, "0")
      )
      .join("");
  function getChartColors() {
    const style = getComputedStyle(document.documentElement);
    return {
      primary: rgbToHex(style.getPropertyValue("--theme-primary-rgb").trim() || "193,237,16"),
      secondary:
        document.documentElement.dataset.themeMode === "dark"
          ? "#a6b2b5"
          : rgbToHex(style.getPropertyValue("--theme-secondary-rgb").trim() || "55,61,63"),
      text: style.getPropertyValue("--theme-text-muted").trim() || "#7a7e85",
      border: style.getPropertyValue("--theme-default-border").trim() || "#e8eaed",
    };
  }
  // Build the chart dates from the selected reporting period.
  function getRevenueRanges() {
    const days = Number(periodValue()),
      buckets = 6;
    const ranges = Array.from({ length: buckets }, (_, index) => {
      const ago = Math.floor(((buckets - index - 1) * days) / buckets);
      const until = Math.floor(((buckets - index) * days) / buckets);
      const date = new Date(today);
      date.setDate(date.getDate() - ago);
      const rows = getPeriodRecords().filter((row) => {
        const age = (today - row.date) / 86400000;
        return age >= ago && age < until;
      });
      return {
        label: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        paid: sumAmounts(rows.filter((row) => row.status === "Paid")),
        pending: sumAmounts(rows.filter((row) => row.status === "Pending")),
      };
    });
    // Extra sample point for the report preview; excluded from payment totals.
    if (view === "reports" && days === 30 && !ranges.some((range) => range.label === "Sep 29")) {
      ranges.push({ label: "Sep 29", paid: 450, pending: 0, sample: true });
    }
    return ranges;
  }

  // ApexCharts: revenue performance (bar).
  function renderRevenueChart() {
    const element = document.getElementById("sales-overview");
    if (!element || !window.ApexCharts) return;
    const ranges = getRevenueRanges();
    const colors = getChartColors();
    const options = {
      series: [
        { name: "Collected", data: ranges.map((r) => r.paid) },
        { name: "Outstanding", data: ranges.map((r) => r.pending) },
      ],
      chart: {
        type: "bar",
        height: 370,
        fontFamily: "inherit",
        foreColor: colors.text,
        toolbar: { show: false },
        animations: { enabled: false },
      },
      colors: [colors.secondary, colors.primary],
      plotOptions: { bar: { borderRadius: 5, columnWidth: "45%" } },
      dataLabels: { enabled: false },
      stroke: { show: true, width: 4, colors: ["transparent"] },
      grid: { borderColor: colors.border, strokeDashArray: 4 },
      xaxis: {
        categories: ranges.map((r) => r.label),
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          formatter: (value) =>
            value >= 1000 ? `$${(value / 1000).toFixed(1)}k` : `$${Math.round(value)}`,
        },
      },
      legend: {
        position: "top",
        horizontalAlign: "left",
        markers: { radius: 8 },
      },
      tooltip: {
        theme: document.documentElement.dataset.themeMode === "dark" ? "dark" : "light",
        y: { formatter: formatMoney },
      },
    };
    if (view === "reports") {
      options.chart.height = 435;
      options.series = [{ name: "Collected revenue", data: ranges.map((r) => r.paid) }];
      const peak = Math.max(...ranges.map((r) => r.paid));
      options.colors = ranges.map((r) => (r.paid === peak ? "#738aeb" : "#afbef2"));
      options.plotOptions = {
        bar: {
          distributed: true,
          borderRadius: 9,
          borderRadiusApplication: "end",
          columnWidth: "72%",
        },
      };
      options.stroke = { width: 0 };
      options.fill = { opacity: 1 };
      options.legend = { show: false };
      options.grid = { show: false };
      options.tooltip.theme = "dark";
      options.tooltip.y.formatter = (value, { dataPointIndex }) =>
        ranges[dataPointIndex]?.sample ? `${formatMoney(value)} (sample)` : formatMoney(value);
      renderChannelChart(colors);
    }
    if (chart) chart.updateOptions(options, false, false);
    else {
      chart = new ApexCharts(element, options);
      chart.render();
    }
  }
  // ApexCharts: revenue by channel (donut).
  function renderChannelChart(colors) {
    const element = document.getElementById("report-channel-chart");
    if (!element || !window.ApexCharts) return;
    const paid = getPeriodRecords().filter((r) => r.status === "Paid");
    const channelOptions = {
      series: channels.map((name) => sumAmounts(paid.filter((r) => r.channel === name))),
      labels: channels,
      colors: channelColors,
      chart: {
        type: "donut",
        height: 250,
        fontFamily: "inherit",
        animations: { enabled: false },
      },
      stroke: {
        width: 5,
        colors: [
          getComputedStyle(document.documentElement).getPropertyValue("--theme-custom-white").trim(),
        ],
      },
      dataLabels: { enabled: false },
      legend: { show: false },
      plotOptions: {
        pie: {
          expandOnClick: false,
          donut: {
            size: "73%",
            labels: {
              show: true,
              name: { color: colors.text },
              value: {
                color: colors.text,
                fontSize: "24px",
                formatter: (v) => formatMoney(Number(v)),
              },
              total: {
                show: true,
                showAlways: true,
                label: "Collected",
                color: colors.text,
                formatter: () => formatMoney(sumAmounts(paid)),
              },
            },
          },
        },
      },
      tooltip: { theme: "dark", y: { formatter: formatMoney } },
      states: {
        hover: { filter: { type: "lighten", value: 0.08 } },
        active: { filter: { type: "none" } },
      },
    };
    if (channelChart) channelChart.updateOptions(channelOptions, false, false);
    else {
      channelChart = new ApexCharts(
        document.getElementById("report-channel-chart"),
        channelOptions
      );
      channelChart.render();
    }
  }

  // Refresh the summary cards, channel list, team, and charts.
  function render() {
    const rows = getPeriodRecords(),
      paid = rows.filter((row) => row.status === "Paid"),
      revenue = sumAmounts(paid);
    const values = {
      revenue: formatMoney(revenue),
      orders: rows.length,
      pending: formatMoney(sumAmounts(rows.filter((row) => row.status === "Pending"))),
      average: formatMoney(paid.length ? revenue / paid.length : 0),
    };
    document.querySelectorAll("[data-sales-metric]").forEach((element) => {
      element.textContent = values[element.dataset.salesMetric];
    });
    if (view === "invoices") {
      const percent = rows.length ? Math.round((paid.length / rows.length) * 100) : 0;
      const paidSummary = document.getElementById("invoice-paid-summary");
      const pendingSummary = document.getElementById("invoice-pending-summary");
      if (paidSummary) paidSummary.textContent = `${paid.length} of ${rows.length} invoices`;
      if (pendingSummary) {
        pendingSummary.textContent = `${rows.filter((row) => row.status === "Pending").length} invoices awaiting payment`;
      }
      const progress = document.getElementById("invoice-paid-progress");
      if (progress) {
        progress.setAttribute("aria-valuenow", percent);
        if (progress.firstElementChild) progress.firstElementChild.style.width = percent + "%";
      }
    }
    const goal = document.getElementById("sales-goal-progress");
    if (goal) {
      const percent = Math.min(100, Math.round((revenue / preferences.target) * 100));
      const goalCurrent = document.getElementById("sales-goal-current");
      const goalTarget = document.getElementById("sales-goal-target");
      if (goalCurrent) goalCurrent.textContent = formatMoney(revenue);
      if (goalTarget) goalTarget.textContent = `of ${formatMoney(preferences.target)}`;
      goal.setAttribute("aria-valuenow", percent);
      if (goal.firstElementChild) goal.firstElementChild.style.width = `${percent}%`;
      const goalCaption = document.getElementById("sales-goal-caption");
      if (goalCaption) {
        goalCaption.textContent = `${percent}% of target · ${paid.length} completed payments`;
      }
    }
    const channelList = document.getElementById("sales-channels");
    if (channelList)
      channelList.innerHTML = channels
        .map((channel, index) => {
          const total = sumAmounts(paid.filter((row) => row.channel === channel)),
            percent = revenue ? Math.round((total / revenue) * 100) : 0;
          if (view === "reports") {
            return `
      <li class="list-group-item px-0">
        <div class="d-flex align-items-center gap-2">
          <div class="flex-fill">
            <div class="d-flex justify-content-between align-items-center gap-2 mb-1">
              <span class="fw-medium fs-12">${channel}</span>
              <span class="fw-semibold fs-12">${formatMoney(total)}</span>
            </div>
            <div class="d-flex align-items-center gap-2">
              <div
                class="progress progress-xs flex-fill"
                role="progressbar"
                aria-label="${channel} revenue share"
                aria-valuenow="${percent}"
                aria-valuemin="0"
                aria-valuemax="100"
              >
                <div
                  class="progress-bar"
                  style="width: ${percent}%; background-color: ${channelColors[index]}"
                ></div>
              </div>
              <span class="text-muted fs-11">${percent}%</span>
            </div>
          </div>
        </div>
      </li>
    `;
          }
          return `
      <div class="sales-channel">
        <div>
          <span>
            <i class="${["ri-store-2-line", "ri-user-voice-line", "ri-shopping-bag-line", "ri-team-line"][
            index
            ]
            }" aria-hidden="true"></i>
            ${channel}
          </span>
          <strong>${formatMoney(total)}</strong>
        </div>
        <div class="sales-channel-track"><span style="width: ${percent}%"></span></div>
        <small>${percent}% of collected revenue</small>
      </div>
    `;
        })
        .join("");
    const teamSummary = document.getElementById("sales-team-summary");
    const teamData = members.map((member, index) => ({
      ...member,
      index,
      revenue: sumAmounts(paid.filter((row) => row.owner === index)),
      count: rows.filter((row) => row.owner === index).length,
    }));
    if (teamSummary)
      teamSummary.innerHTML = teamData
        .map((member) =>
          view === "reports"
            ? `
      <tr>
        <td>
          <div class="d-flex align-items-center gap-2">
            <span class="avatar avatar-sm avatar-rounded">
              <img src="../assets/images/users/${member.image}" alt="" />
            </span>
            <div>
              <span class="fw-medium d-block">${member.name}</span>
              <span class="text-muted fs-12">${member.role}</span>
            </div>
          </div>
        </td>
        <td>${member.count}</td>
        <td><span class="badge bg-success">${revenue ? Math.round((member.revenue / revenue) * 100) : 0
            }%</span></td>
        <td class="fw-semibold">${formatMoney(member.revenue)}</td>
        <td>
          <a
            href="sales-payments.html?owner=${member.index}"
            class="btn btn-sm btn-icon btn-secondary-light"
            aria-label="View payments for ${member.name}"
          >
            <i class="ri-arrow-right-up-line" aria-hidden="true"></i>
          </a>
        </td>
      </tr>
    `
            : `
      <div>
        <span class="sales-team-person">
          <img src="../assets/images/users/${member.image}" alt="" />
          ${member.name}
        </span>
        <span>${member.count} transactions</span>
        <strong>${formatMoney(member.revenue)}</strong>
      </div>
    `
        )
        .join("");
    renderPaymentTable();
    renderRevenueChart();
  }
  function updateInvoiceFilters() {
    const rows = getPeriodRecords();
    const status = document.getElementById("sales-status")?.value || "";
    document.querySelectorAll("[data-invoice-count]").forEach((badge) => {
      badge.textContent = rows.filter(
        (row) => badge.dataset.invoiceCount === "All" || row.status === badge.dataset.invoiceCount
      ).length;
    });
    document.querySelectorAll("[data-invoice-filter]").forEach((button) => {
      const active = button.dataset.invoiceFilter === status;
      button.setAttribute("aria-pressed", active);
      button.classList.toggle("active", active);
    });
  }

  // UI events.
  document.querySelectorAll("[data-invoice-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      const status = document.getElementById("sales-status");
      if (!status) return;
      status.value = button.dataset.invoiceFilter;
      status.dispatchEvent(new Event("change"));
    });
  });
  period?.addEventListener("change", () => {
    page = 0;
    render();
  });
  ["sales-search", "sales-status"].forEach((id) =>
    document
      .getElementById(id)
      ?.addEventListener(id === "sales-search" ? "input" : "change", () => {
        page = 0;
        renderPaymentTable();
      })
  );
  document.getElementById("sales-prev")?.addEventListener("click", () => {
    page--;
    renderPaymentTable();
  });
  document.getElementById("sales-next")?.addEventListener("click", () => {
    page++;
    renderPaymentTable();
  });
  document.getElementById("sales-records")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-record]");
    if (!button) return;
    const record = records.find((row) => row.id === button.dataset.record);
    if (!record) return;
    const modalTitle = document.getElementById("sales-record-title");
    const modalBody = document.getElementById("sales-record-body");
    const modalElement = document.getElementById("sales-record-modal");
    if (!modalElement || !window.bootstrap?.Modal) return;
    if (modalTitle) modalTitle.textContent = record.id;
    if (modalBody) modalBody.innerHTML = `
      <dl class="sales-record-details">
        <dt>Customer</dt>
        <dd>${record.customer}</dd>
        <dt>Product</dt>
        <dd>${record.product}</dd>
        <dt>Date</dt>
        <dd>${formatDate(record.date)}</dd>
        <dt>Amount</dt>
        <dd>${formatMoney(record.amount)}</dd>
        <dt>Status</dt>
        <dd>${record.status}</dd>
        <dt>Channel</dt>
        <dd>${record.channel}</dd>
        <dt>Account owner</dt>
        <dd>${members[record.owner].name}</dd>
      </dl>
    `;
    if (view === "invoices") {
      if (modalBody) modalBody.innerHTML = `
        <div class="d-flex justify-content-between flex-wrap gap-3 mb-4">
          <div><span class="text-muted fs-12">BILLED TO</span><h3 class="fs-18 mt-1">${record.customer
        }</h3><span class="text-muted fs-12">Issued ${formatDate(record.date)}</span></div>
          <div class="text-end"><span class="badge bg-secondary-transparent">${record.status
        }</span><p class="text-muted fs-12 mt-2 mb-0">Demo invoice</p></div>
        </div>
        <div class="table-responsive"><table class="table"><thead><tr><th>Item</th><th class="text-end">Amount</th></tr></thead><tbody><tr><td>${record.product
        }</td><td class="text-end">${formatMoney(record.amount)}</td></tr></tbody></table></div>
        <div class="d-flex justify-content-between border-top pt-3 mb-4"><strong>Invoice total</strong><strong class="fs-20">${formatMoney(
          record.amount
        )}</strong></div>
        <div class="row g-3"><div class="col-sm-6"><span class="text-muted fs-12 d-block">Sales channel</span><span>${record.channel
        }</span></div><div class="col-sm-6"><span class="text-muted fs-12 d-block">Account owner</span><span>${members[record.owner].name
        }</span></div></div>
      `;
    }
    bootstrap.Modal.getOrCreateInstance(modalElement).show(button);
  });
  document.querySelector("[data-sales-export]")?.addEventListener("click", () => {
    const rows = getFilteredRecords();
    const csv = [
      ["Invoice", "Customer", "Product", "Date", "Status", "Amount USD", "Channel"],
      ...rows.map((row) => [
        row.id,
        row.customer,
        row.product,
        formatDate(row.date),
        row.status,
        row.amount,
        row.channel,
      ]),
    ]
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
      .join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `sales-${view}-${periodValue()}-days.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showFeedback(`Exported ${rows.length} records for the selected filters.`);
  });
  const search = document.getElementById("sales-search");
  if (search) search.value = new URLSearchParams(location.search).get("q") || "";
  let themeTimer;
  new MutationObserver(() => {
    clearTimeout(themeTimer);
    themeTimer = setTimeout(renderRevenueChart, 100);
  }).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme-color", "style"],
  });
  render();
})();
