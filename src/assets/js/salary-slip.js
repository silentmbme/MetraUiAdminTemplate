
    document.addEventListener('DOMContentLoaded', function () {
      const form = document.getElementById('create-salary-slip-form');
      const modalElement = document.getElementById('create-salary-slip-modal');
      const errorMessage = document.getElementById('slip-form-error');
      const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

      form.addEventListener('submit', function (event) {
        event.preventDefault();
        errorMessage.classList.add('d-none');

        const value = (id) => document.getElementById(id).value.trim();
        const amount = (id) => Number(document.getElementById(id).value) || 0;
        const employeeName = value('slip-form-name');
        const employeeId = value('slip-form-id');
        const period = value('slip-form-period');
        const payDateValue = value('slip-form-date');
        const baseSalary = amount('slip-form-base');
        const overtime = amount('slip-form-overtime');
        const bonus = amount('slip-form-bonus');
        const federalTax = amount('slip-form-federal');
        const stateTax = amount('slip-form-state');
        const benefits = amount('slip-form-benefits');
        const gross = baseSalary + overtime + bonus;
        const deductions = federalTax + stateTax + benefits;
        const netPay = gross - deductions;

        if (netPay < 0) {
          errorMessage.textContent = 'Deductions cannot be greater than gross earnings.';
          errorMessage.classList.remove('d-none');
          return;
        }

        const [year, month] = period.split('-').map(Number);
        const monthName = new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'short' });
        const lastDay = new Date(year, month, 0).getDate();
        const payDate = new Date(`${payDateValue}T00:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        const initials = employeeName.split(/\s+/).filter(Boolean).slice(0, 2).map((name) => name[0].toUpperCase()).join('');
        const statementId = `PAY-${year}-${String(month).padStart(2, '0')}-${employeeId.replace(/[^a-z0-9]/gi, '').toUpperCase()}`;
        const netPercent = gross ? (netPay / gross) * 100 : 0;
        const deductionPercent = gross ? (deductions / gross) * 100 : 0;
        const setText = (id, text) => { document.getElementById(id).textContent = text; };

        setText('slip-employee-name', employeeName);
        setText('slip-employee-id', employeeId);
        setText('slip-employee-department', value('slip-form-department'));
        setText('slip-employee-avatar', initials || '??');
        setText('slip-pay-period', `${monthName} 1-${lastDay}, ${year}`);
        setText('slip-pay-date', payDate);
        setText('slip-pay-method', value('slip-form-method'));
        setText('slip-statement-id', statementId);
        setText('slip-base-salary', money.format(baseSalary));
        setText('slip-overtime', money.format(overtime));
        setText('slip-bonus', money.format(bonus));
        setText('slip-gross', money.format(gross));
        setText('slip-federal-tax', money.format(federalTax));
        setText('slip-state-tax', money.format(stateTax));
        setText('slip-benefits', money.format(benefits));
        setText('slip-deductions', money.format(deductions));
        setText('slip-net-pay', money.format(netPay));
        setText('slip-account', value('slip-form-account'));
        setText('slip-breakdown-gross', money.format(gross));
        setText('slip-breakdown-deductions', `-${money.format(deductions)}`);
        setText('slip-net-percent', `${netPercent.toFixed(1)}%`);
        setText('slip-deduction-percent', `${deductionPercent.toFixed(1)}%`);
        document.getElementById('slip-net-bar').style.width = `${netPercent}%`;
        document.getElementById('slip-deduction-bar').style.width = `${deductionPercent}%`;
        document.getElementById('slip-pay-ratio').setAttribute('aria-label', `${netPercent.toFixed(1)} percent of gross earnings is take-home pay`);
        setText('slip-status-title', 'Draft preview created');
        setText('slip-status-message', 'Review the statement before payroll approval.');
        setText('slip-created-feedback', `Draft ready for ${employeeName}.`);

        bootstrap.Modal.getOrCreateInstance(modalElement).hide();
      });
    });
