(function () {
    'use strict';

    const invoiceForm = document.querySelector('.invoice-builder');

    if (!invoiceForm) {
        return;
    }

    const issueDate = document.querySelector('#invoice-date-issued');
    const dueDate = document.querySelector('#invoice-date-due');
    const itemList = document.querySelector('#invoice-items');
    const currencySelect = document.querySelector('#invoice-currency');
    const feedback = document.querySelector('#invoice-feedback');

    if (window.flatpickr) {
        const dateOptions = {
            dateFormat: 'Y-m-d',
            altInput: true,
            altFormat: 'M j, Y',
            disableMobile: true
        };

        if (issueDate) flatpickr(issueDate, dateOptions);
        if (dueDate) flatpickr(dueDate, dateOptions);
    }

    if (window.Dropzone && document.querySelector('#invoice-logo-upload')) {
        Dropzone.autoDiscover = false;
        new Dropzone('#invoice-logo-upload', {
            url: 'https://httpbin.org/post',
            maxFiles: 1,
            acceptedFiles: 'image/*',
            addRemoveLinks: true,
            autoProcessQueue: false,
            dictDefaultMessage: 'Drop a logo here or click to browse',
            dictRemoveFile: 'Remove logo'
        });
    }

    const formatMoney = function (amount) {
        const currency = currencySelect ? currencySelect.value : 'USD';

        try {
            return new Intl.NumberFormat(undefined, {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 2
            }).format(amount);
        } catch (error) {
            return `${currency} ${amount.toFixed(2)}`;
        }
    };

    const amountFrom = function (row) {
        const quantity = Number(row.querySelector('.invoice-item-quantity')?.value) || 0;
        const rate = Number(row.querySelector('.invoice-item-rate')?.value) || 0;
        return quantity * rate;
    };

    const updateTotals = function () {
        const rows = [...itemList.querySelectorAll('.invoice-item-row')];
        const subtotal = rows.reduce((total, row) => {
            const amount = amountFrom(row);
            row.querySelector('.invoice-item-amount').textContent = formatMoney(amount);
            return total + amount;
        }, 0);
        const discountRate = Math.min(100, Math.max(0, Number(document.querySelector('#invoice-discount').value) || 0));
        const taxRate = Math.min(100, Math.max(0, Number(document.querySelector('#invoice-tax').value) || 0));
        const discount = subtotal * discountRate / 100;
        const tax = (subtotal - discount) * taxRate / 100;
        const total = subtotal - discount + tax;

        document.querySelector('#invoice-subtotal').textContent = formatMoney(subtotal);
        document.querySelector('#invoice-discount-amount').textContent = `−${formatMoney(discount)}`;
        document.querySelector('#invoice-tax-amount').textContent = formatMoney(tax);
        document.querySelector('#invoice-total').textContent = formatMoney(total);
    };

    const updateDueDate = function () {
        if (!dueDate || !dueDate.value) return;
        const date = new Date(`${dueDate.value}T00:00:00`);
        if (!Number.isNaN(date.getTime())) {
            document.querySelector('#invoice-due-label').textContent = new Intl.DateTimeFormat(undefined, {
                month: 'long',
                day: '2-digit',
                year: 'numeric'
            }).format(date);
        }
    };

    const announce = function (message, state) {
        feedback.textContent = message;
        feedback.classList.toggle('text-success', state === 'success');
        feedback.classList.toggle('text-danger', state === 'error');
        document.querySelector('#invoice-status').textContent = state === 'success' ? 'Changes saved' : 'Ready to edit';
    };

    const bindRow = function (row) {
        row.querySelectorAll('.invoice-item-quantity, .invoice-item-rate').forEach((input) => {
            input.addEventListener('input', updateTotals);
        });
        row.querySelector('.invoice-remove-item').addEventListener('click', function () {
            row.remove();
            updateTotals();
        });
    };

    itemList.querySelectorAll('.invoice-item-row').forEach(bindRow);

    document.querySelector('#invoice-add-item').addEventListener('click', function () {
        const row = document.createElement('tr');
        row.className = 'invoice-item-row';
        row.innerHTML = `
            <td><input class="form-control invoice-item-name" type="text" aria-label="Item name" placeholder="Item name"></td>
            <td><input class="form-control invoice-item-description" type="text" aria-label="Item description" placeholder="Add a short description"></td>
            <td><input class="form-control invoice-item-quantity text-center" type="number" min="0" step="1" aria-label="Quantity" value="1"></td>
            <td><input class="form-control invoice-item-rate text-end" type="number" min="0" step="0.01" aria-label="Rate" value="0"></td>
            <td class="text-end fw-semibold invoice-item-amount">${formatMoney(0)}</td>
            <td><button class="btn btn-icon btn-sm btn-danger-light invoice-remove-item" type="button" aria-label="Remove line item"><i class="ri-delete-bin-line" aria-hidden="true"></i></button></td>`;
        itemList.appendChild(row);
        bindRow(row);
        row.querySelector('.invoice-item-name').focus();
    });

    document.querySelector('#invoice-discount').addEventListener('input', updateTotals);
    document.querySelector('#invoice-tax').addEventListener('input', updateTotals);
    currencySelect.addEventListener('change', updateTotals);
    dueDate.addEventListener('change', updateDueDate);
    dueDate.addEventListener('input', updateDueDate);
    document.querySelector('#invoice-number').addEventListener('input', function (event) {
        document.querySelector('#invoice-number-label').textContent = event.target.value || 'Draft';
    });

    document.querySelector('#invoice-save-draft').addEventListener('click', function () {
        const draft = {
            number: document.querySelector('#invoice-number').value,
            client: document.querySelector('#customer-Name').value,
            issueDate: issueDate.value,
            dueDate: dueDate.value,
            currency: currencySelect.value,
            discount: document.querySelector('#invoice-discount').value,
            tax: document.querySelector('#invoice-tax').value,
            rows: [...itemList.querySelectorAll('.invoice-item-row')].map((row) => ({
                name: row.querySelector('.invoice-item-name').value,
                description: row.querySelector('.invoice-item-description').value,
                quantity: row.querySelector('.invoice-item-quantity').value,
                rate: row.querySelector('.invoice-item-rate').value
            }))
        };

        try {
            localStorage.setItem('metraui-invoice-draft', JSON.stringify(draft));
            announce('Draft saved in this browser.', 'success');
        } catch (error) {
            announce('The draft could not be saved in this browser.', 'error');
        }
    });

    document.querySelector('#invoice-print').addEventListener('click', function () {
        window.print();
    });

    document.querySelector('#invoice-send').addEventListener('click', function () {
        const clientEmail = document.querySelector('#customer-mail').value.trim();
        const clientName = document.querySelector('#customer-Name').value.trim();

        if (!clientName || !clientEmail) {
            announce('Add the client name and email before preparing this invoice.', 'error');
            document.querySelector(!clientName ? '#customer-Name' : '#customer-mail').focus();
            return;
        }

        const subject = encodeURIComponent(`Invoice ${document.querySelector('#invoice-number').value}`);
        const body = encodeURIComponent(`Hello ${clientName},\n\nYour invoice total is ${document.querySelector('#invoice-total').textContent}.\nPayment is due ${document.querySelector('#invoice-due-label').textContent}.\n\nThank you.`);
        window.location.href = `mailto:${encodeURIComponent(clientEmail)}?subject=${subject}&body=${body}`;
        announce('Invoice details opened in your email app.', 'success');
    });

    updateTotals();
    updateDueDate();
})();
