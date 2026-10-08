(function () {
  'use strict';
  function initialize() {
    if (typeof DataTable === 'undefined') return;
    const instances = new Map();
    const statusColors = {
      'In progress': 'secondary',
      Review: 'warning',
      Complete: 'success',
      Planned: 'info',
    };
    function create(id, extra = {}) {
      const element = document.getElementById(id);
      if (!element) return null;
      const table = new DataTable(element, {
        pageLength: 5,
        lengthMenu: [5, 10, 25],
        order: [],
        language: { search: 'Search records:', lengthMenu: 'Show _MENU_ records' },
        columnDefs: [
          {
            targets: 3,
            render: (value, type) =>
              type === 'display'
                ? '<span class="badge bg-' +
                  (statusColors[value] || 'light') +
                  '-transparent">' +
                  value +
                  '</span>'
                : value,
          },
          {
            targets: 4,
            render: (value, type) => (type === 'display' ? value + '%' : Number(value)),
          },
        ],
        ...extra,
      });
      instances.set(id, table);
      return table;
    }
    create('datatable-basic');
    create('responsiveDataTable');
    const exportTable = create('file-export');
    const selectionTable = create('delete-datatable', {
      columnDefs: [
        {
          targets: 0,
          render: (value, type) =>
            type === 'display'
              ? '<label class="d-flex align-items-center gap-2"><input type="checkbox" class="form-check-input mt-0" data-select-project aria-label="Select ' +
                value +
                '">' +
                value +
                '</label>'
              : value,
        },
        {
          targets: 3,
          render: (value, type) =>
            type === 'display'
              ? '<span class="badge bg-' +
                statusColors[value] +
                '-transparent">' +
                value +
                '</span>'
              : value,
        },
        {
          targets: 4,
          render: (value, type) => (type === 'display' ? value + '%' : Number(value)),
        },
      ],
    });
    const selected = new Set();
    function selectionStatus() {
      document.getElementById('datatable-selection').textContent =
        selected.size + ' selected';
      document.getElementById('datatable-remove').disabled = selected.size === 0;
    }
    document.getElementById('delete-datatable')?.addEventListener('change', (event) => {
      if (!event.target.matches('[data-select-project]')) return;
      const row = event.target.closest('tr');
      const key = selectionTable.row(row).data()[0];
      if (event.target.checked) selected.add(key);
      else selected.delete(key);
      row.dataset.selected = String(event.target.checked);
      selectionStatus();
    });
    selectionTable?.on('draw', () => {
      selectionTable.rows({ page: 'current' }).every(function () {
        const node = this.node();
        const checked = selected.has(this.data()[0]);
        node.dataset.selected = String(checked);
        const input = node.querySelector('[data-select-project]');
        if (input) input.checked = checked;
      });
    });
    document.getElementById('datatable-remove')?.addEventListener('click', () => {
      selectionTable
        .rows((index, data) => selected.has(data[0]))
        .remove()
        .draw();
      selected.clear();
      selectionStatus();
    });
    const addTable = create('add-row');
    const original = addTable
      .rows()
      .data()
      .toArray()
      .map((row) => [...row]);
    let added = 0;
    document.getElementById('addRow')?.addEventListener('click', () => {
      added++;
      addTable.row
        .add([
          'Sample project ' + added,
          'Demo owner',
          'Product',
          'Planned',
          0,
          '2026-12-15',
        ])
        .draw();
      document.getElementById('datatable-add-status').textContent =
        'Added sample project ' + added;
    });
    document.getElementById('datatable-reset')?.addEventListener('click', () => {
      addTable.clear().rows.add(original).draw();
      added = 0;
      document.getElementById('datatable-add-status').textContent =
        'Original records restored';
    });
    create('scroll-vertical', { scrollY: '280px', scrollCollapse: true, paging: false });
    const columnTable = create('hidden-columns');
    document
      .querySelectorAll('[data-datatable-column]')
      .forEach((input) =>
        input.addEventListener('change', () =>
          columnTable.column(Number(input.dataset.datatableColumn)).visible(input.checked)
        )
      );
    const statusTable = create('datatable-status');
    document
      .getElementById('datatable-status-filter')
      ?.addEventListener('change', (event) =>
        statusTable.column(3).search(event.target.value, { exact: true }).draw()
      );
    // Export plain data from the filtered table, excluding presentation markup.
    document.getElementById('datatable-export')?.addEventListener('click', () => {
      const escapeCell = (value) => {
        let text = String(value);
        if (/^[=+@-]/.test(text)) text = "'" + text;
        return '"' + text.replace(/"/g, '""') + '"';
      };
      const rows = [
        ['Project', 'Owner', 'Team', 'Status', 'Progress (%)', 'Due date'],
        ...exportTable.rows({ search: 'applied' }).data().toArray(),
      ];
      const csv = rows.map((row) => row.map(escapeCell).join(',')).join('\r\n');
      const url = URL.createObjectURL(
        new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
      );
      const link = document.createElement('a');
      link.href = url;
      link.download = 'project-records.csv';
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
    window.addEventListener('resize', () =>
      instances.forEach((table) => table.columns.adjust())
    );
  }
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
