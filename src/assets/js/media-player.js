(function () {
    'use strict';
    const players = [];
    if (typeof window.Plyr === 'function') {
        ['player', 'player1', 'player2'].forEach(id => {
            if (!document.getElementById(id)) return;
            const player = new window.Plyr('#' + id, { autoplay: false, keyboard: { focused: true, global: false } });
            players.push(player);
            player.on('play', () => players.forEach(other => { if (other !== player) other.pause(); }));
        });
    }
    const audio = document.getElementById('player2');
    const status = document.getElementById('media-playback-status');
    if (!audio || !status) return;
    document.querySelectorAll('[data-audio-action]').forEach(button => {
        button.addEventListener('click', () => {
            const action = button.dataset.audioAction;
            if (action === 'loop') {
                audio.loop = !audio.loop;
                button.setAttribute('aria-pressed', String(audio.loop));
                button.textContent = audio.loop ? 'Repeat on' : 'Repeat off';
                status.textContent = audio.loop ? 'Repeat enabled for this track.' : 'Repeat disabled.';
                return;
            }
            if (!audio.readyState) { status.textContent = 'Start the track before seeking.'; return; }
            audio.currentTime = action === 'restart' ? 0 : Math.max(0, audio.currentTime - 10);
            status.textContent = action === 'restart' ? 'Returned to the beginning.' : 'Moved back 10 seconds.';
        });
    });
    audio.addEventListener('play', () => { status.textContent = 'Playing Perfect Beauty.'; });
    audio.addEventListener('pause', () => { status.textContent = 'Playback paused.'; });
    audio.addEventListener('ended', () => { status.textContent = 'Track complete. Play it again whenever you like.'; });
    audio.addEventListener('error', () => { status.textContent = 'The audio could not load. Reload the page to try again.'; });

})();
