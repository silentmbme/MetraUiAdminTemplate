(function () {
    "use strict"

 // Sales Overview Chart
  const options2 = {
        series: [{
            name: "Total Orders",
            type: 'bar',
            data: [104, 115, 87, 86, 106, 65, 91, 128, 66, 80, 78, 59]
        },
        {
            name: "Total Sales",
            type: 'bar',
            data: [76, 5, 131, 128, 74, 85, 87, 86, 85, 64, 109, 76]
        },
        {
            name: "Revenue",
            type: 'line',
            data: [126, 145, 141, 178, 134, 165, 127, 146, 137, 165, 149, 123]
        }],
        chart: {
            toolbar: {
                show: false
            },
            type: 'line',
            height: 372,
            events: {
                mounted: function (chartContext) {
                    const svg = chartContext.el.querySelector('svg');
                    const defs = svg && svg.querySelector('defs');
                    if (!defs || defs.querySelector('#sales-revenue-bar-pattern')) return;

                    const namespace = 'http://www.w3.org/2000/svg';
                    const pattern = document.createElementNS(namespace, 'pattern');
                    pattern.setAttribute('id', 'sales-revenue-bar-pattern');
                    pattern.setAttribute('width', '8');
                    pattern.setAttribute('height', '8');
                    pattern.setAttribute('patternUnits', 'userSpaceOnUse');

                    const background = document.createElementNS(namespace, 'rect');
                    background.setAttribute('width', '8');
                    background.setAttribute('height', '8');
                    background.setAttribute('fill', '#111827');
                    pattern.appendChild(background);

                    const stripe = document.createElementNS(namespace, 'path');
                    stripe.setAttribute('d', 'M-2 2 L2 -2 M0 8 L8 0 M6 10 L10 6');
                    stripe.setAttribute('stroke', 'rgba(255,255,255,0.28)');
                    stripe.setAttribute('stroke-width', '1');
                    pattern.appendChild(stripe);
                    defs.appendChild(pattern);

                    chartContext.el.querySelectorAll('.apexcharts-series[data\\:realIndex="0"] .apexcharts-bar-area').forEach(function (bar) {
                        bar.setAttribute('fill', 'url(#sales-revenue-bar-pattern)');
                    });
                }
            },
            // stacked: true,
        },
        markers: {
            size: 5,
            colors: ["#5e78fd"],
            strokeColors: "#8498fe",
            hover: { size: 6 },
            borderRadius: 4
        },
        grid: {
            show: true,
            xaxis: {
                lines: {
                    show: true
                }
            },
            yaxis: {
                lines: {
                    show: false
                }
            },
            padding: {
                top: 2,
                right: 2,
                bottom: 2,
                left: 2
            },
            borderColor: '#f1f1f1',
            strokeDashArray: 3
        },
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: "smooth",
            width: [5, 5, 2.5],
            lineCap: "round"
        },
        legend: {
            show: true,
            position: "top",
            horizontalAlign: "left",
            markers: {
                size: 4,
                strokeWidth: 0,
            },
        },
        yaxis: {
            axisBorder: {
                show: false,
                color: "rgba(119, 119, 142, 0.05)",
                offsetX: 0,
                offsetY: 0,
            },
            axisTicks: {
                show: true,
                borderType: "solid",
                color: "rgba(119, 119, 142, 0.05)",
                width: 6,
                offsetX: 0,
                offsetY: 0,
            },
            title: {
                style: {
                    color: '#adb5be',
                    fontSize: '14px',
                    fontFamily: 'poppins, sans-serif',
                    fontWeight: 600,
                    cssClass: 'apexcharts-yaxis-label',
                },
            },
            labels: {
                show: false,
                // formatter: function (y) {
                //     return y.toFixed(0) + "";
                // }
            }
        },
        xaxis: {
            type: 'month',
            axisBorder: {
                show: true,
                color: "rgba(119, 119, 142, 0.05)",
                offsetX: 0,
                offsetY: 0,
            },
            title: {
                style: {
                    color: '#adb5be',
                    fontSize: '5px',
                    fontFamily: 'poppins, sans-serif',
                    fontWeight: 600,
                    cssClass: 'apexcharts-yaxis-label',
                },
            },
        },
        plotOptions: {
            bar: {
                columnWidth: "70%",
                borderRadius: 2
            }
        },

        colors: ["#000", 'var(--theme-primary-color)', "#5e78fd"],
    };
    const chart2 = new ApexCharts(document.querySelector("#sales-overview"), options2);
    if(chart2) chart2.render();

    //session by devie/
     var options = {
        series: [
            {
                name: "Laptop",
                data: [[10, 35, 80]]
            },
            {
                name: "Tablet",
                data: [[10, 35, 80]]
            },
            {
                name: "Mobile",
                data: [[22, 10, 80]]
            },
            {
                name: "Desktop",
                data: [[25, 25, 150]]
            },
        ],
        chart: {
            height: 440,
            type: "bubble",
            toolbar: {
                show: false
            }
        },
        grid: {
            borderColor: '#f3f3f3',
            strokeDashArray: 3
        },
        colors: ["#b3c6fc", "#7ceba5", "#f4d476"],
        dataLabels: {
            enabled: false
        },
        legend: {
            show: true,
            fontSize: '13px',
            labels: {
                colors: '#959595',
            },
            markers: {
                width: 10,
                height: 10,
            },
        },
        xaxis: {
            min: 0,
            max: 50,
            labels: {
                show: false,
            },
            axisBorder: {
                show: false,
            },
        },
        yaxis: {
            max: 50,
            labels: {
                show: false,
            },
        },
        tooltip: {
            enabled: true,
            theme: "dark",
        }
    };
    var chart1 = new ApexCharts(document.querySelector("#session-by-device"), options);
    chart1.render();

})();
