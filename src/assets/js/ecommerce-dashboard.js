(function () {
  "use strict";
  // Featured products use the project's existing Swiper bundle.
  const featuredProducts = document.querySelector(".commerce-feature-swiper");
  if (featuredProducts && window.Swiper) {
    new Swiper(featuredProducts, {
      slidesPerView: 1,
      spaceBetween: 16,
      loop: true,
      speed: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 400,
      autoplay: { delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true },
      keyboard: { enabled: true, onlyInViewport: true },
      a11y: { enabled: true },
    });
  }
  // Sample order fulfillment breakdown: 252 total, including 18 open orders.
  const performanceElement = document.getElementById("store-performance");
  let performanceChart;
  function renderStorePerformance() {
    if (!performanceElement) return;
    const style = getComputedStyle(document.documentElement);
    const textColor = style.getPropertyValue("--theme-default-text-color").trim();
    const options = {
      chart: {
        type: "donut",
        height: 315,
        fontFamily: "inherit",
        foreColor: textColor,
        animations: { enabled: false },
      },
      series: [23, 18, 10],
      labels: ["Fulfilled", "To pack", "To dispatch"],
      colors: ["#0f1504", "var(--theme-primary-color)", "#7b93eb"],
      stroke: { width: 4, colors: [style.getPropertyValue("--theme-custom-white").trim()] },
      dataLabels: { enabled: false },
      legend: { position: "bottom", fontSize: "12px", itemMargin: { horizontal: 8, vertical: 5 } },
      plotOptions: {
        pie: {
          expandOnClick: false,
          donut: {
            size: "72%",
            labels: {
              show: true,
              name: { color: textColor },
              value: { color: textColor, fontSize: "26px", fontWeight: 600 },
              total: {
                show: true,
                showAlways: true,
                label: "Total orders",
                color: textColor,
                formatter: () => "252",
              },
            },
          },
        },
      },
      tooltip: {
        theme: document.documentElement.dataset.themeMode === "dark" ? "dark" : "light",
        y: { formatter: (value) => value + " orders" },
      },
    };
    if (performanceChart) performanceChart.updateOptions(options, false, false);
    else {
      performanceChart = new ApexCharts(performanceElement, options);
      performanceChart.render();
    }
  }
  renderStorePerformance();
  document
    .getElementById("store-performance-refresh")
    ?.addEventListener("click", renderStorePerformance);

// ========================================
// Sales Report Chart
// ========================================

document.addEventListener("DOMContentLoaded", function () {

    const chartElement = document.querySelector("#revenue-chart");

    if (!chartElement) return;

    const salesChart = new ApexCharts(chartElement, {

        series: [
            {
                name: "Total Revenue",
                type: "area",
                data: [
                    220, 221, 222, 355, 365,
                    365, 434, 434, 434, 524,
                    524, 524, 438, 438, 726,
                    726, 915, 915, 736, 736,
                    312, 312, 436, 428, 428
                ]
            },
            {
                name: "Orders",
                type: "line",
                data: [
                    420, 420, 420, 510, 510,
                    335, 257, 257, 257, 115,
                    115, 227, 227, 356, 356,
                    323, 323, 334, 345, 323,
                    520, 520, 525, 525, 525
                ]
            }
        ],

        chart: {
            type: "line",
            height: 380,
            toolbar: {
                show: false
            },
            zoom: {
                enabled: false
            }
        },

        colors: [
            "#5e78fd",
            "rgba(var(--theme-dark-rgb),0.5)"
        ],

        stroke: {
            curve: "smooth",
            width: [3, 2],
            dashArray: [0, 8]
        },

        fill: {
            type: ["gradient", "solid"],
            opacity: [1, 0.5],
            gradient: {
                type: "vertical", 
                opacityFrom: 0.5,
                opacityTo: 0,
                stops: [0, 70]
            }
        },

        dataLabels: {
            enabled: false
        },

        markers: {
            size: 0
        },

        xaxis: {
            type: "category",
            categories: [
                "1", "2", "3", "4", "5",
                "6", "7", "8", "9", "10",
                "11", "12", "13", "14", "15",
                "16", "17", "18", "19", "20",
                "21", "22", "23", "24", "25"
            ],

            axisBorder: {
                show: false
            }
        },

        yaxis: {
            min: 0,
            max: 1000,
            tickAmount: 4,

            labels: {
                formatter: function (value) {
                    return value + "k";
                }
            }
        },

        grid: {
            strokeDashArray: 7
        },

        tooltip: {
            shared: true,
            intersect: false,

            y: {
                formatter: function (value) {
                    return "$" + value + "k";
                }
            }
        },

        legend: {
            position: "bottom",
            offsetY: 5
        }
    });

    salesChart.render();

});

document.addEventListener("DOMContentLoaded", function () {

    const map = new jsVectorMap({
        selector: "#revenue-by-location",

        map: "world_merc",

        zoomOnScroll: false,
        zoomButtons: false,

        markers: [
            {
                name: "India",
                coords: [20.5937, 78.9629]
            },
            {
                name: "Australia",
                coords: [-25.2744, 133.7751]
            },
            {
                name: "Japan",
                coords: [36.2048, 138.2529]
            },
            {
                name: "Germany",
                coords: [51.1657, 10.4515]
            },
            {
                name: "United Kingdom",
                coords: [55.3781, -3.436]
            }
        ],

        lines: [
            {
                from: "India",
                to: "Australia"
            },
            {
                from: "India",
                to: "Germany"
            },
            {
                from: "Japan",
                to: "United Kingdom"
            }
        ],

        regionStyle: {
            initial: {
                fill: "#e9edf5",
                stroke: "#ffffff",
                strokeWidth: 0.5
            }
        },

        markerStyle: {
            initial: {
                fill: "#6366f1",
                stroke: "#ffffff",
                strokeWidth: 2
            }
        },

        lineStyle: {
            stroke: "#6366f1",
            strokeWidth: 1,
            strokeDasharray: "4 4",
            animation: true
        }
    });

    // Responsive map
    window.addEventListener("resize", function () {
        map.updateSize();
    });

});


})();
