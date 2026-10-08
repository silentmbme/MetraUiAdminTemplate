(function () {
    'use strict';

    const search = document.querySelector('#invoice-search');
    const statusFilter = document.querySelector('#invoice-status-filter');
    const tableBody = document.querySelector('#invoice-list-rows');

    if (!search || !statusFilter || !tableBody) return;

    const rows = [...tableBody.querySelectorAll('.invoice-list-row')];
    const emptyState = document.querySelector('#invoice-empty-state');
    const resultCount = document.querySelector('#invoice-list-count');

    function filterInvoices() {
        const query = search.value.trim().toLowerCase();
        const selectedStatus = statusFilter.value.toLowerCase();
        let visibleCount = 0;

        rows.forEach(function (row) {
            const matchesQuery = row.textContent.toLowerCase().includes(query);
            const matchesStatus = !selectedStatus || row.dataset.status === selectedStatus;
            const visible = matchesQuery && matchesStatus;
            row.hidden = !visible;
            if (visible) visibleCount += 1;
        });

        emptyState.classList.toggle('d-none', visibleCount > 0);
        resultCount.textContent = `Showing ${visibleCount} of ${rows.length} invoices`;
    }

    search.addEventListener('input', filterInvoices);
    statusFilter.addEventListener('change', filterInvoices);

    document.querySelector('#invoice-reset-filters').addEventListener('click', function () {
        search.value = '';
        statusFilter.value = '';
        statusFilter.dispatchEvent(new Event('change', { bubbles: true }));
        search.focus();
    });

    document.querySelector('#invoice-export').addEventListener('click', function () {
        const visibleRows = rows.filter((row) => !row.hidden);
        const csvRows = [['Client', 'Email', 'Invoice ID', 'Issue date', 'Amount', 'Status', 'Due date']];

        visibleRows.forEach(function (row) {
            const cells = row.querySelectorAll('td');
            const values = [
                cells[0].querySelector('strong').textContent.trim(),
                cells[0].querySelector('span').textContent.trim(),
                cells[1].textContent.trim(),
                cells[2].textContent.trim(),
                cells[3].textContent.trim(),
                cells[4].textContent.trim(),
                cells[5].textContent.trim()
            ];
            csvRows.push(values);
        });

        const csv = csvRows.map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(',')).join('\r\n');
        const file = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const downloadUrl = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = 'invoice-list.csv';
        link.click();
        URL.revokeObjectURL(downloadUrl);
    });

    document.querySelectorAll('.invoice-print-row').forEach(function (button) {
        button.addEventListener('click', function () {
            window.print();
        });
    });

    filterInvoices();
})();
