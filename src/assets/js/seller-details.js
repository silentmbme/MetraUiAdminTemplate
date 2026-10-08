(() => {
  "use strict";

  const pauseButton = document.getElementById("seller-pause-button");
  const statusBadge = document.querySelector(".seller-profile-identity .badge");

  if (pauseButton && statusBadge) {
    pauseButton.addEventListener("click", () => {
      const isActive = statusBadge.textContent.trim().includes("Active");
      const nextStatus = isActive ? "Paused" : "Active";

      statusBadge.className = `badge bg-${
        isActive ? "secondary" : "success"
      }-transparent text-${isActive ? "secondary" : "success"}`;
      statusBadge.innerHTML = `<span class="seller-status-dot"></span>${nextStatus}`;
      pauseButton.className = `btn btn-outline-${
        isActive ? "success" : "warning"
      }`;
      pauseButton.innerHTML = isActive
        ? '<i class="ri-play-circle-line me-1" aria-hidden="true"></i>Resume store'
        : '<i class="ri-pause-circle-line me-1" aria-hidden="true"></i>Pause store';
    });
  }
})();
