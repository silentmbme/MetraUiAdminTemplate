(function () {
  'use strict';
  function initialize() {
    if (typeof gridjs === 'undefined') return;
    const projects = [
      [
        'Workspace redesign',
        'Amelia Hart',
        'Design',
        'In progress',
        78,
        64,
        '2026-10-24',
      ],
      ['Customer portal', 'Liam Carter', 'Engineering', 'Review', 64, 96, '2026-10-28'],
      [
        'Billing integration',
        'Olivia Reed',
        'Platform',
        'Complete',
        100,
        48,
        '2026-10-30',
      ],
      ['Analytics studio', 'Noah James', 'Data', 'Planned', 32, 80, '2026-11-04'],
      [
        'Mobile experience',
        'Emma Stone',
        'Product',
        'In progress',
        56,
        120,
        '2026-11-08',
      ],
      ['Support hub', 'Ethan Brooks', 'Operations', 'Review', 86, 40, '2026-11-12'],
      ['Design system', 'Sophia Lane', 'Design', 'Complete', 100, 72, '2026-11-16'],
      ['Access management', 'Lucas Reed', 'Platform', 'Planned', 24, 56, '2026-11-20'],
      [
        'Release automation',
        'Mia Patel',
        'Engineering',
        'In progress',
        68,
        88,
        '2026-11-24',
      ],
      ['Knowledge base', 'Oliver King', 'Operations', 'Review', 92, 36, '2026-11-28'],
      ['Quality dashboard', 'Ava Wilson', 'Quality', 'In progress', 74, 60, '2026-12-02'],
      ['Partner workspace', 'James Lee', 'Product', 'Planned', 18, 100, '2026-12-06'],
    ];
    const status = (cell) =>
      gridjs.h(
        'span',
        {
          className:
            'badge bg-' +
            ({
              'In progress': 'secondary',
              Review: 'warning',
              Complete: 'success',
              Planned: 'info',
              Paid: 'success',
              Pending: 'warning',
              Draft: 'info',
            }[cell] || 'light') +
            '-transparent',
        },
        cell
      );
    const progress = (cell) => gridjs.h('span', { className: 'fw-medium' }, cell + '%');
    function render(id, config) {
      const element = document.getElementById(id);
      if (!element) return;
      new gridjs.Grid({
        autoWidth: true,
        language: { search: { placeholder: 'Search records...' } },
        ...config,
      }).render(element);
    }
    const projectColumns = [
      'Project',
      'Owner',
      'Team',
      { name: 'Status', formatter: status },
    ];
    render('grid-example1', {
      columns: projectColumns,
      data: projects.slice(0, 5).map((row) => row.slice(0, 4)),
    });
    render('grid-pagination', {
      columns: [
        'Invoice',
        'Customer',
        { name: 'Status', formatter: status },
        {
          name: 'Amount',
          formatter: (cell) =>
            '$' + cell.toLocaleString('en-US', { minimumFractionDigits: 2 }),
        },
      ],
      data: projects.map((row, index) => [
        'INV-' + (1042 + index),
        row[0],
        ['Paid', 'Pending', 'Draft'][index % 3],
        960 + index * 240,
      ]),
      pagination: { limit: 5, summary: true },
      sort: true,
    });
    render('grid-search', {
      columns: ['Name', 'Team', 'Email'],
      data: projects.map((row) => [
        row[1],
        row[2],
        row[1].toLowerCase().replace(' ', '.') + '@example.com',
      ]),
      search: true,
      pagination: { limit: 5 },
    });
    render('grid-sorting', {
      columns: [
        'Project',
        { name: 'Progress', formatter: progress },
        'Hours',
        'Due date',
      ],
      data: projects.map((row) => [row[0], row[4], row[5], row[6]]),
      sort: true,
      pagination: { limit: 5 },
    });
    // This delay demonstrates async loading without an external service.
    render('grid-loading', {
      columns: projectColumns,
      data: () =>
        new Promise((resolve) =>
          setTimeout(
            () => resolve(projects.slice(0, 5).map((row) => row.slice(0, 4))),
            700
          )
        ),
    });
    render('grid-wide', {
      columns: [
        { name: 'Project', width: '220px' },
        { name: 'Owner', width: '160px' },
        { name: 'Team', width: '140px' },
        { name: 'Status', width: '140px', formatter: status },
        { name: 'Progress', width: '120px', formatter: progress },
        { name: 'Hours', width: '100px' },
        { name: 'Due date', width: '140px' },
      ],
      data: projects,
      search: true,
      sort: true,
      pagination: { limit: 6 },
    });
    render('grid-header-fixed', {
      columns: ['Document', 'Team', 'Updated'],
      data: projects.map((row, index) => [
        row[0] + ' brief.pdf',
        row[2],
        '2026-10-' + String(5 + index).padStart(2, '0'),
      ]),
      height: '280px',
      fixedHeader: true,
      sort: true,
    });
    render('grid-hidden-column', {
      columns: [
        { name: 'Internal ID', hidden: true },
        {
          name: 'Project',
          formatter: (cell) =>
            gridjs.h(
              'a',
              { href: 'projects-list.html', className: 'text-secondary fw-medium' },
              cell
            ),
        },
        'Owner',
        { name: 'Status', formatter: status },
      ],
      data: projects.map((row, index) => [
        'PRJ-' + (101 + index),
        row[0],
        row[1],
        row[3],
      ]),
      pagination: { limit: 5 },
      search: true,
    });
  }
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
