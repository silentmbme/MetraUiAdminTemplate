(function () {
    'use strict';
    const tasks = Array.from(document.querySelectorAll('[data-widget-task]'));
    const updateTasks = () => {
        const completed = tasks.filter(task => task.checked).length;
        const percent = tasks.length ? Math.round(completed / tasks.length * 100) : 0;
        document.getElementById('widget-task-count').textContent = completed + ' of ' + tasks.length + ' complete';
        const progress = document.getElementById('widget-task-progress');
        progress.setAttribute('aria-valuenow', String(percent));
        progress.querySelector('.progress-bar').style.width = percent + '%';
    };
    tasks.forEach(task => task.addEventListener('change', updateTasks));
    if (tasks.length) updateTasks();
    const noteForm = document.getElementById('widget-note-form');
    const noteText = document.getElementById('widget-note-text');
    const notePreview = document.getElementById('widget-note-preview');
    const noteStatus = document.getElementById('widget-note-status');
    noteForm?.addEventListener('submit', event => {
        event.preventDefault();
        noteText.setCustomValidity(noteText.value.trim() ? '' : 'Enter a note to preview.');
        if (!noteForm.reportValidity()) return;
        document.getElementById('widget-note-content').textContent = noteText.value.trim();
        notePreview.classList.remove('d-none');
        noteStatus.textContent = 'Note preview updated. It is not stored.';
    });
    noteText?.addEventListener('input', () => noteText.setCustomValidity(''));
    noteForm?.addEventListener('reset', () => {
        noteText.setCustomValidity('');
        notePreview.classList.add('d-none');
        document.getElementById('widget-note-content').textContent = '';
        noteStatus.textContent = 'Note cleared.';
    });
    const preferences = Array.from(document.querySelectorAll('[data-widget-preference]'));
    const updatePreferences = () => {
        const status = document.getElementById('widget-preference-status');
        if (status) status.textContent = preferences.filter(input => input.checked).length + ' of ' + preferences.length + ' updates enabled in this preview.';
    };
    preferences.forEach(input => input.addEventListener('change', updatePreferences));
    updatePreferences();
    document.getElementById('widget-poll-form')?.addEventListener('submit', event => {
        event.preventDefault();
        const choice = document.querySelector('[name="widget-poll"]:checked');
        if (choice) document.getElementById('widget-poll-status').textContent = 'Your preview response: ' + choice.value + '. Nothing was submitted.';
    });
    document.getElementById('widget-booking-form')?.addEventListener('submit', event => {
        event.preventDefault();
        const slot = document.querySelector('[name="widget-booking-slot"]:checked');
        if (slot) document.getElementById('widget-booking-status').textContent = document.getElementById('widget-booking-type').value + ' at ' + slot.value + '. Preview only; no appointment was booked.';
    });
    const focusDisplay = document.getElementById('widget-focus-time');
    const focusToggle = document.getElementById('widget-focus-toggle');
    const focusStatus = document.getElementById('widget-focus-status');
    let remaining = 25 * 60;
    let deadline = 0;
    let focusInterval;
    const renderTime = () => {
        focusDisplay.textContent = String(Math.floor(remaining / 60)).padStart(2, '0') + ':' + String(remaining % 60).padStart(2, '0');
    };
    const pauseFocus = () => {
        if (deadline) remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
        deadline = 0;
        window.clearInterval(focusInterval);
        focusToggle.textContent = remaining === 1500 ? 'Start session' : 'Resume session';
        renderTime();
    };
    focusToggle?.addEventListener('click', () => {
        if (deadline) { pauseFocus(); focusStatus.textContent = 'Session paused.'; return; }
        if (!remaining) remaining = 1500;
        deadline = Date.now() + remaining * 1000;
        focusToggle.textContent = 'Pause session';
        focusStatus.textContent = 'Your focus session is running.';
        focusInterval = window.setInterval(() => {
            remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
            renderTime();
            if (!remaining) { pauseFocus(); focusToggle.textContent = 'Start session'; focusStatus.textContent = 'Session complete. Take a moment to recharge.'; }
        }, 1000);
    });
    document.getElementById('widget-focus-reset')?.addEventListener('click', () => {
        pauseFocus(); remaining = 1500; renderTime(); focusToggle.textContent = 'Start session'; focusStatus.textContent = 'Session reset. Ready when you are.';
    });
    document.getElementById('widget-compare-period')?.addEventListener('change', event => {
        const values = event.target.value === 'month' ? [584, 512] : [142, 128];
        document.getElementById('widget-compare-current').textContent = values[0];
        document.getElementById('widget-compare-previous').textContent = values[1];
        document.getElementById('widget-compare-change').textContent = '+' + ((values[0] - values[1]) / values[1] * 100).toFixed(1) + '%';
    });
    const connections = Array.from(document.querySelectorAll('[data-widget-connection]'));
    connections.forEach(input => input.addEventListener('change', () => {
        document.getElementById('widget-connection-status').textContent = connections.filter(item => item.checked).length + ' connections enabled in this preview.';
    }));
    document.querySelectorAll('[data-approve-preview]').forEach(button => button.addEventListener('click', () => {
        const row = button.closest('[data-widget-approval]');
        const approved = button.getAttribute('aria-pressed') !== 'true';
        button.setAttribute('aria-pressed', String(approved));
        button.textContent = approved ? 'Undo preview' : 'Approve preview';
        const badge = row.querySelector('[data-approval-state]');
        badge.textContent = approved ? 'Approved preview' : 'Needs review';
        badge.className = 'badge ' + (approved ? 'bg-success-transparent' : 'bg-warning-transparent');
        document.getElementById('widget-approval-status').textContent = row.querySelector('h3').textContent + (approved ? ' marked approved in this preview.' : ' returned to review.') + ' No approval was submitted.';
    }));
    const handoffItems = Array.from(document.querySelectorAll('[data-widget-handoff]'));
    const updateHandoff = () => {
        const done = handoffItems.filter(item => item.checked).length;
        const count = document.getElementById('widget-handoff-count');
        const status = document.getElementById('widget-handoff-status');
        if (count) count.textContent = done + ' / ' + handoffItems.length;
        if (status) status.textContent = done === handoffItems.length ? 'Handoff checklist complete in this preview.' : (handoffItems.length - done) + ' items left in this preview.';
    };
    handoffItems.forEach(input => input.addEventListener('change', updateHandoff));
    updateHandoff();
    document.getElementById('widget-portfolio-search')?.addEventListener('input', event => {
        let visible = 0;
        const query = event.target.value.trim().toLowerCase();
        document.querySelectorAll('[data-widget-portfolio]').forEach(row => {
            const matches = row.dataset.widgetPortfolio.includes(query);
            row.classList.toggle('d-none', !matches);
            if (matches) visible++;
        });
        document.getElementById('widget-portfolio-empty').classList.toggle('d-none', visible > 0);
    });
    if (typeof window.ApexCharts !== 'function') return;
    const color = name => {
        const probe = document.createElement('span');
        probe.style.color = name.endsWith('-rgb-color') ? 'rgb(var(' + name.replace('-rgb-color', '-rgb') + '))' : 'var(' + name + ')';
        probe.style.display = 'none';
        document.body.append(probe);
        const resolved = getComputedStyle(probe).color;
        probe.remove();
        const channels = resolved.match(/[\d.]+/g);
        if (!channels || channels.length < 3) return '#93f126';
        const rgb = channels.slice(0, 3).map(value => Math.max(0, Math.min(255, Math.round(Number(value)))));
        return '#' + rgb.map(value => value.toString(16).padStart(2, '0')).join('');
    };
    const palette = () => [color('--theme-primary-color'), color('--theme-info-rgb-color'), color('--theme-secondary-rgb-color')];
    const dark = () => document.documentElement.getAttribute('data-theme-color') === 'dark';
    const periods = {
        week: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], values: [3200, 4100, 3800, 5200, 4700, 6400, 5900] },
        month: { labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], values: [10800, 12600, 11400, 13820] }
    };
    const compactCharts = [];
    const miniConfigs = [{"id":"widget-mini-output","title":"Task throughput","type":"area","data":[18,22,17,25,21,28,31]},{"id":"widget-mini-hours","title":"Focus hours","type":"bar","data":[4,6,3.5,7,5,4,3]},{"id":"widget-mini-cycle","title":"Cycle time","type":"line","data":[4.1,3.8,4,3.5,3.2,3,2.8]},{"id":"widget-mini-goal","title":"Sprint completion","type":"radialBar","data":[78]},{"id":"widget-mini-open","title":"Open work","type":"donut","data":[12,8,4]},{"id":"widget-mini-reviews","title":"Review activity","type":"bar","data":[9,13,11,18,16,19]},{"id":"widget-mini-burn","title":"Remaining points","type":"area","data":[64,58,52,41,36,24,18]},{"id":"widget-mini-quality","title":"Quality trend","type":"line","data":[89,91,90,93,94,95,96]}];
    miniConfigs.forEach(config => {
        const target = document.getElementById(config.id);
        if (!target) return;
        const circular = ['radialBar', 'donut'].includes(config.type);
        const options = {
            chart: { type: config.type, height: 100, background: 'transparent', fontFamily: 'inherit', sparkline: { enabled: true }, animations: { enabled: !window.matchMedia('(prefers-reduced-motion: reduce)').matches } },
            series: circular ? config.data : [{ name: config.title, data: config.data }],
            colors: palette(),
            stroke: { width: circular ? 0 : 2, curve: 'smooth' },
            dataLabels: { enabled: false }, legend: { show: false },
            theme: { mode: dark() ? 'dark' : 'light' },
            tooltip: { theme: dark() ? 'dark' : 'light', x: { show: false } },
            fill: { opacity: config.type === 'area' ? .18 : 1 }
        };
        if (config.type === 'bar') options.plotOptions = { bar: { columnWidth: '45%', borderRadius: 3 } };
        if (config.type === 'donut') { options.labels = ['Design', 'Development', 'Review']; options.plotOptions = { pie: { donut: { size: '78%' } } }; }
        if (config.type === 'radialBar') options.plotOptions = { radialBar: { hollow: { size: '65%' }, track: { background: color('--theme-default-border') }, dataLabels: { show: false } } };
        const chart = new window.ApexCharts(target, options);
        compactCharts.push(chart);
        chart.render();
    });
    const revenue = new window.ApexCharts(document.getElementById('widget-revenue-chart'), {
        chart: { type: 'area', background: 'transparent', height: 260, toolbar: { show: false }, fontFamily: 'inherit', animations: { enabled: !window.matchMedia('(prefers-reduced-motion: reduce)').matches } },
        series: [{ name: 'Revenue', data: periods.week.values }],
        colors: [color('--theme-primary-color')],
        stroke: { curve: 'smooth', width: 2 },
        fill: { type: 'gradient', gradient: { opacityFrom: .3, opacityTo: .03 } },
        dataLabels: { enabled: false },
        xaxis: { categories: periods.week.labels, axisBorder: { show: false }, axisTicks: { show: false } },
        yaxis: { labels: { formatter: value => '$' + (value / 1000).toFixed(1) + 'k' } },
        grid: { borderColor: color('--theme-default-border'), strokeDashArray: 4 },
        tooltip: { theme: dark() ? 'dark' : 'light', y: { formatter: value => '$' + value.toLocaleString() } },
        theme: { mode: dark() ? 'dark' : 'light' }
    });
    const spending = new window.ApexCharts(document.getElementById('widget-spending-chart'), {
        chart: { type: 'donut', background: 'transparent', height: 240, fontFamily: 'inherit' },
        series: [4200, 2800, 1600], labels: ['Tools & software', 'Operations', 'Other'],
        colors: palette(),
        stroke: { width: 0 }, dataLabels: { enabled: false }, legend: { position: 'bottom' },
        plotOptions: { pie: { donut: { size: '75%', labels: { show: true, total: { show: true, label: 'Total spending', formatter: () => '$8,600' }, value: { formatter: value => '$' + Number(value).toLocaleString() } } } } },
        tooltip: { y: { formatter: value => '$' + value.toLocaleString() } }, theme: { mode: dark() ? 'dark' : 'light' }
    });
    Promise.all([revenue.render(), spending.render()]).then(() => {
        document.getElementById('widget-chart-range').addEventListener('change', event => {
            const period = periods[event.target.value];
            if (period) revenue.updateOptions({ series: [{ name: 'Revenue', data: period.values }], xaxis: { categories: period.labels } });
        });
        new MutationObserver(() => {
            const mode = dark() ? 'dark' : 'light';
            compactCharts.forEach(chart => chart.updateOptions({ colors: palette(), theme: { mode }, tooltip: { theme: mode } }));
            revenue.updateOptions({ colors: [color('--theme-primary-color')], theme: { mode }, tooltip: { theme: mode }, grid: { borderColor: color('--theme-default-border') } });
            spending.updateOptions({ colors: palette(), theme: { mode } });
        }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme-color', 'style'] });
    });
})();
