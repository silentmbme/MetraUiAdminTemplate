(() => {
  const container = document.getElementById('liveAlertPlaceholder');
  if (!container) return;
  document.getElementById('liveAlertBtn').addEventListener('click', () => {
    const message = document.getElementById('alert-message').value.trim();
    if (!message) { document.getElementById('alert-message').focus(); return; }
    const type = document.getElementById('alert-type').value;
    const alert = document.createElement('div');
    alert.className = 'alert alert-' + type + ' alert-dismissible fade show mb-2';
    alert.setAttribute('role', 'alert');
    const text = document.createElement('span');
    text.textContent = message;
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'btn-close';
    close.setAttribute('data-bs-dismiss', 'alert');
    close.setAttribute('aria-label', 'Dismiss alert');
    alert.append(text, close);
    if (container.children.length >= 3) container.firstElementChild.remove();
    container.append(alert);
  });
  document.getElementById('clear-alerts').addEventListener('click', () => container.replaceChildren());
})();

(() => {
  const slot = document.getElementById('timed-alert-slot');
  let timer;
  document.getElementById('show-timed-alert')?.addEventListener('click', () => {
    clearTimeout(timer);
    slot.innerHTML = '<div class="alert alert-success alert-dismissible fade show mb-0" role="alert" tabindex="0">Settings saved. This notice closes after five seconds.<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Dismiss timed notice"></button></div>';
    const notice = slot.firstElementChild;
    let remaining = 5000, started;
    const resume = () => { clearTimeout(timer); if (notice.matches(':hover, :focus-within')) return; started = Date.now(); timer = setTimeout(() => notice.remove(), remaining); };
    const pause = () => { clearTimeout(timer); remaining = Math.max(0, remaining - (Date.now() - started)); };
    notice.addEventListener('mouseenter', pause);
    notice.addEventListener('mouseleave', resume);
    notice.addEventListener('focusin', pause);
    notice.addEventListener('focusout', () => setTimeout(resume, 0));
    resume();
  });
  document.getElementById('restore-alert')?.addEventListener('click', () => {
    document.getElementById('restore-alert-slot').innerHTML = '<div class="alert alert-warning alert-dismissible fade show mb-0" role="alert">Your profile is missing a contact email.<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Dismiss profile notice"></button></div>';
  });
})();
