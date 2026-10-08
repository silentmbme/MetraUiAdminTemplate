(() => {
    const range = document.getElementById('progress-range');
    if (!range) return;
    const live = document.getElementById('progress-live');
    range.addEventListener('input', () => { live.setAttribute('aria-valuenow', range.value); live.firstElementChild.style.width = range.value + '%'; live.firstElementChild.textContent = range.value + '%'; document.getElementById('progress-live-label').textContent = range.value + '%'; });
    const upload = document.getElementById('upload-progress'), start = document.getElementById('upload-start'), pause = document.getElementById('upload-pause'), feedback = document.getElementById('upload-feedback');
    let value = 0, timer;
    const update = () => { upload.setAttribute('aria-valuenow', String(value)); upload.firstElementChild.style.width = value + '%'; };
    start.addEventListener('click', () => {
        if (timer || value === 100) return;
        start.disabled = true; pause.disabled = false;
        feedback.textContent = 'Uploading... ' + value + '%';
        timer = setInterval(() => { value = Math.min(100, value + 5); update(); feedback.textContent = value === 100 ? 'Upload simulation complete.' : 'Uploading... ' + value + '%'; if (value === 100) { clearInterval(timer); timer = undefined; pause.disabled = true; start.textContent = 'Complete'; } }, 250);
    });
    pause.addEventListener('click', () => { clearInterval(timer); timer = undefined; pause.disabled = true; start.disabled = false; start.textContent = 'Resume'; feedback.textContent = 'Paused at ' + value + '%'; });
    document.getElementById('upload-reset').addEventListener('click', () => { clearInterval(timer); timer = undefined; value = 0; update(); start.disabled = false; pause.disabled = true; start.textContent = 'Start upload'; feedback.textContent = 'Ready to start'; });
    window.addEventListener('pagehide', () => clearInterval(timer));
})();
