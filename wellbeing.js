const Wellbeing = (() => {
    const CHECK_INTERVAL = 60000; // Check every minute
    const WARNING_THRESHOLD = 120 * 60 * 1000; // 2 hours in ms
    let sessionStartTime = null;
    let timerInterval = null;

    function startSession() {
        sessionStartTime = Date.now();
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(checkTime, CHECK_INTERVAL);
    }

    function stopSession() {
        if (timerInterval) clearInterval(timerInterval);
        sessionStartTime = null;
    }

    function checkTime() {
        if (!sessionStartTime) return;

        const elapsed = Date.now() - sessionStartTime;
        if (elapsed >= WARNING_THRESHOLD) {
            showReminder();
        }
    }

    function shouldCheck() {
        // Can be used to prevent playing if user has been watching too long without a break
        return false; // For now, always allow, just warn.
    }

    function showReminder(continueCallback) {
        // Only show if not already showing
        if (document.getElementById('wellbeing-modal')) return;

        const modalHTML = `
      <div id="wellbeing-modal" class="modal" style="text-align: center;">
        <h2 class="section-title" style="border: none; padding: 0; margin-bottom: 1rem;">¿Sigues ahí?</h2>
        <p style="margin-bottom: 2rem; color: var(--color-text-muted);">Has estado viendo contenido por un buen rato. ¿Quieres tomar un descanso?</p>
        <div class="flex" style="justify-content: center;">
          <button class="btn btn-primary" onclick="Wellbeing.snooze()">Continuar viendo</button>
          <button class="btn" style="border: 1px solid var(--color-text-muted);" onclick="Wellbeing.stop()">Detener sesión</button>
        </div>
      </div>
    `;

        const container = document.getElementById('modals');
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        overlay.style.zIndex = '2000'; // Topmost
        overlay.innerHTML = modalHTML;

        container.appendChild(overlay);

        // Attach callbacks to window for the inline onclicks
        window.Wellbeing.snooze = function () {
            container.innerHTML = ''; // Close modal
            sessionStartTime = Date.now(); // Reset timer
            if (continueCallback) continueCallback();
        };

        window.Wellbeing.stop = function () {
            container.innerHTML = '';
            stopSession();
            // Close any open player
            const playerOverlay = document.querySelector('.overlay');
            if (playerOverlay && playerOverlay.querySelector('iframe')) {
                document.body.removeChild(playerOverlay);
            }
        };
    }

    return {
        startSession,
        stopSession,
        shouldCheck,
        showReminder
    };
})();
